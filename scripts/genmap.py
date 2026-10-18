# Map generator for standard levels: intro, ambushes, three arenas (<= 30 wide), exit.
# usage: python3 scripts/genmap.py SEED [width] [--hazard] [--indoor] [--ceiling]
# Markers: P spawn, A ambush, B-C arena 1 (G spawn inside), D ambush, E-F arena 2
# (M spawn inside), H-I arena 3 (L spawn inside), J closing beat, X exit.
import random, sys
seed = int(sys.argv[1]); W = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 200
hazard = '--hazard' in sys.argv; indoor = '--indoor' in sys.argv; ceiling = '--ceiling' in sys.argv
r = random.Random(seed)
H = 17
g = [['.'] * W for _ in range(H)]
for y in range(13, H):
    for x in range(W): g[y][x] = '#'
for y in range(H): g[y][0] = g[y][W - 1] = '#'
if ceiling:
    for x in range(W): g[0][x] = g[1][x] = '#'
def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 < x < W - 1 and 0 <= y < H: g[y][x] = c
if indoor: rect(1, 2 if ceiling else 3, W - 2, 12, ':')
arenas = [(48, 74, 'G'), (108, 135, 'M'), (158, 185, 'L')]
def platforms(x0, x1, n):
    for _ in range(n):
        w = r.randint(4, 8); x = r.randint(x0, max(x0, x1 - w)); y = r.choice([7, 8, 9, 10])
        rect(x, y, x + w - 1, y, '=')
        if not indoor and r.random() < 0.5: rect(x, y + 1, x + w - 1, 12, ':')
def block(x, h):
    rect(x, 13 - h, x + r.randint(1, 3), 12, '#')
# Intro and travel sections.
platforms(8, 40, 3); block(28, 2); platforms(80, 102, 2); block(90, 3); platforms(140, 154, 2)
if hazard:
    for x in (36, 96, 146): rect(x, 12, x + 2, 12, '^')
for x0, x1, s in arenas:
    platforms(x0 + 2, x1 - 2, 3); block(x0 + r.randint(8, 16), r.randint(1, 2))
marks = {'P': 3, 'A': 24, 'B': 48, 'C': 74, 'G': 70, 'D': 92, 'E': 108, 'F': 135, 'M': 131, 'H': 158, 'I': 185, 'L': 181, 'J': 188, 'X': W - 5}
for k, x in marks.items():
    rect(x, 12, x, 12, k)
    if g[11][x] == '#': g[11][x] = '.'
    if g[12][x] == '^': pass
    # Keep a clear column above each marker.
    for y in range(9, 12):
        if g[y][x] in '#=': g[y][x] = ':' if indoor else '.'
for row in g: print("    '" + ''.join(row) + "',")
