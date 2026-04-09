from pathlib import Path

from PIL import Image, ImageColor, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TMP_DIR = ROOT / "tmp"
IMAGES_DIR = ROOT / "images"

STATUS_RAW = TMP_DIR / "advanced_status_raw.png"
OMR_RAW = TMP_DIR / "advanced_omr_raw.png"
STATUS_OUT = IMAGES_DIR / "advanced_mode_status_highlight.png"
OMR_OUT = IMAGES_DIR / "advanced_mode_omr_highlight.png"


def get_font(size: int):
    for candidate in [
        "C:/Windows/Fonts/malgun.ttf",
        "C:/Windows/Fonts/malgunbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


TITLE_FONT = get_font(18)
BODY_FONT = get_font(13)


def draw_label(draw: ImageDraw.ImageDraw, xy, text: str, accent):
    x, y = xy
    bbox = draw.textbbox((x, y), text, font=BODY_FONT)
    padding_x = 8
    padding_y = 5
    rect = (
        bbox[0] - padding_x,
        bbox[1] - padding_y,
        bbox[2] + padding_x,
        bbox[3] + padding_y,
    )
    draw.rounded_rectangle(rect, radius=10, fill=(255, 255, 255, 235), outline=accent, width=2)
    draw.text((x, y), text, font=BODY_FONT, fill="#0f172a")


def draw_highlight(base: Image.Image, box, label_xy, label_text: str, color: str):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    accent = ImageColor.getrgb(color) + (185,)
    overlay_draw.rounded_rectangle(box, radius=14, outline=accent, width=4, fill=(255, 255, 255, 8))
    draw_label(overlay_draw, label_xy, label_text, accent)
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def add_title(base: Image.Image, title: str):
    canvas = Image.new("RGBA", (base.width, base.height + 44), (255, 255, 255, 255))
    canvas.alpha_composite(base.convert("RGBA"), (0, 44))
    draw = ImageDraw.Draw(canvas)
    draw.text((18, 12), title, font=TITLE_FONT, fill="#111827")
    return canvas


def build_status_image():
    image = Image.open(STATUS_RAW).convert("RGBA")
    cropped = image.crop((250, 10, 1280, 360))
    composed = add_title(cropped, "고급 모드 상태와 실제환경 여백")
    composed = draw_highlight(composed, (34, 100, 996, 272), (40, 62), "상단 상태 바에서 로그인과 만료 확인", "#2563EB")
    composed = draw_highlight(composed, (924, 220, 998, 294), (676, 266), "우측 여백과 버튼 자리가 함께 복원", "#DC2626")
    composed.save(STATUS_OUT)


def build_omr_image():
    image = Image.open(OMR_RAW).convert("RGBA")
    cropped = image.crop((0, 330, 430, 958))
    composed = add_title(cropped, "OMR 아래 고급 버튼 활용 순서")
    composed = draw_highlight(composed, (8, 148, 404, 272), (26, 72), "정답 입력과 채점부터 시작", "#EA580C")
    composed = draw_highlight(composed, (8, 276, 404, 536), (28, 286), "가운데 안내 패널이 순서를 짚어 줌", "#2563EB")
    composed = draw_highlight(composed, (8, 542, 404, 668), (62, 548), "복기용 버튼은 아래에 모여 있음", "#7C3AED")
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
