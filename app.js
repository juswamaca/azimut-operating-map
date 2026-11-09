/* Singapore Operating Map: the interactive page. Reads its data from #opmap-data, which index.html fills.
 * The Human-AI Enterprise · an NUS MBA consulting project with Azimut Investment Management Singapore
 * Hung Wan Yu · Apoorva Kushwaha · Joshua Macapugay
 */
(function(){
const D = JSON.parse(document.getElementById('opmap-data').textContent);
const FNS = D.functions;
const BEARING = {"Fund Management":0,"Compliance":45,"Finance & Operations":90,"Technology & Cybersecurity":135,"People & HR":180,"Marketing":225,"Management":270,"Wealth Management":315};
const MS = D.live ? {the:'the master sheet', name:'Master sheet', wfs:'Workflows in the master sheet', short:'the master sheet'}
                  : {the:'the V4 master', name:'V4 master', wfs:'V4 workflows', short:'V4'};
const OR = D.orch, TEAMS = OR.teams.map(t=>t.id), TEAM = {}, TBEAR = {};
OR.teams.forEach((t,i)=>{ TEAM[t.id]=t; TBEAR[t.id]=i*360/OR.teams.length; });
const W=1270, CX=310, R_ROOT=64, R_HUB=100, R_FN=200, R_COMP=250, FX=660, WX=900, PITCH=26, FGAP=12, MIN_GROUP=46, MINH=640, MIN_SCALE=0.66;
const byKey = {}; D.workflows.forEach(w=>byKey[w.key]=w);
const CANON = {}; Object.keys(OR.wf).forEach(k=>{ CANON[k]=k; OR.wf[k].others.forEach(o=>CANON[o]=k); });
const STAGE = {}; OR.teams.forEach(t=>t.stages.forEach(s=>{ STAGE[t.id+'/'+s.id]=s; }));
const agentByName = {}; D.agents.forEach(a=>agentByName[a.name]=a);
const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
let PHONE=false;

const $ = s=>document.querySelector(s);
const app=$('#app'), stage=$('#stage'), box=$('#box'), scroller=$('#scroller'), panel=$('#panel'), jump=$('#jump');

const esc = s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const split = s=>String(s||'').split(/\s+\/\s+|\n+/).map(t=>t.trim()).filter(Boolean);
const splitSemi = s=>String(s||'').split(/;\s*/).map(t=>t.trim()).filter(Boolean);
const rad = b=>b*Math.PI/180;
const PERSON = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

const S = {view:'overview', omode:'people', design:'revenue', mode:'today', fn:'Wealth Management', key:'wealth-management--wf-retro-001', role:'ARM', off:90-BEARING['Wealth Management']};
const isT = ()=>S.mode==='target';

/* ---------- mode-aware helpers: functions today, outcome teams in the target ---------- */
function ringIds(){ return isT() ? TEAMS : FNS; }
function bearing(id){ return isT() ? TBEAR[id] : BEARING[id]; }
function nodeName(id){ return isT() ? TEAM[id].name : id; }
function placeOf(w){ const o=OR.wf[CANON[w.key]]; return o ? {team:o.team, stage:o.stage} : null; }
function nodeOf(w){ if(!isT()) return w.function; const p=placeOf(w); return p?p.team:null; }
function visible(w){ return isT() || !w.targetOnly; }
function groupsFor(id){
  if(isT()){
    return TEAM[id].stages.filter(s=>s.keys.length).map(s=>({fam:s.name, sid:s.id, proposed:false, items:s.keys.map(k=>byKey[k])}));
  }
  const m=new Map();
  D.workflows.filter(w=>w.function===id && !w.targetOnly).forEach(w=>{
    if(!m.has(w.family)) m.set(w.family,{fam:w.family,proposed:false,items:[]});
    const g=m.get(w.family); g.items.push(w); if(w.familyProposed) g.proposed=true;
  });
  return [...m.values()];
}
function fnStats(fn){
  const all=D.workflows.filter(w=>w.function===fn && !w.targetOnly);
  return {n:all.length, fams:new Set(all.map(w=>w.family)).size, stepped:all.filter(w=>w.e2e.length).length, later:all.filter(w=>w.later).length,
    red:D.workflows.filter(w=>w.function===fn && w.target).length};
}
function teamStats(id){
  const keys=[].concat(...TEAM[id].stages.map(s=>s.keys));
  return {n:keys.length, red:keys.filter(k=>byKey[k].target).length, isNew:keys.filter(k=>byKey[k].targetOnly).length, stages:TEAM[id].stages.length};
}
function nodeStats(id){ if(isT()){ const s=teamStats(id); return {n:s.n, red:s.red}; } return fnStats(id); }
function totals(){
  const u={};
  D.workflows.filter(w=>!w.targetOnly).forEach(w=>{const k=w.id||w.key; u[k]=Math.max(u[k]||0,w.e2e.length);});
  const vals=Object.values(u);
  const tset=new Set(D.workflows.filter(w=>w.target).map(w=>w.target));
  return {wf:vals.length, steps:vals.reduce((a,b)=>a+b,0), stepped:vals.filter(Boolean).length, designs:tset.size};
}
function teamForFn(fn){
  const c={}; Object.values(OR.wf).forEach(o=>{ if(o.functions.includes(fn)) c[o.team]=(c[o.team]||0)+1; });
  return Object.keys(c).sort((a,b)=>c[b]-c[a])[0] || null;
}
function fnForTeam(t){
  const c={}; Object.values(OR.wf).forEach(o=>{ if(o.team===t) o.functions.forEach(f=>c[f]=(c[f]||0)+1); });
  return Object.keys(c).sort((a,b)=>c[b]-c[a])[0] || null;
}
function heightNeeded(){
  let mx=0; const keep=S.mode;
  ['today','target'].forEach(m=>{
    S.mode=m;
    ringIds().forEach(id=>{const g=groupsFor(id); const t=g.reduce((a,x)=>a+Math.max(x.items.length*PITCH,MIN_GROUP),0)+FGAP*Math.max(0,g.length-1); mx=Math.max(mx,t);});
  });
  S.mode=keep;
  return Math.max(MINH, Math.ceil(mx+96));
}
const H = heightNeeded();
const CY = Math.round(H/2);
function pt(b,r){ return [CX + r*Math.sin(rad(b)), CY - r*Math.cos(rad(b))]; }

/* ---------- stage ---------- */
function fnLabel(fn){
  if(fn.length<=16) return esc(fn);
  const words=fn.split(' '); let best=1, bd=1e9;
  for(let i=1;i<words.length;i++){ const a=words.slice(0,i).join(' ').length, b=words.slice(i).join(' ').length; const d=Math.abs(a-b); if(d<bd){bd=d;best=i;} }
  return esc(words.slice(0,best).join(' '))+'<br>'+esc(words.slice(best).join(' '));
}
let pills={}, layout=null, animId=0;

function buildStage(){
  const T=isT();
  let h='';
  h+=`<svg id="wires" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg>`;
  h+=`<div class="collbl" style="left:${CX}px;transform:translateX(-50%)">${T?'Enterprise · outcome teams':'Enterprise · functions'}</div>`;
  h+=`<div class="collbl" style="left:${FX}px">${T?'Stage':'Workflow family'}</div>`;
  h+=`<div class="collbl" style="left:${WX+8}px">Workflow</div>`;
  h+=`<button type="button" class="root" data-go="root" style="left:${CX-R_ROOT}px;top:${CY-R_ROOT}px" aria-label="Azimut Singapore: show overview"><small>Enterprise</small><span>Azimut<br>Singapore</span></button>`;
  ringIds().forEach(id=>{
    const s=nodeStats(id), empty=!s.n, name=nodeName(id);
    let cnt='';
    if(!empty){ cnt = T ? (s.red?`<span class="cnt red" title="${s.red} redesigned">${s.red}</span>`:'') : `<span class="cnt" title="${s.n} workflows">${s.n}</span>`; }
    h+=`<button type="button" class="fn${empty?' empty':''}${T?' team':''}" data-fn="${esc(id)}" aria-pressed="${id===S.fn}" ${empty?'title="Not mapped yet"':''}><span>${fnLabel(name)}${T?`<small class="lead">${esc(TEAM[id].short||TEAM[id].orchestrator)} leads</small>`:''}</span>${cnt}${empty?'<span class="sr"> (not mapped yet)</span>':''}${!empty&&!T?'<span class="sr"> workflows</span>':''}${T&&s.red?'<span class="sr"> redesigned</span>':''}</button>`;
  });
  const groups = S.fn ? groupsFor(S.fn) : [];
  h+=`<div class="branch hide" id="branch">`;
  if(!S.fn){
    h+=`<div class="hint" style="left:${FX}px;top:${CY-24}px">${T?'Pick an outcome team to open its stages and workflows.':'Pick a function on the compass to open its workflow families and workflows.'}</div>`;
  } else if(!groups.length){
    h+=`<div class="fam none" data-g="0" style="left:${FX}px;top:${CY-15}px">Not mapped yet</div>`;
  } else {
    groups.forEach((g,gi)=>{
      const on = g.items.some(w=>w.key===S.key);
      h+=`<div class="fam${g.proposed?' proposed':''}${on?' on':''}" data-g="${gi}">${esc(g.fam)}</div>`;
      g.items.forEach((w,wi)=>{
        const cls=['wf']; if(w.later) cls.push('later'); if(w.target) cls.push('has-t');
        h+=`<button type="button" class="${cls.join(' ')}" data-key="${w.key}" data-g="${gi}" data-i="${wi}" aria-pressed="${w.key===S.key}" title="${esc(w.name)}${w.id?' · '+esc(w.id):''}"><span class="nm">${esc(w.name)}</span>${T&&w.target?'<span class="adot" aria-hidden="true"></span><span class="sr"> (redesigned)</span>':''}${w.targetOnly?'<span class="tagnew">New</span>':''}${w.later&&!T?'<span class="sr"> (named only)</span>':''}</button>`;
      });
    });
  }
  h+=`</div>`;
  stage.style.width=W+'px'; stage.style.height=H+'px';
  stage.innerHTML=h;

  pills={};
  stage.querySelectorAll('.fn').forEach(el=>{ pills[el.dataset.fn]={el,w:el.offsetWidth,h:el.offsetHeight}; });

  layout={groups:[]};
  if(S.fn && groups.length){
    const hs=groups.map(g=>Math.max(g.items.length*PITCH,MIN_GROUP));
    const total=hs.reduce((a,b)=>a+b,0)+FGAP*(groups.length-1);
    let y=CY-total/2;
    const famEls=stage.querySelectorAll('.fam');
    groups.forEach((g,gi)=>{
      const gh=hs[gi], fc=y+gh/2, fe=famEls[gi];
      fe.style.left=FX+'px'; fe.style.top=Math.round(fc-fe.offsetHeight/2)+'px';
      const items=[]; let iy=y+(gh-g.items.length*PITCH)/2;
      g.items.forEach((w,wi)=>{
        const c=iy+PITCH*(wi+.5);
        const el=stage.querySelector(`.wf[data-g="${gi}"][data-i="${wi}"]`);
        el.style.left=WX+'px'; el.style.top=Math.round(c-12)+'px';
        items.push({w,y:c});
      });
      layout.groups.push({g,cy:fc,fw:fe.offsetWidth,items});
      y+=gh+FGAP;
    });
  } else if(S.fn){
    const fe=stage.querySelector('.fam.none');
    layout.groups.push({g:null,cy:CY,fw:fe?fe.offsetWidth:0,items:[]});
  }
}

function placePills(){
  ringIds().forEach(id=>{
    const p=pills[id]; if(!p) return;
    const [x,y]=pt(bearing(id)+S.off,R_FN);
    p.x=x; p.y=y;
    p.el.style.left=Math.round(x-p.w/2)+'px'; p.el.style.top=Math.round(y-p.h/2)+'px';
  });
}

function curve(x1,y1,x2,y2){ const mx=(x1+x2)/2; return `M${x1.toFixed(1)} ${y1.toFixed(1)} C${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`; }

function drawWires(show){
  const T=isT();
  let s='';
  s+=`<circle class="w-comp" cx="${CX}" cy="${CY}" r="${R_COMP}"/>`;
  for(let a=0;a<360;a+=15){
    const big=a%90===0, d=big?8:4;
    const [x1,y1]=pt(a,R_COMP-d),[x2,y2]=pt(a,R_COMP+d);
    s+=`<line class="w-tick${big?' big':''}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }
  s+=`<text class="w-n" x="${CX}" y="${CY-R_COMP-14}">N</text>`;
  if(T){
    const r=R_HUB+5, [ax,ay]=pt(-80,r), [bx,by]=pt(80,r);
    s+=`<circle class="w-hub" cx="${CX}" cy="${CY}" r="${R_HUB}"/>`;
    s+=`<path id="hubarc" d="M${ax.toFixed(1)} ${ay.toFixed(1)} A${r} ${r} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none"/>`;
    s+=`<text class="w-hublbl"><textPath href="#hubarc" startOffset="50%" text-anchor="middle">AZI-BOTS · ${D.agents.length} AGENTS</textPath></text>`;
  }
  ringIds().forEach(id=>{
    const p=pills[id]; if(!p) return;
    const empty=!nodeStats(id).n;
    s+=`<line class="spoke${id===S.fn?' on':''}${empty?' empty':''}" x1="${CX}" y1="${CY}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"/>`;
  });
  if(T){
    ringIds().forEach(id=>{ if(nodeStats(id).red){ const [x,y]=pt(bearing(id)+S.off,R_HUB); s+=`<circle class="hubdot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`; } });
  }
  if(show && S.fn && layout && pills[S.fn]){
    const p=pills[S.fn]; const x1=p.x+p.w/2, y1=p.y;
    layout.groups.forEach(G=>{
      const famOn = G.g && G.items.some(it=>it.w.key===S.key);
      s+=`<path class="br${famOn?' on':''}" d="${curve(x1,y1,FX,G.cy)}"/>`;
      G.items.forEach(it=>{
        const on=it.w.key===S.key, ag=T&&it.w.target;
        s+=`<path class="br${ag?' ag':''}${on?' on':''}" d="${curve(FX+G.fw,G.cy,WX-2,it.y)}"/>`;
        s+=`<circle class="end${ag?' ag':''}${on?' on':''}" cx="${WX-2}" cy="${it.y.toFixed(1)}" r="2.6"/>`;
      });
    });
  }
  const svg=document.getElementById('wires'); if(svg) svg.innerHTML=s;
  if(svg){ svg.querySelectorAll('.br.on').forEach(n=>svg.appendChild(n)); svg.querySelectorAll('.end.on').forEach(n=>svg.appendChild(n)); }
}

function showBranch(){ const b=document.getElementById('branch'); if(b) requestAnimationFrame(()=>b.classList.remove('hide')); }

function rotateTo(target,done){
  cancelAnimationFrame(animId);
  const start=S.off, d=((target-start)%360+540)%360-180;
  if(reduced || Math.abs(d)<.5){ S.off=target; done(); return; }
  const t0=performance.now(), dur=420+Math.abs(d)*1.4;
  const step=now=>{
    const t=Math.min(1,(now-t0)/dur), e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    S.off=start+d*e; placePills(); drawWires(false);
    if(t<1) animId=requestAnimationFrame(step); else { S.off=target; done(); }
  };
  animId=requestAnimationFrame(step);
}

function fit(){
  const avail=scroller.clientWidth || W;
  let s=Math.min(1,avail/W); const mn=PHONE?0.56:MIN_SCALE; if(s<mn) s=mn;
  stage.style.transform=`scale(${s})`;
  box.style.width=Math.floor(W*s)+'px'; box.style.height=Math.ceil(H*s)+'px';
}

/* ---------- header, legend ---------- */
function header(){
  const T=isT();
  const O=S.view==='orch', OV=S.view==='overview', PR=S.view==='proto', AB=S.view==='about';
  $('#mainGrid').hidden=OV||PR||AB; $('#ovPane').hidden=!OV; $('#protoPane').hidden=!PR; $('#aboutPane').hidden=!AB; $('#foot').hidden=OV||PR||AB;
  app.classList.toggle('mode-target', O ? S.omode==='agents' : T);
  $('#designNav').hidden=!O;
  if(O){ const i=DESIGNS.indexOf(S.design); $('#designSel').innerHTML=DESIGNS.map(k=>`<option value="${k}"${k===S.design?' selected':''}>${esc(D.targets[k].title)}</option>`).join(''); $('#designCnt').textContent=`${i+1} of ${DESIGNS.length}`; }
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===S.mode)));
  document.querySelectorAll('[data-omode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.omode===S.omode)));
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===S.view)));
  $('#modeSeg').hidden=O; $('#jumpWrap').hidden=O; $('#omodeSeg').hidden=!O;
  $('#vdesc').textContent = O
    ? (S.omode==='agents' ? 'The same workflow with agents added. The lead stays in the centre; people keep every decision.' : 'How the workflow runs today, with people only. The person who leads it is in the centre.')
    : (T ? 'The same workflows regrouped into five outcome teams, each led by an existing role.' : `Today's ${totals().wf} workflows, grouped by the function that runs them.`);
  $('#levels').textContent = OV ? 'The vision: from an org map to an orchestrator map' : PR ? 'Wave 1 prototypes, built on test data' : AB ? 'About this work and the team' : O ? 'Redesigned workflow → Lead → People → Agents' : T ? 'Enterprise → Outcome team → Stage → Workflow' : 'Enterprise → Function → Workflow family → Workflow';
  let h='<option value="">Jump to a workflow…</option>';
  ringIds().forEach(id=>{
    const ws=[].concat(...groupsFor(id).map(g=>g.items)); if(!ws.length) return;
    h+=`<optgroup label="${esc(nodeName(id))}">`+ws.map(w=>`<option value="${w.key}"${w.key===S.key?' selected':''}>${esc(w.name)}${w.later?' (named only)':''}${w.targetOnly?' (new)':''}${T&&w.target?' ●':''}</option>`).join('')+`</optgroup>`;
  });
  jump.innerHTML=h;
  app.classList.toggle('view-scene',O);
  if(O){ $('#legend').innerHTML = sceneLegend(); } else
  $('#legend').innerHTML = T
    ? `<span><i class="lg pill"></i>Outcome team (count = redesigned)</span><span><i class="lg ring"></i>Azi-bots</span><span><i class="lg dot"></i>Redesigned with agents</span><span><i class="lg new">NEW</i>New workflow</span><span><i class="lg it">Muted</i>Joins its team later</span>`
    : `<span><i class="lg pill"></i>Function (count = workflows)</span><span><i class="lg pill dash"></i>Not mapped yet</span><span><i class="lg box"></i>Family</span><span><i class="lg box dash"></i>Family proposed by the team</span><span><i class="lg it">Italic</i>Named, not yet stepped</span>`;
  const t=totals();
  $('#foot').innerHTML = D.live ? `Source: ${esc(D.source)}, ${D.stale?`saved copy from ${esc(D.readAt)}`:`read live when this page opened (${esc(D.readAt)})`}. It holds ${t.wf} workflows and ${t.steps} mapped steps. The target groups the same workflows by outcome team; target designs are the team's proposals for discussion with Azimut.`
    : `Source: ${esc(D.source)}. This version holds ${t.wf} workflows and ${t.steps} mapped steps; most Compliance workflows are named but not yet stepped. The latest master (53 workflows, about 390 steps) will refresh this view once shared. The target groups the same workflows by outcome team; target designs are the team's proposals for discussion with Azimut.`;
}

