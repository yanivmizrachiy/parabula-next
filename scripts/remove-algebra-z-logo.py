#!/usr/bin/env python3
from __future__ import annotations

import base64
import gzip
import hashlib
import json
import math
import re
from pathlib import Path

import cv2
import fitz
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "meta/algebra-z-workbook.json"
TEST_PATH = ROOT / "tests/contracts/algebra-z-workbook.test.mjs"
ARTIFACT_DIR = ROOT / "tmp/algebra-z-logo-removal"
CHUNK_SIZE = 512 * 1024

START_MARKER = "// BEGIN APPROVED LOGO-FREE ALGEBRA-Z RELEASE"
END_MARKER = "// END APPROVED LOGO-FREE ALGEBRA-Z RELEASE"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def page_rgb(page: fitz.Page, scale: float = 3.0) -> np.ndarray:
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False, colorspace=fitz.csRGB)
    return np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)


def find_logo(arr: np.ndarray) -> tuple[int, int, int, int]:
    height, width, _ = arr.shape
    roi_width = int(width * 0.44)
    roi_height = int(height * 0.22)
    roi = arr[:roi_height, :roi_width]

    gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY)
    dark = (gray < 112).astype(np.uint8) * 255

    kernel = np.ones((3, 3), np.uint8)
    dark = cv2.morphologyEx(dark, cv2.MORPH_CLOSE, kernel, iterations=1)
    contours, _ = cv2.findContours(dark, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    candidates: list[tuple[float, tuple[int, int, int, int]]] = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if not (width * 0.045 <= w <= width * 0.16):
            continue
        if not (height * 0.028 <= h <= height * 0.125):
            continue

        aspect = w / max(h, 1)
        if not 0.72 <= aspect <= 1.38:
            continue

        fill_ratio = float((dark[y:y + h, x:x + w] > 0).mean())
        if fill_ratio < 0.34:
            continue

        squareness = 1.0 - min(abs(1.0 - aspect), 1.0)
        upper_bias = 1.0 - (y / max(roi_height, 1))
        score = fill_ratio * math.sqrt(w * h) * (0.65 + 0.25 * squareness + 0.10 * upper_bias)
        candidates.append((score, (x, y, w, h)))

    if not candidates:
        raise RuntimeError("Could not detect the dense rounded-square logo in the top-left header.")

    candidates.sort(reverse=True)
    _, box = candidates[0]
    return box


def sample_background(arr: np.ndarray, box: tuple[int, int, int, int]) -> tuple[float, float, float]:
    x, y, w, h = box
    height, width, _ = arr.shape
    pad = max(10, int(min(w, h) * 0.22))

    x0 = max(0, x - pad)
    y0 = max(0, y - pad)
    x1 = min(width, x + w + pad)
    y1 = min(height, y + h + pad)

    region = arr[y0:y1, x0:x1]
    mask = np.ones(region.shape[:2], dtype=bool)
    inner_x0 = x - x0
    inner_y0 = y - y0
    mask[inner_y0:inner_y0 + h, inner_x0:inner_x0 + w] = False

    pixels = region[mask]
    if pixels.size == 0:
        return (1.0, 1.0, 1.0)

    gray = cv2.cvtColor(pixels.reshape(-1, 1, 3), cv2.COLOR_RGB2GRAY).reshape(-1)
    background = pixels[gray > 175]
    if background.size == 0:
        background = pixels

    median = np.median(background, axis=0)
    return tuple(float(value / 255.0) for value in median)


def render_png(page: fitz.Page, target: Path, scale: float = 2.0) -> None:
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False, colorspace=fitz.csRGB)
    target.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(target))


