(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const seg=(p,a,b)=>clamp((p-a)/(b-a));
  const ease=t=>1-Math.pow(1-t,3);
  const $=id=>document.getElementById(id);
  if(!reduce) document.documentElement.classList.add('motion');

  document.querySelectorAll('.split-words').forEach(el=>{
    const lines=(el.dataset.lines||el.textContent.trim()).split('|');
    el.textContent=''; let i=0;
    lines.forEach(line=>{
      const host=lines.length>1?el.appendChild(Object.assign(document.createElement('span'),{className:'ln'})):el;
      line.trim().split(/\s+/).forEach(w=>{const s=document.createElement('span');s.className='w';s.textContent=w;s.style.transitionDelay=(i++*70)+'ms';host.appendChild(s);host.appendChild(document.createTextNode(' '));});
    });
  });

  // ---------- shared, motion-independent behaviour ----------
  let cat='all',st='all';
  const tiles=[...document.querySelectorAll('.tile')], empty=$('empty');
  function apply(){
    let n=0,k=0;
    tiles.forEach(t=>{const ok=(cat==='all'||t.dataset.cat===cat)&&(st==='all'||t.dataset.st===st);
      if(ok){n++;const was=t.hidden;t.hidden=false;t.classList.remove('is-hiding','is-showing');void t.offsetWidth;t.style.setProperty('--d',(k++*60)+'ms');t.classList.add('is-showing');}
      else{t.hidden=true;t.classList.remove('is-showing');}});
    empty.hidden=n>0;
  }
  document.querySelectorAll('.cat').forEach(b=>b.addEventListener('click',()=>{cat=b.dataset.cat;document.querySelectorAll('.cat').forEach(x=>x.setAttribute('aria-pressed',x===b));apply();}));
  document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{st=b.dataset.st;document.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b));apply();}));
  $('approveBtn').addEventListener('click',()=>{$('approveMsg').textContent='Approved. Gia will prepare the activation.';$('approveBtn').classList.add('is-done');$('approveBtn').textContent='Approved';document.querySelector('.approve').classList.add('is-approved');});
  $('laterBtn').addEventListener('click',()=>{$('approveMsg').textContent='Nothing changes until you approve.';});

  const io=(el,fn,th)=>{if(!('IntersectionObserver' in window)){fn({isIntersecting:true,intersectionRatio:1});return;}new IntersectionObserver(es=>es.forEach(fn),{threshold:th||[0,.3]}).observe(el);};


  // ---------- reveals and small interactions ----------
  const revealAll=()=>document.querySelectorAll('.rv,.rv-scale,.io-words,.compare').forEach(e=>e.classList.add('is-in'));
  if(reduce||!('IntersectionObserver' in window)) revealAll();
  else{
    const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');ro.unobserve(e.target);}}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.rv,.rv-scale,.io-words,.compare').forEach(e=>ro.observe(e));
  }
  document.querySelectorAll('.compare tbody tr').forEach((r,i)=>r.style.setProperty('--d',(250+i*120)+'ms'));
  // catalog tiles enter one by one
  const tileEls=[...document.querySelectorAll('.tile')];
  tileEls.forEach((t,i)=>t.style.setProperty('--d',(i%4)*70+'ms'));
  // the catalog rises over the dark/light seam as soon as its top edge enters the viewport
  if(!reduce) io($('catalog'),e=>{if(e.isIntersecting){$('catalog').classList.add('is-in');tileEls.forEach(t=>t.classList.add('is-showing'));}},[0]);
  // header shadow once the page scrolls
  const hdr=document.querySelector('.site-header');
  addEventListener('scroll',()=>hdr.classList.toggle('is-scrolled',scrollY>8),{passive:true});

  // Gia video: plays once per visit when 30% visible, holds the last frame
  const gv=$('giaVideo'); let giaPlayed=false;
  if(!reduce) io(gv,e=>{
    if(e.isIntersecting&&e.intersectionRatio>=.3&&!giaPlayed){giaPlayed=true;gv.play().catch(()=>{});}
    if(!e.isIntersecting){giaPlayed=false;gv.pause();try{gv.currentTime=0}catch(_){}}
  });

  // Ambient loops play only while visible; static poster on small screens / reduced motion
  const small=window.matchMedia('(max-width:767px)').matches;
  const cv=$('closingVideo'), pv=$('pauseVideo');
  if(reduce||small){cv.removeAttribute('src');cv.load();}
  else io(cv,e=>{e.isIntersecting?cv.play().catch(()=>{}):cv.pause();},[0]);
  if(reduce){pv.removeAttribute('loop');pv.pause();}
  else io(pv,e=>{e.isIntersecting?pv.play().catch(()=>{}):pv.pause();},[0]);

  io($('closingC'),e=>{if(e.isIntersecting&&e.intersectionRatio>=.3){$('closingC').classList.add('is-in');$('s6h').classList.add('is-in');}});

  const h1=document.querySelector('.hero__h1');
  setTimeout(()=>h1.classList.add('is-in'),250);

  if(reduce){
    [$('pauseH'),$('s6h')].forEach(e=>e.classList.add('is-in')); $('closingC').classList.add('is-in');
    document.querySelectorAll('.step').forEach(s=>s.classList.add('is-done'));
    $('holoArc').style.strokeDashoffset=565.5*.25;
    return;
  }

  // ---------- scroll-driven scenes ----------
  function progress(sec){const r=sec.getBoundingClientRect();const total=sec.offsetHeight-innerHeight;return total>0?clamp(-r.top/total):0;}

  // Hero video is scrubbed: load the whole file into memory for instant seeking
  const hv=$('heroVideo');
  (function(){const url=hv.dataset.src;if(!url)return;const direct=()=>{hv.onerror=null;if(hv.src!==url)hv.src=url;};
    fetch(url).then(r=>{if(!r.ok)throw 0;return r.blob();}).then(b=>{hv.onerror=direct;hv.src=URL.createObjectURL(b);}).catch(direct);})();
  const sH={target:0,cur:0};
  hv.addEventListener('loadeddata',()=>{hv.play().then(()=>hv.pause()).catch(()=>{});},{once:true});
  function tickHero(){if(!hv.duration)return;sH.cur+=(sH.target-sH.cur)*.18;const t=sH.cur*(hv.duration-.05);if(Math.abs(hv.currentTime-t)>.02&&!hv.seeking)hv.currentTime=t;}

  const hero=$('s1'),stage=$('heroStage'),b2=$('heroB2'),veil=$('heroVeil'),cue=$('cue'),portal=$('portal');
  const SRC={w:1280,h:720,x:447,y:329,rw:403,rh:254}; // laptop display in the source frame
  // Interface on the laptop: lights up, expands whole (never cropped on landscape), holds,
  // then dims into the dark bridge where the Screen 2 heading appears; Screen 2's catalog rises over the seam
  const ui=$('portalUi'),glow=$('portalGlow'),dim=$('portalDim'),seam=$('portalSeam'),uiGia=$('uiGia'),UI_AR=1.6;
  const bridgeH=document.querySelector('.bridge__h'),bridgeLead=$('bridgeLead'),hdrEl=document.querySelector('.site-header');
  let uiGiaLoaded=false,uiGiaOn=false;
  // Scroll budget of the hero in vh (section height minus one screen). The atrium beats keep their
  // original 320vh; the interface part (lit → expand → hold → dim → heading) gets IFACE_VH.
  const ATRIUM_VH=320, IFACE_START=246.5, IFACE_VH=253.5, TOTAL_VH=IFACE_START+IFACE_VH;
  function frameHero(){
    const vh=progress(hero)*TOTAL_VH, P=vh/ATRIUM_VH;
    const p=vh<IFACE_START?vh/425:.58+.42*(vh-IFACE_START)/IFACE_VH; // phase values below stay on the old 0–1 scale
    sH.target=P<.48?(P/.48)*.4:.4+.6*clamp((P-.48)/.30);
    const o=seg(P,.15,.21); h1.style.opacity=1-o; h1.style.transform=`translateY(${-24*o}px)`;
    const i2=ease(seg(P,.22,.29)),o2=seg(P,.41,.47); b2.style.opacity=i2*(1-o2); b2.style.transform=`translateY(${(1-i2)*24-o2*24}px)`;
    cue.style.opacity=1-seg(P,.02,.06);
    veil.style.opacity=1-seg(P,.46,.62)*.75;
    const W=stage.clientWidth,H=stage.clientHeight,s=Math.max(W/SRC.w,H/SRC.h),ox=(W-SRC.w*s)/2,oy=(H-SRC.h*s)/2;
    const r={x:ox+SRC.x*s,y:oy+SRC.y*s,w:SRC.rw*s,h:SRC.rh*s};
    const lit=seg(p,.58,.63), g=ease(seg(p,.63,.72)), d=ease(seg(p,.80,.88));
    portal.style.opacity=lit;
    const pl=r.x*(1-g),pt=r.y*(1-g),pw=r.w+(W-r.w)*g,ph=r.h+(H-r.h)*g;
    portal.style.left=pl+'px';portal.style.top=pt+'px';portal.style.width=pw+'px';portal.style.height=ph+'px';
    portal.style.borderRadius=6*(1-g)+'px';
    // fit inside the area below the header: whole image on landscape, closer crop around Gia on portrait
    const hdr=(hdrEl?hdrEl.offsetHeight:0)*g, ah=ph-hdr, A=pw/ah;
    const ic=Math.min(pw,ah*UI_AR), cc=Math.max(pw,ah*UI_AR), t=clamp((1.2-A)/.6)*.6;
    const iw=(ic+(cc-ic)*t)*(1-.06*d);
    ui.style.width=iw+'px';ui.style.height=iw/UI_AR+'px';ui.style.top=(hdr+ah/2)+'px';
    ui.style.filter=lit<1?`brightness(${1+1.2*(1-lit)}) saturate(${.5+.5*lit})`:'';
    glow.style.opacity=(1-lit)*.9;
    dim.style.opacity=.72*d; seam.style.opacity=d;
    bridgeH.classList.toggle('is-in',p>.84);
    const l=ease(seg(p,.87,.92)); bridgeLead.style.opacity=l; bridgeLead.style.transform=`translateY(${(1-l)*16}px)`;
    // live Gia: only when a video is set; plays while the interface is lit and not yet dimmed
    if(!uiGiaLoaded&&p>.4&&uiGia.dataset.src){uiGiaLoaded=true;uiGia.src=uiGia.dataset.src;}
    const on=uiGiaLoaded&&lit>.5&&d<1;
    if(on!==uiGiaOn){uiGiaOn=on;uiGia.classList.toggle('is-on',on);on?uiGia.play().catch(()=>{}):uiGia.pause();}
  }

  function frameGia(){
    const m=$('giaMedia'),r=m.getBoundingClientRect(),vh=innerHeight,p=clamp((vh-r.top)/(vh+r.height));
    [[$('b1'),.30,.42],[$('b2'),.42,.56]].forEach(([el,a,b])=>{const t=ease(seg(p,a,b));el.style.opacity=t;el.style.transform=`translateX(${(1-t)*-20}px) scale(${.95+.05*t})`;});
  }
  const steps=[...document.querySelectorAll('.step')];
  function frameSteps(){
    const line=innerHeight*.62;let last=-1;
    steps.forEach((s,i)=>{if(s.getBoundingClientRect().top<line)last=i;});
    steps.forEach((s,i)=>{s.classList.toggle('is-done',i<=last);s.classList.toggle('is-now',i===last);});
  }

  const pause=$('pause'),pFrame=$('pauseFrame'),pVeil=$('pauseVeil'),pH=$('pauseH'),pWrap=$('pauseWrap'),pStage=$('pauseStage');
  const lerp=(a,b,t)=>a+(b-a)*t;
  function framePause(){
    const p=progress(pause);
    let it,il,rr;
    if(p<.45){const t=ease(p/.45);it=lerp(43,0,t);il=lerp(36,0,t);rr=lerp(16,0,t);}
    else if(p<.7){it=0;il=0;rr=0;}
    else{const t=ease(seg(p,.7,1));it=lerp(0,30,t);il=lerp(0,20,t);rr=lerp(0,20,t);}
    pFrame.style.clipPath=`inset(${it}% ${il}% ${it}% ${il}% round ${rr}px)`;
    pVeil.style.opacity=.28*seg(p,.32,.45)+.32*seg(p,.7,.95);
    pH.classList.toggle('is-in',p>.38&&p<.74);
    pWrap.style.opacity=1-seg(p,.7,.8); pWrap.style.transform=`translateY(${-20*seg(p,.7,.8)}px)`;
    // the stage behind the frame warms into the dark Screen 5
    const d=ease(seg(p,.8,1));
    pStage.style.background=`rgb(${Math.round(lerp(247,21,d))},${Math.round(lerp(243,24,d))},${Math.round(lerp(235,28,d))})`;
  }

  const control=$('s5'),asm=[...control.querySelectorAll('.asm')],holoArc=$('holoArc');
  const pinCtl=()=>innerWidth>960&&innerHeight>780;
  function frameControl(){
    if(!pinCtl()){asm.forEach(e=>{e.style.opacity='';e.style.transform='';});
      const r=control.querySelector('.holo').getBoundingClientRect();holoArc.style.strokeDashoffset=565.5*(1-.75*ease(clamp((innerHeight*.8-r.top)/(innerHeight*.4))));return;}
    const r=control.getBoundingClientRect(),p=clamp((innerHeight*.6-r.top)/(control.offsetHeight*.7));
    asm.forEach(e=>{const a=+e.dataset.a,t=ease(seg(p,a,a+.12));e.style.opacity=t;e.style.transform=`translateY(${(1-t)*16}px)`;
      const c=e.querySelector('[data-count]');if(c){const v=Math.round(+c.dataset.count*ease(seg(p,a,a+.2)));c.textContent=v+(c.dataset.suffix||'');}});
    holoArc.style.strokeDashoffset=565.5*(1-.75*ease(seg(p,.24,.5)));
  }

  (function loop(){frameHero();frameGia();frameSteps();framePause();frameControl();tickHero();requestAnimationFrame(loop);})();
})();
