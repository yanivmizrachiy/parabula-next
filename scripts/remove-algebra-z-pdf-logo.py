from __future__ import annotations

import base64
import gzip
import hashlib
import json
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "meta/algebra-z-workbook.json"
CHUNK_ROOT = ROOT / "assets/workbooks/algebra-z/chunks"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def detect_header_logo_rect(pdf_path: Path) -> fitz.Rect:
    doc = fitz.open(pdf_path)
    page = doc[0]
    matrix = fitz.Matrix(3, 3)
    pix = page.get_pixmap(matrix=matrix, alpha=False)
    image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    width, height = image.size
    top_limit = int(height * 0.18)
    pixels = image.load()

    mask = bytearray(width * top_limit)
    for y in range(top_limit):
        row = y * width
        for x in range(width):
            r, g, b = pixels[x, y]
            blue = b >= 95 and b >= r + 18 and b >= g + 6
            navy = b >= 55 and b >= r + 8 and g >= r + 4 and (r + g + b) < 390
            if blue or navy:
                mask[row + x] = 1

    seen = bytearray(len(mask))
    components: list[tuple[int, int, int, int, int]] = []
    for y in range(top_limit):
        for x in range(width):
            idx = y * width + x
            if not mask[idx] or seen[idx]:
                continue
            stack = [(x, y)]
            seen[idx] = 1
            min_x = max_x = x
            min_y = max_y = y
            count = 0
            while stack:
                cx, cy = stack.pop()
                count += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)
                for ny in range(max(0, cy - 1), min(top_limit, cy + 2)):
                    for nx in range(max(0, cx - 1), min(width, cx + 2)):
                        nidx = ny * width + nx
                        if mask[nidx] and not seen[nidx]:
                            seen[nidx] = 1
                            stack.append((nx, ny))
            if count >= 24:
                components.append((min_x, min_y, max_x, max_y, count))

    candidates = []
    for box in components:
        min_x, min_y, max_x, max_y, count = box
        box_width = max_x - min_x + 1
        box_height = max_y - min_y + 1
        center_x = (min_x + max_x) / 2
        if box_width > width * 0.35:
            continue
        if center_x > width * 0.48:
            continue
        if min_y > top_limit * 0.82:
            continue
        if box_height < 4 or count < 24:
            continue
        candidates.append(box)

    if not candidates:
        doc.close()
        return fitz.Rect(30, 12, 185, 92)

    min_x = min(box[0] for box in candidates)
    min_y = min(box[1] for box in candidates)
    max_x = max(box[2] for box in candidates)
    max_y = max(box[3] for box in candidates)

    scale_x = page.rect.width / width
    scale_y = page.rect.height / height
    rect = fitz.Rect(
        max(0, (min_x - 18) * scale_x),
        max(0, (min_y - 14) * scale_y),
        min(page.rect.width, (max_x + 18) * scale_x),
        min(page.rect.height, (max_y + 14) * scale_y),
    )

    # Safety bounds: the requested mark is confined to the upper-left header.
    if rect.width < 45 or rect.width > 220 or rect.height < 20 or rect.height > 115:
        rect = fitz.Rect(30, 12, 185, 92)

    doc.close()
    return rect


def redact_pdf(pdf_path: Path, rect: fitz.Rect) -> None:
    source = fitz.open(pdf_path)
    output = fitz.open()
    output.insert_pdf(source)
    source.close()

    for page in output:
        page.add_redact_annot(rect, fill=(1, 1, 1))
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_REMOVE)

    temp = pdf_path.with_suffix(".tmp.pdf")
    output.save(temp, garbage=4, deflate=True, clean=True)
    output.close()
    temp.replace(pdf_path)


def write_chunks(mode: str, pdf_bytes: bytes) -> None:
    target = CHUNK_ROOT / mode
    target.mkdir(parents=True, exist_ok=True)
    for old in target.glob("part-*.b64"):
        old.unlink()

    compressed = gzip.compress(pdf_bytes, compresslevel=9, mtime=0)
    encoded = base64.b64encode(compressed).decode("ascii")
    chunk_size = 900_000
    for index, start in enumerate(range(0, len(encoded), chunk_size), start=1):
        (target / f"part-{index:03d}.b64").write_text(encoded[start:start + chunk_size] + "\n", encoding="ascii")


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    color_path = ROOT / manifest["files"]["color"]["path"]
    rect = detect_header_logo_rect(color_path)
    print(f"Detected logo rectangle: {tuple(round(value, 2) for value in rect)}")

    for mode in ("color", "bw"):
        pdf_path = ROOT / manifest["files"][mode]["path"]
        redact_pdf(pdf_path, rect)
        data = pdf_path.read_bytes()
        manifest["files"][mode]["bytes"] = len(data)
        manifest["files"][mode]["sha256"] = sha256(data)
        write_chunks(mode, data)
        print(f"{mode}: {len(data)} bytes, {sha256(data)}")

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
