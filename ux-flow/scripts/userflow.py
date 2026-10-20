#!/usr/bin/env python3
"""User flow diagram (SVG) for the ux-flow guide's User flow chapter.

uflow(nodes, edges, caption='') -> '<div class="uflow">…<svg>…</svg></div>' string

nodes: list of (id, label, kind, col, row)
  kind: 'start' (entry point), 'screen' (designed screen), 'modal' (modal, drawer, popover),
        'decision' (system check / branch), 'end' (exit / done), 'missing' (step with no frame yet)
  col, row: grid position (0-based). Lay the happy path left to right on one row; branches above/below.
  Use '\\n' in a label for a second line.
edges: list of (from_id, to_id, label, status[, via])
  via: 'h' (default) side bus along the column gutter; 'v' across the source row then up/down.
  Keep nodes out of an edge's path: lay branches in free cells; keep labels short (1–2 words).
  status: 'linked'  — prototype link exists in Figma (solid)
          'design'  — shown by the design but not linked (dashed)
          'open'    — destination not in the design: an open question, ask the user (dashed, red, '?')
Never draw an 'open' edge as if it were known; add it to Decisions and ask.
Colors are the guide template's CSS variables, so the diagram follows light and dark themes.
"""
CW, RH, NW, NH = 214, 100, 150, 50

def _esc(s): return s.replace('&', '&amp;').replace('<', '&lt;')

