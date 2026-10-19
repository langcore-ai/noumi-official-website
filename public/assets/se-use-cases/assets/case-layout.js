window.initializeCaseLayout = () => {
  const embedded = document.documentElement.classList.contains('noumi-embed');
  const data = JSON.parse(document.querySelector('#case-data').textContent);
  const dialog = document.querySelector('#preview-dialog');
  const modalImage = document.querySelector('#modal-image');
  const rail = document.querySelector('#preview-rail');
  const prev = document.querySelector('#rail-previous'), next = document.querySelector('#rail-next');
  const modalPrev = document.querySelector('#modal-previous'), modalNext = document.querySelector('#modal-next');
  const workspace = document.querySelector('.workspace');
  const conversation = document.querySelector('.conversation');
  const reply = conversation.querySelector('.retrieval');
  let replyFrame;
  function fitReply() {
    if (disposed) return;
    if (embedded) {
      conversation.classList.remove('reply-compact', 'reply-dense');
      reply.style.removeProperty('--reply-height');
      return;
    }
    // Stacked mobile columns have no shared height to match.
    const sideBySide = getComputedStyle(workspace.parentElement).display === 'grid';
    conversation.classList.remove('reply-compact', 'reply-dense');
    if (!sideBySide) { reply.style.removeProperty('--reply-height'); return; }
    const remaining = () => workspace.getBoundingClientRect().height -
      (conversation.getBoundingClientRect().height - reply.getBoundingClientRect().height);
    if (remaining() < 125) conversation.classList.add('reply-compact');
    if (remaining() < 80) conversation.classList.add('reply-dense');
    // A readable minimum keeps the response usable on unusually narrow columns.
    const height = Math.max(80, Math.floor(remaining()));
    reply.style.setProperty('--reply-height', `${height}px`);
  }
  function scheduleReplyFit() {
    cancelAnimationFrame(replyFrame);
    replyFrame = requestAnimationFrame(fitReply);
  }
  let opener, selected = 0, active = 0, modalPages = [], modalPage = 0, pointer, suppressClickUntil = 0, scrollTimer, mediaFrame, disposed = false;
  const pages = output => output.preview_pages || [{src: output.preview_url, full_src: output.full_preview_url, page: 1, caption: output.caption}];
  const basename = output => output.path.split('/').pop();
  const figures = () => [...rail.querySelectorAll('.preview-page')];
  const position = i => figures()[i].offsetLeft - figures()[0].offsetLeft;
  const nearest = () => figures().reduce((best, f, i) => Math.abs(position(i)-rail.scrollLeft) < Math.abs(position(best)-rail.scrollLeft) ? i : best, 0);
  function sync() {
    active = nearest(); rail.dataset.active = active;
    prev.disabled = active === 0; next.disabled = active === figures().length - 1;
  }
  function moveTo(i, instant = false) {
    const target = Math.max(0, Math.min(figures().length - 1, i));
    rail.scrollTo({left:position(target),behavior:instant || matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
  }
  function showModalPage(i) {
    modalPage = i; const page = modalPages[i];
    modalImage.src = page.full_src || page.src;
    modalImage.alt = `PAGE ${page.page} · ${page.caption}`;
    document.querySelector('#modal-caption').textContent = modalImage.alt;
    modalPrev.hidden = modalNext.hidden = modalPages.length === 1;
    modalPrev.disabled = i === 0; modalNext.disabled = i === modalPages.length - 1;
    dialog.scrollTop = 0;
  }
  function openPreview(output, from, i = 0, customPages = null) {
    opener = from; modalPages = customPages || pages(output);
    document.querySelector('#modal-title').textContent = basename(output);
    document.querySelector('#modal-title').title = basename(output);
    document.querySelector('#modal-original').href = output.download;
    showModalPage(i);
    // In an iframe the enlarged page participates in the parent's page height.
    if (embedded) dialog.show();
    else dialog.showModal();
    document.querySelector('#close-preview').focus({preventScroll: embedded});
  }
  const expand = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/></svg>';
  function selectOutput(index) {
    selected = index; active = 0; const output = data.outputs[index], items = pages(output);
    document.querySelectorAll('[data-choose]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.choose === index)));
    rail.replaceChildren(); rail.classList.toggle('single-image', items.length === 1);
    prev.hidden = next.hidden = items.length === 1;
    items.forEach((page, i) => {
      const figure = document.createElement('figure'); figure.className = 'preview-page';
      figure.setAttribute('aria-label', `PAGE ${page.page} · ${page.caption}`);
      const button = document.createElement('button'); button.type = 'button'; button.className = 'page-image';
      button.setAttribute('aria-label', `Enlarge page ${page.page} · ${page.caption}`);
      const image = document.createElement('img'); image.dataset.previewSrc = page.src; image.loading = 'lazy'; image.decoding = 'async'; image.alt = figure.getAttribute('aria-label'); image.draggable = false;
      if(page.width && page.height) {image.width=page.width;image.height=page.height;}
      button.style.setProperty('--page-ratio', String(page.width && page.height ? page.width/page.height : 1.414));
      const icon = document.createElement('span'); icon.className = 'page-expand'; icon.innerHTML = expand;
      button.append(image,icon); button.addEventListener('click', () => openPreview(output,button,i));
      const caption = document.createElement('figcaption'); caption.className = 'page-caption';
      const label = document.createElement('span'); label.textContent = `PAGE ${page.page} · `;
      const text = document.createElement('strong'); text.textContent = page.caption;
      caption.append(label,text); figure.append(button,caption); rail.append(figure);
    });
    rail.scrollLeft = 0; sync();
    // Paint the text and dimensioned preview placeholders before requesting images.
    cancelAnimationFrame(mediaFrame);
    mediaFrame = requestAnimationFrame(() => {
      mediaFrame = requestAnimationFrame(() => {
        if (disposed) return;
        rail.querySelectorAll('img[data-preview-src]').forEach(image => {
          image.src = image.dataset.previewSrc;
          delete image.dataset.previewSrc;
        });
      });
    });
  }
  rail.addEventListener('scroll', () => {sync(); clearTimeout(scrollTimer); scrollTimer = setTimeout(() => {if(!pointer) moveTo(nearest());},160);}, {passive:true});
  prev.addEventListener('click',()=>moveTo(active-1)); next.addEventListener('click',()=>moveTo(active+1));
  rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveTo(active+(e.key==='ArrowRight'?1:-1));}});
  rail.addEventListener('dragstart',e=>e.preventDefault());
  rail.addEventListener('pointerdown',e=>{
    if((e.pointerType==='mouse'&&e.button!==0)||figures().length<2)return;
    pointer={id:e.pointerId,x:e.clientX,y:e.clientY,start:rail.scrollLeft,index:active,delta:0,dragged:false};
  });
  rail.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    const delta=e.clientX-pointer.x,dy=e.clientY-pointer.y;
    if(!pointer.dragged&&Math.abs(dy)>Math.abs(delta)&&Math.abs(dy)>6){pointer=null;return;}
    if(!pointer.dragged&&Math.abs(delta)>6){pointer.dragged=true;rail.classList.add('dragging');rail.setPointerCapture(e.pointerId);}
    if(pointer.dragged){e.preventDefault();pointer.delta=delta;rail.scrollLeft=pointer.start-delta;}
  });
  function release(e){
    if(!pointer||pointer.id!==e.pointerId)return;
    const state=pointer;pointer=null;
    if(state.dragged){
      suppressClickUntil=Date.now()+800;
      const candidate=nearest();
      const target=candidate===state.index&&Math.abs(state.delta)>Math.min(60,rail.clientWidth*.15)?state.index+(state.delta<0?1:-1):candidate;
      rail.classList.remove('dragging');moveTo(target);
    }else rail.classList.remove('dragging');
    if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId);
  }
  rail.addEventListener('pointerup',release);rail.addEventListener('pointercancel',release);
  rail.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  const railObserver = new ResizeObserver(()=>moveTo(active,true)); railObserver.observe(rail);
  const replyObserver = new ResizeObserver(scheduleReplyFit);
  [workspace, conversation.querySelector('.prompt'), conversation.querySelector('.memory')].filter(Boolean).forEach(node => replyObserver.observe(node));
  document.fonts.ready.then(scheduleReplyFit);
  window.addEventListener('resize', scheduleReplyFit);
  fitReply();
  const cleanRail = () => {disposed = true; cancelAnimationFrame(mediaFrame); cancelAnimationFrame(replyFrame); clearTimeout(scrollTimer); railObserver.disconnect(); replyObserver.disconnect(); window.removeEventListener('resize', scheduleReplyFit);};
  document.querySelectorAll('[data-choose]').forEach(b=>b.addEventListener('click',()=>selectOutput(+b.dataset.choose)));
  modalPrev.addEventListener('click',()=>{if(modalPage>0)showModalPage(modalPage-1);});
  modalNext.addEventListener('click',()=>{if(modalPage<modalPages.length-1)showModalPage(modalPage+1);});
  document.querySelector('#close-preview').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&modalPage<modalPages.length-1){e.preventDefault();showModalPage(modalPage+1);}else if(e.key==='ArrowLeft'&&modalPage>0){e.preventDefault();showModalPage(modalPage-1);}});
  selectOutput(0);
  const evidence = document.querySelector('.memory-evidence');
  if (!evidence) return cleanRail;
  const proof = evidence.querySelector('.memory-proof');
  const popover = evidence.querySelector('.memory-popover');
  function placeEvidence() {
    if (embedded) return;
    const anchor = proof.getBoundingClientRect();
    popover.style.maxHeight = `${window.innerHeight - 24}px`;
    const rect = popover.getBoundingClientRect();
    let left = Math.max(12, Math.min(anchor.right - rect.width, window.innerWidth - rect.width - 12));
    let top;
    if (anchor.top >= rect.height + 20) top = anchor.top - rect.height - 8;
    else if (window.innerHeight - anchor.bottom >= rect.height + 20) top = anchor.bottom + 8;
    else if (anchor.left >= rect.width + 24) {left=anchor.left-rect.width-8;top=Math.max(12,Math.min(anchor.top-rect.height/2,window.innerHeight-rect.height-12));}
    else {const above=anchor.top-20,below=window.innerHeight-anchor.bottom-20;popover.style.maxHeight=`${Math.max(80,above,below)}px`;top=above>below?12:anchor.bottom+8;}
    popover.style.left=`${left}px`;popover.style.top=`${top}px`;
  }
  function showEvidence(){evidence.removeAttribute('data-dismissed');placeEvidence();}
  evidence.addEventListener('pointerenter',showEvidence);proof.addEventListener('focus',showEvidence);
  evidence.querySelector('.evidence-screenshot').addEventListener('load',placeEvidence);
  window.addEventListener('resize',placeEvidence);window.addEventListener('scroll',placeEvidence,{passive:true});
  proof.addEventListener('click',()=>{evidence.setAttribute('data-dismissed','');const output=data.outputs[data.memory_preview.output_index];openPreview(output,proof,0,[{src:data.memory_preview.image,page:1,caption:data.memory_preview.alt}]);});
  const dismissEvidence = e=>{if(e.key==='Escape')evidence.setAttribute('data-dismissed','');};
  document.addEventListener('keydown',dismissEvidence);
  return () => {cleanRail();window.removeEventListener('resize',placeEvidence);window.removeEventListener('scroll',placeEvidence);document.removeEventListener('keydown',dismissEvidence);};
};
window.disposeCaseLayout = window.initializeCaseLayout();
