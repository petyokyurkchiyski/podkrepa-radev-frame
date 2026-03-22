#!/usr/bin/env python3
"""
Обработка на официалната рамка radev_21_oficial.jpg:
- Запълва кръга (без човека) със зеления цвят от лентата (#365e46 или от пиксел в лентата)
- Запазва белия квадрат '21', надписа ПРОГРЕСИВНА БЪЛГАРИЯ и бялата кръгла рамка
- Фонът извън рамката става прозрачен (alpha) за маска/рамка в социални мрежи
- Експорт: frame_21.png

Ползване: python process_frame.py [път/до/radev_21_oficial.jpg]
"""

import sys
from pathlib import Path

from PIL import Image

# Цвят за запълване на централната част (зелен от лентата)
FILL_HEX = "#365e46"

INPUT_IMAGE = "radev_21_oficial.jpg"
OUTPUT_IMAGE = "frame_21.png"


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def in_circle(cx: float, cy: float, x: int, y: int, r: float) -> bool:
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def in_ring(cx: float, cy: float, x: int, y: int, r_outer: float, r_inner: float) -> bool:
    d2 = (x - cx) ** 2 + (y - cy) ** 2
    return r_inner * r_inner <= d2 <= r_outer * r_outer


def main() -> None:
    base = Path(__file__).resolve().parent
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else base / INPUT_IMAGE
    if not input_path.exists():
        raise SystemExit(f"Липсва файл: {input_path}")

    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    pix = img.load()

    cx, cy = w / 2.0, h / 2.0
    outer_r = min(w, h) / 2.0 - 2
    border_width = 14
    inner_r = outer_r - border_width

    # Опционално: вземи зелен цвят от пиксел в долната лента (под центъра, в зелената зона)
    band_center_y = int(cy + inner_r * 0.6)
    band_center_x = int(cx)
    if 0 <= band_center_x < w and 0 <= band_center_y < h:
        br, bg, bb, ba = pix[band_center_x, band_center_y]
        if (br, bg, bb) != (255, 255, 255) and ba > 200:
            fill_r, fill_g, fill_b = br, bg, bb
        else:
            fill_r, fill_g, fill_b = hex_to_rgb(FILL_HEX)
    else:
        fill_r, fill_g, fill_b = hex_to_rgb(FILL_HEX)

    # Долната лента: долните ~35% от кръга – запазваме оригинал (21, надпис, зелена лента)
    band_top_y = cy + inner_r * 0.42

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out_pix = out.load()

    for y in range(h):
        for x in range(w):
            if not in_circle(cx, cy, x, y, outer_r):
                out_pix[x, y] = (0, 0, 0, 0)
                continue

            if in_ring(cx, cy, x, y, outer_r, inner_r):
                out_pix[x, y] = pix[x, y]
                continue

            if y >= band_top_y:
                out_pix[x, y] = pix[x, y]
                continue

            out_pix[x, y] = (fill_r, fill_g, fill_b, 255)

    out.save(base / OUTPUT_IMAGE, "PNG")
    print(f"Записано: {base / OUTPUT_IMAGE}")


if __name__ == "__main__":
    main()
