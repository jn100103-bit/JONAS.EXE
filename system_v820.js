(()=>{'use strict';
const RELEASE='8.02.0';
const SAVE_META_KEY='jx-system-save-meta-v1';
const PATCHES=[
  ['v8.02.0','TECHNICAL CLEANUP','Embedded image payloads moved into media/embedded. Save data stays on the existing LocalStorage keys. Added diagnostics, patch notes and background asset prewarm. Fishing gameplay was not changed.'],
  ['v8.01.x','RAID / COMBAT POLISH','Current raid map, battle backgrounds and release fixes retained.'],
  ['v7.51+','SAVE MANAGER','Local save export/import and media diagnostics retained.']
];
window.JXRelease=RELEASE;
window.JXSystem=Object.assign(window.JXSystem||{},{release:RELEASE,saveSchema:1});
function safeGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}}
function writeMeta(){let old={};try{old=JSON.parse(safeGet(SAVE_META_KEY)||'{}')||{}}catch(_){};const meta={schemaVersion:1,firstSeenRelease:old.firstSeenRelease||RELEASE,currentRelease:RELEASE,lastSeenAt:new Date().toISOString()};safeSet(SAVE_META_KEY,JSON.stringify(meta));return meta}
function storageCount(){try{return localStorage.length}catch(_){return 0}}
function bytesLabel(n){if(n<1024)return n+' B';if(n<1024*1024)return (n/1024).toFixed(1)+' KB';return (n/1024/1024).toFixed(2)+' MB'}
function collectMediaRefs(){const html=document.documentElement.outerHTML;const refs=new Set();for(const m of html.matchAll(/(?:src|poster|href)=["'](media\/[^"'#?]+)["']/g))refs.add(m[1]);for(const m of html.matchAll(/["'`](media\/[A-Za-z0-9_./()\-]+\.(?:png|jpe?g|webp|gif|svg|mp4|webm|ogg|mp3|wav))["'`]/gi))refs.add(m[1]);return [...refs].sort()}
function report(){const refs=collectMediaRefs();let used=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),v=localStorage.getItem(k)||'';used+=(k?.length||0)+v.length}}catch(_){};const meta=writeMeta();return [
 'JONAS.EXE SYSTEM DIAGNOSTICS',
 'Release: '+RELEASE,
 'Asset bundle: '+(window.JX819_ASSET_VERSION||'unknown'),
 'Viewport: '+innerWidth+' × '+innerHeight+' @ '+(devicePixelRatio||1)+'x',
 'Storage keys: '+storageCount()+' · approx '+bytesLabel(used*2),
 'Save schema: '+meta.schemaVersion+' · first seen '+meta.firstSeenRelease,
 'External media refs found: '+refs.length,
 'Online: '+navigator.onLine,
 'User agent: '+navigator.userAgent,
 '',
 'Fishing engine: unchanged by v8.02.0 technical cleanup.'
 ].join('\n')}
function modal(title,bodyBuilder){let modal=document.getElementById('jx820Modal');if(!modal){modal=document.createElement('div');modal.id='jx820Modal';modal.hidden=true;modal.innerHTML='<section class="jx820-box" role="dialog" aria-modal="true" aria-labelledby="jx820ModalTitle"><div class="jx820-title"><span id="jx820ModalTitle"></span><button type="button" aria-label="Close">×</button></div><div class="jx820-body"></div></section>';document.body.append(modal);modal.querySelector('.jx820-title button').onclick=()=>modal.hidden=true;modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)modal.hidden=true})}modal.querySelector('#jx820ModalTitle').textContent=title;const body=modal.querySelector('.jx820-body');body.replaceChildren();bodyBuilder(body,modal);modal.hidden=false;modal.querySelector('.jx820-title button').focus();return modal}
async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch(_){const ta=document.createElement('textarea');ta.value=text;document.body.append(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();return ok}}
function openDiagnostics(){modal('🧪 SYSTEM DIAGNOSTICS.EXE',(body)=>{const pre=document.createElement('pre');pre.textContent=report();const actions=document.createElement('div');actions.className='jx820-actions';const copy=document.createElement('button');copy.className='retro-btn';copy.textContent='COPY REPORT';copy.onclick=async()=>{copy.textContent=(await copyText(pre.textContent))?'COPIED ✓':'COPY FAILED'};const scan=document.createElement('button');scan.className='retro-btn';scan.textContent='CHECK MEDIA FILES';const status=document.createElement('div');status.id='jx820AssetStatus';scan.onclick=async()=>{if(scan.disabled)return;scan.disabled=true;const refs=collectMediaRefs();let ok=0,missing=[];status.textContent='Checking '+refs.length+' referenced media files…';let cursor=0;const worker=async()=>{while(cursor<refs.length){const src=refs[cursor++];try{const r=await fetch(src,{method:'HEAD',cache:'no-store'});if(r.ok)ok++;else missing.push(src+' ['+r.status+']')}catch(_){missing.push(src+' [request failed]')}status.textContent='Checked '+(ok+missing.length)+'/'+refs.length+' · missing '+missing.length}};await Promise.all(Array.from({length:Math.min(8,refs.length||1)},worker));status.textContent='MEDIA CHECK COMPLETE\n'+ok+'/'+refs.length+' reachable.'+(missing.length?'\nMissing:\n'+missing.join('\n'):'\nNo missing files detected.');scan.disabled=false};actions.append(copy,scan);body.append(pre,actions,status)})}
function openPatchNotes(){modal('📄 PATCH_NOTES.TXT',(body)=>{for(const [ver,title,desc] of PATCHES){const item=document.createElement('div');item.className='jx820-patch';item.innerHTML='<strong></strong><div></div>';item.querySelector('strong').textContent=ver+' · '+title;item.querySelector('div').textContent=desc;body.append(item)}})}
function addPanel(){const host=document.querySelector('#controlPanel .v77-control')||document.querySelector('#controlPanel .content');if(!host||document.getElementById('jx820SystemPanel'))return;const section=document.createElement('section');section.id='jx820SystemPanel';const h=document.createElement('h3');h.textContent='🧰 SYSTEM MAINTENANCE';const release=document.createElement('span');release.className='jx820-release';release.textContent='JONAS.EXE v'+RELEASE;release.title='Desktop: Ctrl+Shift+D · Mobile: tap version 5× for diagnostics';const note=document.createElement('p');note.className='jx820-note';note.textContent='Technical cleanup layer. Existing game saves remain on their original keys.';const row=document.createElement('div');row.className='jx820-row';const patch=document.createElement('button');patch.type='button';patch.className='retro-btn';patch.textContent='📄 PATCH NOTES';patch.onclick=openPatchNotes;const diag=document.createElement('button');diag.type='button';diag.className='retro-btn';diag.textContent='🧪 DIAGNOSTICS';diag.onclick=openDiagnostics;row.append(patch,diag);section.append(h,release,note,row);host.prepend(section);let taps=0,timer=0;release.addEventListener('click',()=>{clearTimeout(timer);taps++;timer=setTimeout(()=>taps=0,1500);if(taps>=5){taps=0;openDiagnostics()}})}
function prewarm(){const paths=collectMediaRefs().filter(p=>/\.(?:png|jpe?g|webp|gif|svg)$/i.test(p)).slice(0,24);let done=0;for(const src of paths){const img=new Image();img.onload=img.onerror=()=>{done++;window.JXSystem.prewarmed=done};img.src=src}window.JXSystem.prewarmTarget=paths.length}
function ready(){writeMeta();addPanel();setTimeout(prewarm,600);document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='d'){e.preventDefault();openDiagnostics()}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
