from pathlib import Path

from PIL import Image


SOURCE = Path('docs/references/sysu-buildings-reference.png')
OUTPUT_DIR = Path('public/mascot/buildings')

# 五栋建筑在原组合图中的范围，已经避开底部水印。
BUILDING_BOXES = (
    (8, 195, 239, 291),
    (242, 194, 455, 291),
    (456, 164, 650, 291),
    (650, 176, 904, 291),
    (904, 148, 1021, 291),
)


def make_white_transparent(image: Image.Image) -> Image.Image:
    result = image.convert('RGBA')
    pixels = []

    for red, green, blue, _ in result.getdata():
        distance_from_white = 255 - min(red, green, blue)
        alpha = max(0, min(255, distance_from_white * 4))
        pixels.append((red, green, blue, alpha))

    result.putdata(pixels)
    return result


def main() -> None:
    source = Image.open(SOURCE)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for index, box in enumerate(BUILDING_BOXES, start=1):
        building = source.crop(box)
        transparent_building = make_white_transparent(building)
        output_path = OUTPUT_DIR / f'building-{index:02}.png'
        transparent_building.save(output_path)


if __name__ == '__main__':
    main()
