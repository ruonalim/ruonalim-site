from PIL import Image, ImageDraw, ImageFont
import os

# We'll create simple placeholder images too
base = "/sessions/epic-peaceful-shannon/mnt/Sandbox/ruonalim/assets"

# Create placeholder project images (dark gradient abstracts)
placeholders = [
    ("placeholder-1.jpg", (920, 520), [(18, 22, 36), (30, 40, 80)], "The Big Ticket"),
    ("placeholder-2.jpg", (920, 520), [(36, 28, 18), (60, 45, 30)], "Tania's Tea House"),
    ("placeholder-3.jpg", (920, 520), [(22, 22, 28), (40, 35, 55)], "Badibanga"),
    ("placeholder-about.jpg", (800, 600), [(20, 20, 28), (35, 30, 45)], ""),
]

for name, size, colors, label in placeholders:
    img = Image.new('RGB', size, colors[0])
    draw = ImageDraw.Draw(img)
    # Simple gradient
    for y in range(size[1]):
        r = int(colors[0][0] + (colors[1][0] - colors[0][0]) * y / size[1])
        g = int(colors[0][1] + (colors[1][1] - colors[0][1]) * y / size[1])
        b = int(colors[0][2] + (colors[1][2] - colors[0][2]) * y / size[1])
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))
    img.save(os.path.join(base, name), quality=85)
    print(f"Created {name}")

print("Done")
