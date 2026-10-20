#!/usr/bin/env python3
"""Write the developer .md from the published guide, so both always say the same thing.

    python3 guide2md.py <guide.html> <out.md>

Renders the guide with Playwright when it is installed (some chapters, such as the spacing
scale, text styles and CSS tokens, are filled in by the page's script), otherwise reads the
static HTML. Then walks every tab (General first, then one per flow) and writes:

  # <Product> Guide            from <title>
  ## <Tab>                     one per tab
  ### <Chapter>                one per chapter
  #### <Entry>                 one per entry: answer line, tables as Markdown tables,
                               notes as bullets, decision cards as bullets, user flows as
                               Mermaid (from data-uflow), CSS tokens as a css block

Diagrams other than user flows are skipped: their numbers are already in the answer line
and token chips. Links (Figma frames) are kept as Markdown links.
"""
import json, re, sys
from bs4 import BeautifulSoup, NavigableString, Tag


def load(path):
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page()
            pg.goto('file://' + __import__('os').path.abspath(path))
            pg.wait_for_timeout(500)
            html = pg.content()
            b.close()
            return html
    except Exception:
        return open(path, encoding='utf-8').read()


def inline(el):
    if isinstance(el, NavigableString):
        return str(el)
    if not isinstance(el, Tag) or el.name in ('svg', 'script', 'style'):
        return ''
    inner = ''.join(inline(c) for c in el.children)
    if el.name == 'button':
        if inner.strip() in ('Copy', 'Copied', '') or el.get('aria-pressed') is not None:
            return ''
        return f'`{inner.strip()}`'
    if el.name == 'a' and el.get('href', '').startswith('http'):
        t = inner.strip()
        return f'[{t}]({el["href"]})' if t else ''
    if el.name in ('b', 'strong') and inner.strip():
        return f'**{inner.strip()}**'
    if el.name == 'code' and inner.strip():
        return f'`{inner.strip()}`'
    if el.name == 'br':
        return ' '
    return inner


def text(el):
    return re.sub(r'\s+', ' ', inline(el)).strip()


def table(t):
    rows = [[text(c).replace('|', '\\|') for c in tr.find_all(['th', 'td'])] for tr in t.find_all('tr')]
    rows = [r for r in rows if any(r)]
    if not rows:
        return ''
    n = max(len(r) for r in rows)
    rows = [r + [''] * (n - len(r)) for r in rows]
    out = ['| ' + ' | '.join(rows[0]) + ' |', '|' + '---|' * n]
    out += ['| ' + ' | '.join(r) + ' |' for r in rows[1:]]
    return '\n'.join(out)


def mermaid(div):
    try:
        d = json.loads(div['data-uflow'])
    except Exception:
        return ''
    shape = {'start': ('([', '])'), 'end': ('([', '])'), 'decision': ('{', '}'), 'modal': ('[[', ']]'),
             'missing': ('[/', '/]'), 'screen': ('[', ']')}
    out = ['```mermaid', 'flowchart LR']
    for nid, label, kind in d['nodes']:
        a, b = shape.get(kind, ('[', ']'))
        lab = re.sub(r'\s*·\s*·\s*', ' · ', label.replace('\n', ' · ')).replace('"', "'")
        out.append(f'  {nid}{a}"{lab}{" (not designed)" if kind == "missing" else ""}"{b}')
    for a, b, lab, st in d['edges']:
        arrow = '-->' if st == 'linked' else '-.->'
        lab = (('? ' if st == 'open' else '') + (lab or '')).strip().replace('"', "'")
        out.append(f'  {a} {arrow}|"{lab}"| {b}' if lab else f'  {a} {arrow} {b}')
    out.append('```')
    out.append('Solid = prototype-linked · dashed = not linked · ? = open question.')
    return '\n'.join(out)