/* ---------- panel ---------- */
function crumbs(list){
  return `<nav class="crumbs" aria-label="Breadcrumb">${list.map((c,i)=> i<list.length-1
    ? `<button type="button" ${c.fn?`data-fn="${esc(c.fn)}"`:'data-go="root"'}>${esc(c.label)}</button><span aria-hidden="true">›</span>`
    : `<span>${esc(c.label)}</span>`).join('')}</nav>`;
}
function wfMeta(w){
  if(w.later) return 'Named only';
  if(w.e2e.length) return `${w.e2e.length} steps`;
  const st=(w.contribs[0]||{}).status; return st||'Not stepped';
}
function andList(a){ return a.length<2 ? a.join('') : a.slice(0,-1).join(', ')+' and '+a[a.length-1]; }

function panelOverview(){
  const T=isT(), t=totals();
  if(T){
    const F=OR.firm;
    let h=`<div class="eyebrow t">After · by outcome team</div><h2>Organized by task, not by department</h2>`;
    h+=`<p class="p">Today a workflow crosses several departments and people carry it between them by email. After, the same work sits in five outcome teams, each led by an existing role (the RM, the ARM, Compliance or Finance) who directs agents from Azi-bots. Specialists step in only to decide.</p>`;
    const rows=TEAMS.map(id=>{const s=teamStats(id), tm=TEAM[id]; return `<tr><td><button type="button" class="lnk" data-fn="${id}">${esc(tm.name)}</button><div class="tl">${esc(tm.orchestrator)}</div></td><td>${s.n}</td><td>${s.red||'–'}</td><td>${tm.target.agents.length}</td></tr>`;}).join('');
    h+=`<div class="sec"><h3>Outcome teams <small>${MS.wfs}, each with one owner</small></h3><div class="tblwrap"><table class="t"><thead><tr><th>Team, and who leads it</th><th>Workflows</th><th>Redesigned</th><th>Agents</th></tr></thead><tbody>${rows}</tbody></table></div><p class="srcline" style="margin-top:8px">${F.split} workflows are split between two functions today; here each has one owner.</p></div>`;
    const pods=[...new Set(D.agents.map(a=>a.pod))];
    h+=`<div class="sec"><h3>Azi-bots <small>${D.agents.length} agents · 4 pods</small></h3><div class="pods">${pods.map(p=>`<div class="pod"><h4>${esc(p)}</h4><ul>${D.agents.filter(a=>a.pod===p).map(a=>`<li><span>${esc(a.name)}</span><small>Wave ${a.wave}</small></li>`).join('')}</ul></div>`).join('')}</div></div>`;
    return h;
  }
  let h=`<div class="eyebrow">Before · by function</div><h2>Azimut Singapore</h2>`;
  h+=`<p class="p">Eight functions, the workflow families inside them, and each workflow. Pick a function on the compass, then a workflow, to see who does what today, step by step.</p>`;
  const rows=FNS.map(fn=>{const s=fnStats(fn); const z=v=>v?`<td>${v}</td>`:`<td class="z">–</td>`; return `<tr><td><button type="button" class="lnk" data-fn="${esc(fn)}">${esc(fn)}</button></td>${z(s.n)}${z(s.stepped)}${z(s.red)}</tr>`;}).join('');
  h+=`<div class="sec"><h3>By function <small>${MS.name}</small></h3><div class="tblwrap"><table class="t"><thead><tr><th>Function</th><th>Workflows</th><th>Stepped</th><th>Redesigned</th></tr></thead><tbody>${rows}<tr class="tot"><td>Firm, counted once</td><td>${t.wf}</td><td>${t.stepped}</td><td>${t.designs} designs</td></tr></tbody></table></div></div>`;
  return h;
}

function panelFunction(fn){
  const s=fnStats(fn), groups=groupsFor(fn);
  let h=crumbs([{label:'Azimut Singapore'},{label:fn}]);
  h+=`<div class="eyebrow">Function</div><h2>${esc(fn)}</h2>`;
  if(!groups.length){ return h+`<p class="empty">No workflows are mapped for this function in ${MS.the} yet.</p>`; }
  h+=`<p class="sub">${s.n} workflows in ${s.fams} families · ${s.stepped} with steps mapped${s.later?` · ${s.later} named only`:''}</p>`;
  groups.forEach(g=>{
    h+=`<div class="fgroup"><h3>${esc(g.fam)}${g.proposed?'<span class="ptag">Proposed</span>':''}</h3><ul class="wl">`;
    g.items.forEach(w=>{
      h+=`<li class="${w.later?'later':''}"><button type="button" data-key="${w.key}"><span class="nm">${esc(w.name)}</span><span class="mt">${esc(wfMeta(w))}</span></button></li>`;
    });
    h+=`</ul></div>`;
  });
  return h;
}

function orchBlock(tm){
  return `<div class="orch"><span class="pi">${PERSON}</span><div><span class="ol">Led by</span><b>${esc(tm.orchestrator)}</b>${tm.orch_note?`<span class="onote">${esc(tm.orch_note)}</span>`:''}</div></div>`;
}
function stageRows(st){
  let h='';
  if(st.agents.length) st.agents.forEach(([n,x])=>{ h+=`<div class="row"><span class="tag ag">Agent</span><span><b>${esc(n)}</b> ${esc(x)}</span></div>`; });
  else h+=`<div class="row"><span class="tag ag">Agent</span><span class="none">None: this stays a human call</span></div>`;
  if(st.people.length) st.people.forEach(([w,x,k])=>{ h+=`<div class="row"><span class="tag ${k==='d'?'dd':'pp'}">${k==='d'?'Decides':'Person'}</span><span><b>${esc(w)}</b> ${esc(x)}</span></div>`; });
  else h+=`<div class="row"><span class="tag pp">Person</span><span class="none">None needed: agents hand off to each other</span></div>`;
  return h;
}

function panelTeam(id){
  const tm=TEAM[id], s=teamStats(id), td=tm.today, tg=tm.target;
  let h=crumbs([{label:'Azimut Singapore'},{label:tm.name}]);
  h+=`<div class="eyebrow t">Outcome team</div><h2>${esc(tm.name)}</h2>`;
  h+=`<p class="sub">${s.n} workflows in ${tm.stages.length} stages · ${s.red} redesigned${s.isNew?` · ${s.isNew} new`:''}</p>`;
  h+=orchBlock(tm);
  h+=`<div class="chips">${tm.decides.map(d=>`<span class="chip">Decides: ${esc(d)}</span>`).join('')}</div>`;
  h+=`<div class="cmp"><div class="a"><small>Before · by function</small>${td.workflows} workflows from ${td.functions.length} function${td.functions.length>1?'s':''}${td.steps?` · <strong>${td.handoffs} handoffs</strong> in ${td.steps} mapped steps`:' · not yet stepped'}</div><div class="b"><small>After · with agents</small>Led by ${esc(tm.orchestrator)} · ${tg.agents.length} agent${tg.agents.length>1?'s':''}${tg.decisions?` · ${tg.decisions} human decisions`:''}</div></div>`;
  h+=`<div class="sec"><h3>Stages <small>who does what, after</small></h3><ol class="stg">`;
  tm.stages.forEach((st,i)=>{
    h+=`<li><span class="sn">${i+1}</span><div class="sc"><h4>${esc(st.name)}</h4><p class="td"><b>Today:</b> ${esc(st.today)}</p>${stageRows(st)}`;
    if(st.keys.length) h+=`<div class="wfs">${st.keys.map(k=>{const w=byKey[k]; return `<button type="button" data-key="${k}" class="${w.target?'r':''}">${w.target?'<span class="adot" aria-hidden="true"></span>':''}${esc(w.name)}</button>`;}).join('')}</div>`;
    h+=`</div></li>`;
  });
  h+=`</ol></div>`;
  return h;
}

function infoRow(label,val,list){
  if(!val) return '';
  const items=list?split(val):null;
  const body = items && items.length>1 ? `<ul>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>` : esc(val);
  return `<dt>${label}</dt><dd>${body}</dd>`;
}

function panelToday(w){
  let h=crumbs([{label:'Azimut Singapore'},{label:w.function,fn:w.function},{label:w.family}]);
  const c = w.contribs.find(x=>x.role===S.role) || w.contribs[0];
  const role = c ? c.role : null;
  h+=`<div class="eyebrow">Selected workflow${role?` · ${esc(role)} contribution`:''}</div><h2>${esc(w.name)}</h2>`;
  h+=`<p class="sub">${esc(w.function)} · ${esc(w.family)}</p>`;
  const chips=[];
  if(w.id) chips.push(`<span class="chip">${esc(w.id)}</span>`);
  if(c && c.value_stream) chips.push(`<span class="chip">${esc(c.value_stream)}</span>`);
  if(w.later) chips.push(`<span class="chip st ns">Named only</span>`);
  else if(c && c.status) chips.push(`<span class="chip st${/not/i.test(c.status)?' ns':''}">${esc(c.status)}</span>`);
  if(chips.length) h+=`<div class="chips">${chips.join('')}</div>`;
  if(w.contribs.length>1){
    h+=`<div class="roles" role="group" aria-label="Contribution">Contributions:${w.contribs.map(x=>`<button type="button" data-role="${esc(x.role)}" aria-pressed="${x.role===role}">${esc(x.role)}</button>`).join('')}</div>`;
  }
  const others=D.workflows.filter(x=>x.id && x.id===w.id && x.key!==w.key);
  if(others.length) h+=`<div class="also">Also mapped under ${others.map(o=>`<button type="button" class="lnk" data-key="${o.key}">${esc(o.function)}</button>`).join(', ')}</div>`;

  const p=placeOf(w);
  if(p){
    const tm=TEAM[p.team];
    h+=`<div class="callout"><b>${w.target?'Redesigned with agents':'After'}</b>${w.target?esc(D.targets[w.target].change)+'. ':''}It sits in the <i>${esc(tm.name)}</i> team.<br><button type="button" data-mode="target">See the after view</button>${w.target?` <button type="button" data-design="${w.target}">Watch it on the orchestrator map</button>`:''}</div>`;
  }

  if(w.later || !c){
    return h+`<p class="empty">This workflow is named in the Compliance list but its steps are not in ${MS.the} yet.</p>`;
  }
  const info = infoRow('Purpose',c.purpose)+infoRow('Trigger',c.trigger)+infoRow('Inputs',c.inputs)+infoRow('Output',c.output)+infoRow('Handoff',c.handoff)+infoRow('Frequency',c.frequency,true);
  h+=`<div class="sec"><h3>Workflow information</h3>${info?`<dl class="info">${info}</dl>`:`<p class="empty" style="margin:0">Not filled in yet in ${MS.short} (status: ${esc(c.status||'not started')}).</p>`}</div>`;

  if(w.e2e.length){
    const mine=w.e2e.filter(s=>s.role===role).length;
    h+=`<div class="sec"><h3>End-to-end steps <small class="keyline"><i aria-hidden="true"></i>${mine} of ${w.e2e.length} by ${esc(role)}</small></h3><ol class="steps">`;
    w.e2e.forEach(s=>{
      const m=s.role===role;
      h+=`<li class="${m?'mine':''}"><span class="num">${s.n}</span><span><span class="who">${esc(s.who)}</span>${esc(s.text)}${s.next?` <span class="nx">→ ${esc(s.next)}</span>`:''}${m?'<span class="sr"> (this contribution)</span>':''}</span></li>`;
    });
    h+=`</ol></div>`;
  } else {
    h+=`<div class="sec"><h3>End-to-end steps</h3><p class="empty" style="margin:0">Steps not mapped yet in ${MS.short}.</p></div>`;
  }

  const det=[['Pain points','pain',true],['Systems','systems',true],['Controls','controls',false],['Exceptions','exceptions',false],['Data','data',false],['Documents','documents',false],['KPIs','kpis',false]];
  const dh=det.filter(d=>c[d[1]]).map(d=>{const items=split(c[d[1]]); return `<details class="dl"${d[2]?' open':''}><summary>${d[0]}<span>${items.length}</span></summary><ul>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></details>`;}).join('');
  if(dh) h+=`<div class="sec"><h3>Supporting details</h3>${dh}</div>`;
  if(c.source) h+=`<p class="srcline">Source: ${split(c.source).map(esc).join(' · ')}</p>`;
  return h;
}

