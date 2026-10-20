// use_figma (READ-ONLY): measurable evidence for the ux-audit checklist.
// Replace __NODE_ID__ with the section/frame id.
const ROOT_ID = '__NODE_ID__';

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) throw new Error('Node ' + ROOT_ID + ' not found');
let pg = root; while (pg.type !== 'PAGE') pg = pg.parent;
await figma.setCurrentPageAsync(pg);

const frames = root.type === 'SECTION' ? root.children.filter(c => c.visible !== false) : [root];
const frameIds = new Set(frames.map(f => f.id));
function frameOf(n) { let p = n; while (p.parent && !frameIds.has(p.id)) p = p.parent; return frameIds.has(p.id) ? p.name + ' (' + p.id + ')' : '?'; }
function hidden(n) { let p = n; while (p && p.id !== root.id) { if (p.visible === false) return true; p = p.parent; } return false; }

// ---- Contrast (WCAG 2.x) ----
function topFill(n) {
  if (!('fills' in n) || !Array.isArray(n.fills)) return null;
  const f = n.fills.filter(f => f.visible !== false && (f.opacity ?? 1) > 0);
  return f.length ? f[f.length - 1] : null;
}
function lum(c) { const t = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); return 0.2126 * t(c.r) + 0.7152 * t(c.g) + 0.0722 * t(c.b); }
function mix(fg, a, bg) { return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) }; }
function hex(c) { return '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); }
function background(n) {
  // Nearest ancestor with a visible fill. Non-solid (image/gradient) → unknown, so skip instead of guessing.
  let p = n.parent;
  while (p) {
    const f = topFill(p);
    if (f) {
      if (f.type !== 'SOLID') return null;
      if ((f.opacity ?? 1) * (p.opacity ?? 1) > 0.9) return f.color;
    }
    p = p.parent;
  }
  return null;
}
const contrast = {}; let checked = 0, skipped = 0;
for (const t of root.findAll(n => n.type === 'TEXT')) {
  if (hidden(t)) continue;
  const f = topFill(t);
  if (!f || f.type !== 'SOLID') { skipped++; continue; }
  const bg = background(t);
  if (!bg) { skipped++; continue; }
  checked++;
  const fg = mix(f.color, (f.opacity ?? 1) * (t.opacity ?? 1), bg);
  const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  const size = typeof t.fontSize === 'number' ? t.fontSize : 0;
  const bold = typeof t.fontName === 'object' && /Bold|SemiBold|Semi Bold|Black|Heavy/.test(t.fontName.style);
  const need = (size >= 18 || (size >= 14 && bold)) ? 3 : 4.5;
  if (ratio < need) {
    const k = hex(fg) + ' on ' + hex(bg) + ' = ' + ratio.toFixed(2) + ':1 (needs ' + need + ':1)';
    (contrast[k] = contrast[k] || []).push(frameOf(t) + ' · "' + t.characters.slice(0, 30) + '" ' + size + 'px');
  }
}
for (const k in contrast) if (contrast[k].length > 6) contrast[k] = contrast[k].slice(0, 6).concat(['+' + (contrast[k].length - 6) + ' more']);

// ---- Target sizes ----
const INTERACTIVE = /button|btn|icon ?button|close|edit|delete|trash|more|menu|kebab|toggle|switch|checkbox|radio|tab|chip|link|pagination|page \d|arrow|chevron|back|search|filter|select|dropdown/i;
const targets = { under24: [], under44: [] };
const seen = new Set();
for (const n of root.findAll(n => (n.type === 'INSTANCE' || n.type === 'FRAME' || n.type === 'COMPONENT') && INTERACTIVE.test(n.name))) {
  if (hidden(n)) continue;
  // Skip an icon whose parent is itself an interactive target (the parent is the hit area).
  if (n.parent && INTERACTIVE.test(n.parent.name) && n.parent.width >= n.width && n.parent.height >= n.height && n.parent.id !== root.id && !frameIds.has(n.parent.id)) continue;
  // Skip wide containers (toolbars, pagination rows, button groups): their children are the real targets.
  if (n.width > 240 && 'findOne' in n && n.findOne(c => c !== n && c.visible !== false && INTERACTIVE.test(c.name))) continue;
  const key = frameOf(n) + ' · ' + n.name + ' ' + Math.round(n.width) + '×' + Math.round(n.height);
  if (seen.has(key)) continue; seen.add(key);
  const m = Math.min(n.width, n.height);
  if (m < 24) targets.under24.push(key); else if (m < 44) targets.under44.push(key);
}
targets.under24 = targets.under24.slice(0, 30); targets.under44 = targets.under44.slice(0, 40);

// ---- Prototype connections ----
const proto = {};
for (const f of frames) proto[f.name + ' (' + f.id + ')'] = { outgoing: 0, destinations: new Set() };
for (const n of root.findAll(n => 'reactions' in n && n.reactions && n.reactions.length)) {
  const k = frameOf(n); if (!proto[k]) continue;
  for (const r of n.reactions) for (const a of (r.actions || (r.action ? [r.action] : []))) {
    if (!a) continue;
    proto[k].outgoing++;
    proto[k].destinations.add(a.type + (a.destinationId ? ':' + a.destinationId : '') + (a.navigation ? '/' + a.navigation : ''));
  }
}
for (const k in proto) proto[k].destinations = [...proto[k].destinations].slice(0, 10);
const noConnections = Object.keys(proto).filter(k => proto[k].outgoing === 0);

// ---- Number alignment in tables ----
const numberAlign = {};
for (const t of root.findAll(n => n.type === 'TEXT' && /^[\d.,%:\-–]+$/.test(n.characters.trim()) && n.characters.trim().length < 12)) {
  if (hidden(t)) continue;
  numberAlign[t.textAlignHorizontal] = (numberAlign[t.textAlignHorizontal] || 0) + 1;
}

return { frames: frames.map(f => f.name + ' (' + f.id + ')'), contrast: { checked, skipped, failing: contrast }, targets, prototype: { perFrame: proto, framesWithNoOutgoing: noConnections }, numberAlign };
