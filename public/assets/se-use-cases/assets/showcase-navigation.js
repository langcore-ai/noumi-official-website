(() => {
  const embedded = document.documentElement.classList.contains('noumi-embed');
  const header = document.querySelector('.showcase-header');
  const sidebar = document.querySelector('.showcase-sidebar');
  const view = document.querySelector('#case-view');
  if (embedded) sidebar.querySelectorAll('a[data-case]').forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set('embed', '1');
    link.href = url.href;
  });
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const cases = new Map();
  // Inert templates contain only text/markup; no preview images are fetched here.
  Object.entries(window.showcaseCases || {}).forEach(([number, entry]) => {
    const template = document.createElement('template');
    template.innerHTML = entry.html;
    cases.set(number, {...entry, template});
  });
  delete window.showcaseCases;
  function revealCurrent() {
    const selected = sidebar.querySelector('[aria-current=page]');
    if (!selected) return;
    const navRect = sidebar.getBoundingClientRect(), itemRect = selected.getBoundingClientRect();
    if (matchMedia('(max-width:780px)').matches) {
      if (itemRect.left < navRect.left + 8) sidebar.scrollLeft += itemRect.left - navRect.left - 8;
      else if (itemRect.right > navRect.right - 8) sidebar.scrollLeft += itemRect.right - navRect.right + 8;
    } else if (!embedded && sidebar.scrollHeight > sidebar.clientHeight) {
      if (itemRect.top < navRect.top + 14) sidebar.scrollTop += itemRect.top - navRect.top - 14;
      else if (itemRect.bottom > navRect.bottom - 14) sidebar.scrollTop += itemRect.bottom - navRect.bottom + 14;
    }
  }
  new ResizeObserver(revealCurrent).observe(sidebar);
  document.fonts.ready.then(revealCurrent);
  const updateHeader = () => document.documentElement.style.setProperty('--masthead-height', `${header.getBoundingClientRect().height}px`);
  new ResizeObserver(updateHeader).observe(header); updateHeader();
  function navigate(link, historyMode = 'replace') {
    const number = link.dataset.case;
    if (number === view.dataset.case) return;
    const entry = cases.get(number);
    if (!entry) { location.href = link.href; return; }
    view.querySelector('dialog[open]')?.close();
    window.disposeCaseLayout?.();
    view.replaceChildren(entry.template.content.cloneNode(true));
    view.dataset.case = number;
    view.setAttribute('aria-label', entry.label);
    document.title = entry.title;
    sidebar.querySelectorAll('[data-case]').forEach(item => {
      if (item === link) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    window.disposeCaseLayout = window.initializeCaseLayout();
    revealCurrent();
    if (historyMode !== 'none') history[historyMode === 'push' ? 'pushState' : 'replaceState']({case:number}, '', link.href);
    window.dispatchEvent(new Event('noumi:case-change'));
  }
  sidebar.addEventListener('pointerover', event => {
    if (!hover.matches || event.pointerType === 'touch') return;
    const link = event.target.closest('a[data-case]');
    if (link && !link.contains(event.relatedTarget)) navigate(link);
  });
  sidebar.addEventListener('click', event => {
    const link = event.target.closest('a[data-case]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(link, 'push');
  });
  window.addEventListener('popstate', () => {
    const path = location.pathname.replace(/\.html$/, '').split('/').pop();
    const link = [...sidebar.querySelectorAll('[data-case]')].find(item => new URL(item.href).pathname.replace(/\.html$/, '').split('/').pop() === path) || sidebar.querySelector('[data-case="1"]');
    navigate(link, 'none');
  });
})();