function panelTarget(w){
  const p=placeOf(w), tm=TEAM[p.team], st=STAGE[p.team+'/'+p.stage], o=OR.wf[CANON[w.key]];
  let h=crumbs([{label:'Azimut Singapore'},{label:tm.name,fn:tm.id},{label:st.name}]);
  const todayLine = w.targetOnly ? 'New workflow: today this only happens when an ARM has spare time'
    : `Today: ${o.functions.length>1?'split between '+andList(o.functions.map(esc)):esc(o.functions[0]||w.function)}${o.steps?` · ${o.steps} mapped steps · <strong>${o.handoffs} handoffs</strong> between ${andList(o.parties.map(esc))}`:' · not yet mapped step by step'}`;
  if(!w.target){
    h+=`<div class="eyebrow t">Outcome team · ${esc(tm.name)}</div><h2>${esc(w.name)}</h2>`;
    h+=`<p class="sub">${todayLine}</p>`;
    h+=orchBlock(tm);
    h+=`<p class="p">Joins the <b>${esc(tm.name)}</b> team at the <b>${esc(st.name.toLowerCase())}</b> stage. It keeps today's process until its agents arrive.</p>`;
    h+=`<div class="sec"><h3>${esc(st.name)} <small>stage plan</small></h3><div class="sc plain">${stageRows(st)}</div></div>`;
    h+=`<div class="callout" style="background:var(--surface-2);border-color:var(--line);color:var(--body)"><b>See how it runs today</b>The before view shows each step and who does it.<br><button type="button" data-mode="today" style="color:var(--ink);border-color:var(--line)">Switch to before</button></div>`;
    return h;
  }
  const t=D.targets[w.target];
  h+=`<div class="eyebrow t">Redesigned workflow · Wave ${t.wave}</div><h2>${esc(t.title)}</h2>`;
  h+=`<p class="sub">${todayLine}</p>`;
  h+=`<div class="orch"><span class="pi">${PERSON}</span><div><span class="ol">Led by</span><b>${esc(t.lead)}</b><span class="onote">Leads it today and directs its agents after</span></div></div>`;
  h+=`<div class="callout" style="margin-top:12px"><b>See people and agents at work</b>Play this workflow with people only, then with the agents added.<br><button type="button" data-design="${w.target}">Watch it on the orchestrator map</button></div>`;
  h+=`<div class="chips"><span class="chip">Trigger: ${esc(t.trigger)}</span>${t.agents.map(a=>`<span class="chip ag">${esc(a)}</span>`).join('')}</div>`;
  h+=`<p class="big">${esc(t.change)}</p>`;
  if(t.today) h+=`<p class="today"><b>Today:</b> ${esc(t.today)}</p>`;
  h+=`<div class="sec"><h3>Target steps <span class="tkey"><span><i aria-hidden="true"></i>Person</span><span><i class="a" aria-hidden="true"></i>Agent</span><span><i class="d" aria-hidden="true"></i>Human decision</span></span></h3><ol class="ts">`;
  t.steps.forEach((s,i)=>{
    const lbl = s.kind==='decision' ? `${esc(s.who)} decides` : esc(s.who);
    h+=`<li><span class="num">${i+1}</span><div class="tc ${s.kind}"><span class="who">${lbl}</span>${esc(s.text)}${s.kind==='agent'?'<span class="sr"> (agent)</span>':''}</div></li>`;
  });
  h+=`</ol></div>`;
  const ags=t.agents.map(n=>agentByName[n]).filter(Boolean);
  if(ags.length){
    h+=`<div class="sec"><h3>Agents from Azi-bots</h3><div class="agents">${ags.map(a=>`<div class="ac"><div class="an">${esc(a.name)}<small>${esc(a.pod)} · Wave ${a.wave}</small></div><div><em>Lives in</em>${esc(a.lives)}</div><div><em>Signed off by</em>${esc(a.signs)}</div></div>`).join('')}</div></div>`;
  }
  const away=splitSemi(t.away), meas=splitSemi(t.measure);
  if(away.length) h+=`<div class="sec"><h3>What goes away</h3><ul class="plain">${away.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`;
  if(meas.length) h+=`<div class="sec"><h3>How we measure it</h3><ul class="plain">${meas.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`;
  const cov=Object.keys(OR.wf).filter(k=>k!==w.key && byKey[k].target===w.target);
  if(cov.length) h+=`<div class="sec"><h3>This design also covers</h3><ul class="plain">${cov.map(k=>`<li><button type="button" class="lnk" data-key="${k}">${esc(byKey[k].name)}</button> <span class="sub" style="display:inline">· ${esc(TEAM[OR.wf[k].team].name)}</span></li>`).join('')}</ul></div>`;
  return h;
}

function renderPanel(){
  let h;
  if(S.key && byKey[S.key]) h = isT() ? panelTarget(byKey[S.key]) : panelToday(byKey[S.key]);
  else if(S.fn) h = isT() ? panelTeam(S.fn) : panelFunction(S.fn);
  else h=panelOverview();
  panel.innerHTML=h;
}

/* ---------- one look per agent ---------- */
const AV={ // head, eyes, antenna, chest badge
 'Market Trend':['rounded','dots','single','chart'],
 'Portfolio Review':['round','glasses','none','magnifier'],
 'Portfolio Proposal':['wide','happy','double','pie'],
 'CRM assistant':['rounded','dots','headset','bubble'],
 'Onboarding Tracker':['square','visor','single','clipboard'],
 'Source-of-Wealth check':['dome','one','bulb','shield'],
 'Pre-trade Check':['square','happy','double','tick'],
 'Trade Alert Triage':['round','visor','bulb','bell'],
 'Revenue Assurance':['rounded','glasses','spring','coin'],
 'Revenue Statement':['wide','dots','single','doc'],
 'Fee Letter Drafter':['dome','happy','none','envelope'],
 'Close and AP':['square','dots','bulb','calendar'],
 'Product Library':['round','happy','single','book'],
 'Research Analyst Team':['wide','glasses','double','lightbulb'],
 'Management Insights':['rounded','one','spring','bars']};
const AV_HEAD={rounded:'<rect x="-15" y="-37" width="30" height="26" rx="8" class="hd"/>',
 round:'<circle cx="0" cy="-24" r="14" class="hd"/>',
 square:'<rect x="-14" y="-37" width="28" height="26" rx="3" class="hd"/>',
 wide:'<rect x="-18" y="-35" width="36" height="22" rx="11" class="hd"/>',
 dome:'<path d="M-15 -11 V-24 A15 15 0 0 1 15 -24 V-11 Z" class="hd"/>'};
const AV_EYES={dots:'<circle cx="-6" cy="-24" r="2.8" class="ey"/><circle cx="6" cy="-24" r="2.8" class="ey"/>',
 glasses:'<circle cx="-6.5" cy="-24" r="4.6" class="em"/><circle cx="6.5" cy="-24" r="4.6" class="em"/><line x1="-1.9" y1="-24" x2="1.9" y2="-24" class="em"/><circle cx="-6.5" cy="-24" r="1.7" class="ey"/><circle cx="6.5" cy="-24" r="1.7" class="ey"/>',
 happy:'<path d="M-9.5 -22.5 q3 -4.5 6 0" class="em"/><path d="M3.5 -22.5 q3 -4.5 6 0" class="em"/>',
 visor:'<rect x="-11" y="-28" width="22" height="7.5" rx="3.75" class="vz"/><rect x="-8" y="-26.6" width="5" height="2" rx="1" class="gl"/>',
 one:'<circle cx="0" cy="-24" r="5.2" class="em"/><circle cx="0.8" cy="-24.4" r="2.3" class="ey"/>'};
const AV_ANT={single:'<line x1="0" y1="-38" x2="0" y2="-46" class="ant"/><circle cx="0" cy="-48" r="3" class="antd"/>',
 double:'<line x1="-6" y1="-37" x2="-10" y2="-46" class="ant"/><line x1="6" y1="-37" x2="10" y2="-46" class="ant"/><circle cx="-10.5" cy="-47.5" r="2.6" class="antd"/><circle cx="10.5" cy="-47.5" r="2.6" class="antd"/>',
 bulb:'<line x1="0" y1="-38" x2="0" y2="-43" class="ant"/><circle cx="0" cy="-47.5" r="4.6" class="antd"/>',
 spring:'<polyline points="0,-38 3.5,-40.5 -3.5,-43 3.5,-45.5 0,-48" class="ant"/><circle cx="0" cy="-49.5" r="2.6" class="antd"/>',
 none:'',
 headset:'<path d="M-17 -23 A17 17 0 0 1 17 -23" class="ant"/><rect x="-20" y="-28" width="5" height="10" rx="2.5" class="antd"/><rect x="15" y="-28" width="5" height="10" rx="2.5" class="antd"/><path d="M17.5 -18 Q17 -11 9 -11.5" class="ant"/>'};
const AV_EMB={chart:'<polyline points="-6,4.5 -2,0 1.5,2.5 6,-3.5" class="em"/><polyline points="3,-3.5 6,-3.5 6,-0.5" class="em"/>',
 magnifier:'<circle cx="-1.2" cy="-0.6" r="3.8" class="em"/><line x1="1.6" y1="2.2" x2="5.5" y2="6" class="em"/>',
 pie:'<circle cx="0" cy="1" r="5.6" class="em"/><path d="M0 1 V-4.6 A5.6 5.6 0 0 1 5.4 2.4 Z" class="emf"/>',
 bubble:'<path d="M-6.5 -3.5 h13 v8 h-7 l-3.5 3 v-3 h-2.5 z" class="em"/>',
 clipboard:'<rect x="-4.8" y="-4.5" width="9.6" height="11.5" rx="1.5" class="em"/><line x1="-2.4" y1="-0.8" x2="2.4" y2="-0.8" class="em"/><line x1="-2.4" y1="2.4" x2="2.4" y2="2.4" class="em"/>',
 shield:'<path d="M0 -5 L5.5 -3 V1 C5.5 4.6 3 6.6 0 7.6 C-3 6.6 -5.5 4.6 -5.5 1 V-3 Z" class="em"/>',
 tick:'<polyline points="-5.5,1.5 -1.8,5 5.5,-3.5" class="em"/>',
 bell:'<path d="M-5 4.5 V0.5 a5 5 0 0 1 10 0 V4.5 Z" class="em"/><line x1="-1.6" y1="7" x2="1.6" y2="7" class="em"/>',
 coin:'<circle cx="0" cy="1" r="5.8" class="em"/><path d="M2.2 -1.4 C1.4 -2.6 -2.2 -2.6 -2.2 -0.6 C-2.2 1.4 2.2 0.6 2.2 2.6 C2.2 4.6 -1.6 4.6 -2.4 3.4" class="em"/>',
 doc:'<rect x="-4.5" y="-5" width="9" height="12" rx="1.2" class="em"/><line x1="-2.2" y1="-1.5" x2="2.2" y2="-1.5" class="em"/><line x1="-2.2" y1="1.8" x2="2.2" y2="1.8" class="em"/>',
 envelope:'<rect x="-6.5" y="-4" width="13" height="10" rx="1.4" class="em"/><path d="M-6.5 -4 L0 1.5 L6.5 -4" class="em"/>',
 calendar:'<rect x="-5.8" y="-3.8" width="11.6" height="10.5" rx="1.6" class="em"/><line x1="-5.8" y1="-0.6" x2="5.8" y2="-0.6" class="em"/><line x1="-2.6" y1="-6" x2="-2.6" y2="-2.6" class="em"/><line x1="2.6" y1="-6" x2="2.6" y2="-2.6" class="em"/>',
 book:'<path d="M0 -3.6 C-2 -4.8 -4.6 -4.8 -6 -3.8 V5.4 C-4.6 4.4 -2 4.4 0 5.6 C2 4.4 4.6 4.4 6 5.4 V-3.8 C4.6 -4.8 2 -4.8 0 -3.6 Z" class="em"/><line x1="0" y1="-3.6" x2="0" y2="5.6" class="em"/>',
 lightbulb:'<path d="M-2.4 3 C-2.4 1 -4.2 0 -4.2 -2 a4.2 4.2 0 0 1 8.4 0 C4.2 0 2.4 1 2.4 3 Z" class="em"/><line x1="-1.6" y1="5.6" x2="1.6" y2="5.6" class="em"/>',
 bars:'<line x1="-4" y1="6" x2="-4" y2="2" class="em"/><line x1="0" y1="6" x2="0" y2="-1.5" class="em"/><line x1="4" y1="6" x2="4" y2="-4.5" class="em"/>'};
function botAvatar(name){
  const s=AV[name]||['rounded','dots','single','tick'];
  return `<g>${AV_ANT[s[2]]}${AV_HEAD[s[0]]}${AV_EYES[s[1]]}<rect x="-17" y="-10" width="34" height="22" rx="7" class="bd"/>${AV_EMB[s[3]]}</g>`;
}

