// use_figma (READ-ONLY): everything the design guide needs from one flow.
// Replace __NODE_ID__ with the section/frame id (e.g. 164:5406).
// __TREES__: 'none' = variables, styles and the off-token scan only (run this first on a big flow);
//            'all'  = also return each frame's layout tree (fine for 1–3 frames);
//            '164:5430,164:5558' = trees for just those frames (fan out in parallel calls, ~40 KB each).
const ROOT_ID = '__NODE_ID__';
const TREES = '__TREES__';
const MAX_DEPTH = 5, MAX_CHILDREN = 14;

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) throw new Error('Node ' + ROOT_ID + ' not found');
let pg = root; while (pg.type !== 'PAGE') pg = pg.parent;
await figma.setCurrentPageAsync(pg);

// ---- Variables (aliases resolved, every mode) ----
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = [];
const spacingVals = new Set(), radiusVals = new Set();
async function resolve(val) {
  let guard = 0;
  while (val && val.type === 'VARIABLE_ALIAS' && guard++ < 10) {
    const t = await figma.variables.getVariableByIdAsync(val.id);
    if (!t) return null;
    const tc = await figma.variables.getVariableCollectionByIdAsync(t.variableCollectionId);
    val = t.valuesByMode[tc.modes[0].modeId];
  }
  return val;
}
function hex(c) { return '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); }
for (const c of cols) {
  const rows = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const values = {};
    for (const m of c.modes) {
      const raw = v.valuesByMode[m.modeId];
      let r = await resolve(raw);
      if (r && typeof r === 'object' && 'r' in r) r = hex(r);
      values[m.name] = (raw && raw.type === 'VARIABLE_ALIAS' ? '→ ' : '') + (typeof r === 'object' ? JSON.stringify(r) : r);
      if (v.resolvedType === 'FLOAT' && typeof r === 'number') {
        const scopes = v.scopes || [];
        const n = (c.name + ' ' + v.name).toLowerCase();
        if (/radius|round/.test(n) || scopes.includes('CORNER_RADIUS')) radiusVals.add(r);
        else if (/space|spacing|gap|padding/.test(n) || scopes.some(s => /GAP|PADDING/.test(s))) spacingVals.add(r);
      }
    }
    rows.push({ name: v.name, type: v.resolvedType, values });
  }
  vars.push({ collection: c.name, modes: c.modes.map(m => m.name), count: rows.length, rows });
}

// ---- Text styles ----
const tstyles = (await figma.getLocalTextStylesAsync()).map(s => ({
  name: s.name, font: s.fontName.family + ' ' + s.fontName.style, size: s.fontSize,
  lineHeight: s.lineHeight.unit === 'AUTO' ? 'auto' : s.lineHeight.value + (s.lineHeight.unit === 'PERCENT' ? '%' : ''),
  letterSpacing: s.letterSpacing.value
}));
const styleSizes = new Set(tstyles.map(s => s.size));

// ---- Layout tree + off-token scan ----
const offToken = { spacing: {}, radius: {}, fontSize: {}, fonts: {}, unstyledText: 0, under12: [] };
function note(bucket, val, where) { const k = String(val); (offToken[bucket][k] = offToken[bucket][k] || []).length < 4 && offToken[bucket][k].push(where); }
async function info(n, depth, path) {
  const o = { id: n.id, name: n.name, type: n.type, w: Math.round(n.width), h: Math.round(n.height) };
  const where = path + ' › ' + n.name;
  if (n.type === 'INSTANCE') {
    const mc = await n.getMainComponentAsync();
    if (mc) o.component = (mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent.name + ' / ' : '') + mc.name + (mc.remote ? ' (library)' : ' (local)');
  }
  if ('layoutMode' in n && n.layoutMode && n.layoutMode !== 'NONE') {
    o.layout = n.layoutMode; o.gap = n.itemSpacing;
    o.pad = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft];
    const bv = n.boundVariables || {};
    o.bound = Object.keys(bv).filter(k => /padding|itemSpacing|Radius/.test(k));
    if (spacingVals.size) {
      if (n.itemSpacing && !spacingVals.has(n.itemSpacing) && !bv.itemSpacing && n.primaryAxisAlignItems !== 'SPACE_BETWEEN') note('spacing', 'gap ' + n.itemSpacing, where);
      for (const p of new Set(o.pad)) if (p && !spacingVals.has(p)) note('spacing', 'padding ' + p, where);
    }
  }
  if ('layoutGrids' in n && n.layoutGrids && n.layoutGrids.length) o.grids = n.layoutGrids.map(g => ({ pattern: g.pattern, count: g.count, size: g.sectionSize, gutter: g.gutterSize, offset: g.offset }));
  if ('cornerRadius' in n && typeof n.cornerRadius === 'number' && n.cornerRadius) {
    o.radius = Math.round(n.cornerRadius * 10) / 10;
    if (radiusVals.size && !radiusVals.has(o.radius) && o.radius < 1000) note('radius', o.radius, where);
  }
  if (n.type === 'TEXT') {
    o.text = n.characters.slice(0, 40);
    o.size = n.fontSize;
    o.font = typeof n.fontName === 'object' ? n.fontName.family + ' ' + n.fontName.style : 'mixed';
    o.lineHeight = n.lineHeight && n.lineHeight.unit ? (n.lineHeight.unit === 'AUTO' ? 'auto' : n.lineHeight.value) : 'mixed';
    if (typeof n.textStyleId === 'string' && n.textStyleId) { const s = await figma.getStyleByIdAsync(n.textStyleId); o.style = s ? s.name : '?'; }
    else { o.style = null; offToken.unstyledText++; }
    if (typeof n.fontSize === 'number') {
      if (!styleSizes.has(n.fontSize)) note('fontSize', n.fontSize, where);
      if (n.fontSize < 12) offToken.under12.length < 10 && offToken.under12.push(where + ' (' + n.fontSize + 'px)');
    }
    if (typeof n.fontName === 'object') offToken.fonts[n.fontName.family] = (offToken.fonts[n.fontName.family] || 0) + 1;
  }
  if (depth > 0 && 'children' in n) {
    const kids = n.children.filter(c => c.visible !== false);
    o.children = [];
    const limit = depth > MAX_DEPTH ? kids.length : MAX_CHILDREN; // scan-only walks visit every child
    for (const c of kids.slice(0, limit)) o.children.push(await info(c, depth - 1, where));
    if (kids.length > limit) o.more = kids.length - limit;
  }
  return o;
}
const frames = ('children' in root && root.type === 'SECTION') ? root.children.filter(c => c.visible !== false) : [root];
const wanted = TREES === 'all' ? null : new Set(TREES === 'none' ? [] : TREES.split(',').map(x => x.trim()));
const trees = [];
for (const f of frames) {
  // The off-token scan needs every layer, so walk all frames; keep the tree only where asked.
  const t = await info(f, wanted && !wanted.has(f.id) ? 50 : MAX_DEPTH, '');
  if (!wanted || wanted.has(f.id)) trees.push(t);
}

return {
  page: pg.name, root: { id: root.id, name: root.name, type: root.type },
  frames: frames.map(f => ({ id: f.id, name: f.name, type: f.type, w: Math.round(f.width), h: Math.round(f.height) })),
  variables: vars, textStyles: tstyles,
  scales: { spacing: [...spacingVals].sort((a, b) => a - b), radius: [...radiusVals].sort((a, b) => a - b), fontSizes: [...styleSizes].sort((a, b) => a - b) },
  offToken, trees
};
