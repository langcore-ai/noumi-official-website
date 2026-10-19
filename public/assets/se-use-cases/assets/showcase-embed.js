(() => {
  if (new URLSearchParams(location.search).get('embed') !== '1') return;
  document.documentElement.classList.add('noumi-embed');

  // The gallery ships with its parent website. Trust only this exact origin,
  // including local and branch previews; never accept a query-supplied origin.
  const allowedOrigins = new Set([location.origin]);
  let parentOrigin = location.origin;

  let root, frame = 0, lastHeight, forceReply = false;
  function measure() {
    frame = 0;
    if (!root || window.parent === window) return;
    // Never measure body/document scrollHeight: it is at least the iframe's
    // viewport height and prevents shrinking (or creates a resize feedback loop).
    const height = Math.ceil(root.getBoundingClientRect().height);
    if (!Number.isFinite(height) || height <= 0) return;
    if (!forceReply && height === lastHeight) return;
    forceReply = false;
    lastHeight = height;
    const message = {type: 'noumi:embed-height', height};
    // Strict target origins also allow the first report with Referrer-Policy:
    // no-referrer. Only the origin matching the actual parent receives it.
    const targets = parentOrigin ? [parentOrigin] : allowedOrigins;
    for (const origin of targets) window.parent.postMessage(message, origin);
  }
  function schedule(force = false) {
    forceReply = forceReply || force;
    if (!frame) frame = requestAnimationFrame(measure);
  }
  window.addEventListener('message', event => {
    if (event.source !== window.parent || !allowedOrigins.has(event.origin)) return;
    if (!event.data || typeof event.data !== 'object' || event.data.type !== 'noumi:embed-measure') return;
    parentOrigin = event.origin;
    schedule(true); // A request must get a reply even if height is unchanged.
  });

  function initialize() {
    const shell = document.querySelector('.showcase-shell');
    if (!shell) return;
    root = document.createElement('div');
    root.id = 'noumi-embed-root';
    shell.before(root);
    root.append(shell);
    new ResizeObserver(() => schedule()).observe(root);
    new MutationObserver(() => schedule()).observe(root, {
      subtree: true, childList: true, characterData: true, attributes: true
    });
    // Resource events do not bubble; capture images inside replaced case views.
    root.addEventListener('load', () => schedule(), true);
    root.addEventListener('error', () => schedule(), true);
    root.addEventListener('toggle', () => schedule(), true);
    root.addEventListener('close', () => schedule(), true);
    window.addEventListener('resize', () => schedule());
    window.addEventListener('pageshow', () => schedule(true));
    window.addEventListener('load', () => schedule(true));
    window.addEventListener('noumi:case-change', () => schedule(true));
    if (document.fonts) {
      document.fonts.ready.then(() => schedule());
      document.fonts.addEventListener('loadingdone', () => schedule());
      document.fonts.addEventListener('loadingerror', () => schedule());
    }
    schedule(true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once: true});
  else initialize();
})();