/* ---------- orchestrator map: people only, then people with agents ---------- */
let SW=1270, SH=640, SCX=635, SCY=318, RX=300, RY=190, HRX=410, HRY=242, FS=1.45, LH=18, EXT=null;
function setSceneGeo(){
  if(PHONE){ SW=720; SH=1000; SCX=360; SCY=500; RX=232; RY=290; HRX=232; HRY=300; FS=1.75; LH=27; EXT=[[96,92],[624,92],[96,930],[624,930]]; }
  else { SW=1270; SH=640; SCX=635; SCY=318; RX=300; RY=190; HRX=410; HRY=242; FS=1.45; LH=18; EXT=null; }
}
const ZONE={'RM':'Wealth Management','ARM':'Wealth Management','Finance':'Finance & Operations','Compliance':'Compliance','Legal':'Legal','MD':'Management','Management':'Management',
  'Outsourced accountant':'Outside Azimut','Bank':'Outside Azimut','Client':'Outside Azimut','Counterparty':'Outside Azimut','Capital Introducer':'Outside Azimut','Vendors and staff':'Outside Azimut','PMS':'Systems'};
const ALIAS={'Outsourced accounting service provider':'Outsourced accountant','Outsourced accounting vendor':'Outsourced accountant','Accountant':'Outsourced accountant',
  'RM or ARM':'ARM','ARM/RM':'ARM','Azimut':'Client'};
const KNOWNP=new Set(Object.keys(ZONE));
const ORDER_D=['market','review','proposal','onboarding','revenue','commission','pretrade','feeletter','close','aum'];
const DESIGNS=Object.keys(D.targets).sort((a,b)=>D.targets[a].wave-D.targets[b].wave || ORDER_D.indexOf(a)-ORDER_D.indexOf(b));
const sceneEl=document.getElementById('scene');
let SC={id:null, omode:null, step:0, playing:false, timer:0, raf:0, pos:{}};
const isA=()=>S.omode==='agents';

function partiesOf(who){
  const out=new Set();
  String(who).split(/\s*(?:\/|↔|,| and )\s*/).forEach(p=>{ p=ALIAS[p.trim()]||p.trim(); if(KNOWNP.has(p)) out.add(p); });
  return out;
}
function primary(who){
  const w=ALIAS[String(who).trim()]; if(w) return w;
  const first=String(who).split(/\s*(?:\/|↔)\s*/)[0].trim();
  return ALIAS[first]||first;
}
function kindOf(id){ return ZONE[id]==='Outside Azimut'||ZONE[id]==='Systems' ? 'ext' : 'human'; }
function wfById(id){ return D.workflows.filter(w=>w.id===id).sort((a,b)=>b.e2e.length-a.e2e.length)[0]; }

function todaySteps(dk){
  const t=D.targets[dk];
  if(t.todayAlt) return {src:`Today's flow from interviews; not yet mapped in ${MS.the}`, steps:t.todayAlt};
  const steps=[], ids=[];
  t.rep.forEach(id=>{ const w=wfById(id); if(w&&w.e2e.length){ ids.push(id); w.e2e.forEach(s=>steps.push({who:s.who,text:s.text,next:s.next||''})); } });
  if(!steps.length) return {src:`Steps not in ${MS.the}; summary from the target design`, steps:[{who:t.lead, text:t.today, next:''}]};
  return {src:`Today's flow from ${D.live?D.source:'Operating Map Master V4'} (${ids.join(', ')})`, steps};
}
function peopleFlow(dk){
  const lead=D.targets[dk].lead, src=todaySteps(dk);
  const steps=[], actors={};
  const add=id=>{ if(!actors[id]) actors[id]={id, kind:kindOf(id)}; };
  src.steps.forEach((s,i)=>{
    const id=primary(s.who); add(id);
    const nx=String(s.next||'').trim().split(/[\s/]/)[0], nid=ALIAS[nx]||nx;
    const nextId=i+1<src.steps.length?primary(src.steps[i+1].who):null;
    let exc=null; if(nid && KNOWNP.has(nid) && nid!==id && nid!==nextId){ exc=nid; add(nid); }
    steps.push({a:id, who:s.who, text:s.text, next:s.next, kind:'person', exc, parties:partiesOf(s.who)});
  });
  add(lead); actors[lead].lead=true;
  const links=[]; let hand=0;
  for(let i=1;i<steps.length;i++){
    const a=steps[i-1], b=steps[i];
    if(a.exc) links.push({i, from:a.a, to:a.exc, cls:'exc'},{i, from:a.exc, to:a.a, cls:'exc', back:true});
    if(a.a===b.a) continue;
    const h=a.parties.size&&b.parties.size&&![...a.parties].some(p=>b.parties.has(p));
    if(h) hand++;
    links.push({i, from:a.a, to:b.a, cls:h?'hand':'p'});
  }
  const last=steps[steps.length-1]; if(last&&last.exc) links.push({i:steps.length, from:last.a, to:last.exc, cls:'exc'});
  return {src:src.src, steps, actors, links, lead, stats:{steps:steps.length, hand, people:Object.values(actors).filter(a=>a.kind==='human'||(a.kind==='ext'&&ZONE[a.id]!=='Systems')).length}};
}
function agentFlow(dk){
  const t=D.targets[dk], lead=t.lead;
  const steps=[], actors={};
  t.steps.forEach(s=>{
    const ag=s.kind==='agent', id=ag?s.who:(ALIAS[s.who]||s.who);
    if(!actors[id]) actors[id]={id, kind:ag?'agent':kindOf(id)};
    if(s.kind==='decision') actors[id].decides=true;
    steps.push({a:id, who:s.who, text:s.text, kind:s.kind});
  });
  if(!actors[lead]) actors[lead]={id:lead, kind:'human'};
  actors[lead].lead=true;
  const links=[]; let hand=0, ag=0, dec=0;
  steps.forEach(s=>{ if(s.kind==='agent') ag++; if(s.kind==='decision') dec++; });
  for(let i=1;i<steps.length;i++){
    const a=steps[i-1], b=steps[i]; if(a.a===b.a) continue;
    const ka=actors[a.a].kind, kb=actors[b.a].kind;
    let cls = ka==='agent'&&kb==='agent' ? 'ag' : (ka==='agent'||kb==='agent') ? 'ag2' : (hand++, 'hand');
    if(b.kind==='decision') cls+=' dec';
    links.push({i, from:a.a, to:b.a, cls});
  }
  return {src:`Target design proposed by the team · Wave ${t.wave}`, steps, actors, links, lead, stats:{steps:steps.length, ag, dec, hand}};
}

function spread(n, c, gap){ return Array.from({length:n},(_,i)=>c+(i-(n-1)/2)*gap); }
function wrap2(s){ s=String(s); if(s.length<=14) return [s]; const w=s.split(' '); if(w.length<2) return [s]; let best=1,bd=1e9; for(let i=1;i<w.length;i++){const d=Math.abs(w.slice(0,i).join(' ').length-w.slice(i).join(' ').length); if(d<bd){bd=d;best=i;}} return [w.slice(0,best).join(' '),w.slice(best).join(' ')]; }
// one layout for both states, so nobody moves: the agents simply arrive around the lead
function sLayout(P,A){
  const pos={}, lead=P.lead;
  pos[lead]={x:SCX,y:SCY};
  const seen=[]; [P,A].forEach(f=>f.steps.forEach(s=>{ if(!seen.includes(s.a)) seen.push(s.a); if(s.exc&&!seen.includes(s.exc)) seen.push(s.exc); }));
  const kind=id=>(A.actors[id]||P.actors[id]).kind;
  const ags=seen.filter(id=>kind(id)==='agent'), hum=seen.filter(id=>id!==lead&&kind(id)==='human'), ext=seen.filter(id=>id!==lead&&kind(id)==='ext');
  const k=ags.length, a0=PHONE?-150:-160, aw=PHONE?120:140, angs=k===1?[-90]:k===2?[-125,-55]:Array.from({length:k},(_,i)=>a0+i*(aw/(k-1)));
  ags.forEach((id,i)=>{ pos[id]={x:SCX+RX*Math.cos(angs[i]*Math.PI/180), y:SCY+RY*Math.sin(angs[i]*Math.PI/180)}; });
  const m=hum.length, h0=PHONE?150:158, hw=PHONE?120:136, hang=m===1?[90]:m===2?[140,40]:Array.from({length:m},(_,i)=>h0-i*(hw/(m-1)));
  hum.forEach((id,i)=>{ pos[id]={x:SCX+HRX*Math.cos(hang[i]*Math.PI/180), y:SCY+HRY*Math.sin(hang[i]*Math.PI/180)}; });
  if(EXT) ext.forEach((id,i)=>{ const e=EXT[i%EXT.length]; pos[id]={x:e[0],y:e[1]+(i>=EXT.length?60:0)}; });
  else spread(ext.length, SCY, 170).forEach((y,i)=>{ pos[ext[i]]={x:92,y}; });
  return pos;
}
function figure(id,kind){
  if(kind==='agent') return `<g class="fig">${botAvatar(id)}</g>`;
  if(id==='Bank'||id==='Counterparty') return `<g class="fig"><path d="M-20 -14 L0 -30 L20 -14 Z" class="hd"/><rect x="-16" y="-12" width="5" height="18" class="bd"/><rect x="-2.5" y="-12" width="5" height="18" class="bd"/><rect x="11" y="-12" width="5" height="18" class="bd"/><rect x="-21" y="7" width="42" height="5" class="bd"/></g>`;
  if(id==='PMS') return `<g class="fig"><rect x="-18" y="-30" width="36" height="40" rx="5" class="bd"/><line x1="-10" y1="-18" x2="10" y2="-18" class="sysl"/><line x1="-10" y1="-8" x2="10" y2="-8" class="sysl"/><line x1="-10" y1="2" x2="4" y2="2" class="sysl"/></g>`;
  return `<g class="fig"><circle cx="0" cy="-27" r="11" class="hd"/><path d="M-19 10 C-19 -8 -10 -13 0 -13 C10 -13 19 -8 19 10 Z" class="bd"/></g>`;
}
function flows(){ const dk=D.targets[S.design]?S.design:DESIGNS[0]; return {dk, P:peopleFlow(dk), A:agentFlow(dk)}; }
function curFlow(){ const F=flows(); return isA()?F.A:F.P; }

function sceneHeader(F){
  const t=D.targets[F.dk], fl=isA()?F.A:F.P;
  const pl=(n,w,p)=>`${n} ${n===1?w:(p||w+'s')}`;
  const stats = isA()
    ? `${pl(fl.stats.steps,'step')} · <b class="ag">${fl.stats.ag} done by agents</b> · ${pl(fl.stats.dec,'human decision')} · <strong>${pl(fl.stats.hand,'handoff')}</strong> between people and parties`
    : `${pl(fl.stats.steps,'step')}, all by hand · <strong>${pl(fl.stats.hand,'handoff')}</strong> between people and parties · ${pl(fl.stats.people,'party','parties')} involved`;
  return `<div class="scene-h"><div><p class="eyebrow${isA()?' t':''}">${isA()?'People with agents · the target design':'People only · how it runs today'}</p><h3>${esc(t.title)}</h3><p class="st">${stats}</p><p class="srcl">${esc(fl.src)}. Led by ${esc(F.P.lead)} in both.</p></div></div>`;
}

