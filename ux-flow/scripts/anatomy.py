#!/usr/bin/env python3
"""To-scale spacing diagram (SVG) for the ux-flow guide's Layout spacing chapter.

anat(W, H, pad=(top, right, bottom, left), direction='V'|'H', gap, items=[(w, h, label), ...],
     r=radius, caption='...', maxw=None) -> '<svg …>' string

Draws the container at its real size: padding bands (var(--ov-pad)), gaps (var(--ov-gap)),
children (var(--surface)), padding and gap numbers, width below, height on the right, radius.
Colors are the guide template's CSS variables, so the diagram follows light and dark themes.
Use maxw for small components (e.g. 420) so they are not blown up.
"""
def anat(W,H,pad,direction,gap,items,r=0,caption='',maxw=None):
    """Container W×H with padding (t,r,b,l), children stacked with gap. items: (w,h,label)."""
    t,rt,b,l=pad
    disp=min(maxw or min(860,int(W*2.4)),860)
    fs=13*W/(disp-13*7.6)
    m=fs*3.2; mr=fs*6
    vw,vh=W+m+mr,H+2*m
    x0,y0=m,m
    o=[f'<svg viewBox="0 0 {vw:.0f} {vh:.0f}" style="width:100%;max-width:{disp}px;display:block" role="img" aria-label="{caption}">']
    o.append(f'<rect x="{x0}" y="{y0}" width="{W}" height="{H}" rx="{r}" fill="var(--surface-2)" stroke="var(--line)"/>')
    # padding bands
    if t: o.append(f'<rect x="{x0}" y="{y0}" width="{W}" height="{t}" fill="var(--ov-pad)"/>')
    if b: o.append(f'<rect x="{x0}" y="{y0+H-b}" width="{W}" height="{b}" fill="var(--ov-pad)"/>')
    if l: o.append(f'<rect x="{x0}" y="{y0+t}" width="{l}" height="{H-t-b}" fill="var(--ov-pad)"/>')
    if rt: o.append(f'<rect x="{x0+W-rt}" y="{y0+t}" width="{rt}" height="{H-t-b}" fill="var(--ov-pad)"/>')
    txt=lambda x,y,s,c='var(--ink)',a='middle',w=600: f'<text x="{x:.1f}" y="{y:.1f}" font-size="{fs:.1f}" font-weight="{w}" fill="{c}" text-anchor="{a}" dominant-baseline="middle" font-family="IBM Plex Mono, monospace">{s}</text>'
    pc='var(--ov-pad-ink)'; gc='var(--ov-gap-ink)'
    if t: o.append(txt(x0+W/2,y0+t/2 if t>fs*1.1 else y0-fs*0.9,t,pc))
    if b and b!=t: o.append(txt(x0+W/2,y0+H-b/2 if b>fs*1.1 else y0+H+fs*0.9,b,pc))
    if l: o.append(txt(x0+l/2 if l>fs*2 else x0-fs*1.2,y0+H/2,l,pc))
    if rt and rt!=l: o.append(txt(x0+W-rt/2 if rt>fs*2 else x0+W+fs*2.4,y0+H/2,rt,pc))
    # children
    cx,cy=x0+l,y0+t
    for i,(w,h,lab) in enumerate(items):
        o.append(f'<rect x="{cx}" y="{cy}" width="{w}" height="{h}" rx="{min(4,h/4)}" fill="var(--surface)" stroke="var(--line)"/>')
        if h>fs*1.4 and w>fs*4: o.append(txt(cx+w/2,cy+h/2,f'{lab} · {w}×{h}' if w>fs*14 else (f'{lab}' if w>fs*5 else ''),'var(--muted)','middle',500))
        if i<len(items)-1 and gap:
            if direction=='V':
                o.append(f'<rect x="{cx}" y="{cy+h}" width="{max(w,10)}" height="{gap}" fill="var(--ov-gap)"/>')
                o.append(txt(x0+W+fs*0.8,cy+h+gap/2,gap,gc,'start'))
                cy+=h+gap
            else:
                o.append(f'<rect x="{cx+w}" y="{cy}" width="{gap}" height="{max(h,10)}" fill="var(--ov-gap)"/>')
                o.append(txt(cx+w+gap/2,cy-fs*0.9 if cy-fs*0.9>y0 else cy+h+fs*0.9,gap,gc))
                cx+=w+gap
        else:
            if direction=='V': cy+=h
            else: cx+=w
    # dimensions
    o.append(txt(x0+W/2,vh-m*0.45,f'{W}','var(--muted)'))
    o.append(f'<text x="{vw-fs*1.2:.1f}" y="{y0+H/2:.1f}" font-size="{fs:.1f}" font-weight="600" fill="var(--muted)" text-anchor="middle" dominant-baseline="middle" font-family="IBM Plex Mono, monospace">{H}</text>')
    if r: o.append(txt(x0+fs*0.2,y0-fs*0.9,f'r {r}','var(--muted)','start',500))
    o.append('</svg>')
    return ''.join(o)
LEGEND_HTML='<div class="legend"><span><i class="sw" style="background:var(--ov-pad)"></i>Padding</span><span><i class="sw" style="background:var(--ov-gap)"></i>Gap</span><span><i class="sw" style="background:var(--surface);border:1px solid var(--line)"></i>Content</span></div>'
