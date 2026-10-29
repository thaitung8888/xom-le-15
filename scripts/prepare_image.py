"""Chuẩn bị ảnh sản phẩm cho kệ treo: xoá nền (nếu còn), cắt sát viền, thu nhỏ, lưu WebP.

Cách dùng:
    pip install pillow numpy
    python scripts/prepare_image.py anh-goc.png public/products/ten-san-pham.webp

- Ảnh đã có nền trong suốt: chỉ cắt sát viền và thu nhỏ.
- Ảnh nền trơn (trắng, xám nhạt…, ví dụ JPG): nền được xoá bằng cách loang từ mép ảnh vào,
  dừng lại ở chỗ màu khác hẳn màu nền. Áo trùng màu nền (áo trắng trên nền trắng) sẽ không tách được.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

MAX_H = 1024      # chiều cao tối đa (điểm ảnh): đủ nét trên web, nhẹ cho điện thoại
TOL = 28          # độ lệch màu tối đa so với nền vẫn coi là nền


def remove_flat_background(rgba):
    a = np.array(rgba).astype(np.int16)
    h, w = a.shape[:2]
    border = np.concatenate([a[0, :, :3], a[-1, :, :3], a[:, 0, :3], a[:, -1, :3]])
    bg = np.median(border, axis=0)
    near = np.abs(a[..., :3] - bg).max(axis=2) <= TOL
    seen = np.zeros((h, w), bool)
    q = deque([(y, x) for y in (0, h - 1) for x in range(w)] + [(y, x) for x in (0, w - 1) for y in range(h)])
    while q:
        y, x = q.popleft()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or not near[y, x]:
            continue
        seen[y, x] = True
        q.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    alpha = Image.fromarray(np.where(seen, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = rgba.copy(); out.putalpha(alpha)
    return out


def main(src, dst):
    im = Image.open(src).convert('RGBA')
    if np.array(im)[..., 3].min() > 250:          # không có chỗ nào trong suốt → nền còn nguyên
        im = remove_flat_background(im)
    a = np.array(im)[..., 3]
    ys, xs = np.where(a > 24)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    if im.height > MAX_H:
        im = im.resize((round(im.width * MAX_H / im.height), MAX_H), Image.LANCZOS)
    pad = 6
    canvas = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    canvas.save(dst, 'WEBP', quality=88, method=6)
    print(f'{dst}: {canvas.width}x{canvas.height}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
