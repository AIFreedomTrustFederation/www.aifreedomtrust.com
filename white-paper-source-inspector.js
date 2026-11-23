/* Interactive source inspector for the standalone, public Living White Paper.
 * Every chapter synopsis comes from the authored HTML document.
 * The concept index is a bounded editorial crosswalk to published sources,
 * not a live federation inventory, operating-status feed, or validation claim.
 * Offline, static, inspectable: no fetch, storage, telemetry or remote execution.
 */
(()=>{
'use strict';
if(document.documentElement.classList.contains('embedded-world'))return;
const reader=document.getElementById('white-paper-atlas');
const inspector=document.getElementById('wp-source-inspector');
const detail=document.getElementById('wp-inspector-detail');
const heading=document.getElementById('wp-inspector-title');
const meaning=document.getElementById('wp-inspector-meaning');
const boundary=document.getElementById('wp-inspector-boundary');
const status=document.getElementById('wp-inspector-status');
const related=document.getElementById('wp-inspector-related');
const sources=document.getElementById('wp-inspector-sources');
const returnLink=document.getElementById('wp-inspector-return');
const termIndex=document.getElementById('wp-term-index');
const search=document.getElementById('wp-term-search');
const count=document.getElementById('wp-term-count');
const close=document.getElementById('wp-inspector-close');
if(!reader||!inspector||!detail||!heading||!meaning||!boundary||!status||!related||!sources||!returnLink||!termIndex||!search||!count||!close)return;

const docs='https://github.com/AIFreedomTrustFederation/www.aifreedomtrust.com/blob/main/docs/';
const doctrine='https://github.com/AIFreedomTrustFederation/AI-Freedom-Trust/blob/main/docs/';
const page='index.html';
const docsLinks={
 operating:{label:'Federation operating model',href:docs+'federation-operating-model.md'},
 map:{label:'Federation organization map',href:docs+'organization-map.md'},
 privacy:{label:'Public security and privacy boundaries',href:docs+'security-and-privacy.md'},
 covenant:{label:'Public mission and covenant',href:page+'#umbrella'},
 mission:{label:'Published human-first mission',href:page+'#hero-title'},
 status:{label:'Published evidence and status',href:page+'#status'},
 flight:{label:'Aetherion Flight Paper · draft source',href:doctrine+'aetherion-flight-paper-post-quantum-sovereign-network.md'},
 genesis:{label:'Genesis White Paper · alpha source',href:doctrine+'aetherion-genesis-whitepaper-alpha.md'},
 circulation:{label:'Circleunchain and Biozoe · source synthesis',href:doctrine+'aetherion-circleunchain-biozoe-source-summary.md'},
 restorative:{label:'Restorative Civilization Economy · doctrine draft',href:doctrine+'aetherion-restorative-civilization-economy.md'},
 lineage:{label:'Documented source lineage',href:'https://github.com/AIFreedomTrustFederation/www.aifreedomtrust.com/blob/main/lineage-data.js'},
 atlas:{label:'Published Federation Atlas',href:'atlas.html'},
 pages:{label:'Public Constellations',href:'constellations.html'}
};
// Statuses and limitations below describe authored source claims, not an audit.
const terms=[
 {id:'human-authorship',title:'Human authorship',chapter:'root',status:'Published commitment',description:'Human dignity, consent, and conscience remain central when people decide how intelligence is used.',boundary:'An ethical commitment does not certify the conduct of every separate tool or model.',related:['sovereignty','shared-covenant'],refs:['mission','covenant']},
 {id:'sovereignty',title:'Sovereignty',chapter:'root',status:'Published principle',description:'The public mission asks technology and shared institutions to support people and communities in directing their own lives.',boundary:'A public principle does not establish legal sovereignty or operational independence of every proposed system.',related:['human-authorship','local-autonomy'],refs:['mission','covenant']},
 {id:'shared-covenant',title:'Shared covenant',chapter:'trunk',status:'Documented operating philosophy',description:'Different Federation works may share responsibilities and purpose while retaining distinct ownership and accountability.',boundary:'Shared doctrine is not proof of deployed interoperability or formally adopted governance.',related:['local-autonomy','public-trust'],refs:['operating','covenant']},
 {id:'local-autonomy',title:'Local autonomy',chapter:'trunk',status:'Documented design principle',description:'Independent works should make their own purpose, responsibility, maturity, and verification limits visible.',boundary:'A design rule does not demonstrate that every participating service meets it today.',related:['shared-covenant','sovereignty'],refs:['operating','map']},
 {id:'public-trust',title:'Public Trust',chapter:'branch',status:'Documented organizational layer',description:'The organization map assigns public identity, shared standards, documentation, and visible accountability to a distinct public-facing layer.',boundary:'The name of this layer is not a claim of third-party certification or audited trustworthiness.',related:['source-evidence','infrastructure'],refs:['map','operating']},
 {id:'infrastructure',title:'Infrastructure',chapter:'branch',status:'Documented organizational layer',description:'The operating model places hosting, routing, provider networks, naming, and related foundations in a separate infrastructure layer.',boundary:'Architecture and assigned responsibility do not establish live deployment or service reliability.',related:['public-trust','applied-systems'],refs:['operating','map']},
 {id:'applied-systems',title:'Applied Systems',chapter:'branch',status:'Documented organizational layer',description:'Applied work is intended to test shared technical approaches through practical services and real-world operations.',boundary:'An applied-system category does not prove revenue, customer adoption, or completed technical integration.',related:['infrastructure','stewardship'],refs:['map','operating']},
 {id:'stewardship',title:'Stewardship and Value',chapter:'branch',status:'Documented research and organizational layer',description:'This layer contains longer-term research on value, datasets, models, cryptographic trust, and regenerative economic concepts.',boundary:'Research inclusion does not create a functioning financial product or audited security guarantee.',related:['research','restorative-economics'],refs:['map','operating']},
 {id:'source-evidence',title:'Source evidence',chapter:'leaf',status:'Documented publication practice',description:'Documents, methods, supporting records, and disclosed limitations give readers a path to inspect what is asserted.',boundary:'A published source is not the same as independent peer review or a verified causal finding.',related:['public-claims','research'],refs:['status','privacy']},
 {id:'public-claims',title:'Public claims boundaries',chapter:'leaf',status:'Published disclosure requirements',description:'The public security and privacy statement separates what the static portal can show from claims requiring further evidence.',boundary:'The portal explicitly does not claim a formal security audit, verified financial value, or production-readiness certification.',related:['source-evidence','research'],refs:['privacy','status']},
 {id:'research',title:'Research',chapter:'flower',status:'Documented maturity category',description:'Research covers experiments, datasets, cryptographic approaches, models, and other exploratory work.',boundary:'Research may be valuable without being independently replicated, adopted, or production-ready.',related:['incubation','source-evidence'],refs:['operating','map']},
 {id:'incubation',title:'Incubation',chapter:'flower',status:'Documented maturity category',description:'Incubating work is promising but has not yet become a primary active public product.',boundary:'A proposal or prototype is not evidence of an available production service.',related:['research','published-destinations'],refs:['map','operating']},
 {id:'circleunchain',title:'Circleunchain',chapter:'flower',status:'Concept-stage protocol thesis',description:'The Aetherion source synthesis describes Circleunchain as a proposed non-extractive circulation foundation distinct from conventional scarcity-first blockchain framing.',boundary:'The source edition describes a proposed architecture, not an audited or operating network.',related:['biozoe','restorative-economics'],refs:['circulation','flight']},
 {id:'biozoe',title:'Biozoe',chapter:'flower',status:'Concept-stage economic thesis',description:'The preserved source synthesis describes a prospective family of accounting or currency concepts built around memory, contribution, and regenerative circulation.',boundary:'This does not announce a launched coin, custody service, financial product, or validated market value.',related:['circleunchain','restorative-economics'],refs:['circulation','genesis']},
 {id:'restorative-economics',title:'Restorative economics',chapter:'flower',status:'Constitutional doctrine draft',description:'The draft explores civilizational inheritance, restoration before accumulation, and the value of life-serving contribution.',boundary:'A proposed economic doctrine is not evidence of implemented distribution, financial outcomes, or legal adoption.',related:['stewardship','biozoe'],refs:['restorative','genesis']},
 {id:'published-destinations',title:'Published destinations',chapter:'fruit',status:'Public reading destinations',description:'The Federation homepage, Atlas, and Constellations provide navigable ways to explore published material.',boundary:'A reachable website does not demonstrate the production health of a separate operating system.',related:['source-evidence','incubation'],refs:['atlas','pages','privacy']},
 {id:'document-lineage',title:'Document lineage',chapter:'fruit',status:'Curated public navigation',description:'The Tree lineage organizes published connections for exploration and helps readers return to cited material.',boundary:'A navigational relationship is not live system telemetry, proof of actual integration, or independent evidence of readiness.',related:['source-evidence','published-destinations'],refs:['lineage','atlas']}
];
const chapters=[
 {id:'root',label:'Human Agency',status:'Published ethical commitments',related:['human-authorship','sovereignty']},
 {id:'trunk',label:'Shared Covenant',status:'Documented coordination model',related:['shared-covenant','local-autonomy']},
 {id:'branch',label:'Federation Structure',status:'Documented organization',related:['public-trust','infrastructure','applied-systems','stewardship']},
 {id:'leaf',label:'Source Evidence',status:'Publication and evidence boundaries',related:['source-evidence','public-claims']},
 {id:'flower',label:'Emerging Work',status:'Research and proposals',related:['research','incubation','circleunchain','biozoe','restorative-economics']},
 {id:'fruit',label:'Public Experiences',status:'Published reading destinations',related:['published-destinations','document-lineage']}
];
const termById=new Map(terms.map(term=>[term.id,term]));
const chapterById=new Map(chapters.map(chapter=>[chapter.id,chapter]));
const build=(tag,textValue,cls)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(textValue!=null)el.textContent=textValue;
 return el;
};
const chip=(text,key,cls='wp-inspector-chip')=>{
 const button=build('button',text,cls);
 button.type='button';button.dataset.wpInspect=key;button.setAttribute('aria-controls','wp-inspector-detail');
 return button;
};
const linksFor=(keys,chapter)=>{
 const found=[];
 const seen=new Set;
 const original=document.getElementById('wp-chapter-'+chapter)?.querySelectorAll('.wp-sources a')||[];
 for(const key of keys){
  const item=docsLinks[key];if(item&&!seen.has(item.href)){seen.add(item.href);found.push(item);}
 }
 for(const el of original){
  const href=el.getAttribute('href');
  if(href&&!seen.has(href)){seen.add(href);found.push({href,label:el.textContent.trim()});}
 }
 return found;
};
const show=(key,{focus=false}={})=>{
 let data;
 if(key.startsWith('chapter:')){
  const chapter=chapterById.get(key.slice(8));
  if(!chapter)return false;
  const article=document.getElementById('wp-chapter-'+chapter.id);
  const h=article?.querySelector('h3');
  const lead=article?.querySelector('.wp-chapter-lead');
  const limit=article?.querySelector('.wp-claim-note');
  if(!h||!lead||!limit)return false;
  data={title:chapter.label+' · '+h.textContent.trim(),chapter:chapter.id,status:chapter.status,
   description:lead.textContent.trim(),boundary:limit.textContent.trim(),related:chapter.related,refs:[]};
 }else if(key.startsWith('term:')){
  data=termById.get(key.slice(5));
  if(!data)return false;
 }else return false;
 detail.hidden=false;
 inspector.dataset.wpInspectorSelected=key;
 status.textContent=data.status;
 heading.textContent=data.title;
 meaning.textContent=data.description;
 boundary.textContent='Source and evidence boundary: '+data.boundary.replace(/^Source and evidence boundary\.\s*/,'');
 returnLink.href='#wp-chapter-'+data.chapter;
 related.replaceChildren();
 for(const id of data.related){const term=termById.get(id);if(term)related.append(chip(term.title,'term:'+id));}
 sources.replaceChildren();
 for(const item of linksFor(data.refs,data.chapter)){
  const li=build('li');
  const a=build('a',item.label);a.href=item.href;li.append(a);sources.append(li);
 }
 for(const button of termIndex.querySelectorAll('[data-wp-inspect]'))button.setAttribute('aria-pressed',String(button.dataset.wpInspect===key));
 if(focus){heading.focus({preventScroll:true});detail.scrollIntoView({block:'nearest',behavior:'instant'});}
 return true;
};
const renderTerms=()=>{
 const q=search.value.trim().toLocaleLowerCase();
 const filtered=terms.filter(term=>(term.title+' '+term.description).toLocaleLowerCase().includes(q));
 termIndex.replaceChildren(...filtered.map(term=>chip(term.title,'term:'+term.id)));
 count.textContent=filtered.length===0?'No matching documented concepts.':filtered.length+' documented concepts'+(q?' match your search.':' available.');
};
for(const chapter of chapters){
 const article=document.getElementById('wp-chapter-'+chapter.id);
 const lead=article?.querySelector('.wp-chapter-lead');
 if(!article||!lead)continue;
 const group=build('div',null,'wp-concept-shortcuts');
 const label=build('span','Explore these concepts:','wp-concept-caption');
 group.append(label);
 for(const id of chapter.related){const term=termById.get(id);if(term)group.append(chip(term.title,'term:'+id));}
 lead.insertAdjacentElement('afterend',group);
}
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-wp-inspect]');
 if(el){
  const isLink=el.tagName==='A';
  const didShow=show(el.dataset.wpInspect,{focus:!isLink});
  if(didShow&&isLink)requestAnimationFrame(()=>heading.focus({preventScroll:true}));
  return;
 }
 const marker=event.target.closest('.wp-tree-marker[data-wp-stage]');
 if(marker)show('chapter:'+marker.dataset.wpStage);
 const index=event.target.closest('.wp-toc [data-wp-index]');
 if(index)show('chapter:'+index.dataset.wpIndex);
});
document.querySelectorAll('.wp-tree-marker[data-wp-stage]').forEach(marker=>{
 marker.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' ')show('chapter:'+marker.dataset.wpStage);
 });
});
search.addEventListener('input',renderTerms);
search.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&search.value){search.value='';renderTerms();}
});
close.addEventListener('click',()=>{
 detail.hidden=true;delete inspector.dataset.wpInspectorSelected;
 termIndex.querySelectorAll('[aria-pressed]').forEach(button=>button.setAttribute('aria-pressed','false'));
 search.focus({preventScroll:true});
});
renderTerms();
})();