def entry(art):
    out = []
    h = art.find(['h3'])
    if h:
        out.append('#### ' + text(h))
    for el in art.descendants:
        if not isinstance(el, Tag):
            continue
        if el.find_parent(['table', 'svg']) or (el.name != 'div' and el.find_parent(class_='dcard')):
            continue
        cls = el.get('class') or []
        if el.name == 'p' and ('answer' in cls or 'figlink' in cls):
            out.append(text(el))
        elif el.name == 'table':
            out.append(table(el))
        elif el.name == 'ul' and not el.find_parent(class_='dcard'):
            items = ['- ' + text(li) for li in el.find_all('li', recursive=False) if text(li)]
            if items:
                out.append('\n'.join(items))
        elif el.name == 'div' and 'chips' in cls:
            chips = [text(s) for s in el.find_all('span')]
            if chips:
                out.append('Tokens / notes: ' + ' · '.join(chips))
        elif el.name == 'div' and 'uflow' in cls:
            out.append(mermaid(el))
        elif el.name == 'div' and 'dcard' in cls:
            top = el.find(class_='top')
            q = el.find(class_='q')
            dl = {text(dt): text(dt.find_next_sibling('dd')) for dt in el.find_all('dt')}
            line = f'- **{text(top.find(class_="id")) if top else ""}** {text(q) if q else ""}'
            st = text(top.find(class_='st')) if top and top.find(class_='st') else ''
            if 'Decision' in dl:
                line += f' → **{dl["Decision"].strip("*")}**'
            else:
                line += f' — {st}. Options: {dl.get("Options", "")}'
            if out and out[-1].startswith('- **'):
                out[-1] += '\n' + line
            else:
                out.append(line)
        elif el.name == 'div' and 'lbl' in cls:
            out.append('**' + text(el) + '**')
        elif el.name == 'div' and 'srow' in cls:
            if not out or not out[-1].startswith('| Token | px |'):
                out.append('| Token | px | Use |\n|---|---|---|')
            cells = [text(el.find(class_='tok')), text(el.find(class_='px')), text(el.find(class_='use'))]
            out[-1] += '\n| ' + ' | '.join(cells) + ' |'
        elif el.name == 'div' and 'ts' in cls and el.find(class_='meta'):
            if not out or not out[-1].startswith('| Style |'):
                out.append('| Style | Size / line · weight | Use |\n|---|---|---|')
            parts = [re.sub(r'\s+', ' ', inline(BeautifulSoup(x, 'html.parser'))).strip() for x in str(el.find(class_='meta').decode_contents()).split('<br/>')]
            parts = (parts + ['', '', ''])[:3]
            out[-1] += '\n| ' + ' | '.join(parts) + ' |'
        elif el.name == 'pre':
            out.append('```css\n' + el.get_text().strip() + '\n```')
    return '\n\n'.join(o for o in out if o)


def main(src, dst):
    s = BeautifulSoup(load(src), 'html.parser')
    title = text(s.title) if s.title else 'Guide'
    tabs = {b.get('data-flow'): (b.find('b') or b).get_text(' ', strip=True) for b in s.select('[role=tab][data-flow]')}
    md = [f'# {title}', '', 'Developer handoff. Generated from the visual guide; values are measured from Figma.', '']
    flows = s.select('div.flow') or [s]
    for f in flows:
        md.append('## ' + tabs.get(f.get('data-flow'), f.get('data-flow') or 'Guide'))
        src_line = s.select_one(f'.meta-row[data-for="{f.get("data-flow")}"]')
        if src_line:
            md.append(' · '.join(text(x) for x in src_line.find_all('span', recursive=False)) or text(src_line))
        for ch in f.select('section.chapter'):
            h = ch.find('h2')
            md.append('### ' + (text(h) if h else ch.get('data-title', '')))
            for art in ch.select('article.entry'):
                md.append(entry(art))
        md.append('')
    out = re.sub(r'\n{3,}', '\n\n', '\n\n'.join(md)).strip() + '\n'
    out = out.replace(' Click a token to copy it.', '')
    open(dst, 'w', encoding='utf-8').write(out)
    print(f'wrote {dst}: {len(out.splitlines())} lines')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
