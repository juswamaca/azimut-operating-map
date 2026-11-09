// Refreshes data/snapshot.json, the saved copy the page falls back on, from the published sheet.
// Run by .github/workflows/refresh-snapshot.yml every night and on demand. Needs Node 18 or later.
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['config.js', 'design.js', 'build.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const C = ctx.window.OPMAP_CONFIG || {};
if (!C.csvUrl) { console.log('No csvUrl in config.js yet, so there is nothing to refresh.'); process.exit(0); }

const res = await fetch(C.csvUrl);
if (!res.ok) throw new Error('The sheet link answered with error ' + res.status);
const text = await res.text();
if (/^\s*</.test(text)) throw new Error('The sheet link returned a web page, not CSV. Use File > Share > Publish to web, and choose CSV.');

const readAt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Singapore' }).format(new Date());
const notes = [];
const { buildMapData, parseCSV } = ctx.window.OpmapBuild;
const d = buildMapData(parseCSV(text), ctx.window.DESIGN, { source: C.sourceLabel || 'Operating Map Master', readAt, live: true }, notes);
if (!d.workflows.some(w => !w.targetOnly)) throw new Error('No workflows were found in the sheet, so the saved copy was left as it was.');
d.syncNotes = notes;

const file = 'data/snapshot.json';
const strip = x => JSON.stringify({ ...x, readAt: '' });
const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
if (old && strip(old) === strip(d)) { console.log('The sheet has not changed since the last saved copy.'); process.exit(0); }
fs.writeFileSync(file, JSON.stringify(d));
console.log(`Saved copy updated: ${d.orch.firm.unique} workflows, ${d.orch.firm.arm.of} mapped steps.`);
notes.forEach(n => console.log('Note: ' + n));
