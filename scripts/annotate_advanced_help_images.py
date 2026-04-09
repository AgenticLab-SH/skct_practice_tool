from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TMP_DIR = ROOT / "tmp"
IMAGES_DIR = ROOT / "images"

STATUS_RAW = TMP_DIR / "advanced_status_raw.png"
OMR_RAW = TMP_DIR / "advanced_omr_raw.png"
STATUS_OUT = IMAGES_DIR / "advanced_mode_status_highlight.png"
OMR_OUT = IMAGES_DIR / "advanced_mode_omr_highlight.png"


def get_font(size: int):
    for candidate in [
        "C:/Windows/Fonts/malgunbd.ttf",
        "C:/Windows/Fonts/malgun.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


TITLE_FONT = get_font(24)
BODY_FONT = get_font(18)


def draw_label(draw: ImageDraw.ImageDraw, xy, text: str, fill: str):
    x, y = xy
    bbox = draw.textbbox((x, y), text, font=BODY_FONT)
    padding_x = 12
    padding_y = 8
    rect = (
        bbox[0] - padding_x,
        bbox[1] - padding_y,
        bbox[2] + padding_x,
        bbox[3] + padding_y,
    )
    draw.rounded_rectangle(rect, radius=12, fill=fill)
    draw.text((x, y), text, font=BODY_FONT, fill="white")


def draw_highlight(base: Image.Image, box, label_xy, label_text: str, color: str):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rounded_rectangle(box, radius=18, outline=color, width=8, fill=(255, 255, 255, 20))
    draw_label(overlay_draw, label_xy, label_text, color)
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def add_title(base: Image.Image, title: str):
    canvas = Image.new("RGBA", (base.width, base.height + 64), (255, 255, 255, 255))
    canvas.alpha_composite(base.convert("RGBA"), (0, 64))
    draw = ImageDraw.Draw(canvas)
    draw.text((18, 18), title, font=TITLE_FONT, fill="#111827")
    return canvas


def build_status_image():
    image = Image.open(STATUS_RAW).convert("RGBA")
    cropped = image.crop((250, 10, 1280, 360))
    composed = add_title(cropped, "고급 모드 상태와 실제환경 여백")
    composed = draw_highlight(composed, (34, 120, 996, 292), (38, 84), "상단 상태 바에서 로그인과 만료를 바로 확인", "#2563EB")
    composed = draw_highlight(composed, (924, 240, 998, 314), (640, 300), "우측 버튼 열과 여백이 실제환경 감각을 맞춤", "#DC2626")
    composed.save(STATUS_OUT)


def build_omr_image():
    image = Image.open(OMR_RAW).convert("RGBA")
    cropped = image.crop((0, 330, 430, 958))
    composed = add_title(cropped, "OMR 아래 고급 버튼 활용 순서")
    composed = draw_highlight(composed, (8, 168, 404, 292), (26, 96), "정답 입력 모드와 채점 버튼부터 시작", "#EA580C")
    composed = draw_highlight(composed, (8, 296, 404, 556), (24, 312), "안내 패널이 사용 순서를 바로 설명", "#2563EB")
    composed = draw_highlight(composed, (8, 562, 404, 688), (58, 580), "복기용 버튼은 하단에 연속으로 모여 있음", "#7C3AED")
    composed.save(OMR_OUT)


def main():
    if not STATUS_RAW.exists() or not OMR_RAW.exists():
        missing = [str(path.name) for path in [STATUS_RAW, OMR_RAW] if not path.exists()]
        raise SystemExit(f"missing screenshots: {', '.join(missing)}")
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    build_status_image()
    build_omr_image()
    print(f"generated: {STATUS_OUT}")
    print(f"generated: {OMR_OUT}")


if __name__ == "__main__":
    main()
