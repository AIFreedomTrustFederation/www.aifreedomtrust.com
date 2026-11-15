/* Shared read-only source-to-knowledge explorer. Never infers completed products. */
(function(){
'use strict';
const nodes=window.AIFT_LINEAGE_NODES;if(!Array.isArray(nodes)||!nodes.length)return;
const index=new Map(nodes.map(n=>[n.id,n]));
const css=document.createElement('style');
css.textContent='.knowledge-observatory{margin:2rem auto;max-width:1100px;padding:clamp(16px,3vw,32px);background:radial-gradient(at 0 0,#6a274b66,transparent 48%),radial-gradient(at 100% 100%,#12547977,transparent 50%),#0c182b;color:#edf5fa;border:1px solid #bba573;border-radius:24px;font:16px/1.55 system-ui,sans-serif}.knowledge-observatory *{box-sizing:border-box}.knowledge-observatory h2{color:#f2d18a;font:700 clamp(22px,3vw,32px) Georgia,serif}.knowledge-observatory .ko-grid{display:grid;grid-template-columns:minmax(220px,1fr) minmax(0,2fr);gap:16px}.knowledge-observatory .ko-pane{background:#11223b;border:1px solid #7394a9;border-radius:16px;padding:16px;min-width:0}.knowledge-observatory input{width:100%;padding:12px;background:#071426;color:white;border:1px solid #8bc6d6;border-radius:10px}.knowledge-observatory button,.knowledge-observatory a{display:inline-flex;align-items:center;min-height:44px;padding:8px 12px;border-radius:10px;background:#19374d;border:1px solid #80b6c9;color:#fff;text-decoration:none;cursor:pointer;font:inherit}.knowledge-observatory button[aria-pressed=true]{border-color:#f2d18a;background:#604a28}.knowledge-observatory :is(button,input,a):focus-visible{outline:3px solid #f2d18a;outline-offset:3px}.knowledge-observatory .ko-list{display:grid;gap:8px;max-height:340px;overflow:auto;margin-top:12px}.knowledge-observatory .ko-path,.knowledge-observatory .ko-children{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.knowledge-observatory .ko-muted{color:#bfd8e4}.knowledge-observatory .ko-spectrum{height:6px;background:linear-gradient(90deg,#f56a85,#eac47c,#69d9a8,#6bbcff);border-radius:8px}@media(max-width:640px){.knowledge-observatory .ko-grid{grid-template-columns:1fr}.knowledge-observatory .ko-list{max-height:200px}}@media(prefers-reduced-motion:no-preference){.knowledge-observatory button{transition:background .15s,transform .15s}.knowledge-observatory button:hover{transform:translateY(-2px)}}@media(forced-colors:active){.knowledge-observatory,.knowledge-observatory .ko-pane{border:1px solid CanvasText}}';
document.head.append(css);
const root=document.createElement('section');root.className='knowledge-observatory';root.setAttribute('aria-label','Living knowledge observatory');
root.innerHTML='<h2>Living Knowledge Observatory</h2><p>Explore documented source systems and trace capabilities back to their roots. This is curated evidence, not live readiness or earned achievements.</p><div class="ko-spectrum" aria-hidden="true"></div><div class="ko-grid"><div class="ko-pane"><label for="ko-search">Search the federation</label><input id="ko-search" type="search" placeholder="Source, capability, outcome…"><p id="ko-count" class="ko-muted" role="status"></p><div id="ko-list" class="ko-list"></div></div><div class="ko-pane"><p id="ko-kind" class="ko-muted"></p><h3 id="ko-title"></h3><p id="ko-desc"></p><nav id="ko-path" class="ko-path" aria-label="Source lineage"></nav><div id="ko-children" class="ko-children"></div><p id="ko-status" class="ko-muted"></p></div></div>';
(document.querySelector('main')||document.body).append(root);
const el=id=>root.querySelector('#'+id);let selected=index.has('federation')?'federation':nodes[0].id;
function btn(label,id){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(id===selected));b.addEventListener('click',()=>{selected=id;render()});return b}
function render(){
const q=el('ko-search').value.trim().toLowerCase(),found=nodes.filter(n=>(n.label+' '+(n.desc||'')+' '+n.kind).toLowerCase().includes(q));
el('ko-count').textContent=found.length+' documented destinations';el('ko-list').replaceChildren(...found.map(n=>btn(n.label+' · '+n.kind,n.id)));
if(!found.length)el('ko-list').textContent='No documented match; no destination invented.';
const n=index.get(selected);el('ko-kind').textContent=n.kind==='root'?'Repository root':n.kind==='fruit'?'Curated outcome':n.kind;el('ko-title').textContent=n.label;el('ko-desc').textContent=n.desc||'No source description recorded.';
const trail=[],seen=new Set();let current=n;while(current&&!seen.has(current.id)){seen.add(current.id);trail.unshift(current);current=index.get(current.parent)}
el('ko-path').replaceChildren(...trail.map(x=>btn(x.label,x.id)));
const actions=nodes.filter(x=>x.parent===n.id).map(x=>btn('Explore '+x.label,x.id));
if(n.url&&/^(https:\/\/|[\w.-]+\/)/.test(n.url)){const a=document.createElement('a');a.href=n.url;a.rel='noopener noreferrer';a.textContent=n.kind==='fruit'?'Open curated outcome':'Open source evidence';actions.unshift(a)}
el('ko-children').replaceChildren(...actions);
el('ko-status').textContent='Curated lineage only. No CI status, live verification, product completion, or achievement is inferred.';
}
el('ko-search').addEventListener('input',render);render();
})();
