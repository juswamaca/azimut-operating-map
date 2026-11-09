/* Turns the master sheet's "1 Operating Map" tab into the map's data.
 * Shared with the Apps Script version (Code.gs), so both read the sheet the same way.
 */
(function (root) {
/**
 * grid: the tab's cells as text (row by row, as getDisplayValues returns them).
 * Each workflow is a column; column B holds the row labels (Function, Workflow, Step 1 ...).
 */
function buildMapData(grid, DSN, meta, warnings) {
  warnings = warnings || [];
  const copy = function (x) { return JSON.parse(JSON.stringify(x)); };
  const norm = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim(); };
  const clean = function (v) {
    if (v === null || v === undefined) return '';
    const s = String(v).trim();
    if (s === 'None' || s === '#NAME?' || s === 'TBC ') return '';
    return s.replace(/\s*\n\s*/g, ' / ');
  };
  const slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };
  const sorted = function (xs) { return Array.from(xs).sort(); };
  const FIX = {}; (DSN.nameFixes || []).forEach(function (p) { FIX[p[0]] = p[1]; });
  const fixName = function (n) { return Object.prototype.hasOwnProperty.call(FIX, n) ? FIX[n] : n; };

  // 1. find each row by its label in column B (falls back to the V4 layout)
  const LABELS = {
    func: 'function', family: 'workflow family', name: 'workflow', id: 'workflow id', role: 'main role',
    participants: 'other participants', value_stream: 'value stream', purpose: 'purpose', trigger: 'trigger',
    inputs: 'inputs', output: 'output / finish', handoff: 'final handoff', frequency: 'frequency / volume',
    procedure: 'procedure / subprocess (optional)', systems: 'systems / tools', data: 'data', documents: 'documents',
    controls: 'controls / approvals', exceptions: 'exceptions / risks', pain: 'pain points / value gaps',
    kpis: 'time / kpis', source: 'source / validation', status: 'status', importance: 'business importance',
    improvement: 'improvement opportunity', ai: 'ai opportunity', notes: 'notes / open questions',
    listfn: 'function (for listing)', team: 'outcome team',
  };
  const V4 = {
    func: 6, family: 7, name: 8, id: 9, role: 10, participants: 11, value_stream: 12, purpose: 14, trigger: 15,
    inputs: 16, output: 17, handoff: 18, frequency: 19, procedure: 21, systems: 43, data: 44, documents: 45,
    controls: 46, exceptions: 47, pain: 48, kpis: 49, source: 50, status: 51, importance: 52, improvement: 53,
    ai: 54, notes: 55, listfn: 57,
  };
  // the labels sit in column B; find them even if an export drops or adds a column
  let L = 1;
  for (let i = 0; i < grid.length; i++) {
    const k = (grid[i] || []).slice(0, 4).map(norm).indexOf('workflow id');
    if (k >= 0) { L = k; break; }
  }
  const ROW = {}, stepRows = [];
  grid.forEach(function (r, i) {
    const l = norm(r[L]);
    if (!l) return;
    const m = l.match(/^step (\d+)$/);
    if (m) { stepRows.push([+m[1], i]); return; }
    Object.keys(LABELS).forEach(function (k) { if (ROW[k] === undefined && LABELS[k] === l) ROW[k] = i; });
  });
  Object.keys(V4).forEach(function (k) {
    if (ROW[k] === undefined) { ROW[k] = V4[k] - 1; if (k === 'name' || k === 'func') warnings.push('No row labelled "' + LABELS[k] + '" in column B; using row ' + V4[k] + '.'); }
  });
  if (!stepRows.length) for (let i = 0; i < 20; i++) stepRows.push([i + 1, 21 + i]);
  stepRows.sort(function (a, b) { return a[0] - b[0]; });
  const width = grid.reduce(function (a, r) { return Math.max(a, r.length); }, 0);
  const cell = function (k, c) { const r = ROW[k]; return (r === undefined || !grid[r]) ? '' : clean(grid[r][c]); };

  // 2. one contribution per column
  const FIELDS = ['purpose', 'trigger', 'inputs', 'output', 'handoff', 'frequency', 'procedure', 'systems', 'data',
    'documents', 'controls', 'exceptions', 'pain', 'kpis', 'source', 'status'];
  const contribs = [];
  let func = null;
  for (let c = L + 1; c < width; c++) {
    const f = cell('func', c);
    if (f) func = f;
    const name = fixName(cell('name', c));
    if (!name) continue;
    const d = {
      function: cell('listfn', c) || func, family: cell('family', c), workflow: name, id: cell('id', c),
      role: cell('role', c), participants: cell('participants', c), value_stream: cell('value_stream', c),
      team: cell('team', c),
    };
    FIELDS.forEach(function (k) { d[k] = cell(k, c); });
    d.steps = [];
    stepRows.forEach(function (sr) { const v = grid[sr[1]] ? clean(grid[sr[1]][c]) : ''; if (v) d.steps.push({ n: sr[0], text: v }); });
    contribs.push(d);
  }

  // 3. workflows: contributions of the same workflow merge into one
  const parseStep = function (t) {
    const m = t.match(/^\s*([^:]{1,40}):\s*(.*)$/);
    let who = m ? m[1].trim() : '', rest = m ? m[2].trim() : t, next = '';
    const m2 = rest.match(/\s*(?:->|→)\s*([^>→]+)$/);
    if (m2 && m2[1].length < 40) { next = m2[1].trim(); rest = rest.slice(0, m2.index).trim(); }
    return { who: who, text: rest, next: next };
  };
  const PROPOSED = {}; (DSN.proposedFamilies || []).forEach(function (p) { PROPOSED[p[0] + '|' + p[1]] = p[2]; });
  const WF = new Map(), sheetTeam = {};
  contribs.forEach(function (c) {
    const fn = DSN.fnMap[c.function] || c.function;
    const fam = c.family || PROPOSED[fn + '|' + c.workflow] || 'Other';
    const wid = (c.id && c.id !== 'TBC') ? c.id : '';
    const key = slug(fn) + '--' + slug(wid || c.workflow);
    if (!WF.has(key)) WF.set(key, { key: key, function: fn, family: fam, familyProposed: !c.family, name: c.workflow, id: wid, contribs: [], later: false });
    const w = WF.get(key);
    const keep = { role: c.role, participants: c.participants, value_stream: c.value_stream };
    FIELDS.forEach(function (k) { keep[k] = c[k]; });
    keep.steps = c.steps.map(function (s) { const p = parseStep(s.text); return { n: s.n, who: p.who || c.role, text: p.text, next: p.next }; });
    w.contribs.push(keep);
    if (c.team && !sheetTeam[key]) sheetTeam[key] = c.team;
  });
  (DSN.later || []).forEach(function (x) {
    const key = slug(x[0]) + '--' + slug(x[3] || x[2]);
    if (!WF.has(key)) WF.set(key, { key: key, function: x[0], family: x[1], familyProposed: true, name: x[2], id: x[3], contribs: [], later: true });
  });
  // end-to-end chain per workflow ID, across functions
  const byId = {};
  WF.forEach(function (w) {
    if (!w.id) return;
    w.contribs.forEach(function (c) {
      c.steps.forEach(function (s) {
        byId[w.id] = byId[w.id] || {};
        if (!byId[w.id][s.n]) byId[w.id][s.n] = { n: s.n, who: s.who, text: s.text, next: s.next, role: c.role };
      });
    });
  });
  WF.forEach(function (w) {
    const chain = byId[w.id] || {};
    w.e2e = Object.keys(chain).map(Number).sort(function (a, b) { return a - b; }).map(function (n) { return chain[n]; });
    w.target = Object.prototype.hasOwnProperty.call(DSN.targetById, w.id) ? DSN.targetById[w.id] : null;
    if (DSN.targetByName && DSN.targetByName[w.name]) w.target = DSN.targetByName[w.name];
  });
  (DSN.extraWorkflows || []).forEach(function (x) { if (!WF.has(x.key)) WF.set(x.key, copy(x)); });
  const workflows = Array.from(WF.values());
  const byKey = {}; workflows.forEach(function (w) { byKey[w.key] = w; });
  const functions = DSN.functions.slice();
  workflows.forEach(function (w) { if (w.function && functions.indexOf(w.function) < 0) functions.push(w.function); });

  // 4. place every workflow in an outcome team
  const refOf = function (w) { return w.id || w.name; };
  const byRef = new Map();
  workflows.forEach(function (w) { const r = refOf(w); if (!byRef.has(r)) byRef.set(r, []); byRef.get(r).push(w); });
  const canonOf = function (ents) {
    let best = ents[0];
    ents.forEach(function (w) {
      if (w.e2e.length > best.e2e.length || (w.e2e.length === best.e2e.length && w.contribs.length > best.contribs.length)) best = w;
    });
    return best;
  };
  const teams = copy(DSN.teams);
  const TEAM = {}; teams.forEach(function (t) { TEAM[t.id] = t; });
  const teamFromText = function (s) {
    const n = norm(s);
    if (!n) return null;
    const t = teams.filter(function (t) { return norm(t.id) === n || norm(t.name) === n; })[0];
    return t ? t.id : null;
  };
  const otherStage = function (t) {
    let st = t.stages.filter(function (s) { return s.id === 'other'; })[0];
    if (!st) {
      st = { id: 'other', name: 'Other workflows', wfs: [], exhibit: false, today: 'Added to the master sheet; not yet placed in a stage', agents: [], people: [], skills: [], keys: [] };
      t.stages.push(st);
    }
    return st;
  };
  const assigned = new Map();
  teams.forEach(function (t) {
    t.stages.forEach(function (st) {
      const refs = [], keys = [];
      st.wfs.forEach(function (r) {
        if (!byRef.has(r)) { warnings.push('"' + r + '" is in the target design but not in the sheet, so it is left out.'); return; }
        if (assigned.has(r)) return;
        assigned.set(r, [t.id, st.id]);
        refs.push(r); keys.push(canonOf(byRef.get(r)).key);
      });
      st.wfs = refs; st.keys = keys;
    });
  });
  byRef.forEach(function (ents, r) {
    const named = ents.map(function (w) { return sheetTeam[w.key]; }).filter(Boolean)[0];
    const want = named ? teamFromText(named) : null;
    if (named && !want) warnings.push('Outcome team "' + named + '" for "' + r + '" is not one of: ' + teams.map(function (t) { return t.name; }).join(', ') + '.');
    const cur = assigned.get(r);
    if (cur && (!want || want === cur[0])) return;
    if (cur) { // the sheet moves it to another team
      const st = TEAM[cur[0]].stages.filter(function (s) { return s.id === cur[1]; })[0];
      const i = st.wfs.indexOf(r); st.wfs.splice(i, 1); st.keys.splice(i, 1);
    }
    const tid = want || DSN.teamByFunction[ents[0].function] || teams[0].id;
    const st = otherStage(TEAM[tid]);
    st.wfs.push(r); st.keys.push(canonOf(ents).key);
    assigned.set(r, [tid, 'other']);
    if (!cur) warnings.push('New workflow "' + ents[0].name + '" is shown under ' + TEAM[tid].name + ' > Other workflows' +
      (want ? ' (from its Outcome team row).' : '. To choose its team, fill in an "Outcome team" row in column B.'));
    else warnings.push('"' + ents[0].name + '" moved to ' + TEAM[tid].name + ' > Other workflows (from its Outcome team row).');
  });

  // 5. today's numbers: steps, handoffs and parties per workflow and per team
  const ALIAS = DSN.alias || {}, KNOWN = new Set(DSN.knownParties || []);
  const aliasOf = function (s) { return Object.prototype.hasOwnProperty.call(ALIAS, s) ? ALIAS[s] : null; };
  const parties = function (who) {
    who = aliasOf(who.trim()) || who;
    const out = new Set();
    who.split(/\s*(?:\/|↔|,| and )\s*/).forEach(function (p) {
      p = aliasOf(p.trim()) || p.trim();
      if (p === 'ARM/RM') { out.add('ARM'); out.add('RM'); return; }
      if (KNOWN.has(p)) out.add(p);
    });
    return out;
  };
  const nxt = function (s) {
    const n = (s.next || '').trim();
    if (!n) return new Set();
    const first = n.split(/[\s/]/)[0];
    return KNOWN.has(first) ? new Set([first]) : new Set();
  };
  const wfStats = function (w) {
    const e = w.e2e; let hand = 0; const ps = new Set();
    e.forEach(function (s, i) {
      const a = parties(s.who);
      a.forEach(function (x) { ps.add(x); }); nxt(s).forEach(function (x) { ps.add(x); });
      if (i + 1 < e.length) {
        const b = parties(e[i + 1].who);
        let meet = false; a.forEach(function (x) { if (b.has(x)) meet = true; });
        if (a.size && b.size && !meet) hand++;
      }
    });
    return { steps: e.length, handoffs: hand, parties: sorted(ps) };
  };
  const FUNCS = new Map();
  workflows.forEach(function (w) {
    if (w.targetOnly) return;
    const r = refOf(w); if (!FUNCS.has(r)) FUNCS.set(r, new Set()); FUNCS.get(r).add(w.function);
  });
  const wfOut = {};
  teams.forEach(function (t) {
    let tw = 0, tsteps = 0, thand = 0, ents = 0, tsplit = 0, tred = 0;
    const tparties = new Set(), tfuncs = new Set();
    t.stages.forEach(function (st) {
      st.wfs.forEach(function (r, i) {
        const k = st.keys[i], canon = byKey[k], s = wfStats(canon);
        const funcs = sorted(FUNCS.get(r) || []);
        const others = byRef.get(r).filter(function (w) { return w.key !== k; }).map(function (w) { return w.key; });
        wfOut[k] = { team: t.id, stage: st.id, functions: funcs, others: others, steps: s.steps, handoffs: s.handoffs, parties: s.parties };
        if (canon.targetOnly) return;
        tw++; tsteps += s.steps; thand += s.handoffs;
        s.parties.forEach(function (x) { tparties.add(x); }); funcs.forEach(function (x) { tfuncs.add(x); });
        ents += byRef.get(r).length; tsplit += funcs.length > 1 ? 1 : 0; tred += canon.target ? 1 : 0;
      });
    });
    const agents = [];
    t.stages.forEach(function (st) { st.agents.forEach(function (a) { if (agents.indexOf(a[0]) < 0) agents.push(a[0]); }); });
    let decisions = 0;
    t.stages.forEach(function (st) { if (st.exhibit) st.people.forEach(function (p) { if (p[2] === 'd') decisions++; }); });
    let newWf = 0;
    t.stages.forEach(function (st) { st.keys.forEach(function (k) { if (byKey[k].targetOnly) newWf++; }); });
    t.today = { workflows: tw, entries: ents, functions: sorted(tfuncs), split: tsplit, steps: tsteps, handoffs: thand, parties: sorted(tparties) };
    t.target = { agents: agents, decisions: decisions, redesigned: tred, newWorkflows: newWf };
  });
  const uniq = [];
  byRef.forEach(function (ents, r) { if (!ents.every(function (w) { return w.targetOnly; })) uniq.push(r); });
  let armSteps = 0, allSteps = 0; const armWfs = new Set();
  uniq.forEach(function (r) {
    canonOf(byRef.get(r)).e2e.forEach(function (s) { allSteps++; if (parties(s.who).has('ARM')) { armSteps++; armWfs.add(r); } });
  });
  const firm = {
    entries: workflows.filter(function (w) { return !w.targetOnly; }).length,
    unique: uniq.length,
    split: uniq.filter(function (r) { return FUNCS.get(r).size > 1; }).length,
    functions_with_work: sorted(new Set(workflows.filter(function (w) { return !w.targetOnly; }).map(function (w) { return w.function; }))),
    arm: { steps: armSteps, of: allSteps, workflows: armWfs.size, stepped: uniq.filter(function (r) { return byRef.get(r).some(function (w) { return w.e2e.length; }); }).length },
  };

  const out = {
    source: meta.source, functions: functions, workflows: workflows, targets: copy(DSN.targets), agents: copy(DSN.agents),
    orch: { teams: teams, wf: wfOut, firm: firm },
  };
  if (meta.live) { out.live = true; out.readAt = meta.readAt; }
  return out;
}

/** Reads CSV text (as Google Sheets publishes it) into rows of cells. */
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
      continue;
    }
    if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows;
}
root.OpmapBuild = { buildMapData: buildMapData, parseCSV: parseCSV };
if (typeof module !== 'undefined') module.exports = root.OpmapBuild;
})(typeof window !== 'undefined' ? window : globalThis);