def remove_logo(pdf_path: Path, mode: str) -> dict:
    document = fitz.open(pdf_path)
    if document.page_count != 15:
        raise RuntimeError(f"{mode}: expected 15 pages, got {document.page_count}")

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    render_png(document[0], ARTIFACT_DIR / f"{mode}-before.png")

    detections: list[dict] = []
    for page_index in range(document.page_count):
        page = document[page_index]
        scale = 3.0
        arr = page_rgb(page, scale)
        x, y, w, h = find_logo(arr)
        background = sample_background(arr, (x, y, w, h))

        expand_points = 1.4
        rect = fitz.Rect(
            x / scale - expand_points,
            y / scale - expand_points,
            (x + w) / scale + expand_points,
            (y + h) / scale + expand_points,
        )
        page.draw_rect(rect, color=background, fill=background, width=0, overlay=True)

        detections.append({
            "page": page_index + 1,
            "rect": [round(rect.x0, 3), round(rect.y0, 3), round(rect.x1, 3), round(rect.y1, 3)],
            "background": [round(value, 5) for value in background],
            "rasterBox": [x, y, w, h],
        })

    widths = [item["rect"][2] - item["rect"][0] for item in detections]
    heights = [item["rect"][3] - item["rect"][1] for item in detections]
    centers_x = [(item["rect"][0] + item["rect"][2]) / 2 for item in detections]
    centers_y = [(item["rect"][1] + item["rect"][3]) / 2 for item in detections]

    for values, name, tolerance in [
        (widths, "width", 4.0),
        (heights, "height", 4.0),
        (centers_x, "x-position", 5.0),
        (centers_y, "y-position", 5.0),
    ]:
        if max(values) - min(values) > tolerance:
            raise RuntimeError(f"{mode}: inconsistent logo {name} across pages: {values}")

    temp_path = pdf_path.with_suffix(".logo-free.tmp.pdf")
    document.save(temp_path, garbage=4, deflate=True, clean=True)
    document.close()
    temp_path.replace(pdf_path)

    verified = fitz.open(pdf_path)
    render_png(verified[0], ARTIFACT_DIR / f"{mode}-after.png")
    if verified.page_count != 15:
        raise RuntimeError(f"{mode}: page count changed after logo removal")

    page = verified[0]
    arr = page_rgb(page, 3.0)
    rect = detections[0]["rect"]
    x0, y0, x1, y1 = [int(round(value * 3.0)) for value in rect]
    patch = arr[max(0, y0):min(arr.shape[0], y1), max(0, x0):min(arr.shape[1], x1)]
    gray = cv2.cvtColor(patch, cv2.COLOR_RGB2GRAY)
    dark_ratio = float((gray < 135).mean())
    verified.close()
    if dark_ratio > 0.035:
        raise RuntimeError(f"{mode}: logo area is still visually dark after edit ({dark_ratio:.4f})")

    data = pdf_path.read_bytes()
    return {
        "mode": mode,
        "bytes": len(data),
        "sha256": sha256(data),
        "pages": 15,
        "darkRatioAfter": round(dark_ratio, 6),
        "detections": detections,
    }


def write_chunks(pdf_path: Path, chunk_dir: Path) -> int:
    chunk_dir.mkdir(parents=True, exist_ok=True)
    for old in chunk_dir.glob("part-*.b64"):
        old.unlink()

    compressed = gzip.compress(pdf_path.read_bytes(), compresslevel=9, mtime=0)
    encoded = base64.b64encode(compressed).decode("ascii")

    parts = 0
    for offset in range(0, len(encoded), CHUNK_SIZE):
        parts += 1
        part = encoded[offset:offset + CHUNK_SIZE]
        (chunk_dir / f"part-{parts:03d}.b64").write_text(part + "\n", encoding="ascii")
    return parts


def update_contract(expected_hashes: dict[str, str]) -> None:
    content = TEST_PATH.read_text(encoding="utf-8")
    block = f"""{START_MARKER}
test('algebra-z PDFs are the approved logo-free release', () => {{
  assert.equal(manifest.presentation?.logoRemoved, true);
  assert.deepEqual(
    {{
      color: manifest.files.color.sha256,
      bw: manifest.files.bw.sha256
    }},
    {{
      color: '{expected_hashes["color"]}',
      bw: '{expected_hashes["bw"]}'
    }}
  );
}});
{END_MARKER}"""

    pattern = re.compile(
        re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
        flags=re.DOTALL,
    )
    if pattern.search(content):
        content = pattern.sub(block, content)
    else:
        content = content.rstrip() + "\n\n" + block + "\n"

    TEST_PATH.write_text(content, encoding="utf-8")


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    reports: dict[str, dict] = {}

    for mode in ("color", "bw"):
        item = manifest["files"][mode]
        pdf_path = ROOT / item["path"]
        report = remove_logo(pdf_path, mode)
        parts = write_chunks(pdf_path, ROOT / f"assets/workbooks/algebra-z/chunks/{mode}")
        report["parts"] = parts
        reports[mode] = report

        item["bytes"] = report["bytes"]
        item["sha256"] = report["sha256"]

    manifest["presentation"] = {
        **manifest.get("presentation", {}),
        "logoRemoved": True,
        "logoRemovalScope": "all-15-pages-both-pdf-variants",
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    update_contract({mode: reports[mode]["sha256"] for mode in ("color", "bw")})

    report_path = ARTIFACT_DIR / "report.json"
    report_path.write_text(
        json.dumps({"ok": True, "reports": reports}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(report_path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
