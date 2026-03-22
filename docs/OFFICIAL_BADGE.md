# Официален Facebook profile badge (Prove-it / PB)

1. Постави квадратния експорт като `assets/pb_fb_profile_badge_official.png` (препоръчително **720×720** или по-голям квадрат от вектор).
2. Генерирай overlay:
   ```bash
   python3 build_frame_overlay.py assets/pb_fb_profile_badge_official.png
   ```
3. Резултат: `assets/frame_overlay.png` (800×800). Зеленото и надписите са **непрозрачни** (като в официалния файл); прозрачни са само дупката за снимка и ъглите извън кръга.

След смяна на изходния файл направи hard refresh в браузъра (`?v=` в URL се обновява в `profile_frame_generator.html`).
