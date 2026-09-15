import asyncio
import datetime
import random
from typing import Optional, List, Dict, Any
import httpx
from app.config import settings
from app.schemas import CurrentWeather, ForecastDay, WeatherResponse

class WeatherService:
    @property
    def api_key(self) -> str:
        return (settings.WEATHER_API_KEY or "").strip()

    async def get_weather(
        self,
        location: str = "Ludhiana, Punjab",
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> WeatherResponse:
        clean_loc = (location or "Ludhiana, Punjab").strip()
        
        # Validate coordinates if provided
        valid_coords = False
        if lat is not None and lon is not None:
            try:
                lat_f = float(lat)
                lon_f = float(lon)
                if -90.0 <= lat_f <= 90.0 and -180.0 <= lon_f <= 180.0:
                    valid_coords = True
                    lat, lon = lat_f, lon_f
                else:
                    print(f"[Weather Warning] Coordinates out of bounds: lat={lat}, lon={lon}. Falling back to city name.")
                    lat, lon = None, None
            except (ValueError, TypeError):
                print(f"[Weather Warning] Non-numeric coordinates: lat={lat}, lon={lon}. Falling back to city name.")
                lat, lon = None, None

        api_key = self.api_key
        if not api_key:
            return self._generate_agricultural_weather(
                location=clean_loc,
                fallback_reason="WEATHER_API_KEY is not configured in backend environment."
            )

        try:
            return await self._fetch_live_weather(clean_loc, lat, lon)
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            if status_code == 401:
                reason = "OpenWeatherMap API Key is invalid or not activated yet. Check WEATHER_API_KEY in backend .env."
            elif status_code == 404:
                reason = f"Location '{clean_loc}' was not found by OpenWeatherMap."
            elif status_code == 429:
                reason = "OpenWeatherMap API rate limit exceeded. Reverting to agricultural engine."
            elif status_code >= 500:
                reason = f"OpenWeatherMap service is temporarily unavailable (HTTP {status_code})."
            else:
                reason = f"OpenWeatherMap returned HTTP error {status_code}."
            print(f"[Weather Warning] {reason} ({e})")
            return self._generate_agricultural_weather(location=clean_loc, fallback_reason=reason)
        except httpx.TimeoutException:
            reason = "OpenWeatherMap API request timed out (connection exceeded timeout limit)."
            print(f"[Weather Warning] {reason}")
            return self._generate_agricultural_weather(location=clean_loc, fallback_reason=reason)
        except (httpx.ConnectError, httpx.RequestError) as e:
            reason = f"Network failure connecting to OpenWeatherMap ({type(e).__name__})."
            print(f"[Weather Warning] {reason}")
            return self._generate_agricultural_weather(location=clean_loc, fallback_reason=reason)
        except Exception as e:
            reason = f"Unexpected live weather retrieval error: {str(e)}"
            print(f"[Weather Warning] {reason}")
            return self._generate_agricultural_weather(location=clean_loc, fallback_reason=reason)

    async def _fetch_live_weather(
        self,
        location: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> WeatherResponse:
        api_key = self.api_key
        base_params = {"appid": api_key, "units": "metric"}
        
        if lat is not None and lon is not None:
            base_params["lat"] = lat
            base_params["lon"] = lon
        else:
            base_params["q"] = location

        async with httpx.AsyncClient(timeout=8.0) as client:
            # Parallel request for current weather and 5-day forecast
            current_task = client.get("https://api.openweathermap.org/data/2.5/weather", params=base_params)
            forecast_task = client.get("https://api.openweathermap.org/data/2.5/forecast", params=base_params)
            
            resp_current, resp_forecast = await asyncio.gather(current_task, forecast_task, return_exceptions=True)

            if isinstance(resp_current, Exception):
                raise resp_current
            
            resp_current.raise_for_status()
            cur_data = resp_current.json()

            # Parse Current Weather
            temp = round(float(cur_data["main"]["temp"]), 1)
            feels_like = round(float(cur_data["main"].get("feels_like", temp)), 1)
            humidity = round(float(cur_data["main"]["humidity"]), 1)
            pressure = round(float(cur_data["main"].get("pressure", 1013.25)), 1)
            clouds = int(cur_data.get("clouds", {}).get("all", 0))
            
            wind_speed_ms = float(cur_data.get("wind", {}).get("speed", 3.5))
            wind_speed_kmh = round(wind_speed_ms * 3.6, 1) # Standard agricultural km/h

            weather_obj = cur_data.get("weather", [{}])[0]
            cond = weather_obj.get("main", "Clear")
            desc = weather_obj.get("description", "clear sky").capitalize()
            icon = weather_obj.get("icon", "01d")

            rain_1h = float(cur_data.get("rain", {}).get("1h", 0.0) or 0.0)
            rain_3h = float(cur_data.get("rain", {}).get("3h", 0.0) or 0.0)
            rainfall = round(rain_1h if rain_1h > 0 else (rain_3h / 3.0 if rain_3h > 0 else 0.0), 1)

            # Rain probability estimate from weather condition or clouds
            if "Rain" in cond or "Drizzle" in cond or "Thunderstorm" in cond:
                rain_prob = 85.0
            elif "Cloud" in cond:
                rain_prob = round(max(20.0, float(clouds) * 0.5), 1)
            else:
                rain_prob = 10.0

            loc_name = cur_data.get("name")
            country = cur_data.get("sys", {}).get("country", "")
            display_location = f"{loc_name}, {country}".strip(", ") if loc_name else location

            # Parse Forecast
            forecast_days: List[ForecastDay] = []
            if not isinstance(resp_forecast, Exception) and resp_forecast.status_code == 200:
                forecast_data = resp_forecast.json()
                forecast_days = self._parse_openweathermap_forecast(forecast_data)
                
                # If forecast contains rain probability for today, adjust current rain_prob
                if forecast_days:
                    first_day_prob = forecast_days[0].rain_probability
                    if first_day_prob > rain_prob:
                        rain_prob = first_day_prob

            if not forecast_days:
                # Fallback forecast generation from live baseline
                forecast_days = self._generate_forecast(temp, humidity)

            current = CurrentWeather(
                location=display_location,
                temperature=temp,
                feels_like=feels_like,
                humidity=humidity,
                rainfall=rainfall,
                wind_speed=wind_speed_kmh,
                condition=cond,
                description=desc,
                icon=icon,
                rain_probability=rain_prob,
                uv_index=round(max(1.0, 7.5 - (clouds * 0.05)), 1),
                clouds=clouds,
                pressure=pressure,
                data_source="OpenWeatherMap",
                timestamp=datetime.datetime.now(datetime.timezone.utc)
            )

            advisory = self._get_advisory(
                temp=temp,
                humidity=humidity,
                rain=rainfall,
                condition=cond,
                wind_kmh=wind_speed_kmh,
                clouds=clouds
            )

            return WeatherResponse(
                current=current,
                forecast=forecast_days,
                agricultural_advisory=advisory,
                data_source="OpenWeatherMap",
                fallback_reason=None
            )

    def _parse_openweathermap_forecast(self, data: Dict[str, Any]) -> List[ForecastDay]:
        items = data.get("list", [])
        if not items:
            return []

        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        grouped: Dict[str, List[Dict[str, Any]]] = {}

        for item in items:
            dt_txt = item.get("dt_txt", "") # Format: "YYYY-MM-DD HH:MM:SS"
            if not dt_txt:
                continue
            date_str = dt_txt.split(" ")[0]
            grouped.setdefault(date_str, []).append(item)

        forecast_days: List[ForecastDay] = []
        today_str = datetime.date.today().strftime("%Y-%m-%d")

        for d_str, day_items in grouped.items():
            # Skip if this is strictly today and we have enough upcoming days
            if d_str == today_str and len(grouped) > 5:
                continue

            try:
                d_obj = datetime.datetime.strptime(d_str, "%Y-%m-%d").date()
                day_name = day_names[d_obj.weekday()]
            except Exception:
                day_name = "Day"

            temps = [it["main"]["temp"] for it in day_items if "main" in it]
            humidities = [it["main"]["humidity"] for it in day_items if "main" in it]
            pops = [it.get("pop", 0.0) for it in day_items]

            t_min = round(min(temps), 1) if temps else 20.0
            t_max = round(max(temps), 1) if temps else 30.0
            avg_humidity = round(sum(humidities) / len(humidities), 1) if humidities else 50.0
            max_pop = round(max(pops) * 100.0, 1) if pops else 0.0

            # Midday condition item or most representative
            mid_item = day_items[len(day_items) // 2]
            weather_obj = mid_item.get("weather", [{}])[0]
            c_main = weather_obj.get("main", "Clear")
            c_desc = weather_obj.get("description", "clear sky").capitalize()
            c_icon = weather_obj.get("icon", "01d")

            forecast_days.append(ForecastDay(
                date=d_str,
                day_name=day_name,
                temp_min=t_min,
                temp_max=t_max,
                condition=c_main,
                description=c_desc,
                icon=c_icon,
                rain_probability=max_pop,
                humidity=avg_humidity
            ))

            if len(forecast_days) >= 7:
                break

        return forecast_days

    def _generate_agricultural_weather(
        self,
        location: str,
        fallback_reason: Optional[str] = None
    ) -> WeatherResponse:
        # High-realism deterministic simulation based on location hash
        seed = sum(ord(c) for c in location)
        rng = random.Random(seed + datetime.date.today().toordinal())

        temp = round(rng.uniform(22.0, 33.5), 1)
        humidity = round(rng.uniform(45.0, 78.0), 1)
        wind = round(rng.uniform(5.0, 14.0), 1)
        rain_prob = round(rng.uniform(5.0, 40.0), 1)
        rain_amt = round(rng.uniform(0.0, 4.5), 1) if rain_prob > 30 else 0.0
        clouds = rng.randint(10, 75)
        pressure = round(rng.uniform(1008.0, 1018.0), 1)

        conditions = [
            ("Sunny", "Clear skies with bright sunlight", "01d"),
            ("Partly Cloudy", "Scattered clouds with mild sun", "02d"),
            ("Overcast", "Dense cloud cover with cool breeze", "04d"),
            ("Light Rain", "Intermittent light drizzle", "10d")
        ]
        cond, desc, icon = conditions[rng.randint(0, 2 if rain_prob < 35 else 3)]

        current = CurrentWeather(
            location=location,
            temperature=temp,
            feels_like=round(temp + rng.uniform(-1.5, 2.0), 1),
            humidity=humidity,
            rainfall=rain_amt,
            wind_speed=wind,
            condition=cond,
            description=desc,
            icon=icon,
            rain_probability=rain_prob,
            uv_index=round(rng.uniform(4.5, 8.5), 1),
            clouds=clouds,
            pressure=pressure,
            data_source="Simulation/Fallback",
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )

        forecast = self._generate_forecast(temp, humidity, rng)
        advisory = self._get_advisory(
            temp=temp,
            humidity=humidity,
            rain=rain_amt,
            condition=cond,
            wind_kmh=wind,
            clouds=clouds
        )

        return WeatherResponse(
            current=current,
            forecast=forecast,
            agricultural_advisory=advisory,
            data_source="Simulation/Fallback",
            fallback_reason=fallback_reason
        )

    def _generate_forecast(self, base_temp: float, base_humidity: float, rng=None) -> List[ForecastDay]:
        if rng is None:
            rng = random.Random(42)

        days = []
        today = datetime.date.today()
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        for i in range(1, 8):
            f_date = today + datetime.timedelta(days=i)
            t_min = round(base_temp - rng.uniform(5.0, 8.0), 1)
            t_max = round(base_temp + rng.uniform(1.0, 4.0), 1)
            f_rain_prob = round(rng.uniform(10.0, 65.0), 1)

            if f_rain_prob > 50:
                c, d, ic = "Rain", "Moderate showers", "10d"
            elif f_rain_prob > 30:
                c, d, ic = "Clouds", "Partly cloudy", "03d"
            else:
                c, d, ic = "Clear", "Bright sunshine", "01d"

            days.append(ForecastDay(
                date=f_date.strftime("%Y-%m-%d"),
                day_name=day_names[f_date.weekday()],
                temp_min=t_min,
                temp_max=t_max,
                condition=c,
                description=d,
                icon=ic,
                rain_probability=f_rain_prob,
                humidity=round(base_humidity + rng.uniform(-10.0, 10.0), 1)
            ))
        return days

    def _get_advisory(
        self,
        temp: float,
        humidity: float,
        rain: float,
        condition: str,
        wind_kmh: float = 8.0,
        clouds: int = 30
    ) -> str:
        if rain > 5.0 or "Rain" in condition or "Thunderstorm" in condition:
            return (
                f"Active/Imminent Precipitation ({rain} mm, {condition}): Delay planned foliar pesticide and "
                "liquid fertilizer applications to prevent chemical wash-off and surface runoff. Ensure field drainage "
                "channels in low-lying crop plots are cleared."
            )
        elif wind_kmh > 24.0:
            return (
                f"Elevated Wind Velocity ({wind_kmh} km/h): Postpone sprayer operations to avoid significant pesticide drift "
                "and uneven deposition. Inspect physical crop stakes and tall trellis supports."
            )
        elif temp > 35.0:
            return (
                f"Elevated Thermal Stress Index ({temp}°C): High evapotranspiration losses in progress. Irrigate crops "
                "strictly during early morning (before 08:30 AM) or dusk to conserve water. Implement organic straw mulching."
            )
        elif temp < 10.0:
            return (
                f"Cold Climatic Warning ({temp}°C): Seedling vulnerability to low temperatures. Provide protective field covers "
                "or light nocturnal misting to mitigate cold shock."
            )
        elif humidity > 80.0:
            return (
                f"High Canopy Humidity ({humidity}%): Atmospheric conditions are highly conducive for fungal pathogens "
                "(e.g., Leaf Blight, Downy Mildew, Rust). Scout lower canopy leaves and maintain field border aeration."
            )
        elif clouds > 80:
            return (
                f"Heavy Cloud Canopy ({clouds}% coverage): Diffuse solar radiation moderating plant transpiration. "
                "Standard irrigation doses can be slightly reduced today."
            )
        else:
            return (
                "Favorable Agro-Climatic Window: Optimal meteorological conditions for routine field inspection, "
                "intercultural weeding, and scheduled balanced micronutrient spraying."
            )

weather_service = WeatherService()
