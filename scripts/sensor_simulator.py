"""
AgriSmart AI — Simulated IoT Field Node (ESP32 Sensor Gateway)
Simulates an ESP32 hardware device transmitting volumetric soil moisture,
temperature, relative humidity, and pH telemetry to AgriSmart AI endpoints.
"""

import time
import random
import argparse
import httpx

def simulate_node(endpoint="http://localhost:8000/api/sensors/data", farm_id=1, interval_sec=5, count=10):
    print("=" * 60)
    print("[+] AgriSmart AI -- IoT Node Sensor Simulator (ESP32)")
    print(f"Target Gateway: {endpoint}")
    print(f"Assigned Farm ID: {farm_id} | Node ID: ESP32-FIELD-NODE-01")
    print(f"Transmission interval: {interval_sec}s | Packets to send: {count}")
    print("=" * 60)
    
    base_moisture = 42.0
    base_temp = 24.5
    base_hum = 65.0
    
    sent = 0
    while sent < count:
        # Simulate slight natural sensor fluctuations
        moisture = round(max(15.0, min(85.0, base_moisture + random.uniform(-1.5, 1.5))), 1)
        temp = round(base_temp + random.uniform(-0.8, 0.8), 1)
        hum = round(max(20.0, min(95.0, base_hum + random.uniform(-2.0, 2.0))), 1)
        ph = round(6.5 + random.uniform(-0.1, 0.1), 2)
        
        payload = {
            "sensor_id": "ESP32-FIELD-NODE-01",
            "farm_id": farm_id,
            "moisture": moisture,
            "temperature": temp,
            "humidity": hum,
            "ph": ph
        }
        
        try:
            resp = httpx.post(endpoint, json=payload, timeout=3.0)
            if resp.status_code == 201:
                print(f"[{time.strftime('%H:%M:%S')}] Packet #{sent+1} [OK] -> Moisture: {moisture}% | Temp: {temp}°C | Humidity: {hum}% | pH: {ph}")
            else:
                print(f"[{time.strftime('%H:%M:%S')}] Packet #{sent+1} [ERR] HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[{time.strftime('%H:%M:%S')}] Connection failed: {e}")
            
        sent += 1
        if sent < count:
            time.sleep(interval_sec)
            
    print("Simulation complete! Telemetry recorded in AgriSmart database.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriSmart IoT Sensor Simulator")
    parser.add_argument("--url", default="http://localhost:8000/api/sensors/data", help="Backend API endpoint")
    parser.add_argument("--farm", type=int, default=1, help="Farm ID")
    parser.add_argument("--interval", type=int, default=3, help="Seconds between packets")
    parser.add_argument("--count", type=int, default=5, help="Number of packets to send")
    args = parser.parse_args()
    simulate_node(endpoint=args.url, farm_id=args.farm, interval_sec=args.interval, count=args.count)