function renderScene(){
  const F=flows();
  if(SC.id===F.dk && SC.omode===S.omode && sceneEl.querySelector('svg.sc')) return;
  stop(); cancelAnimationFrame(SC.raf);
  if(SC.id===F.dk && SC.omode && SC.omode!==S.omode && sceneEl.querySelector('svg.sc')){
    SC.omode=S.omode; sceneEl.querySelector('.scene-h').outerHTML=sceneHeader(F); applyState(F,true); return;
  }
  SC.id=F.dk; SC.omode=S.omode; SC.step=0;
  SC.pos=sLayout(F.P,F.A);
  const ids=Object.keys(SC.pos);
  const kind=id=>(F.A.actors[id]||F.P.actors[id]).kind;
  let h=sceneHeader(F);
  h+=`<div class="scwrap"><svg class="sc" viewBox="0 0 ${SW} ${SH}" role="img" aria-label="Who does the work in ${esc(D.targets[F.dk].title)}, ${isA()?'with agents':'people only'}">
  <g class="hubg"><ellipse cx="${SCX}" cy="${SCY}" rx="${RX}" ry="${RY}" class="hubring"/></g>
  <g class="dir">${ids.filter(id=>kind(id)==='agent').map(id=>`<line x1="${SCX}" y1="${SCY}" x2="${SC.pos[id].x.toFixed(1)}" y2="${SC.pos[id].y.toFixed(1)}"/>`).join('')}</g>
  <g id="links"></g><g id="actors">${ids.map(id=>`<g class="actor ${kind(id)}" data-id="${esc(id)}" style="transform:translate(${SC.pos[id].x.toFixed(1)}px,${SC.pos[id].y.toFixed(1)}px)${id===F.P.lead?' scale(1.3)':''}"><circle r="50" cy="-12" class="pulse"/><circle r="58" cy="-12" class="halo"/><g transform="scale(${FS})">${figure(id,kind(id))}</g><text y="${(kind(id)==='agent'?40:42)*(PHONE?1.22:1)}" class="lbl"></text><text class="sub"></text></g>`).join('')}</g>
  <circle id="token" r="8" class="token" cx="0" cy="0" opacity="0"/></svg></div>
  <div class="sc-ctrl"><button type="button" class="play" id="scPlay">Play the workflow</button><button type="button" id="scPrev">‹ Back</button><button type="button" id="scNext">Next ›</button><span class="cnt" id="scCnt"></span></div>
  <div class="stepcard" id="scCard" aria-live="polite"></div><ol class="steplist" id="scList"></ol>`;
  sceneEl.innerHTML=h;
  sceneEl.querySelector('#scPlay').onclick=()=>{ SC.playing?stop():play(); };
  sceneEl.querySelector('#scPrev').onclick=()=>{ stop(); go(Math.max(0,SC.step-1)); };
  sceneEl.querySelector('#scNext').onclick=()=>{ stop(); go(Math.min(curFlow().steps.length-1,SC.step+1)); };
  applyState(F,false);
}
function applyState(F,animate){
  const svg=sceneEl.querySelector('svg.sc'); if(!svg) return;
  const fl=isA()?F.A:F.P;
  svg.classList.toggle('is-target',isA());
  svg.querySelectorAll('.actor').forEach(g=>{
    const id=g.dataset.id, a=fl.actors[id], wasToday=!!F.P.actors[id];
    const dim = isA() && !a && wasToday && F.P.actors[id].kind==='human';
    g.classList.toggle('gone', !a && !dim);
    g.classList.toggle('dim', dim);
    g.classList.toggle('orch', id===F.P.lead);
    let sub='';
    if(id===F.P.lead) sub='Leads the workflow';
    else if(a&&a.kind==='agent') sub='AI agent';
    else if(a&&a.kind==='ext') sub=ZONE[id]==='Systems'?'System':'Outside Azimut';
    else if(dim) sub='Not in the routine flow';
    else if(isA()&&a&&a.decides) sub='Decides';
    const L=g.querySelector('.lbl'), lines=wrap2(id), ly=+L.getAttribute('y');
    L.innerHTML=lines.map((s,j)=>`<tspan x="0" dy="${j?LH:0}">${esc(s)}</tspan>`).join('');
    const SB=g.querySelector('.sub'); SB.textContent=sub; SB.setAttribute('y', ly+(PHONE?25:17)+(lines.length-1)*LH);
    const inv=id===F.P.lead?'scale(0.8)':''; L.setAttribute('transform',inv); SB.setAttribute('transform',inv);
  });
  const lk=svg.querySelector('#links');
  if(animate && !reduced){ lk.classList.add('fade'); setTimeout(()=>{ drawLinks(); lk.classList.remove('fade'); go(0,true); }, 450); }
  else { drawLinks(); go(0,true); }
}
function sCurve(a,b,bend){
  const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1, k=Math.min(90,d*.22)*(bend||1);
  const cx=(a.x+b.x)/2+dy/d*k, cy=(a.y+b.y)/2-dx/d*k;
  return {d:`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, cx, cy};
}
function drawLinks(){
  const svg=sceneEl.querySelector('svg.sc'); if(!svg) return;
  const fl=curFlow(), P=SC.pos; let h='';
  fl.links.forEach(L=>{
    const a=P[L.from], b=P[L.to]; if(!a||!b) return;
    const c=sCurve(a,b,L.back?-1:1);
    h+=`<path class="lk ${L.cls}" data-i="${L.i}" d="${c.d}"/>`;
    if(/hand/.test(L.cls)){ const mx=(a.x+2*c.cx+b.x)/4, my=(a.y+2*c.cy+b.y)/4; h+=`<g class="env" data-i="${L.i}" transform="translate(${mx.toFixed(1)},${my.toFixed(1)})"><rect x="-9" y="-6.5" width="18" height="13" rx="2"/><path d="M-9 -6.5 L0 1 L9 -6.5"/></g>`; }
  });
  svg.querySelector('#links').innerHTML=h;
}
function go(i,silent){
  const fl=curFlow(), svg=sceneEl.querySelector('svg.sc'); if(!fl||!svg) return;
  const prev=SC.step; SC.step=i;
  const s=fl.steps[i], a=fl.actors[s.a];
  svg.querySelectorAll('.actor').forEach(g=>g.classList.toggle('cur',g.dataset.id===s.a));
  svg.querySelectorAll('.lk,.env').forEach(p=>p.classList.toggle('on',+p.dataset.i===i));
  const tok=svg.querySelector('#token'), P=SC.pos, to=P[s.a];
  tok.classList.toggle('t',isA());
  const fromStep=fl.steps[i-1];
  if(!silent && !reduced && fromStep && fromStep.a!==s.a && P[fromStep.a] && i===prev+1){
    const c=sCurve(P[fromStep.a],to,1), t0=performance.now(), dur=650, A0=P[fromStep.a];
    cancelAnimationFrame(SC.raf);
    const anim=now=>{ const t=Math.min(1,(now-t0)/dur), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, u=1-e;
      tok.setAttribute('cx',(u*u*A0.x+2*u*e*c.cx+e*e*to.x).toFixed(1)); tok.setAttribute('cy',(u*u*A0.y+2*u*e*c.cy+e*e*to.y).toFixed(1));
      if(t<1) SC.raf=requestAnimationFrame(anim); else tok.setAttribute('opacity','0'); };
    tok.setAttribute('opacity','1'); SC.raf=requestAnimationFrame(anim);
  } else tok.setAttribute('opacity','0');
  const lk=fl.links.find(L=>L.i===i && !L.back && !/exc/.test(L.cls));
  const tag = !lk ? '' : /hand/.test(lk.cls) ? '<span class="pill rust">Handoff between people</span>' : /ag/.test(lk.cls) ? '<span class="pill amber">Agent handoff</span>' : '';
  const kindTag = s.kind==='decision' ? '<span class="pill dash">Human decision</span>' : s.kind==='agent' ? '<span class="pill amber">Agent</span>' : '';
  sceneEl.querySelector('#scCard').innerHTML=`<span class="sn">${i+1}</span><div><p class="who ${a.kind}">${esc(isA()?s.a:s.who)}</p><p>${esc(s.text)}${!isA()&&s.next?` <span class="nx">→ ${esc(s.next)}</span>`:''}</p><p class="tags">${kindTag}${tag}${!isA()&&s.exc?'<span class="pill rust">Query outside Azimut</span>':''}</p></div>`;
  sceneEl.querySelector('#scCnt').textContent=`Step ${i+1} of ${fl.steps.length}`;
  const list=sceneEl.querySelector('#scList');
  if(list.dataset.key!==SC.id+'/'+S.omode){
    list.dataset.key=SC.id+'/'+S.omode;
    list.innerHTML=fl.steps.map((st,j)=>{ const ac=fl.actors[st.a]; return `<li><button type="button" data-step="${j}"><span class="n">${j+1}</span><span class="k ${ac.kind}${st.kind==='decision'?' dec':''}"></span><span><b>${esc(isA()?st.a:st.who)}</b> ${esc(st.text)}</span></button></li>`; }).join('');
    list.querySelectorAll('button').forEach(b=>b.onclick=()=>{ stop(); go(+b.dataset.step); });
  }
  list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',+b.dataset.step===i?'step':'false'));
}
function play(){
  const fl=curFlow(); if(!fl) return;
  SC.playing=true; sceneEl.querySelector('#scPlay').textContent='Pause';
  if(SC.step>=fl.steps.length-1) go(0,true);
  const tick=()=>{ if(!SC.playing) return; if(SC.step>=curFlow().steps.length-1){ stop(); return; } go(SC.step+1); SC.timer=setTimeout(tick,1400); };
  SC.timer=setTimeout(tick,500);
}
function stop(){ SC.playing=false; clearTimeout(SC.timer); const b=sceneEl.querySelector('#scPlay'); if(b) b.textContent='Play the workflow'; }

function sceneLegend(){
  const hu='<svg width="12" height="15" viewBox="-20 -40 40 52" aria-hidden="true"><circle cx="0" cy="-27" r="11" fill="currentColor"/><path d="M-19 10 C-19 -8 -10 -13 0 -13 C10 -13 19 -8 19 10 Z" fill="currentColor"/></svg>';
  const ag='<svg width="13" height="15" viewBox="-20 -50 40 62" aria-hidden="true"><rect x="-15" y="-36" width="30" height="24" rx="8" fill="var(--agent-bg)" stroke="var(--agent-line)" stroke-width="3"/><rect x="-17" y="-9" width="34" height="20" rx="7" fill="var(--agent-bg)" stroke="var(--agent-line)" stroke-width="3"/></svg>';
  const env='<svg width="16" height="12" viewBox="-10 -7 20 14" aria-hidden="true"><rect x="-9" y="-6.5" width="18" height="13" rx="2" fill="none" stroke="var(--rust)" stroke-width="1.5"/><path d="M-9 -6.5 L0 1 L9 -6.5" fill="none" stroke="var(--rust)" stroke-width="1.5"/></svg>';
  return `<span style="color:var(--navy)">${hu}<span style="color:var(--muted)">Person</span></span><span><i class="lg ring"></i>Leads the workflow</span>${isA()?`<span>${ag}AI agent</span><span><i class="lg ln amber"></i>Agent handoff</span>`:''}<span>${env}Handoff between people</span>`;
}

function panelOrch(){
  const dk=flows().dk, t=D.targets[dk];
  let h=`<div class="eyebrow t">Orchestrator map · Wave ${t.wave}</div><h2>${esc(t.title)}</h2>`;
  h+=`<div class="chips"><span class="chip">Led by ${esc(t.lead)}</span><span class="chip">Trigger: ${esc(t.trigger)}</span>${t.agents.map(a=>`<span class="chip ag">${esc(a)}</span>`).join('')}</div>`;
  h+=`<p class="big">${esc(t.change)}</p>`;
  const away=splitSemi(t.away), meas=splitSemi(t.measure);
  if(away.length) h+=`<h4 class="mini">What goes away</h4><ul class="plain">${away.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`;
  if(meas.length) h+=`<h4 class="mini">How we measure it</h4><ul class="plain">${meas.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`;
  const cov=D.workflows.filter(w=>w.target===dk && OR.wf[w.key]);
  if(cov.length) h+=`<h4 class="mini">On the compass map</h4><ul class="plain">${cov.map(w=>`<li><button type="button" class="lnk" data-key="${w.key}">${esc(w.name)}</button></li>`).join('')}</ul>`;
  h+=`<div class="sec"><h3>All ten redesigned workflows <small>use ‹ › above, or the arrow keys</small></h3>`;
  [1,2,3,4].forEach(wv=>{
    const ds=DESIGNS.filter(k=>D.targets[k].wave===wv); if(!ds.length) return;
    h+=`<div class="wv"><p class="wvl">Wave ${wv}</p><ul class="dlist">${ds.map(k=>{const x=D.targets[k]; return `<li><button type="button" data-design="${k}" aria-pressed="${k===dk}"><span class="nm">${esc(x.title)}</span><span class="mt">Led by ${esc(x.lead)} · ${x.agents.map(esc).join(', ')}</span></button></li>`;}).join('')}</ul></div>`;
  });
  return h+`</div>`;
}

/* ---------- overview: the vision ---------- */
const ovEl=document.getElementById('ovPane');
const AG_DO={'Market Trend':'Scans the news each morning, maps each move to the clients who hold it, and ranks who to call',
 'CRM assistant':'Writes up call notes and reminds the RM of follow-ups',
 'Portfolio Review':'Pulls holdings, flags changes against the mandate, drafts the review pack and follow-up',
 'Portfolio Proposal':'Drafts the allocation, rationale, client deck and email',
 'Onboarding Tracker':'Keeps one shared case, chases documents and pre-fills each bank’s forms',
 'Source-of-Wealth check':'Reads the documents and drafts the pre-check memo, gaps flagged',
 'Pre-trade Check':'Checks each trade request against the lists and the client, and records the trade once',
 'Trade Alert Triage':'Pulls the context behind each trade alert and drafts a disposition',
 'Revenue Assurance':'Reads and matches every bank report, and sends people only the breaks',
 'Revenue Statement':'Builds each RM’s commission statement from validated revenue',
 'Fee Letter Drafter':'Drafts the fee letter from the agreed terms and flags anything non-standard',
 'Close and AP':'Codes invoices, flags duplicates and drafts the month-end accruals',
 'Product Library':'Answers product questions, with sources',
 'Research Analyst Team':'Writes the research notes that feed Market Trend',
 'Management Insights':'Keeps a live view of AUM, revenue, pipeline and controls; drafts the HQ report'};
const PLATFORMS=['Bank platforms','CRM','Gmail','Google Sheets','Fund platforms','Trade monitoring','Factiva','Xero','Deel','DBS','Raccolta (HQ)','WhatsApp'];
const NEVER=['Sends anything to a client','Instructs a bank','Makes a payment','Approves a trade','Closes a trade alert'];
const AZB='<span class="azb"><svg class="azi" viewBox="-20 -50 40 62" aria-hidden="true"><rect x="-15" y="-36" width="30" height="24" rx="8"/><circle cx="-6" cy="-24" r="3" class="e"/><circle cx="6" cy="-24" r="3" class="e"/><rect x="-17" y="-9" width="34" height="20" rx="7"/></svg>Azi-bots</span>';
const O_HAND=OR.teams.reduce((a,x)=>a+x.today.handoffs,0);
let HERO={phase:'today', auto:true, timer:0, raf:0, dots:[], last:0, built:false}, OVAG='Revenue Assurance';

function personSvg(cls){ return `<g class="${cls||''}"><circle cx="0" cy="-27" r="11" class="hd"/><path d="M-19 10 C-19 -8 -10 -13 0 -13 C10 -13 19 -8 19 10 Z" class="bd"/></g>`; }
function botSvg(){ return `<g><line x1="0" y1="-44" x2="0" y2="-36" class="ant"/><circle cx="0" cy="-46" r="3" class="antd"/><rect x="-15" y="-36" width="30" height="24" rx="8" class="hd"/><circle cx="-6" cy="-24" r="2.6" class="ey"/><circle cx="6" cy="-24" r="2.6" class="ey"/><rect x="-17" y="-9" width="34" height="20" rx="7" class="bd"/></g>`; }

// hero geometry: landscape (1100 x 480) and portrait for phones (560 x 760)
const HGEO={
 land:{W:1100,H:480,HC:{x:550,y:238},ring:122,botR:92,botS:.5,core:50,tw:34,lh:0,
  depts:[{n:'Wealth Management',x:20,y:112,w:300,h:290},{n:'Finance & Operations',x:340,y:112,w:300,h:290},{n:'Compliance',x:660,y:112,w:190,h:290},{n:'Legal',x:870,y:112,w:210,h:290}],
  org:'M550 88 V100 M170 100 H975 M170 100 V112 M490 100 V112 M755 100 V112 M975 100 V112',
  pill:{x:446,y:46,w:208,h:54,kick:34}, md:[94,116], lab:{pl:32,ps:47,tn:34,gap:17},
  podF:{RM:.48,ARM:.48,Finance:.45,'Finance ':.54,Compliance:.45}, podUp:12, podR:{6:50,3:36,2:32}, slot:{6:30,3:18,2:15}, podS:.42, coreS:.62,
  lead:{y:50,x:{COO:424,MD:508,CTO:592,HoC:676},tn:104,tl:120}, mdTw:[104,207], mdAu:[128,207],
  P:{RM:{t:[110,284],i:[110,440],g:[178,166]}, ARM:{t:[230,284],i:[255,440],g:[922,166]}, Finance:{t:[430,284],i:[400,440],g:[214,348]},
     'Finance ':{t:[550,284],i:[700,440],g:[550,410]}, Compliance:{t:[755,284],i:[845,440],g:[886,348]}, Legal:{t:[975,284],i:[990,440],g:[1040,250]}, MD:{t:[550,50],i:[550,440],g:[550,50],a:[508,50]}}},
 port:{W:560,H:772,HC:{x:280,y:384},ring:146,botR:110,botS:.6,core:58,tw:38,lh:21,
  depts:[{n:'Wealth Management',x:16,y:118,w:256,h:244},{n:'Finance & Operations',x:288,y:118,w:256,h:244},{n:'Compliance',x:16,y:392,w:256,h:244},{n:'Legal',x:288,y:392,w:256,h:244}],
  org:'M280 98 V106 M144 106 H416 M144 106 V118 M416 106 V118 M280 106 V378 M144 378 H416 M144 378 V392 M416 378 V392',
  pill:{x:160,y:50,w:240,h:62,kick:38}, md:[112,238], lab:{pl:38,ps:56,tn:38,gap:20},
  podF:{RM:.5,ARM:.5,Finance:.5,'Finance ':.5,Compliance:.5}, podUp:17, podR:{6:52,3:42,2:36}, slot:{6:32,3:22,2:17}, podS:.5, coreS:.62,
  lead:{y:54,x:{COO:130,MD:230,CTO:330,HoC:430},tn:126,tl:146}, mdTw:[118,348], mdAu:[154,348],
  P:{RM:{t:[88,282],i:[70,640],g:[96,186]}, ARM:{t:[198,282],i:[210,640],g:[464,186]}, Finance:{t:[362,282],i:[350,640],g:[96,592]},
     'Finance ':{t:[470,282],i:[490,640],g:[280,636]}, Compliance:{t:[144,556],i:[140,724],g:[464,592]}, Legal:{t:[416,556],i:[420,724],g:[512,336]}, MD:{t:[280,54],i:[280,724],g:[280,54],a:[230,54]}}}};
const HP=[{id:'RM',team:'Advise and invest',lead:'RM'},{id:'ARM',team:'Onboard and look after clients',lead:'ARM'},{id:'Finance',team:'Get paid and pay out',lead:'Finance'},
 {id:'Finance ',team:'Close and report',lead:'Finance'},{id:'Compliance',team:'Protect the firm',lead:'Compliance'},{id:'Legal',decide:'ARM'},{id:'MD',top:true}];
const TEAMAG={RM:['Market Trend','Portfolio Review','Portfolio Proposal','CRM assistant','Product Library','Research Analyst Team'],ARM:['Onboarding Tracker','Source-of-Wealth check','Fee Letter Drafter'],
 Finance:['Revenue Assurance','Revenue Statement'],'Finance ':['Close and AP','Management Insights'],Compliance:['Pre-trade Check','Trade Alert Triage']};
const TEAMOF={}; Object.keys(TEAMAG).forEach(t=>TEAMAG[t].forEach(a=>TEAMOF[a]=t));
const LEADS=[['COO','COO'],['CTO','CTO'],['HoC','Compliance']];
const isSplit=ph=>ph==='twins'||ph==='auto';
const PAIRS=[['ARM','Finance'],['Finance','ARM'],['ARM','Compliance'],['Compliance','ARM'],['RM','Legal'],['Legal','ARM'],['Finance ','MD'],['RM','ARM'],['ARM','RM'],['Finance','RM']];
const HPH=[['today','Current','Current'],['intro','Azi-bots','Azi-bots'],['target','Target','Target'],['twins','Future','Future']];
const HNEXT={today:'intro',intro:'target',target:'twins',twins:'today'}, HDUR={today:6000,intro:4300,target:7000,twins:7500};
const geo=()=>PHONE?HGEO.port:HGEO.land;
const isTgt=ph=>ph==='target'||ph==='twins'||ph==='auto';
function hpos(p,ph){ const q=geo().P[p.id]; return ph==='intro'?q.i:(ph==='auto'&&q.a)?q.a:isTgt(ph)?q.g:q.t; }
function podC(id,ph){ const G=geo(), q=G.P[id].g, HC=G.HC; if(ph==='auto') return {x:q[0],y:q[1]+G.lab.tn-G.podUp-G.podR[TEAMAG[id].length]}; const f=G.podF[id]; return {x:q[0]+(HC.x-q[0])*f, y:q[1]+(HC.y-q[1])*f}; }
function botPos(name,i,ph){ const G=geo(), HC=G.HC;
  if(isSplit(ph)&&TEAMOF[name]){ const t=TEAMOF[name], L=TEAMAG[t], n=L.length, j=L.indexOf(name), c=podC(t,ph), a=(-90+j*360/n)*Math.PI/180, r=G.slot[n];
    return {x:c.x+r*Math.cos(a), y:c.y+r*Math.sin(a)+19*G.podS, s:G.podS}; }
  const n=D.agents.length, a=(-90+i*360/n)*Math.PI/180; return {x:HC.x+G.botR*Math.cos(a), y:HC.y+G.botR*Math.sin(a)+20*G.botS, s:G.botS}; }
function twinSide(p){ const G=geo(), q=G.P[p.id].g; if(q[0]+G.tw+22>G.W) return -1; return q[0]<G.HC.x?-1:1; }
function splitName(n){ if(!PHONE||n.length<=17) return [n]; const w=n.split(' '); let best=null;
  for(let i=1;i<w.length;i++){ const a=w.slice(0,i).join(' '), b=w.slice(i).join(' '), m=Math.max(a.length,b.length); if(!best||m<best.m) best={m,l:[a,b]}; } return best.l; }

function heroSvg(){
  const G=geo(), HC=G.HC, L=G.lab, ags=D.agents.map(a=>a.name), k=G.pill.h/54;
  let h=`<svg class="hero-sc${PHONE?' portrait':''}" viewBox="0 0 ${G.W} ${G.H}" role="img" aria-label="Four steps: currently people pass work between departments; Azi-bots arrive; five outcome teams each led by an existing role work with agents; in the future the hub splits into team pods and every person gets a digital twin.">`;
  h+=`<g class="hz"><path class="horg" d="${G.org}"/>${G.depts.map(d=>`<g><rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="18"/><text x="${d.x+d.w/2}" y="${d.y+32}">${esc(d.n.toUpperCase())}</text></g>`).join('')}</g>`;
  const P0=G.pill;
  h+=`<g class="hintro"><text x="${HC.x}" y="${P0.kick}" class="kick">INTRODUCING</text><g class="pill"><rect x="${P0.x}" y="${P0.y}" width="${P0.w}" height="${P0.h}" rx="${P0.h/2}" class="glow"/><rect x="${P0.x}" y="${P0.y}" width="${P0.w}" height="${P0.h}" rx="${P0.h/2}" class="pbg"/><g transform="translate(${(P0.x+36*k).toFixed(1)},${(P0.y+36*k).toFixed(1)}) scale(${(.62*k).toFixed(3)})"><line x1="0" y1="-46" x2="0" y2="-36" class="pant"/><circle cx="0" cy="-47" r="3.5" class="peye"/><rect x="-15" y="-36" width="30" height="24" rx="8" class="pbot"/><circle cx="-6" cy="-24" r="3" class="peye"/><circle cx="6" cy="-24" r="3" class="peye"/><rect x="-17" y="-9" width="34" height="20" rx="7" class="pbot"/></g><text x="${(P0.x+58*k).toFixed(1)}" y="${(P0.y+37*k).toFixed(1)}" class="pname">Azi-bots</text></g></g>`;
  h+=`<g class="hhub"><g class="hspokes">${HP.filter(p=>p.team).map(p=>{const q=G.P[p.id].g; return `<line x1="${HC.x}" y1="${HC.y}" x2="${q[0]}" y2="${q[1]-20}"/>`;}).join('')}${HP.filter(p=>p.decide).map(p=>{const l=G.P[p.decide].g, q=G.P[p.id].g; return `<line class="dec" x1="${l[0]}" y1="${l[1]-20}" x2="${q[0]}" y2="${q[1]-20}"/>`;}).join('')}<line class="dec md" x1="${HC.x}" y1="${G.md[0]}" x2="${HC.x}" y2="${G.md[1]}"/></g>`;
  h+=`<circle cx="${HC.x}" cy="${HC.y}" r="${G.ring}" class="hring"/>`;
  // the hub splits into one pod per team (phase 4), and the pods take the leads' seats (phase 5)
  const cs=G.core*G.coreS;
  h+=`<g class="hsplit">${Object.keys(TEAMAG).map(t=>{ const n=TEAMAG[t].length, a=podC(t,'twins'), b=podC(t,'auto'), q=G.P[t].g;
    return `<line class="pcl tw" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${HC.x}" y2="${HC.y}"/><line class="pcl au" x1="${b.x.toFixed(1)}" y1="${b.y.toFixed(1)}" x2="${HC.x}" y2="${HC.y}"/><line class="ppl" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${q[0]}" y2="${q[1]-20}"/>`; }).join('')}
    <line class="mdl tw" x1="${HC.x}" y1="${G.mdTw[0]}" x2="${HC.x}" y2="${G.mdTw[1]}"/><line class="mdl au" x1="${HC.x}" y1="${G.mdAu[0]}" x2="${HC.x}" y2="${G.mdAu[1]}"/>
    ${Object.keys(TEAMAG).map(t=>{ const c=podC(t,'twins'); return `<g class="podg" data-team="${esc(t)}" style="transform:translate(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px)"><circle r="${G.podR[TEAMAG[t].length]}" class="podr"/></g>`; }).join('')}</g>`;
  ags.forEach((n,i)=>{ const q=botPos(n,i,'today'); h+=`<g class="hbot" data-ag="${esc(n)}" data-i="${i}" style="transform:translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px) scale(${q.s})"><title>${esc(n)}</title><g class="pop" style="--i:${i}">${botAvatar(n)}</g></g>`; });
  h+=`<circle cx="${HC.x}" cy="${HC.y}" r="${G.core}" class="hcore"/><text x="${HC.x}" y="${HC.y+6}" class="hct">Azi-bots</text><text x="${HC.x}" y="${HC.y-2}" class="hct2"><tspan x="${HC.x}">shared</tspan><tspan x="${HC.x}" dy="1.15em">record</tspan></text>`;
  h+=HP.filter(p=>p.team).map(p=>{ const q=G.P[p.id].g, lines=splitName(p.team), ly=L.tn+(lines.length-1)*G.lh+L.gap;
    return `<g class="hteam" transform="translate(${q[0]},${q[1]})"><text y="${L.tn}" class="tn">${lines.map((s,j)=>`<tspan x="0" dy="${j?G.lh:0}">${esc(s)}</tspan>`).join('')}</text><text y="${ly}" class="tl">led by ${p.lead==='RM'||p.lead==='ARM'?'the '+p.lead:p.lead}</text></g>`; }).join('');
  h+=`</g>`;
  // phase 4: a digital twin beside every person; phase 5: an agent in every lead's seat
  h+=`<g class="htwins">${HP.map((p,i)=>{ const q=G.P[p.id].g, x=q[0]+twinSide(p)*G.tw; return `<g class="htwin" transform="translate(${x},${q[1]+2})"><g class="tpop" style="--i:${i}"><g transform="scale(.86)"><line x1="0" y1="-39" x2="0" y2="-46" class="twa"/><circle cx="0" cy="-48" r="2.8" class="twe"/><circle cx="0" cy="-27" r="11" class="tw"/><path d="M-19 10 C-19 -8 -10 -13 0 -13 C10 -13 19 -8 19 10 Z" class="tw"/><circle cx="-4.2" cy="-28" r="2.1" class="twe"/><circle cx="4.2" cy="-28" r="2.1" class="twe"/></g></g></g>`; }).join('')}</g>`;
  h+=`<g class="hdots"></g>`;
  h+=HP.map(p=>{ const q=G.P[p.id].t; return `<g class="hp${p.decide?' dm':''}${p.top?' top':''}" data-id="${esc(p.id)}" style="transform:translate(${q[0]}px,${q[1]}px)">${personSvg()}<text y="${L.pl}" class="pl">${esc(p.id.trim())}</text>${p.decide?`<text y="${L.ps}" class="ps">decides</text>`:p.top?`<text y="${L.ps}" class="ps">oversees</text>`:''}</g>`; }).join('');
  return h+`</svg>`;
}
function heroCaption(ph){
  if(ph==='twins') return `<b>Future:</b> the hub splits up. Each team gets its own pod of ${AZB}, and every person gets a digital twin that knows their clients, their book and how they work. All of them still share one record; people still decide.`;
  if(ph==='target') return `<b>Target:</b> work is organized by task. Five outcome teams, each led by an existing role, work with ${AZB}. People step in to decide.`;
  if(ph==='intro') return `<b>Meet</b> ${AZB}: Azimut's own AI agents, fifteen of them, in four pods, on one shared record. They do the gathering, matching and drafting.`;
  return `<b>Current:</b> work is organized by department, and people carry it between teams by email: <b class="rust">${O_HAND} handoffs</b> in the ${totals().steps} steps mapped so far.`;
}
function heroPhase(ph){
  HERO.phase=ph;
  const svg=ovEl.querySelector('.hero-sc'); if(!svg) return;
  const T=isTgt(ph);
  svg.classList.toggle('is-target',T); svg.classList.toggle('is-intro',ph==='intro'); svg.classList.toggle('is-twins',ph==='twins'); svg.classList.toggle('is-auto',ph==='auto'); svg.classList.toggle('is-split',isSplit(ph));
  svg.querySelectorAll('.hbot').forEach(g=>{ const q=botPos(g.dataset.ag,+g.dataset.i,ph); g.style.transform=`translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px) scale(${q.s})`; });
  svg.querySelectorAll('.podg').forEach(g=>{ const c=podC(g.dataset.team,ph==='auto'?'auto':'twins'); g.style.transform=`translate(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px)`; });
  HP.forEach(p=>{ const g=svg.querySelector(`.hp[data-id="${p.id}"]`); const q=hpos(p,ph); g.style.transform=`translate(${q[0]}px,${q[1]}px)`+(T&&p.team?' scale(1.12)':''); });
  const md=svg.querySelector('.hp.top .ps'); if(md) md.textContent=ph==='auto'?'':'oversees';
  ovEl.querySelectorAll('[data-hero]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hero===ph)));
  ovEl.querySelector('#heroCap').innerHTML=heroCaption(ph);
  HERO.dots=[];
}
function heroPos(id){ const p=HP.find(x=>x.id===id); const q=hpos(p,HERO.phase); return {x:q[0],y:q[1]-22}; }
function twinPos(p){ const G=geo(), q=G.P[p.id].g; return {x:q[0]+twinSide(p)*G.tw, y:q[1]-20}; }
function heroTick(now){
  const svg=ovEl.querySelector('.hero-sc'); if(!svg||ovEl.hidden){ HERO.raf=0; return; }
  const g=svg.querySelector('.hdots'), HC=geo().HC, ph=HERO.phase, pick=a=>a[Math.floor(Math.random()*a.length)];
  if(ph!=='intro' && now-HERO.last>(ph==='today'?620:380) && HERO.dots.length<6){
    HERO.last=now;
    const teams=HP.filter(p=>p.team);
    if(ph==='today'){ const [a,b]=pick(PAIRS); HERO.dots.push({k:'env',a:heroPos(a),b:heroPos(b),t0:now,dur:1500,up:true}); }
    else if(ph==='twins'){ const p=pick(HP), r=Math.random();
      if(r<.45 || !p.team) HERO.dots.push({k:'tw',a:twinPos(p),b:heroPos(p.id),t0:now,dur:750});
      else { const c=podC(p.id,'twins'); HERO.dots.push(r<.75?{k:'ag',a:c,b:heroPos(p.id),t0:now,dur:800}:{k:'ag',a:c,b:{x:HC.x,y:HC.y},t0:now,dur:900}); } }
    else if(ph==='auto'){ if(Math.random()<.15){ HERO.dots.push({k:'dec',a:{x:HC.x,y:geo().mdAu[0]},b:{x:HC.x,y:HC.y},t0:now,dur:1100}); }
      else { const a=pick(teams); let b=pick(teams); if(b===a) b=teams[(teams.indexOf(a)+1)%teams.length]; HERO.dots.push({k:'ag',a:podC(a.id,'auto'),b:podC(b.id,'auto'),t0:now,dur:1300}); } }
    else { const p=pick(teams), out=Math.random()<.6;
      if(Math.random()<.18){ const ds=HP.filter(x=>x.decide), d=pick(ds); HERO.dots.push({k:'dec',a:heroPos(d.decide),b:heroPos(d.id),t0:now,dur:1100}); }
      else HERO.dots.push({k:'ag',a:out?{x:HC.x,y:HC.y}:heroPos(p.id),b:out?heroPos(p.id):{x:HC.x,y:HC.y},t0:now,dur:1000}); }
  }
  HERO.dots=HERO.dots.filter(d=>now-d.t0<d.dur);
  g.innerHTML=HERO.dots.map(d=>{ const t=(now-d.t0)/d.dur, e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    const cx=(d.a.x+d.b.x)/2, cy=d.up?Math.min(d.a.y,d.b.y)-90:(d.a.y+d.b.y)/2-(d.k==='tw'?18:0), u=1-e;
    const x=u*u*d.a.x+2*u*e*cx+e*e*d.b.x, y=u*u*d.a.y+2*u*e*cy+e*e*d.b.y;
    return d.k==='env' ? `<g class="env on" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><rect x="-9" y="-6.5" width="18" height="13" rx="2"/><path d="M-9 -6.5 L0 1 L9 -6.5"/></g>`
      : `<circle class="hd-${d.k}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${d.k==='ag'?6:d.k==='tw'?4.5:5}"/>`; }).join('');
  HERO.raf=requestAnimationFrame(heroTick);
}
function heroSchedule(){
  clearTimeout(HERO.timer);
  HERO.timer=setTimeout(()=>{ heroPhase(HNEXT[HERO.phase]); if(HERO.auto) heroSchedule(); }, HDUR[HERO.phase]);
}
function heroAuto(on){
  HERO.auto=on; clearTimeout(HERO.timer);
  const b=ovEl.querySelector('#heroAuto'); if(b){ b.textContent=on?'Pause':'Play'; b.setAttribute('aria-pressed',String(on)); }
  if(on && !reduced) heroSchedule();
}
function startOverview(){
  if(!HERO.built){ clearTimeout(HERO.timer); buildOverview(); HERO.built=true; heroPhase('today'); heroAuto(!reduced); }
  else if(HERO.auto && !reduced) heroSchedule();
  if(!reduced && !HERO.raf) HERO.raf=requestAnimationFrame(heroTick);
}
function stopOverview(){ clearTimeout(HERO.timer); cancelAnimationFrame(HERO.raf); HERO.raf=0; if(HERO.built) HERO.timer=0; }

function hubSvg(){
  const pods=[...new Set(D.agents.map(a=>a.pod))], C={x:330,y:300};
  let h=`<svg class="hub-sc" viewBox="${PHONE?'118 88 424 424':'0 0 660 600'}" role="img" aria-label="Azi-bots: 15 agents in four pods around one shared record, connected to Azimut's platforms">`;
  if(!PHONE) PLATFORMS.forEach((p,i)=>{ const a=(-90+i*360/PLATFORMS.length)*Math.PI/180, x=C.x+268*Math.cos(a), y=C.y+250*Math.sin(a);
    h+=`<line class="conn" x1="${(C.x+205*Math.cos(a)).toFixed(1)}" y1="${(C.y+205*Math.sin(a)).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" style="animation-delay:${(i*.35).toFixed(2)}s"/>`;
    h+=`<g class="plat" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><rect x="${-p.length*3.6-12}" y="-14" width="${p.length*7.2+24}" height="28" rx="14"/><text y="5">${esc(p)}</text></g>`; });
  h+=`<circle cx="${C.x}" cy="${C.y}" r="205" class="hring2"/>`;
  let i=0; const n=D.agents.length;
  pods.forEach((pod,pi)=>{
    const list=D.agents.filter(a=>a.pod===pod);
    const a0=-90+i*360/n-12, a1=-90+(i+list.length-1)*360/n+12;
    const r=178, p0={x:C.x+r*Math.cos(a0*Math.PI/180),y:C.y+r*Math.sin(a0*Math.PI/180)}, p1={x:C.x+r*Math.cos(a1*Math.PI/180),y:C.y+r*Math.sin(a1*Math.PI/180)};
    h+=`<path class="podarc p${pi}" d="M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}"/>`;
    list.forEach(ag=>{ const a=(-90+i*360/n)*Math.PI/180, x=C.x+140*Math.cos(a), y=C.y+140*Math.sin(a)+12;
      h+=`<g class="hbag" role="button" tabindex="0" data-agent="${esc(ag.name)}" aria-label="${esc(ag.name)}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><circle r="27" cy="-14" class="hit"/><g transform="scale(.82)">${botAvatar(ag.name)}</g></g>`; i++; });
  });
  h+=`<circle cx="${C.x}" cy="${C.y}" r="78" class="hcore"/><text x="${C.x}" y="${C.y+2}" class="hct big">Azi-bots</text><text x="${C.x}" y="${C.y+24}" class="hcs">one shared record</text>`;
  return h+`</svg>`;
}
function agentCard(){
  const a=agentByName[OVAG]; if(!a) return '';
  const teams=OR.teams.filter(t=>t.target.agents.includes(a.name)).map(t=>t.name);
  return `<p class="eyebrow t">${esc(a.pod)} · Wave ${a.wave}</p><h4>${esc(a.name)}</h4><p class="ado">${esc(AG_DO[a.name]||'')}</p>
  <dl class="info"><dt>People meet it</dt><dd>${esc(a.lives)}</dd><dt>Signs off</dt><dd>${esc(a.signs)}</dd>${teams.length?`<dt>Works for</dt><dd>${teams.map(esc).join(', ')}</dd>`:''}</dl>`;
}
function selectAgent(n){ OVAG=n; ovEl.querySelectorAll('.hbag').forEach(g=>g.classList.toggle('sel',g.dataset.agent===n)); ovEl.querySelector('#agCard').innerHTML=agentCard(); }

function buildOverview(){
  const t=totals(), F=OR.firm;
  const pods=[...new Set(D.agents.map(a=>a.pod))];
  const lead=id=>OR.teams.find(x=>x.id===id);
  const roles=[
   ['RM','Pulling statements, building packs, chasing status','Client conversations, investment judgment, directing the advice agents'],
   ['ARM','Keying trades, checking every revenue line, chasing documents','Leading onboarding cases, clearing breaks, working with the banks'],
   ['Finance','Splitting bank reports, rebuilding the commission model, coding invoices','Approving by exception, owning controls and data quality'],
   ['Compliance','Reading free-format requests, reviewing alerts from a blank page','Setting the rules agents check, deciding, auditing agent work'],
   ['Management','Reading packs assembled by email','Running agents like a workforce: which agents, and how much each may do alone']];
  const waves=[1,2,3,4].map(w=>({w, ags:D.agents.filter(a=>a.wave===w).map(a=>a.name)}));
  const wname={1:'Prove',2:'Connect',3:'Extend',4:'Scale'}, wnote={1:'Prototypes built for Market Trend, Portfolio Review and the Source-of-Wealth check; pilot after 10 Nov',2:'Revenue, onboarding tracking and proposals; needs the PMS and one client ID',3:'Compliance, fee letters and the close',4:'Agents hand off across teams; the next office'};
  const gates=['Pilot RMs keep using it; prep time falls; IT and Compliance sign off','PMS live and client ID mapped; one quarter run in parallel matches Finance','Two outcome teams live; AI inventory and risk ratings done; next office chosen'];
  let h=`<section class="ov-hero">
    <div class="ov-intro"><p class="eyebrow">The Human-AI Enterprise · Azimut Singapore × NUS MBA</p>
    <h2>From an org map to an <b>orchestrator map</b></h2>
    <p class="lead">Azimut Singapore can organize its work around tasks, not departments. The person who leads each workflow stays in charge and directs ${AZB}, Azimut's own AI agents. They gather, match and draft; people keep every relationship and every decision.</p></div>
    <div class="hero-card"><div class="hero-ctl"><div class="seg segl hseg" role="group" aria-label="Current, Azi-bots, target or future">${HPH.map(([k,l,sh],i)=>`<button type="button" data-hero="${k}" aria-pressed="${k==='today'}"${i>2?' class="fut"':''}><span class="no">${i+1}</span><span class="ll">${l}</span><span class="ls">${sh}</span></button>`).join('')}</div><button type="button" class="ghost" id="heroAuto" aria-pressed="true">Pause</button></div>
    <div class="hero-wrap">${heroSvg()}</div><p class="hero-cap" id="heroCap"></p></div>
  </section>
  <section class="ov-sec"><p class="eyebrow">What the map shows</p><h3>We mapped how the work actually runs, step by step</h3>
    <div class="nums"><div><b>${t.wf}</b><span>workflows in ${MS.the}, across ${F.functions_with_work.length} functions</span></div><div><b>${t.steps}</b><span>steps mapped, each with who does it and who gets it next</span></div><div class="r"><b class="rust">${O_HAND}</b><span>handoffs between people in those steps</span></div><div><b>${F.split}</b><span>workflows split between two departments</span></div></div>
    <p class="note">${D.live?(D.stale?`Saved copy of ${esc(D.source)} from ${esc(D.readAt)}.`:`Read live from ${esc(D.source)} (${esc(D.readAt)}).`):'Operating Map Master V4 (15 Sep 2026). The latest master (53 workflows, about 390 steps) will update these figures.'} ARMs appear in ${F.arm.workflows} of the ${F.arm.stepped} workflows mapped step by step and do ${F.arm.steps} of the ${F.arm.of} steps: today, people are the glue.</p></section>
  <section class="ov-sec"><p class="eyebrow">The shift</p><h3>Four things change</h3>
    <div class="shift">${[['How work is organized','By department; each workflow crosses several teams','By task; five outcome teams, each drawing on any department'],['Who moves the work','People, by email, WhatsApp and spreadsheets','Agents, on one shared record, handing off to each other'],['What people do','Do the steps, re-key, chase and check','Direct the agents, decide, handle exceptions, own the client'],['Who owns the outcome','Nobody end to end; each team owns a slice','The person who leads the workflow today, with no new roles']].map(([k,a,b])=>`<div class="sh"><p class="k">${k}</p><p class="a"><span>Today</span>${a}</p><svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="b"><span>Target</span>${b}</p></div>`).join('')}</div></section>
  <section class="ov-sec"><p class="eyebrow">The engine</p><h3 class="meet">Meet ${AZB}</h3><p class="lead" style="margin-top:8px">Azimut's own AI agents, doing the legwork for every team.</p>
    <div class="hubgrid"><div class="hub-wrap">${hubSvg()}${PHONE?`<p class="note" style="margin-top:6px">Connects to: ${PLATFORMS.map(esc).join(' · ')}</p>`:''}</div>
    <div class="hub-side"><p class="p" style="margin-top:0">${D.agents.length} agents in four pods sit on one shared record of clients, holdings, trades, fees, revenue and decisions. Connectors read from and write back to the platforms Azimut already uses, so nothing is replaced. Tap an agent to see what it does.</p>
    <div class="podkey">${pods.map((p,i)=>`<span><i class="pk p${i}"></i>${esc(p)}</span>`).join('')}</div>
    <div class="agcard" id="agCard"></div></div></div></section>
  <section class="ov-sec"><p class="eyebrow">The target</p><h3>Five outcome teams, each led by someone already at Azimut</h3>
    <div class="teams">${OR.teams.map(tm=>{const s=teamStats(tm.id); return `<button type="button" class="team" data-team="${tm.id}"><span class="tn">${esc(tm.name)}</span><span class="tl">${PERSON}Led by ${esc(tm.orchestrator)}</span><span class="tcn">${s.n} workflows · ${s.red} redesigned · ${tm.target.agents.length} agent${tm.target.agents.length>1?'s':''}</span><span class="go">See it on the compass →</span></button>`;}).join('')}</div></section>
  <section class="ov-sec"><p class="eyebrow">The people</p><h3>Roles move from doing the steps to directing the agents</h3>
    <div class="roles2"><div class="rh"><span></span><span>Less time on</span><span>More time on</span></div>${roles.map(([r,a,b])=>`<div class="rr"><b>${r}</b><span class="less">${a}</span><span class="more">${b}</span></div>`).join('')}</div></section>
  <section class="ov-sec two"><div><p class="eyebrow">The guardrails</p><h3>Five things no agent ever does</h3>
    <div class="never">${NEVER.map(n=>`<span>${n}</span>`).join('')}</div>
    <p class="note">Every agent has one named person who signs off, data walls follow roles, and every action goes to one audit log. MAS issued its Guidelines on AI Risk Management on 7 October 2026; they take effect on 7 October 2027.</p></div>
    <div><p class="eyebrow">The path</p><h3>Four waves, each opened by a gate</h3>
    <ol class="waves">${waves.map(x=>`<li class="${x.w===1?'now':''}"><p class="wn">Wave ${x.w} · ${wname[x.w]}</p><p class="wd">${wnote[x.w]}</p><p class="wa">${x.ags.map(esc).join(' · ')}</p>${x.w<4?`<p class="gate"><i aria-hidden="true"></i>Gate ${x.w}: ${gates[x.w-1]}</p>`:''}</li>`).join('')}</ol></div></section>
  <section class="ov-cta"><h3>Explore the map</h3><div class="ctas"><button type="button" data-view="compass"><b>Compass map</b><span>Before and after: every workflow, by function and then by outcome team</span></button><button type="button" data-view="orch"><b>Orchestrator map</b><span>Ten redesigned workflows, played with people only, then with agents</span></button><button type="button" data-view="proto"><b>Prototypes</b><span>Try the three Wave 1 agents: Source-of-Wealth check, Portfolio Review and Market Trend</span></button></div></section>`;
  ovEl.innerHTML=h;
  selectAgent(OVAG);
  ovEl.querySelectorAll('.hbag').forEach(g=>{ g.addEventListener('click',()=>selectAgent(g.dataset.agent)); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selectAgent(g.dataset.agent); } }); });
}


/* ---------- render ---------- */
function render(opt){
  opt=opt||{};
  header();
  if(S.view==='proto'){ stop(); stopOverview(); renderProto(); return; }
  if(S.view==='about'){ stop(); stopOverview(); renderAbout(); return; }
  if(S.view==='overview'){ stop(); startOverview(); return; }
  stopOverview();
  const O=S.view==='orch';
  scroller.hidden=O; sceneEl.hidden=!O;
  if(O){ panel.innerHTML=panelOrch(); renderScene(); return; }
  buildStage();
  fit();
  const target = S.fn ? 90-bearing(S.fn) : S.off;
  const finish=()=>{ placePills(); drawWires(true); if(opt.animate) showBranch(); else { const b=document.getElementById('branch'); if(b) b.classList.remove('hide'); } };
  if(opt.animate){ placePills(); drawWires(false); rotateTo(target,finish); }
  else { cancelAnimationFrame(animId); S.off=target; finish(); }
  renderPanel();
}

const GS = (window.google && window.google.script) ? window.google.script : null;
function setHash(k){ try{ history.replaceState(null,'',k?('#'+k):(location.pathname+location.search)); }catch(e){}
  try{ if(GS && GS.history) GS.history.replace(null, null, k||''); }catch(e){} }
const narrow=()=>PHONE || (window.matchMedia && matchMedia('(max-width:1080px)').matches);

function selectFn(id){
  const changed=id!==S.fn; S.fn=id; S.key=null; setHash('');
  render({animate:changed});
}
function selectWf(key,fromMap){
  if(!byKey[key]) return;
  if(byKey[key].targetOnly && !isT()) S.mode='target';
  if(isT()) key=CANON[key]||key;
  const w=byKey[key], node=nodeOf(w);
  const changed=node!==S.fn;
  S.fn=node; S.key=key;
  if(!w.contribs.some(c=>c.role===S.role)) S.role=w.contribs[0]?w.contribs[0].role:null;
  setHash(key);
  render({animate:changed});
  if(fromMap && narrow()) panel.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
}
function setMode(m){
  if(m===S.mode) return;
  const prevKey=S.key, prevNode=S.fn;
  S.mode=m;
  if(prevKey){
    if(m==='target'){ S.key=CANON[prevKey]||prevKey; const p=placeOf(byKey[S.key]); S.fn=p?p.team:null; }
    else { const w=byKey[prevKey]; S.fn=w.function; if(w.targetOnly) S.key=null; }
  } else if(prevNode){
    S.fn = m==='target' ? teamForFn(prevNode) : fnForTeam(prevNode);
  }
  setHash(S.key||'');
  render();
}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-view],[data-omode],[data-design],[data-dnav],[data-hero],[data-team],[data-mode],[data-go],[data-role],[data-key],[data-fn]');
  if(!t) return;
  if(t.dataset.hero){ heroAuto(false); heroPhase(t.dataset.hero); return; }
  if(t.dataset.dnav){ const i=DESIGNS.indexOf(S.design), n=DESIGNS.length; S.design=DESIGNS[(i+(+t.dataset.dnav)+n)%n]; setHash('orchestrator-'+S.design); render(); return; }
  if(t.dataset.team){ S.view='compass'; S.mode='target'; S.fn=t.dataset.team; S.key=null; S.off=90-bearing(S.fn); setHash(''); render(); window.scrollTo({top:0}); return; }
  if(t.dataset.view){ if(S.view!==t.dataset.view){ S.view=t.dataset.view; setHash(S.view==='orch'?'orchestrator-'+S.design:S.view==='overview'?'overview':S.view==='proto'?'prototypes':S.view==='about'?'about':(S.key||'')); render(); window.scrollTo({top:0}); } return; }
  if(t.dataset.omode){ if(S.omode!==t.dataset.omode){ S.omode=t.dataset.omode; render(); } return; }
  if(t.dataset.design){ const fromProto=!!t.closest('#protoPane'); S.design=t.dataset.design; S.view='orch'; setHash('orchestrator-'+S.design); render(); if(fromProto) window.scrollTo({top:0}); return; }
  if(t.dataset.key && S.view==='orch'){ S.view='compass'; S.mode='target'; }
  if(t.dataset.mode){ setMode(t.dataset.mode); return; }
  if(t.dataset.go==='root'){ S.key=null; S.fn=null; setHash(''); render(); return; }
  if(t.dataset.role){ S.role=t.dataset.role; renderPanel(); return; }
  if(t.dataset.key){ selectWf(t.dataset.key, !!t.closest('#stage')); return; }
  if(t.dataset.fn){ selectFn(t.dataset.fn); return; }
});
jump.addEventListener('change',()=>{ if(jump.value) selectWf(jump.value,false); });
$('#designSel').addEventListener('change',e=>{ S.design=e.target.value; setHash('orchestrator-'+S.design); render(); });
document.addEventListener('keydown',e=>{
  if(S.view!=='orch' || e.altKey || e.metaKey || e.ctrlKey || /^(INPUT|SELECT|TEXTAREA)$/.test((e.target||{}).tagName||'')) return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ const i=DESIGNS.indexOf(S.design), n=DESIGNS.length; S.design=DESIGNS[(i+(e.key==='ArrowRight'?1:-1)+n)%n]; setHash('orchestrator-'+S.design); render(); }
});
document.addEventListener('click',e=>{ if(e.target.closest('#heroAuto')) heroAuto(!HERO.auto); });

