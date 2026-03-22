#!/usr/bin/env python3
"""
Overlay 1:1 от официалния квадратен PNG.

• Мащабиране 720→800 с Lanczos — гладки ръбове на кривата и по-мек антиалиас.
• Бял текст върху зелено: Lanczos усреднява бяло+зелено; възстановяваме бялото, когато
  яркостта на смесения пиксел е достатъчно висока (типично ръб/вътрешност на буква).
• NEAREST само за класификация „най-близък пиксел в източника“ (NN), не за цвета.
• Дупка за снимка: α=0 в официалния PNG. Ъгли извън кръга: прозрачни.

Usage: python build_frame_overlay.py [assets/pb_fb_profile_badge_official.png]
"""

import sys
from pathlib import Path

from PIL import Image

WEB = 800
# Тъмно зелено след Lanczos е L≲92; ръб на бял текст често L≥95.
LUM_TEXT_RECOVER = 95


def lum(r: int, g: int, b: int) -> float:
    return 0.299 * r + 0.587 * g + 0.114 * b


def is_forest_green(r: int, g: int, b: int) -> bool:
    if r > 95 or g < 40 or b < 30:
        return False
    if g > 120 or b > 100:
        return False
    return g >= r + 10 and lum(r, g, b) < 100


def is_white(r: int, g: int, b: int) -> bool:
    return r >= 242 and g >= 242 and b >= 242


def build_overlay(src_rgba: Image.Image) -> Image.Image:
    if src_rgba.mode != "RGBA":
        src_rgba = src_rgba.convert("RGBA")
    iw, ih = src_rgba.size
    if iw != ih:
        raise ValueError("Очаква се квадратен PNG.")
    spx = src_rgba.load()
    cx, cy = iw // 2, ih // 2
    R_circle = iw / 2.0

    # Гладко мащабиране за изходен RGB (по-малко „стълби“ от NEAREST).
    scaled = src_rgba.resize((WEB, WEB), Image.Resampling.LANCZOS)
    scaled_rgb = scaled.convert("RGB")
    bpix = scaled_rgb.load()

    out = Image.new("RGBA", (WEB, WEB), (0, 0, 0, 0))
    op = out.load()

    scale = WEB / float(iw)

    for oy in range(WEB):
        for ox in range(WEB):
            sx = (ox + 0.5) / scale
            sy = (oy + 0.5) / scale
            ix = int(min(max(sx, 0), iw - 1))
            iy = int(min(max(sy, 0), ih - 1))
            r_l, g_l, b_l = bpix[ox, oy]
            rs, gs, bs, a_nn = spx[ix, iy]

            d_src = ((sx - cx) ** 2 + (sy - cy) ** 2) ** 0.5

            if d_src > R_circle + 0.5:
                op[ox, oy] = (0, 0, 0, 0)
                continue

            if a_nn == 0:
                op[ox, oy] = (0, 0, 0, 0)
                continue

            L = lum(r_l, g_l, b_l)

            # Пикселът е достатъчно „светъл“ след Lanczos → типично бял текст / AA, не тъмно поле.
            if is_white(rs, gs, bs) or L >= LUM_TEXT_RECOVER:
                op[ox, oy] = (255, 255, 255, 255)
                continue

            if lum(rs, gs, bs) > 195 and rs > 190 and gs > 190:
                op[ox, oy] = (255, 255, 255, 255)
                continue

            # Тъмно зелено от източника + ниска яркост след Lanczos → запазваме гладкото зелено.
            if is_forest_green(rs, gs, bs) and L < 118:
                op[ox, oy] = (r_l, g_l, b_l, 255)
                continue

            op[ox, oy] = (r_l, g_l, b_l, 255)

    return out


def main() -> None:
    base = Path(__file__).resolve().parent
    assets = base / "assets"
    assets.mkdir(exist_ok=True)

    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else assets / "pb_fb_profile_badge_official.png"
    if not src_path.exists():
        print("Липсва:", src_path)
        sys.exit(1)

    img = Image.open(src_path).convert("RGBA")
    out = build_overlay(img)
    out_path = assets / "frame_overlay.png"
    out.save(out_path, "PNG", optimize=True)
    print(f"OK: {out_path} — Lanczos + възстановяване на бял текст (L≥{LUM_TEXT_RECOVER}), α=0 дупка")


if __name__ == "__main__":
    main()
