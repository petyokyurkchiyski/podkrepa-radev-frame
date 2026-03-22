#!/usr/bin/env python3
"""
Създава маска за профилна рамка:
- Извън кръга: прозрачно
- Сивата зона (горе, за снимката на потребителя): напълно прозрачна (alpha 0)
- Зелената лента: полупрозрачна (alpha ~0.75)
- Бялата рамка, квадрат 21, текст, иконка: непрозрачни

Вход: изображение с layout (сиво + зелено + бели/тъмно зелени елементи).
Изход: frame_mask.png с alpha канал за overlay върху снимка.
"""

import sys
from pathlib import Path

from PIL import Image

# Цветове от референса (приблизително)
GREY_PLACEHOLDER = (0x4c, 0x51, 0x5a)   # зона за снимка → прозрачна
GREEN_BAND = (0x6b, 0x8e, 0x7c)          # лента → полупрозрачна
DARK_GREEN = (0x1a, 0x43, 0x2b)          # 21, стрелка → непрозрачни

# Допуск при сравнение на цветове (за anti-aliasing)
TOLERANCE = 45
WHITE_MIN = 230
GREEN_BAND_ALPHA = 190  # полупрозрачност на зелената лента (0–255)


def in_circle(cx: float, cy: float, x: int, y: int, r: float) -> bool:
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def is_grey(r: int, g: int, b: int) -> bool:
    """Сиво (placeholder) – не е бяло и не е зелено."""
    if r >= WHITE_MIN and g >= WHITE_MIN and b >= WHITE_MIN:
        return False
    if g > r + 25 and g > b + 15:
        return False
    return 35 <= r <= 120 and 40 <= g <= 130 and 50 <= b <= 130


def is_band_green(r: int, g: int, b: int) -> bool:
    """Мутно зелено на лентата."""
    return 80 <= r <= 140 and 110 <= g <= 180 and 100 <= b <= 150


def is_white(r: int, g: int, b: int) -> bool:
    return r >= WHITE_MIN and g >= WHITE_MIN and b >= WHITE_MIN


def is_dark_green(r: int, g: int, b: int) -> bool:
    """Тъмно зелено (21, иконка)."""
    return r <= 60 and 30 <= g <= 90 and b <= 70


def main() -> None:
    base = Path(__file__).resolve().parent
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if not input_path or not input_path.exists():
        for candidate in [
            base / "frame_reference.png",
            base / "radev_21_oficial.jpg",
            base / "assets" / "Gemini_Generated_Image_u92k6eu92k6eu92k.png",
        ]:
            if candidate.exists():
                input_path = candidate
                break
        if not input_path or not input_path.exists():
            input_path = base / "frame_reference.png"
    if not input_path.exists():
        raise SystemExit("Липсва входен файл. Ползване: python create_frame_mask.py <път/до/изображение>")

    img = Image.open(input_path).convert("RGB")
    w, h = img.size
    pix = img.load()

    cx, cy = w / 2.0, h / 2.0
    outer_r = min(w, h) / 2.0 - 2

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out_pix = out.load()

    for y in range(h):
        for x in range(w):
            if not in_circle(cx, cy, x, y, outer_r):
                out_pix[x, y] = (0, 0, 0, 0)
                continue

            r, g, b = pix[x, y]

            if is_white(r, g, b):
                out_pix[x, y] = (255, 255, 255, 255)
                continue
            if is_dark_green(r, g, b):
                out_pix[x, y] = (r, g, b, 255)
                continue
            if is_band_green(r, g, b):
                out_pix[x, y] = (r, g, b, GREEN_BAND_ALPHA)
                continue
            if is_grey(r, g, b):
                out_pix[x, y] = (0, 0, 0, 0)
                continue

            # Anti-aliasing / междинни пиксели: по позиция и цвят
            if g > r and g > b and 90 <= g <= 170:
                out_pix[x, y] = (r, g, b, GREEN_BAND_ALPHA)
            elif r >= 200 and g >= 200 and b >= 200:
                out_pix[x, y] = (255, 255, 255, 255)
            elif r <= 70 and g <= 100 and b <= 80:
                out_pix[x, y] = (r, g, b, 255)
            else:
                out_pix[x, y] = (0, 0, 0, 0)

    out_path = base / "frame_mask.png"
    out.save(out_path, "PNG")
    print(f"Записано: {out_path}")


if __name__ == "__main__":
    main()
