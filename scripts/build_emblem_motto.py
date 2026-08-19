from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BRANDING = ROOT / "public" / "branding"


def ink_layer(path: Path, size: tuple[int, int]) -> Image.Image:
    source = Image.open(path).convert("RGBA")
    pixels = source.load()
    for y in range(source.height):
        for x in range(source.width):
            red, green, blue, _ = pixels[x, y]
            darkness = max(0, 245 - min(red, green, blue))
            alpha = 0 if darkness < 18 else min(255, (darkness - 18) * 4)
            pixels[x, y] = (242, 241, 233, alpha)

    bounds = source.getbbox()
    if bounds:
        source = source.crop(bounds)
    source.thumbnail(size, Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", size)
    layer.alpha_composite(source, ((size[0] - source.width) // 2, (size[1] - source.height) // 2))
    return layer


canvas = Image.new("RGBA", (2300, 900))
left = ink_layer(BRANDING / "motto-shangao-source.png", (700, 820))
right = ink_layer(BRANDING / "motto-shuichang-source.png", (700, 820))

emblem = Image.open(BRANDING / "sysu-emblem.png").convert("RGBA")
emblem.thumbnail((700, 700), Image.Resampling.LANCZOS)
emblem_alpha = emblem.getchannel("A")
emblem_ink = Image.new("RGBA", emblem.size, (186, 242, 211, 255))
emblem_ink.putalpha(emblem_alpha)

canvas.alpha_composite(left, (20, 40))
canvas.alpha_composite(emblem_ink, ((canvas.width - emblem_ink.width) // 2, (canvas.height - emblem_ink.height) // 2))
canvas.alpha_composite(right, (canvas.width - right.width - 20, 40))
canvas.save(BRANDING / "sysu-emblem-shangao-shuichang.png", optimize=True)
