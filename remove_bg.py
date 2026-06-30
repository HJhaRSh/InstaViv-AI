import sys
try:
    from PIL import Image, ImageDraw
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw

def remove_background(input_path, output_path, tolerance=15):
    img = Image.open(input_path).convert("RGBA")
    data = img.load()
    width, height = img.size
    
    # We will do a flood fill from the corners
    # A queue for the flood fill
    points_to_check = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    visited = set()
    
    def color_distance(c1, c2):
        return sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))
    
    # Background color is assumed to be the color at (0,0) (which is black)
    target_color = data[0, 0]
    
    while points_to_check:
        x, y = points_to_check.pop()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        current_color = data[x, y]
        if current_color[3] == 0:
            continue # already transparent
            
        if color_distance(current_color, target_color) <= tolerance:
            # Make it transparent
            data[x, y] = (0, 0, 0, 0)
            # Add neighbors to queue
            points_to_check.append((x + 1, y))
            points_to_check.append((x - 1, y))
            points_to_check.append((x, y + 1))
            points_to_check.append((x, y - 1))
            
    # Apply a slight anti-aliasing/feathering by just checking borders
    # But for a dark UI, a hard edge on black is usually okay since the UI is also dark.
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    remove_background("public/hero_centerpiece.png", "public/hero_centerpiece_transparent.png", tolerance=20)
