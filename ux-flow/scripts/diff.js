// use_figma (READ-ONLY): what changed between the "Audit – before" snapshot and the current flow.
// Replace __BEFORE_ID__ (snapshot root on the Audit – before page) and __AFTER_ID__ (current flow root).
// Matching is by tree position + name, which holds because the snapshot is a clone of the original.
const BEFORE_ID = '__BEFORE_ID__';
const AFTER_ID = '__AFTER_ID__';

const before = await figma.getNodeByIdAsync(BEFORE_ID);
const after = await figma.getNodeByIdAsync(AFTER_ID);
if (!before || !after) throw new Error('Missing node: ' + (!before ? BEFORE_ID : AFTER_ID));
for (const n of [before, after]) { let p = n; while (p.type !== 'PAGE') p = p.parent; await p.loadAsync(); }

const PROPS = ['visible', 'width', 'height', 'itemSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'cornerRadius', 'fontSize', 'characters', 'textAlignHorizontal', 'opacity', 'layoutMode'];
function val(n, p) {
  if (!(p in n)) return undefined;
  let v = n[p];
  if (typeof v === 'symbol') return 'mixed';
  if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v * 10) / 10 : String(v); // NaN !== NaN would report false changes
  if (p === 'characters') return v.slice(0, 60);
  return v;
}
async function extra(n) {
  const o = {};
  if (n.type === 'TEXT') {
    o.font = typeof n.fontName === 'object' ? n.fontName.family + ' ' + n.fontName.style : 'mixed';
    if (typeof n.textStyleId === 'string' && n.textStyleId) { const s = await figma.getStyleByIdAsync(n.textStyleId); o.textStyle = s ? s.name : '?'; }
    else o.textStyle = null;
  }
  if (n.type === 'INSTANCE') { const mc = await n.getMainComponentAsync(); o.component = mc ? mc.name : null; }
  const bv = n.boundVariables || {};
  for (const k of Object.keys(bv)) {
    const b = Array.isArray(bv[k]) ? bv[k][0] : bv[k];
    if (b && b.id) { const v = await figma.variables.getVariableByIdAsync(b.id); o['var:' + k] = v ? v.name : b.id; }
  }
  return o;
}
const changes = [], added = [], removed = [];
let compared = 0;
async function walk(a, b, path) {
  compared++;
  const diff = {};
  for (const p of PROPS) { const x = val(a, p), y = val(b, p); if (x !== y && !(x === undefined && y === undefined)) diff[p] = [x, y]; }
  const ea = await extra(a), eb = await extra(b);
  for (const k of new Set([...Object.keys(ea), ...Object.keys(eb)])) if (ea[k] !== eb[k]) diff[k] = [ea[k] ?? null, eb[k] ?? null];
  // Ignore pure size changes caused by hug/fill reflow when nothing else changed on the node.
  const keys = Object.keys(diff);
  if (keys.length && !(keys.every(k => k === 'width' || k === 'height') && b.type !== 'TEXT' && 'layoutMode' in b && b.layoutMode !== 'NONE')) {
    changes.push({ path: path + a.name, afterId: b.id, type: b.type, changed: diff });
  }
  const ka = 'children' in a ? a.children : [], kb = 'children' in b ? b.children : [];
  const used = new Set();
  for (let i = 0; i < ka.length; i++) {
    let j = (kb[i] && kb[i].name === ka[i].name && !used.has(i)) ? i : kb.findIndex((c, idx) => !used.has(idx) && c.name === ka[i].name && c.type === ka[i].type);
    if (j < 0) { removed.push(path + a.name + ' › ' + ka[i].name); continue; }
    used.add(j);
    await walk(ka[i], kb[j], path + a.name + ' › ');
  }
  kb.forEach((c, idx) => { if (!used.has(idx)) added.push(path + a.name + ' › ' + c.name + ' (' + c.id + ')'); });
}
await walk(before, after, '');
return { compared, changedCount: changes.length, changes: changes.slice(0, 150), more: Math.max(0, changes.length - 150), added: added.slice(0, 50), removed: removed.slice(0, 50) };
