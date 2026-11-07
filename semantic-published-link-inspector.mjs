/** Read-only evidence-link inspector. Every entry is extracted from the published DOM. */
export function collectPublishedLinks(sections,baseUrl){
 const entries=[],seen=new Set();
 sections.forEach((section,workspace)=>{
  for(const anchor of section.querySelectorAll('a[href]')){
   const raw=anchor.getAttribute('href')?.trim();
   if(!raw||/^(javascript:|data:|mailto:|tel:)/i.test(raw))continue;
   let url;try{url=new URL(raw,baseUrl);}catch{continue;}
   if(!['https:','http:'].includes(url.protocol))continue;
   const label=(anchor.textContent||'').trim().replace(/\s+/g,' ');
   if(!label)continue;
   const key=workspace+'|'+url.href+'|'+label;
   if(seen.has(key))continue;
   seen.add(key);
   const isRepository=url.hostname==='github.com'&&url.pathname.split('/').filter(Boolean).length>=2;
   entries.push({workspace,label,url:url.href,kind:isRepository?'source link':'published link'});
  }
 });
 return entries;
}
/** A link's presence proves publication, not its availability, completion, or trust. */
export function mountPublishedEvidenceInspector(doc,nav,sections,activate){
 const entries=collectPublishedLinks(sections,doc.defaultView?.location?.href||'https://www.aifreedomtrust.com/');
 const panel=doc.createElement('section');panel.className='explorer-link-inspector';
 panel.setAttribute('aria-label','Published source and destination links');
 const heading=doc.createElement('h3');heading.textContent='Published link inspector';
 const note=doc.createElement('p');note.textContent='Links found in the existing page. Repository links are source roots, never product fruits. A published link alone does not verify a working product.';
 const controls=doc.createElement('div');controls.className='explorer-link-controls';
 const label=doc.createElement('label');label.textContent='Filter published links ';
 const input=doc.createElement('input');input.type='search';input.placeholder='Search source, destination or label';label.append(input);
 const select=doc.createElement('select');select.setAttribute('aria-label','Filter link origin');
 const all=doc.createElement('option');all.value='all';all.textContent='All workspaces';select.append(all);
 for(let i=0;i<sections.length;i++){const option=doc.createElement('option');option.value=String(i);option.textContent=sections[i].querySelector('h2')?.textContent?.trim()||'Workspace '+(i+1);select.append(option);}
 controls.append(label,select);
 const count=doc.createElement('p');count.setAttribute('role','status');
 const list=doc.createElement('ul');list.className='explorer-link-results';
 function render(){
  const q=input.value.trim().toLocaleLowerCase(),scope=select.value;
  const filtered=entries.filter(e=>(scope==='all'||String(e.workspace)===scope)&&(!q||(e.label+' '+e.url+' '+e.kind).toLocaleLowerCase().includes(q)));
  count.textContent=filtered.length+' published links matched. Not a live availability check.';
  list.replaceChildren();
  for(const entry of filtered.slice(0,60)){
   const li=doc.createElement('li'),a=doc.createElement('a'),source=doc.createElement('button'),meta=doc.createElement('span');
   a.href=entry.url;a.textContent=entry.label;a.rel='noopener noreferrer';
   if(new URL(entry.url).origin!==doc.defaultView?.location?.origin)a.target='_blank';
   meta.textContent=entry.kind+' · '+new URL(entry.url).hostname;
   source.type='button';source.textContent='View containing workspace';
   source.addEventListener('click',()=>activate(entry.workspace,{navigate:true,focus:true}));
   li.append(a,meta,source);list.append(li);
  }
  if(filtered.length>60){const li=doc.createElement('li');li.textContent='Showing first 60 results. Refine the filter to inspect more.';list.append(li);}
 }
 input.addEventListener('input',render);select.addEventListener('change',render);
 panel.append(heading,note,controls,count,list);nav.append(panel);render();
 return entries.length;
}