/* ---------- prototypes ---------- */
const PROTOS=[
 {name:'Source-of-Wealth check', title:'Source-of-Wealth check', tag:'Onboard · new clients', url:'https://clairehung991.github.io/az-source-of-wealth-demo/', design:'onboarding',
  what:'Builds the document checklist for each new client, drafts a source-of-wealth report with its sources, and flags gaps and risks before Compliance opens the file.',
  signs:'The RM, then Compliance', measure:'Source-of-wealth report prep time', team:'Onboard and look after clients',
  bench:'Industry benchmark: Bank of Singapore cut source-of-wealth report time from 10 days to 1 hour with AI (Oct 2025).'},
 {name:'Portfolio Review', title:'Portfolio Review Agent', tag:'Review · each cycle', url:'https://clairehung991.github.io/az-portfolio-review-demo/', design:'review',
  what:'Pulls holdings and performance, flags material changes and drafts the review pack. Once the RM approves the pack, it drafts the client email.',
  signs:'The RM', measure:'Prep time per review', team:'Advise and invest'},
 {name:'Market Trend', title:'Market Trend Agent', tag:'Spot · every morning', url:'https://apoorva0414.github.io/market_trend_agent/', design:'market',
  what:'Scans market news each morning, maps each move to the clients who hold the exposure, and suggests who the RM should call first.',
  signs:'The RM', measure:'Time from a market move to the client call', team:'Advise and invest'}];
