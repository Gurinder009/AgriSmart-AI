import os
import random
from PIL import Image, ImageDraw

def create_samples():
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "sample_leaves")
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Healthy Leaf (Vibrant green with leaf veins)
    img_healthy = Image.new("RGB", (300, 300), (240, 248, 240))
    draw = ImageDraw.Draw(img_healthy)
    draw.polygon([(150, 20), (250, 100), (260, 200), (150, 280), (40, 200), (50, 100)], fill=(34, 139, 34))
    draw.line([(150, 20), (150, 280)], fill=(46, 160, 46), width=3)
    for y in range(60, 260, 30):
        draw.line([(150, y), (220, y - 20)], fill=(50, 170, 50), width=2)
        draw.line([(150, y), (80, y - 20)], fill=(50, 170, 50), width=2)
    img_healthy.save(os.path.join(out_dir, "healthy_leaf.jpg"), "JPEG")
    
    # 2. Blighted Leaf (Dark necrotic target spots and chlorotic yellowing)
    img_blight = Image.new("RGB", (300, 300), (245, 245, 240))
    draw = ImageDraw.Draw(img_blight)
    draw.polygon([(150, 20), (250, 100), (260, 200), (150, 280), (40, 200), (50, 100)], fill=(154, 170, 44))
    draw.line([(150, 20), (150, 280)], fill=(80, 90, 20), width=3)
    # Add dark necrotic concentric spots
    spots = [(120, 90, 25), (190, 140, 35), (100, 180, 30), (160, 220, 20)]
    for sx, sy, r in spots:
        draw.ellipse([(sx - r, sy - r), (sx + r, sy + r)], fill=(200, 190, 30)) # yellow halo
        draw.ellipse([(sx - r + 5, sy - r + 5), (sx + r - 5, sy + r - 5)], fill=(60, 35, 15)) # dark necrotic center
    img_blight.save(os.path.join(out_dir, "blight_leaf.jpg"), "JPEG")
    
    # 3. Rust Leaf (Orange-brown pustules)
    img_rust = Image.new("RGB", (300, 300), (240, 240, 240))
    draw = ImageDraw.Draw(img_rust)
    draw.polygon([(150, 20), (250, 100), (260, 200), (150, 280), (40, 200), (50, 100)], fill=(120, 150, 40))
    draw.line([(150, 20), (150, 280)], fill=(80, 100, 30), width=3)
    random.seed(42)
    for _ in range(80):
        rx = random.randint(80, 220)
        ry = random.randint(50, 250)
        draw.ellipse([(rx - 3, ry - 3), (rx + 3, ry + 3)], fill=(180, 70, 15))
    img_rust.save(os.path.join(out_dir, "rust_leaf.jpg"), "JPEG")
    
    print(f"Sample leaf images generated in {out_dir}")

if __name__ == "__main__":
    create_samples()
