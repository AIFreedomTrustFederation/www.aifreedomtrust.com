// Living Atlas bridge: public read-only canonical draft, never a runtime health feed.
(() => {
  'use strict';
  const host = document.getElementById('genesis-bridge');
  if (!host) return;
  const source = 'https://raw.githubusercontent.com/AIFreedomTrustFederation/AIFT-Genesis/main/manifests/living-atlas.manifest.json';
  const canonical = 'https://github.com/AIFreedomTrustFederation/AIFT-Genesis/blob/main/manifests/living-atlas.manifest.json';
  const kind = {repository:'root',infrastructure:'root',project:'branch',service:'leaf',publication:'fruit','research-package':'fruit','economic-system':'branch'};
  const heading = document.createElement('h2');
  heading.textContent = 'Genesis Living Atlas · canonical correspondence';
  const intro = document.createElement('p');
  intro.textContent = 'Explore public Genesis entities and their explicit Tree mappings. Repository entities remain roots. Publications are authored outcomes; research packages are not independently validated results. This canonical-draft manifest is not a live deployment or health feed.';
  const status = document.createElement('p');
  status.setAttribute('role','status');
  status.textContent = 'Loading canonical Genesis mappings…';
  const controls = document.createElement('div');
  controls.className = 'genesis-controls';
  const query = document.createElement('input');
  query.type = 'search'; query.placeholder = 'Find an entity, concept or mapping'; query.setAttribute('aria-label','Search Genesis mappings');
  const select = document.createElement('select');
  select.setAttribute('aria-label','Filter Genesis entity type');
  const list = document.createElement('div'); list.className = 'genesis-grid';
  const sourceLink = document.createElement('a'); sourceLink.href = canonical; sourceLink.textContent = 'Inspect canonical Genesis manifest ↗'; sourceLink.target = '_blank'; sourceLink.rel = 'noopener noreferrer';
  controls.append(query,select); host.append(heading,intro,controls,status,list,sourceLink);
  function validate(data) {
    if (data.kind !== 'living-atlas-manifest' || data.status !== 'canonical-draft' || !Array.isArray(data.entities) || !Array.isArray(data.treeMappings)) throw new Error('Unexpected Genesis manifest contract');
    const ids = new Set(data.entities.map(e=>e.id));
    if (ids.size !== data.entities.length || data.treeMappings.some(m=>!ids.has(m.atlasEntityId))) throw new Error('Invalid Genesis entity references');
    return data;
  }
  function render(data) {
    const entities = data.entities.filter(e=>e.visibility==='public');
    const types = [...new Set(entities.map(e=>e.type))].sort();
    select.replaceChildren();
    for (const value of ['all',...types]) {const option=document.createElement('option');option.value=value;option.textContent=value==='all'?'All public entity types':value;select.append(option)}
    function update() {
      const term=query.value.trim().toLocaleLowerCase(),filter=select.value;
      list.replaceChildren(); let shown=0;
      for (const entity of entities) {
        const mappings=data.treeMappings.filter(m=>m.atlasEntityId===entity.id);
        if (filter!=='all' && entity.type!==filter) continue;
        if (term && !(entity.label+' '+entity.description+' '+mappings.map(m=>m.treeNodeId+' '+m.relation+' '+m.description).join(' ')).toLocaleLowerCase().includes(term)) continue;
        shown++;
        const card=document.createElement('article');card.className='genesis-card';
        const badge=document.createElement('small');badge.textContent=(kind[entity.type]||'documented entity')+' · '+entity.type+' · '+entity.evidenceStatus;
        const title=document.createElement('h3');title.textContent=entity.label;
        const description=document.createElement('p');description.textContent=entity.description;
        const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent=mappings.length+' explicit Tree mappings';detail.append(summary);
        const items=document.createElement('ul');
        for (const mapping of mappings) {const li=document.createElement('li');li.textContent=mapping.treeNodeId+' · '+mapping.relation+' · '+mapping.status+' · '+mapping.description;items.append(li)}
        detail.append(items);
        card.append(badge,title,description,detail);
        for (const link of entity.links||[]) {if (!/^https:\/\//.test(link.uri)) continue;const a=document.createElement('a');a.href=link.uri;a.target='_blank';a.rel='noopener noreferrer';a.textContent=link.label+' ↗';card.append(a)}
        list.append(card);
      }
      status.textContent=shown+' public Genesis entities shown · '+data.treeMappings.length+' canonical draft mappings in source · no live status claimed';
    }
    query.addEventListener('input',update);select.addEventListener('change',update);update();
  }
  fetch(source,{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json()}).then(validate).then(render).catch(error=>{status.textContent='Genesis mapping unavailable: '+error.message+'. The independent Living Universe source map remains available.'});
})();
