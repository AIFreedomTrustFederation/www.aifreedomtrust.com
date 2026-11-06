import {projectWorld,LAYERS} from './world-projection.mjs';
const host=document.getElementById('world-evidence-atlas');
if(host){
 const el=(tag,cls='',value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
 const shell=el('section','wea-shell'),heading=el('header','wea-heading');
 heading.append(el('p','wea-kicker','FEDERATION · EVIDENCE ATLAS'),el('h2','','From source to outcome'),el('p','','Explore the real federation as an evidence-backed journey. Every root is a repository; every fruit is an actual deliverable. Structural relationships never imply verified contribution.'));
 shell.append(heading);host.append(shell);
 const status=el('p','wea-status','Loading curated federation evidence…');status.setAttribute('role','status');shell.append(status);
 try{
  const response=await fetch('data/living-universe.json',{cache:'no-store'});if(!response.ok)throw Error('Manifest HTTP '+response.status);
  const model=projectWorld(await response.json());
  const controls=el('div','wea-controls'),search=el('input'),layer=el('select'),previous=el('button','','Previous layer'),next=el('button','','Next layer');
  search.type='search';search.placeholder='Search systems, capabilities and outcomes';search.setAttribute('aria-label','Search federation evidence atlas');
  layer.setAttribute('aria-label','Biological layer');for(const name of LAYERS){const o=el('option','',name[0].toUpperCase()+name.slice(1));o.value=name;layer.append(o)}
  previous.type=next.type='button';controls.append(search,layer,previous,next);shell.append(controls);
  const ribbon=el('nav','wea-ribbon');ribbon.setAttribute('aria-label','Federation growth layers');shell.append(ribbon);
  const layout=el('div','wea-layout'),results=el('div','wea-results'),inspector=el('aside','wea-inspector');inspector.setAttribute('aria-label','Evidence inspector');layout.append(results,inspector);shell.append(layout);
  const tally=el('div','wea-tally');shell.append(tally);
  let selected=null;
  const link=(text,url)=>{const a=el('a','wea-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
  function inspect(id){
   selected=id;inspector.replaceChildren();const detail=model.inspect(id);
   if(!detail){inspector.append(el('p','','Select an entity to inspect its source evidence.'));return}
   const {node,lineage,relationships,outcomeVerified}=detail;
   inspector.append(el('p','wea-kicker',node.kind.toUpperCase()),el('h3','',node.label),link(node.kind==='fruit'?'Open actual outcome':'Open documented source',node.url));
   if(node.kind==='root')inspector.append(el('p','','Repository root: source and provenance, not a product fruit.'));
   else if(!lineage.roots.length)inspector.append(el('p','wea-gap','Evidence gap: no attested contribution path to a repository root.'));
   else{
    inspector.append(el('h4','','Attested source journeys'));
    for(const path of lineage.paths){const card=el('div','wea-trail');card.append(el('strong','',path.root.label));
     const rootButton=el('button','','Inspect root');rootButton.type='button';rootButton.onclick=()=>inspect(path.root.id);card.append(rootButton);
     for(const edge of path.edges){const target=model.inspect(edge.to)?.node;card.append(el('span','wea-arrow','→ '+(target?.label||edge.to)));if(edge.evidenceUrl)card.append(link('View attestation',edge.evidenceUrl))}
     inspector.append(card)}
   }
   if(node.kind==='fruit')inspector.append(el('p',outcomeVerified?'wea-verified':'wea-gap',outcomeVerified?'Attested contributing root path recorded. This is not a live deployment or CI claim.':'Documented outcome without attested root lineage. No achievement awarded.'));
   inspector.append(el('h4','','Related entities'));
   const rel=el('div','wea-related');for(const edge of relationships){const other=model.inspect(edge.from===id?edge.to:edge.from)?.node;if(!other)continue;const b=el('button','',other.label+' · '+edge.relation);b.type='button';b.onclick=()=>{layer.value=other.kind;render();inspect(other.id)};rel.append(b)}inspector.append(rel);
   for(const b of results.querySelectorAll('button[data-node]'))b.setAttribute('aria-pressed',String(b.dataset.node===id));
  }
  function render(){
   ribbon.replaceChildren();for(const name of LAYERS){const b=el('button','wea-stage',name);b.type='button';b.dataset.layer=name;b.setAttribute('aria-current',String(name===layer.value));b.onclick=()=>{layer.value=name;render()};b.append(el('strong','',String(model.nodes.filter(n=>n.kind===name).length)));ribbon.append(b)}
   const index=LAYERS.indexOf(layer.value);previous.disabled=index===0;next.disabled=index===LAYERS.length-1;
   const term=search.value.trim().toLowerCase(),items=model.search(term,layer.value);results.replaceChildren();
   const label=el('p','wea-count',items.length+' documented '+layer.value+' entities');results.append(label);
   if(!items.length)results.append(el('p','wea-gap','No matching documented entities. Missing outcomes are not invented.'));
   for(const node of items){const detail=model.inspect(node.id),button=el('button','wea-item');button.type='button';button.dataset.node=node.id;button.setAttribute('aria-pressed',String(selected===node.id));button.append(el('small','',node.kind),el('strong','',node.label),el('span','',node.kind==='root'?'Repository source':node.kind==='fruit'?(detail.outcomeVerified?'Attested source lineage':'Evidence gap: source lineage not attested'):(detail.lineage.roots.length?'Source path recorded':'Documented structure; source path not attested')));button.onclick=()=>inspect(node.id);results.append(button)}
   const fruits=model.outcomes();tally.textContent=fruits.length+' documented outcomes · '+fruits.filter(f=>f.outcomeVerified).length+' with attested source paths · No live CI or deployment status asserted';
   if(!selected||!model.inspect(selected))inspect(items[0]?.id);
   else for(const b of results.querySelectorAll('button[data-node]'))b.setAttribute('aria-pressed',String(b.dataset.node===selected));
  }
  search.addEventListener('input',render);layer.addEventListener('change',render);
  previous.onclick=()=>{layer.value=LAYERS[Math.max(0,LAYERS.indexOf(layer.value)-1)];render()};
  next.onclick=()=>{layer.value=LAYERS[Math.min(LAYERS.length-1,LAYERS.indexOf(layer.value)+1)];render()};
  render();status.textContent='Curated source projection loaded · '+model.nodes.length+' entities · '+model.edges.length+' documented relationships';
 }catch(error){status.textContent='Evidence Atlas unavailable: '+error.message+'. Existing portal exploration remains accessible.'}
}
