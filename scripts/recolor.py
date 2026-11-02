"""Turns the white oneko sprite into black Mochi with yellow eyes.

Run from the project root with Pillow installed: python scripts/recolor.py
"""
from collections import deque

from PIL import Image

SOURCE = "docs/oneko.gif"
TARGET = "docs/mochi-sprite.png"
FUR = (24, 23, 28, 255)
DETAIL = (72, 69, 80, 255)
OUTLINE = (112, 108, 122, 255)
EYE = (255, 208, 40, 255)
MIN_EYE_PIXELS = 2  # Single pixels are her nose and mouth.
MAX_EYE_PIXELS = 4
CELL = 32
SLEEPING_COLUMN = 2  # Her eyes stay closed in these frames.
SLEEPING_ROWS = 2

image = Image.open(SOURCE).convert("RGBA")
width, height = image.size
pixels = image.load()


def neighbours(x, y, diagonal=False):
    steps = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    if diagonal:
        steps += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    for step_x, step_y in steps:
        next_x, next_y = x + step_x, y + step_y
        if 0 <= next_x < width and 0 <= next_y < height:
            yield next_x, next_y


def is_black(x, y):
    return pixels[x, y] == (0, 0, 0, 255)


def is_clear(x, y):
    return pixels[x, y][3] == 0


def touches_outside(x, y):
    return any(is_clear(*point) for point in neighbours(x, y))


def line_from(start, seen):
    line = []
    queue = deque([start])
    seen.add(start)
    while queue:
        x, y = queue.popleft()
        line.append((x, y))
        for point in neighbours(x, y, diagonal=True):
            same_cell = (point[0] // CELL, point[1] // CELL) == (start[0] // CELL, start[1] // CELL)
            if same_cell and point not in seen and is_black(*point):
                seen.add(point)
                queue.append(point)
    return line


colors = {}
seen = set()
for y in range(height):
    for x in range(width):
        if not is_black(x, y) or (x, y) in seen:
            continue
        line = line_from((x, y), seen)
        is_sleeping = x // CELL == SLEEPING_COLUMN and y // CELL < SLEEPING_ROWS
        is_eye = (
            not is_sleeping
            and MIN_EYE_PIXELS <= len(line) <= MAX_EYE_PIXELS
            and not any(touches_outside(*point) for point in line)
        )
        for point in line:
            if is_eye:
                colors[point] = EYE
            else:
                colors[point] = OUTLINE if touches_outside(*point) else DETAIL

result = Image.new("RGBA", image.size, (0, 0, 0, 0))
output = result.load()
for y in range(height):
    for x in range(width):
        if not is_clear(x, y):
            output[x, y] = colors.get((x, y), FUR)
result.save(TARGET, optimize=True)
