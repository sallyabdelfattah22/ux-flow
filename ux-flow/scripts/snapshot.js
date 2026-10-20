// use_figma (WRITE): copy the flow to an "Audit – before" page so later runs can diff before/after.
// Replace __NODE_ID__ (e.g. 164:5406) and __DATE__ (e.g. 2026-10-19).
const ROOT_ID = '__NODE_ID__';
const DATE = '__DATE__';

const src = await figma.getNodeByIdAsync(ROOT_ID);
if (!src) throw new Error('Node ' + ROOT_ID + ' not found');
if (src.type === 'PAGE') throw new Error('Pass a section or frame, not a whole page');

let page = figma.root.children.find(p => p.name === 'Audit – before');
let created = false;
if (!page) { page = figma.createPage(); page.name = 'Audit – before'; created = true; }
await page.loadAsync();

// Reuse an existing snapshot of this flow instead of stacking duplicates.
const tag = 'snapshot-of:' + ROOT_ID;
const existing = page.children.find(c => c.name.includes('[' + tag + ']'));
if (existing) return { reused: true, pageId: page.id, snapshotId: existing.id, name: existing.name };

const copy = src.clone();
page.appendChild(copy);
let maxX = 0;
for (const c of page.children) if (c.id !== copy.id) maxX = Math.max(maxX, c.x + c.width);
copy.x = page.children.length > 1 ? maxX + 400 : 0;
copy.y = 0;
copy.name = src.name + ' – before (' + DATE + ') [' + tag + ']';

return {
  createdPage: created, pageId: page.id, snapshotId: copy.id, name: copy.name,
  size: [Math.round(copy.width), Math.round(copy.height)],
  children: 'children' in copy ? copy.children.length : 0
};