def uflow(nodes, edges, caption=''):
    cols = max(n[3] for n in nodes) + 1; rows = max(n[4] for n in nodes) + 1
    W, H = cols * CW + 24, rows * RH + 24
    pos = {n[0]: (24 + n[3] * CW + (CW - NW) / 2 - 12, 24 + n[4] * RH + (RH - NH) / 2 - 12, n) for n in nodes}
    o = [f'<div class="uflow" style="overflow-x:auto"><svg viewBox="0 0 {W} {H}" style="width:100%;min-width:{int(W*0.72)}px;display:block" role="img" aria-label="{_esc(caption)}">',
         '<defs>' + ''.join(f'<marker id="uf-{k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{c}"/></marker>'
                            for k, c in (('linked', 'var(--accent)'), ('design', 'var(--muted)'), ('open', 'var(--danger)'))) + '</defs>']
    def box(i):
        x, y, n = pos[i]; return x, y, x + NW, y + NH, x + NW / 2, y + NH / 2
    # edges first (under nodes)
    for e in edges:
        a, b, lab, st = e[:4]; via = e[4] if len(e) > 4 else 'h'
        ax0, ay0, ax1, ay1, acx, acy = box(a); bx0, by0, bx1, by1, bcx, bcy = box(b)
        if abs(acy - bcy) < 1:          # same row
            pair = any(f[0] == b and f[1] == a for f in edges)
            dy = (-8 if bcx > acx else 8) if pair else 0   # a pair of opposite edges runs as two parallel lines
            p = [(ax1, acy + dy), (bx0, bcy + dy)] if bcx > acx else [(ax0, acy + dy), (bx1, bcy + dy)]
        elif abs(acx - bcx) < 1:        # same column
            p = [(acx, ay1 if bcy > acy else ay0), (bcx, by0 if bcy > acy else by1)]
        elif via == 'v':                 # across the source row, then up/down into the target
            p = [(ax0 if bcx < acx else ax1, acy), (bcx, acy), (bcx, by0 if bcy > acy else by1)]
        else:                            # side bus: out the side, along the column gutter, into the target side
            r = bcx > acx; gx = (ax1 if r else ax0) + (1 if r else -1) * (CW - NW) / 2
            p = [(ax1 if r else ax0, acy), (gx, acy), (gx, bcy), (bx0 if r else bx1, bcy)]
        col = {'linked': 'var(--accent)', 'design': 'var(--muted)', 'open': 'var(--danger)'}[st]
        dash = '' if st == 'linked' else ' stroke-dasharray="5 4"'
        d = 'M' + ' L'.join(f'{x:.0f} {y:.0f}' for x, y in p)
        o.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="1.6"{dash} marker-end="url(#uf-{st})"/>')
        t = (('? ' if st == 'open' else '') + lab).strip()
        if t:
            # label on the longest segment
            segs = list(zip(p, p[1:])); vs = [g for g in segs if abs(g[0][0] - g[1][0]) < 1]
            seg = vs[0] if len(p) == 4 and vs and abs(p[0][1]-p[-1][1]) > 1 else max(segs, key=lambda s: abs(s[0][0] - s[1][0]) + abs(s[0][1] - s[1][1]))
            mx, my = (seg[0][0] + seg[1][0]) / 2, (seg[0][1] + seg[1][1]) / 2
            w = 6.7 * len(t) + 10
            o.append(f'<rect x="{mx-w/2:.0f}" y="{my-7.5:.0f}" width="{w:.0f}" height="15" rx="7" fill="var(--bg)"/>'
                     f'<text x="{mx:.0f}" y="{my:.0f}" font-size="10.5" fill="{col}" text-anchor="middle" dominant-baseline="middle" font-family="IBM Plex Mono, monospace">{_esc(t)}</text>')
    for i, (x, y, n) in pos.items():
        _, lab, kind, *_ = n; cx, cy = x + NW / 2, y + NH / 2
        if kind == 'decision':
            o.append(f'<path d="M{cx} {y-6} L{x+NW-14} {cy} L{cx} {y+NH+6} L{x+14} {cy}Z" fill="var(--accent-soft)" stroke="var(--accent)"/>')
        else:
            fill, stroke, rx, dash = {'start': ('var(--accent)', 'var(--accent)', NH / 2, ''), 'end': ('var(--surface)', 'var(--accent)', NH / 2, ''),
                                      'screen': ('var(--surface)', 'var(--line)', 8, ''), 'modal': ('var(--surface-2)', 'var(--line)', 8, ''),
                                      'missing': ('var(--bg)', 'var(--danger)', 8, ' stroke-dasharray="5 4"')}[kind]
            o.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{NW}" height="{NH}" rx="{rx:.0f}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"{dash}/>')
            if kind == 'modal':
                o.append(f'<rect x="{x+6:.0f}" y="{y+6:.0f}" width="{NW-12}" height="{NH-12}" rx="5" fill="none" stroke="var(--line)" stroke-dasharray="2 3"/>')
        ink = 'var(--accent-ink)' if kind == 'start' else ('var(--danger)' if kind == 'missing' else 'var(--ink)')
        lines = lab.split('\n')
        for k, ln in enumerate(lines):
            o.append(f'<text x="{cx:.0f}" y="{cy + (k - (len(lines)-1)/2) * 15:.0f}" font-size="12.5" font-weight="{600 if k==0 else 400}" fill="{ink}" text-anchor="middle" dominant-baseline="middle">{_esc(ln)}</text>')
    o.append('</svg></div>')
    return ''.join(o)

LEGEND_HTML = ('<div class="legend">'
  '<span><i class="sw" style="background:var(--accent);border-radius:8px"></i>Entry</span>'
  '<span><i class="sw" style="background:var(--surface);border:1px solid var(--line)"></i>Screen</span>'
  '<span><i class="sw" style="background:var(--surface-2);border:1px dashed var(--line)"></i>Modal · drawer</span>'
  '<span><i class="sw" style="background:var(--accent-soft);border:1px solid var(--accent);transform:rotate(45deg) scale(.8)"></i>Check</span>'
  '<span><i class="sw" style="border:1px dashed var(--danger)"></i>Not designed</span>'
  '<span style="color:var(--accent)">── Linked</span><span style="color:var(--muted)">- - Not linked</span><span style="color:var(--danger)">- - ? Open question</span></div>')
