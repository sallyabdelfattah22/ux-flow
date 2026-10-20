// use_figma (READ-ONLY): developer extras for one flow.
// Replace __NODE_ID__ with the section/frame id. Returns:
//  components  – each component set/component used: name, key, local/library, variant props + values, instance count, frames
//  navigation  – prototype links: trigger layer → action → destination frame (deduped)
//  formats     – sample text values grouped by kind (date, time, duration, id, percent, count, empty, email, phone)
const ROOT_ID = '__NODE_ID__';
const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) throw new Error('Node ' + ROOT_ID + ' not found');
let pg = root; while (pg.type !== 'PAGE') pg = pg.parent;
await figma.setCurrentPageAsync(pg);
const frames = root.type === 'SECTION' ? root.children.filter(c => c.visible !== false) : [root];
const frameIds = new Set(frames.map(f => f.id));
const fname = {}; frames.forEach(f => fname[f.id] = f.name);
function frameOf(n) { let p = n; while (p.parent && !frameIds.has(p.id)) p = p.parent; return frameIds.has(p.id) ? p.id : null; }

// ---- Components and their states (top-level instances only: nested ones belong to their parent) ----
const comps = {};
for (const n of root.findAll(n => n.type === 'INSTANCE')) {
  let p = n.parent, nested = false; while (p && p.id !== root.id) { if (p.type === 'INSTANCE') { nested = true; break; } p = p.parent; }
  if (nested) continue;
  const mc = await n.getMainComponentAsync(); if (!mc) continue;
  const set = mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : null;
  const owner = set || mc, k = owner.key || owner.id;
  if (!comps[k]) {
    const props = {};
    try { const defs = owner.componentPropertyDefinitions || {}; for (const [name, d] of Object.entries(defs)) props[name.split('#')[0]] = d.type === 'VARIANT' ? d.variantOptions : d.type; } catch (e) {}
    comps[k] = { name: owner.name, key: owner.key, library: !!mc.remote, props, used: {}, count: 0, frames: new Set() };
  }
  const c = comps[k]; c.count++; const f = frameOf(n); if (f) c.frames.add(f);
  for (const [name, v] of Object.entries(n.componentProperties || {})) { if (v.type !== 'VARIANT' && v.type !== 'BOOLEAN') continue; const key = name.split('#')[0]; (c.used[key] = c.used[key] || new Set()).add(String(v.value)); }
}
const components = Object.values(comps).sort((a, b) => b.count - a.count).slice(0, 40).map(c => ({
  name: c.name, key: c.key, library: c.library, count: c.count, frames: [...c.frames].length,
  variants: Object.fromEntries(Object.entries(c.props).filter(([, v]) => Array.isArray(v))),
  usedStates: Object.fromEntries(Object.entries(c.used).map(([k, v]) => [k, [...v]]))
}));

// ---- Navigation from prototype links ----
const nav = new Map();
for (const n of root.findAll(n => 'reactions' in n && n.reactions && n.reactions.length)) {
  const from = frameOf(n); if (!from) continue;
  const label = n.type === 'TEXT' ? n.characters.slice(0, 30) : (n.findOne ? (n.findOne(c => c.type === 'TEXT') || {}).characters || n.name : n.name);
  for (const r of n.reactions) for (const a of (r.actions || (r.action ? [r.action] : []))) {
    if (!a) continue;
    const to = a.destinationId ? (fname[a.destinationId] ? a.destinationId : a.destinationId + ' (outside flow)') : a.type;
    const key = from + '|' + String(label).slice(0, 30) + '|' + to;
    if (!nav.has(key)) nav.set(key, { from, trigger: (r.trigger && r.trigger.type) || '?', label: String(label).slice(0, 30), action: (a.navigation || a.type), to });
  }
}
const navigation = [...nav.values()].slice(0, 150);

// ---- Data formats ----
const kinds = { date: /\b\d{1,2}\s?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s?\d{4}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s?\d{4}\b|\d{1,2}\/\d{1,2}\/\d{2,4}/i,
  time: /\b\d{1,2}:\d{2}\s?(AM|PM)?\b/i, duration: /\b\d+\s?(h|hrs?|H)\b|\d+\s?H\s?\d+\s?M|\d+h\s?\d+m|\bdays?\b/i,
  id: /#\d{3,}|\b\d{9,}\b/, percent: /\d+(\.\d+)?\s?%/, email: /@[\w.-]+\.\w+/, empty: /^\s*(-|—|–|n\/a|N\/A)\s*$|:\s*-\s*$/ };
const formats = {};
for (const t of root.findAll(n => n.type === 'TEXT')) {
  const s = t.characters.trim(); if (!s || s.length > 40) continue;
  for (const [k, re] of Object.entries(kinds)) if (re.test(s)) { const b = (formats[k] = formats[k] || new Set()); if (b.size < 10) b.add(s); }
}
for (const k in formats) formats[k] = [...formats[k]];

return { frames: frames.map(f => f.id + ' ' + f.name), components, navigation, formats };
