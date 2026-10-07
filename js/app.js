(() => {
  'use strict';
  const exhibitors = window.EXPOSANTS;
  const $ = id => document.getElementById(id);
  let lang = 'fr', soundOn = false, audio = null, listScroll = 0;
  const maps = {arena:'https://planarenaexpominiereforestiere.expofp.com/',atrium:'https://planatriumexpominiereforestiere.expofp.com/'};
  const texts = {
    fr:{skip:'Aller au contenu',event:'Exposition minière et forestière de Malartic',headline:'Découvrez les exposants',intro:'Des entreprises à rencontrer, des expertises à découvrir.',find:'Trouver les exposants',directory:'Répertoire des exposants',hideSearch:'Masquer la recherche',showSearch:'Afficher la recherche',searchLabel:'Rechercher une entreprise',placeholder:'Nom de l’entreprise…',clear:'Effacer la recherche',empty:'Aucun exposant ne correspond à cette recherche.',back:'← Retour aux exposants',website:'Voir le site web ↗',about:'À propos de l’exposant',plansTitle:'Trouver les exposants',plansIntro:'Choisissez un espace pour consulter son plan interactif.',inside:'Exposants intérieurs',outside:'Exposants extérieurs et Atrium',mapExternal:'Ouvrir le plan dans un nouvel onglet ↗',soundOn:'♪ Désactiver le son',soundOff:'♪ Activer le son',options:'Options du répertoire',choosePlan:'Choisir un plan',logo:'Logo de ',view:'Voir la fiche de ',newTab:' (nouvel onglet)',mapTitle:'Plan interactif — ',count:n=>`${n} exposant${n>1?'s':''} affiché${n>1?'s':''} sur ${exhibitors.length}`},
    en:{skip:'Skip to content',event:'Malartic Mining and Forestry Exhibition',headline:'Meet the exhibitors',intro:'Discover the companies and expertise at the exhibition.',find:'Find exhibitors',directory:'Exhibitor directory',hideSearch:'Hide search',showSearch:'Show search',searchLabel:'Search for a company',placeholder:'Company name…',clear:'Clear search',empty:'No exhibitors match your search.',back:'← Back to exhibitors',website:'Visit website ↗',about:'About the exhibitor',plansTitle:'Find exhibitors',plansIntro:'Choose an area to view its interactive floor plan.',inside:'Indoor exhibitors',outside:'Outdoor and Atrium exhibitors',mapExternal:'Open the map in a new tab ↗',soundOn:'♪ Turn sound off',soundOff:'♪ Turn sound on',options:'Directory options',choosePlan:'Choose a floor plan',logo:'Logo of ',view:'View the profile of ',newTab:' (new tab)',mapTitle:'Interactive map — ',count:n=>`${n} exhibitor${n===1?'':'s'} shown out of ${exhibitors.length}`}
  };
  const t = key => texts[lang][key];
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function logo(container,item){
    container.replaceChildren();
    if(item.logo){const img=document.createElement('img');img.src=item.logo;img.alt=t('logo')+item.name;img.loading='lazy';img.decoding='async';container.append(img)}
    else{const span=document.createElement('span');span.className='logo-fallback';span.textContent=item.name.match(/[\p{L}\d]+/gu)?.slice(0,2).map(s=>s[0]).join('').toUpperCase()||'●';span.setAttribute('aria-hidden','true');container.append(span)}
  }
  function renderList(){
    const query=norm($('search').value.trim());
    const matches=exhibitors.filter(x=>norm(x.name).includes(query));
    const fragment=document.createDocumentFragment();
    for(const item of matches){const card=document.createElement('article');card.className='card';const link=document.createElement('a');link.className='card-link';link.href='#'+item.id;link.setAttribute('aria-label',t('view')+item.name);const frame=document.createElement('div');frame.className='logo-box';logo(frame,item);const title=document.createElement('h3');title.textContent=item.name;link.append(frame,title);card.append(link);fragment.append(card)}
    $('grid').replaceChildren(fragment);$('count').textContent=t('count')(matches.length);$('empty').hidden=Boolean(matches.length);$('clear-search').hidden=!$('search').value;
  }
  function description(item){
    const fragment=document.createDocumentFragment();
    for(const text of item.description[lang].split(/\n\s*\n/)){const p=document.createElement('p');p.textContent=text;fragment.append(p)}
    $('detail-desc').replaceChildren(fragment);
  }
  function route(move=true,refreshMap=true){
    const hash=location.hash.slice(1), item=exhibitors.find(x=>x.id===hash), isMap=hash==='plans'||hash.startsWith('plan/');
    $('listing').hidden=Boolean(item)||isMap;$('detail').hidden=!item;$('plans').hidden=!isMap;
    let focus='list-title';
    if(item){logo($('detail-logo'),item);$('detail-title').textContent=item.name;description(item);$('website').href=item.website;$('website').setAttribute('aria-label',t('website').replace(' ↗','')+' — '+item.name+t('newTab'));document.title=item.name+' | '+t('directory');focus='detail-title'}
    else if(isMap){document.title=t('plansTitle')+' | '+t('event');focus='plans-title'}
    else document.title=t('directory')+' | '+t('event');
    const selected=isMap?hash.split('/')[1]:null;
    const valid=Boolean(maps[selected]);$('map-container').hidden=!valid;
    for(const id of ['arena','atrium']){const choice=$('choice-'+id);if(valid&&id===selected)choice.setAttribute('aria-current','true');else choice.removeAttribute('aria-current')}
    if(valid){
      const name=t(selected==='arena'?'inside':'outside');$('map-title').textContent=name;$('map-frame').title=t('mapTitle')+name;
      // A new iframe starts the map again without adding a search parameter.
      if(refreshMap||!$('map-frame').getAttribute('src')){
        const freshFrame=$('map-frame').cloneNode(false);
        freshFrame.src=maps[selected];
        $('map-frame').replaceWith(freshFrame);
      }
      $('map-external').href=$('map-frame').getAttribute('src');
    }
    else $('map-frame').removeAttribute('src');
    if(move){window.scrollTo({top:(!item&&!isMap)?listScroll:0,behavior:'instant'});$(focus).focus({preventScroll:true})}
  }
  function translate(){
    document.documentElement.lang=lang==='fr'?'fr-CA':'en-CA';
    for(const element of document.querySelectorAll('[data-text]'))element.textContent=t(element.dataset.text);
    $('controls').setAttribute('aria-label',t('options'));$('plan-options').setAttribute('aria-label',t('choosePlan'));document.querySelector('.brand').alt=t('event');$('search').placeholder=t('placeholder');$('clear-search').setAttribute('aria-label',t('clear'));
    $('language').textContent=lang==='fr'?'English':'Français';$('language').lang=lang==='fr'?'en':'fr';$('language').setAttribute('aria-label',lang==='fr'?'Switch to English':'Passer en français');
    $('sound').textContent=t(soundOn?'soundOn':'soundOff');updateSearchLabel();renderList();route(false,false);
  }
  function updateSearchLabel(){const open=!$('search-panel').hidden;$('search-toggle').textContent=t(open?'hideSearch':'showSearch');$('search-toggle').setAttribute('aria-expanded',String(open))}
  function chirp(){
    if(!soundOn||!audio||audio.state!=='running')return;
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
    oscillator.type='sine';oscillator.frequency.setValueAtTime(660,now);oscillator.frequency.exponentialRampToValueAtTime(850,now+.06);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.045,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+.085);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+.09);
  }
  $('sound').addEventListener('click',async()=>{
    try{if(!soundOn){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;audio ||=new Context();await audio.resume()}soundOn=!soundOn;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').textContent=t(soundOn?'soundOn':'soundOff');if(soundOn)chirp()}catch{soundOn=false;$('sound').setAttribute('aria-pressed','false');$('sound').textContent=t('soundOff')}
  });
  document.addEventListener('pointerover',event=>{if(!['mouse','pen'].includes(event.pointerType))return;const target=event.target.closest('a,button');if(!target||target.contains(event.relatedTarget))return;chirp()});
  document.addEventListener('click',event=>{
    const target=event.target.closest('a[href^="#"]');
    if(target&&!$('listing').hidden)listScroll=window.scrollY;
    // Clicking the active choice does not emit hashchange: explicitly reload it.
    if(target&&target.getAttribute('href')===location.hash&&location.hash.startsWith('#plan/')){event.preventDefault();route(true,true)}
  });
  $('language').addEventListener('click',()=>{lang=lang==='fr'?'en':'fr';translate()});
  $('search').addEventListener('input',renderList);$('clear-search').addEventListener('click',()=>{$('search').value='';renderList();$('search').focus()});
  $('search-toggle').addEventListener('click',()=>{$('search-panel').hidden=!$('search-panel').hidden;updateSearchLabel();if(!$('search-panel').hidden)$('search').focus()});
  window.addEventListener('hashchange',()=>route());
  window.addEventListener('pageshow',event=>{if(event.persisted&&location.hash.startsWith('#plan/'))route(false,true)});
  translate();
})();
