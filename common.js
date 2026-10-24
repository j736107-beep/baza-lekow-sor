var CFG=window.SOR_CFG||{},sb=window.SOR_MOCK||supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY,{auth:{persistSession:true}});
var APP_URL=CFG.APP_URL||location.href.replace(/admin\.html.*$/,'').replace(/[#?].*$/,'');
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').trim()}
function src(r){return [r.zrodlo_mp?'eMPendium (MP.pl)':'',r.zrodlo_ph?'Pharmindex':''].filter(Boolean).join(', ')}
function fmtPL(d){return new Date(d).toLocaleString('pl-PL',{timeZone:'Europe/Warsaw',dateStyle:'long',timeStyle:'short'})}
function card(r,extra){var ok=r.status==='zatwierdzone';return '<div class="ex"><b>'+esc(r.substancja)+'</b> – '+esc(r.wskazanie)+' <span class="st'+(ok?' ok':'')+'">'+esc(r.status)+'</span><br>'+esc(r.dawka)+' '+esc(r.droga)+' '+esc(r.czestosc)+(r.dawka_max?' · max '+esc(r.dawka_max):'')+(r.nerki?'<br><small>Nerki: '+esc(r.nerki)+'</small>':'')+(r.przeciwwskazania?'<br><small>Przeciwwskazania: '+esc(r.przeciwwskazania)+'</small>':'')+'<br><small>'+esc(r.autor)+' · '+esc(src(r))+(r.link?' · <a href="'+esc(r.link)+'" target="_blank" rel="noopener">link</a>':'')+'</small>'+(extra||'')+'</div>'}
function newCode(){var a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,function(b){return b.toString(16).padStart(2,'0')}).join('')} // 48 znaków
// eksport zgodny z Asystent SOR 5.1 „Własne leki” (format sor-leki-wlasne v1, klucz sor_leki_wlasne)
function toOwn(r){return{id:String(r.id).replace(/-/g,'').slice(-24),substancja:r.substancja,preparat:r.preparaty||'',rplId:'',wskazanie:r.wskazanie,dawka:r.dawka,droga:r.droga,czestosc:r.czestosc,max:r.dawka_max||'',
 uwagi:[r.nerki?'Nerki: '+r.nerki:'',r.przeciwwskazania?'Przeciwwskazania: '+r.przeciwwskazania:'',r.autor&&r.autor!=='grupa'?'Autor: '+r.autor:'','Status bazy: '+r.status].filter(Boolean).join(' | '),zrodlo:r.link||src(r),tekst:r.tekst_mp||'',ts:Date.parse(r.created_at)||Date.now()}}
function dl(name,text,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
function exportJSON(rows){var s=JSON.stringify({format:'sor-leki-wlasne',version:1,eksport:new Date().toISOString(),uwaga:'Wspólna baza SOR – wpisy lekarzy zatwierdzone przez koordynatora, niecertyfikowane.',items:rows.map(toOwn)},null,1);dl('sor-leki-wlasne-baza-'+new Date().toISOString().slice(0,10)+'.json',s,'application/json');return s}
function exportCSV(rows){var H=['id','created_at','autor','substancja','preparaty','wskazanie','dawka','droga','czestosc','dawka_max','nerki','przeciwwskazania','zrodlo','link','status','tekst_mp'];
 var q=function(v){v=String(v==null?'':v);if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 dl('baza-lekow-sor.csv','\ufeff'+H.join(';')+'\n'+rows.map(function(r){r=Object.assign({},r,{zrodlo:src(r)});return H.map(function(h){return q(r[h])}).join(';')}).join('\n'),'text/csv')}
// v2: karta wpisu z tekstem z Indeksu MP (skrót, rozwijany)
function fmtD(d){return d?new Date(d).toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw'}):''}
function card2(r,open,extra){var ok=r.status==='zatwierdzone',t=String(r.tekst_mp||'');
 var body=t?(open?'<div class="full">'+esc(t)+'</div>':'<small>'+esc(t.replace(/\s+/g,' ').slice(0,160))+(t.length>160?'… <u>rozwiń</u>':'')+'</small>'):(r.dawka?'<small>'+esc([r.wskazanie,r.dawka,r.droga,r.czestosc].filter(Boolean).join(' · '))+'</small>':'');
 return '<div class="ex" data-id="'+esc(r.id)+'"><b>'+esc(r.substancja)+'</b> <small>· '+fmtD(r.created_at)+'</small> <span class="st'+(ok?' ok':'')+'">'+esc(r.status)+'</span>'+(r.link?' · <a href="'+esc(r.link)+'" target="_blank" rel="noopener noreferrer">mp.pl</a>':'')+'<br>'+body+(extra||'')+'</div>'}
