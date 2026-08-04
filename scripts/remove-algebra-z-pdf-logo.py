from __future__ import annotations

import base64
import gzip
import hashlib
import json
from pathlib import Path

import fitz
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "meta/algebra-z-workbook.json"
CHUNK_ROOT = ROOT / "assets/workbooks/algebra-z/chunks"
LOGO_RECT = fitz.Rect(25, 8, 190, 100)
EXPECTED_PAGES = 15
MIN_PDF_BYTES = 1_000_000


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def render_page(page: fitz.Page, scale: float = 3.0) -> Image.Image:
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def page_rect_to_pixels(page: fitz.Page, image: Image.Image, rect: fitz.Rect) -> tuple[int, int, int, int]:
    sx = image.width / page.rect.width
    sy = image.height / page.rect.height
    return (
        max(0, round(rect.x0 * sx)),
        max(0, round(rect.y0 * sy)),
        min(image.width, round(rect.x1 * sx)),
        min(image.height, round(rect.y1 * sy)),
    )


def estimate_background(pdf_path: Path) -> tuple[float, float, float]:
    doc = fitz.open(pdf_path)
    try:
        page = doc[0]
        image = render_page(page)
        sx = image.width / page.rect.width
        sy = image.height / page.rect.height
        sample_box = (
            round(205 * sx),
            round(18 * sy),
            round(285 * sx),
            round(82 * sy),
        )
        sample = image.crop(sample_box)
        pixels = [pixel for pixel in sample.getdata() if min(pixel) >= 210]
        if not pixels:
            return (1.0, 1.0, 1.0)
        probe = Image.new("RGB", (len(pixels), 1))
        probe.putdata(pixels)
        median = ImageStat.Stat(probe).median
        return tuple(round(channel / 255, 4) for channel in median)
    finally:
        doc.close()


def cover_logo(pdf_path: Path, rect: fitz.Rect, fill: tuple[float, float, float]) -> None:
    original_size = pdf_path.stat().st_size
    doc = fitz.open(pdf_path)
    try:
        if doc.page_count != EXPECTED_PAGES:
            raise RuntimeError(f"expected {EXPECTED_PAGES} pages, got {doc.page_count}")

        for page in doc:
            page.draw_rect(rect, color=None, fill=fill, overlay=True)

        temp = pdf_path.with_suffix(".tmp.pdf")
        doc.save(temp, garbage=3, deflate=True, clean=True)
    finally:
        doc.close()

    new_size = temp.stat().st_size
    if new_size < MIN_PDF_BYTES or new_size < original_size * 0.75:
        temp.unlink(missing_ok=True)
        raise RuntimeError(
            f"edited PDF became implausibly small: original={original_size}, edited={new_size}"
        )

    temp.replace(pdf_path)


def verify_logo_removed(pdf_path: Path, rect: fitz.Rect, fill: tuple[float, float, float]) -> None:
    doc = fitz.open(pdf_path)
    try:
        if doc.page_count != EXPECTED_PAGES:
            raise RuntimeError(f"expected {EXPECTED_PAGES} pages, got {doc.page_count}")

        expected_rgb = tuple(round(value * 255) for value in fill)
        for page_number, page in enumerate(doc, start=1):
            image = render_page(page, scale=2.0)
            crop = image.crop(page_rect_to_pixels(page, image, rect))
            pixels = list(crop.getdata())
            mismatches = 0
            for pixel in pixels:
                if max(abs(pixel[index] - expected_rgb[index]) for index in range(3)) > 12:
                    mismatches += 1
            mismatch_ratio = mismatches / max(1, len(pixels))
            if mismatch_ratio > 0.01:
                raise RuntimeError(
                    f"page {page_number}: logo area is not clean enough ({mismatch_ratio:.2%} mismatched pixels)"
                )
    finally:
        doc.close()


def write_chunks(mode: str, pdf_bytes: bytes) -> None:
    target = CHUNK_ROOT / mode
    target.mkdir(parents=True, exist_ok=True)
    for old in target.glob("part-*.b64"):
        old.unlink()

    compressed = gzip.compress(pdf_bytes, compresslevel=9, mtime=0)
    encoded = base64.b64encode(compressed).decode("ascii")
    chunk_size = 900_000
    for index, start in enumerate(range(0, len(encoded), chunk_size), start=1):
        (target / f"part-{index:03d}.b64").write_text(
            encoded[start:start + chunk_size] + "\n",
            encoding="ascii",
        )


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    color_path = ROOT / manifest["files"]["color"]["path"]
    fill = estimate_background(color_path)
    print(f"Cover rectangle: {tuple(LOGO_RECT)}")
    print(f"Background fill: {fill}")

    for mode in ("color", "bw"):
        pdf_path = ROOT / manifest["files"][mode]["path"]
        cover_logo(pdf_path, LOGO_RECT, fill)
        verify_logo_removed(pdf_path, LOGO_RECT, fill)
        data = pdf_path.read_bytes()
        manifest["files"][mode]["bytes"] = len(data)
        manifest["files"][mode]["sha256"] = sha256(data)
        write_chunks(mode, data)
        print(f"{mode}: {len(data)} bytes, {sha256(data)}")

    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