function renderProto(){
  const el=document.getElementById('protoPane'); if(el.dataset.built) return;
  el.innerHTML=`<section class="ov-sec"><p class="eyebrow">Wave 1 prototypes</p><h2>Three ${AZB} <b>built and ready to try</b></h2>
  <p class="lead">Working prototypes of the first three agents, built on test data rather than client data. Each opens in your browser in a new tab. In each one, a person approves every output before anything reaches a client.</p></section>
  <div class="pgrid">${PROTOS.map(p=>`<article class="pcard${p.url?'':' soon'}"><div class="pc-top"><svg viewBox="-26 -56 52 70" aria-hidden="true">${botAvatar(p.name)}</svg><div><p class="eyebrow t">Wave 1 · ${esc(p.tag)}</p><h3>${esc(p.title)}</h3></div></div>
    <p class="pc-what">${esc(p.what)}</p>
    <dl class="info"><dt>Signs off</dt><dd>${esc(p.signs)}</dd><dt>Success measure</dt><dd>${esc(p.measure)}</dd><dt>Works for</dt><dd>${esc(p.team)}</dd></dl>
    ${p.bench?`<p class="pc-bench">${esc(p.bench)}</p>`:''}
    <div class="pc-act">${p.url?`<a class="pbtn" href="${p.url}" target="_blank" rel="noopener">Open prototype <span aria-hidden="true">↗</span></a>`:`<span class="pbtn off">Link to follow</span>`}<button type="button" class="plink" data-design="${p.design}">See it in the orchestrator map</button></div></article>`).join('')}</div>`;
  el.dataset.built='1';
}

/* ---------- about ---------- */
function renderAbout(){
  const el=document.getElementById('aboutPane'); if(el.dataset.built) return;
  const INI={'Hung Wan Yu':'HWY','Apoorva Kushwaha':'AK','Joshua Macapugay':'JM','Jackson Ng':'JN','Prof. Tam Trinh':'TT'};
  const person=(n,role,alt)=>`<div class="ab-who"><div class="ab-mono${alt?' alt':''}" aria-hidden="true">${esc(INI[n]||'')}</div><div><b>${esc(n)}</b><span>${esc(role)}</span></div></div>`;
  const STEPS=[
    ['Sep 2026','Listen','Surveys and interviews across Wealth Management, Portfolio Management, and Operations, Finance and Compliance.'],
    ['15 Sep 2026','Map','The operating map: 46 workflows across eight functions, with 129 steps traced and 49 handoffs between people.'],
    ['Oct 2026','Prioritise','Scored the workflows to pick where AI agents help most, and redesigned work around five outcome teams.'],
    ['28 Oct 2026','Build','Designed 15 Azi-bots and built three Wave 1 prototypes, running on test data.',1],
    ['10 Nov 2026','Hand over','Final presentation to Azimut Singapore, with this map as the blueprint.',1]];
  el.innerHTML=`<section class="ov-sec"><p class="eyebrow">About this work</p>
    <h2>The Human-AI Enterprise: <b>an NUS MBA consulting project</b> with Azimut Singapore</h2>
    <p class="lead">Three NUS MBA students worked with Azimut Investment Management Singapore to map how front-office and operations work gets done today, and to redesign it for people and AI agents working side by side. This map, the ${AZB} design and the three Wave 1 prototypes are what we hand over.</p></section>
  <section class="ov-sec"><p class="eyebrow">The team</p><h3>Who we are</h3>
    <div class="ab-peop">${['Hung Wan Yu','Apoorva Kushwaha','Joshua Macapugay'].map(n=>person(n,'NUS MBA')).join('')}</div></section>
  <section class="ov-sec"><p class="eyebrow">With guidance from</p><h3>Our supervisors</h3>
    <div class="ab-peop two">${person('Jackson Ng','COO, Azimut Investment Management Singapore · company supervisor',1)}${person('Prof. Tam Trinh','NUS MBA · academic advisor',1)}</div></section>
  <section class="ov-sec"><p class="eyebrow">How we built it</p><h3>From listening to a working prototype</h3>
    <ol class="ab-steps">${STEPS.map(x=>`<li${x[3]?' class="ag"':''}><span class="when">${esc(x[0])}</span><b>${esc(x[1])}</b><p>${esc(x[2])}</p></li>`).join('')}</ol></section>
  <section class="ov-sec"><p class="eyebrow">Built to be reused</p><h3>A blueprint, not a one-off</h3>
    <p class="lead">The map is meant to be picked up by others: by Azimut Singapore to run the first pilots, by other Azimut offices to adapt to their own teams, and by future NUS MBA teams to build on.</p></section>
  <p class="ab-anote">Sources: workflows and steps come from ${D.live?`Azimut Singapore’s operating map master sheet (${esc(D.source)}), ${D.stale?`shown from a saved copy (${esc(D.readAt)})`:'read live each time this page opens'}`:'Azimut Singapore’s Operating Map Master V4 (15 Sep 2026)'}, built from surveys and interviews with staff. The market monitoring, portfolio review and portfolio proposal flows come from interview notes. Prototypes run on test data, not client data, and industry benchmarks are labelled where used. With thanks to Jackson Ng and the Azimut Singapore team for their time and openness.</p>${(D.syncNotes&&D.syncNotes.length)?`<details class="ab-anote ab-sync"><summary>Sync notes from the master sheet (${D.syncNotes.length})</summary><ul>${D.syncNotes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></details>`:''}`;
  el.dataset.built='1';
}

/* ---------- layout: auto, phone, desktop ---------- */
let LAYOUT='auto'; try{ const v=localStorage.getItem('azLayout'); if(v==='auto'||v==='phone'||v==='desktop') LAYOUT=v; }catch(e){}
function wantPhone(){ return LAYOUT==='phone' || (LAYOUT==='auto' && window.innerWidth<760); }
function applyLayout(rerender){
  const was=PHONE; PHONE=wantPhone();
  app.classList.toggle('m',PHONE);
  app.classList.toggle('pv',LAYOUT==='phone' && window.innerWidth>=760);
  document.querySelectorAll('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===LAYOUT)));
  if(was!==PHONE){ setSceneGeo(); HERO.built=false; SC.id=null; if(rerender) render(); }
  else if(rerender) fit();
}
document.addEventListener('click',e=>{ const b=e.target.closest('[data-layout]'); if(!b) return;
  LAYOUT=b.dataset.layout; try{ localStorage.setItem('azLayout',LAYOUT); }catch(err){}
  applyLayout(true); window.scrollTo({top:0}); });
let lyRaf=0; window.addEventListener('resize',()=>{ cancelAnimationFrame(lyRaf); lyRaf=requestAnimationFrame(()=>applyLayout(true)); });
PHONE=wantPhone(); app.classList.toggle('m',PHONE); app.classList.toggle('pv',LAYOUT==='phone' && window.innerWidth>=760);
document.querySelectorAll('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===LAYOUT)));
setSceneGeo();

// initial: a bare workflow key in the link opens it; "target" opens the orchestrator map
function route(h0){
if(h0==='target'){ S.mode='target'; S.key=null; S.fn=null; }
else if(h0==='overview'){ S.view='overview'; }
else if(h0==='prototypes'){ S.view='proto'; }
else if(h0==='about'){ S.view='about'; }
else if(/^orchestrator/.test(h0)){ S.view='orch'; const d=h0.split('-')[1]; if(D.targets[d]) S.design=d; }
else if(byKey[h0]){ S.view='compass'; const w=byKey[h0]; if(w.targetOnly){ S.mode='target'; S.fn=placeOf(w).team; } else S.fn=w.function; S.key=h0; S.role=w.contribs[0]?w.contribs[0].role:null; }
}
route(decodeURIComponent((location.hash||'').slice(1)));
render();
if(GS && GS.url) GS.url.getLocation(function(l){ const h=decodeURIComponent((l && l.hash)||''); if(h){ route(h); render(); window.scrollTo({top:0}); } });
if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>render());
if(window.ResizeObserver) new ResizeObserver(()=>fit()).observe(scroller); else window.addEventListener('resize',fit);
})();
