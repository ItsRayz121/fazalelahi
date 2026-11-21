/* Design preview behaviour. ~150 lines, no libraries. Content is read from the site's own default data
   (FAZAL.Store, local mode: no network) and inserted with textContent only. */
(function () {
  'use strict';
  var S = FAZAL.Store, U = FAZAL.Util; S.init();
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  var root = document.documentElement;
  var reduced = function () { return matchMedia('(prefers-reduced-motion:reduce)').matches || root.dataset.motion === 'reduced'; };
  var p = S.get('fazal_profile');

  /* ---- content ---- */
  $('photo').src = '../assets/hero/fazal-800.webp';
  $('sub').textContent = p.subTagline;
  (p.expertise || []).slice(0, 3).forEach(function (t) { $('chips').appendChild(el('span', 'chip', t)); });
  var st = (p.stats || []).filter(function (s) { return s.visible !== false; });
  [0, 1].forEach(function (i) { var s = st[i]; if (!s) return; var c = $('sc' + i); c.appendChild(el('b', '', U.clean(s.value))); c.appendChild(el('span', '', U.clean(s.label))); });
  [p.bio1, p.bio2].forEach(function (b) { if (U.clean(b)) $('bio').appendChild(el('p', '', b)); });
  st.slice(0, 6).forEach(function (s) { var t = el('div', 'tile'); t.setAttribute('role', 'listitem'); var b = el('b', '', U.clean(s.value)); b.dataset.count = s.value; t.appendChild(b); t.appendChild(el('span', '', U.clean(s.label))); $('stats').appendChild(t); });
  var tags = (p.expertise || []).concat(['Web3 Education', 'KOL Management', 'Community Growth', 'Pakistan']).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
  for (var r = 0; r < 2; r++) tags.forEach(function (t) { $('marq').appendChild(el('span', '', t)); });

  /* ---- experience (accordion; first open) ---- */
  (S.get('fazal_experience') || []).filter(function (e) { return e.visible !== false; }).forEach(function (e, i) {
    var j = el('article', 'job' + (e.status === 'Active' ? ' cur' : '') + ' rv'); j.style.setProperty('--d', i);
    var h = el('button', 'job-h'); h.type = 'button'; h.id = 'jh' + i; h.setAttribute('aria-expanded', i === 0 ? 'true' : 'false'); h.setAttribute('aria-controls', 'jb' + i);
    h.appendChild(el('span', 'co', e.company)); h.appendChild(el('span', 'ro', e.role));
    h.appendChild(el('span', 'dt', [e.start, e.end].filter(Boolean).join(' — ')));
    var tg = el('span', 'tg', '+'); tg.setAttribute('aria-hidden', 'true'); h.appendChild(tg);
    var b = el('div', 'job-b'); b.id = 'jb' + i; b.setAttribute('role', 'region'); b.setAttribute('aria-labelledby', h.id);
    var inner = el('div'); inner.appendChild(el('p', '', e.desc)); b.appendChild(inner);
    h.addEventListener('click', function () { h.setAttribute('aria-expanded', h.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'); });
    j.appendChild(h); j.appendChild(b); $('tl').appendChild(j);
  });

  /* ---- events: filter + dialog viewer ---- */
  var gal = (S.get('fazal_gallery') || []).map(function (g, i) {
    var imgs = (g.media || []).filter(function (m) { return m.type === 'image'; }).map(function (m) { return '../' + U.safeUrlRaw(U.imageUrl(m.src)); });
    return { i: i, title: g.title, cat: g.category, loc: g.location, role: g.role, imgs: imgs };
  }).filter(function (g) { return g.imgs.length; });
  var cats = ['All'].concat(gal.map(function (g) { return g.cat; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }));
  var cur = null, idx = 0, dlg = $('dlg');
  function show() { var g = cur; $('dimg').src = g.imgs[idx]; $('dimg').alt = g.title + ' — photo ' + (idx + 1) + ' of ' + g.imgs.length; $('dt').textContent = g.title; $('dp').textContent = [g.cat, g.loc, g.role].filter(Boolean).join(' · ') + '  (' + (idx + 1) + '/' + g.imgs.length + ')'; }
  gal.forEach(function (g) {
    var c = el('article', 'card rv'); c.dataset.cat = g.cat;
    var im = el('img'); im.src = g.imgs[0]; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; c.appendChild(im);
    var m = el('div', 'meta'); m.appendChild(el('span', 'cat', g.cat)); m.appendChild(el('h3', '', g.title)); m.appendChild(el('span', 'lo', g.loc || '')); m.appendChild(el('span', 'more', 'View ' + g.imgs.length + ' photo' + (g.imgs.length > 1 ? 's' : '') + ' →')); c.appendChild(m);
    var o = el('button', 'open'); o.type = 'button'; o.setAttribute('aria-label', 'Open photos: ' + g.title); o.addEventListener('click', function () { cur = g; idx = 0; show(); dlg.showModal(); });
    c.appendChild(o); $('evgrid').appendChild(c);
  });
  cats.forEach(function (c, i) {
    var b = el('button', 'f', c); b.type = 'button'; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () {
      Array.prototype.forEach.call($('filters').children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var n = 0; Array.prototype.forEach.call($('evgrid').children, function (card) { var on = c === 'All' || card.dataset.cat === c; card.hidden = !on; if (on) n++; });
      $('evcount').textContent = n + ' event' + (n === 1 ? '' : 's') + ' shown';
    });
    $('filters').appendChild(b);
  });
  $('dprev').addEventListener('click', function () { idx = (idx - 1 + cur.imgs.length) % cur.imgs.length; show(); });
  $('dnext').addEventListener('click', function () { idx = (idx + 1) % cur.imgs.length; show(); });
  $('dclose2').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // backdrop click; Escape + focus return are native

  /* ---- contact: real options only ---- */
  function way(ic, label, val, href) { var a = el('a', 'way'); a.href = href; if (href.indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } a.appendChild(el('span', 'ic', ic)); var d = el('div'); d.appendChild(el('b', '', label)); d.appendChild(el('span', '', val)); a.appendChild(d); $('ways').appendChild(a); }
  if (U.clean(p.email)) way('✉', 'Email', p.email, 'mailto:' + p.email);
  var wa = String(p.whatsapp || '').replace(/[^0-9]/g, ''); if (wa) way('☏', 'WhatsApp', 'Chat on WhatsApp', 'https://wa.me/' + wa);
  if (U.clean(p.linkedin)) way('in', 'LinkedIn', 'Connect', U.safeUrlRaw(p.linkedin));

  /* ---- reveal + count-up (IntersectionObserver) ---- */
  function countUp() {
    if (reduced()) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (n) {
      var raw = n.dataset.count, num = parseFloat(raw.replace(/[^0-9.]/g, '')); if (isNaN(num)) return;
      var suf = raw.replace(/[0-9.,]/g, ''), comma = raw.indexOf(',') > -1, t0 = null;
      (function step(ts) { t0 = t0 || ts; var k = Math.min((ts - t0) / 1100, 1), v = Math.floor((1 - Math.pow(1 - k, 3)) * num); n.textContent = (comma ? v.toLocaleString() : v) + suf; if (k < 1) requestAnimationFrame(step); else n.textContent = raw; })(performance.now());
    });
  }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.id === 'stats') countUp(); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(document.querySelectorAll('.rv'), function (n) { io.observe(n); });

  /* ---- nav: solid-on-scroll, hide-on-scroll-down, sliding indicator, drawer ---- */
  var nav = $('nav'), lastY = 0, ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { var y = scrollY; nav.classList.toggle('solid', y > 40); nav.classList.toggle('hide', y > lastY && y > 480 && !$('drawer').classList.contains('open')); lastY = y; ticking = false; });
  }, { passive: true });
  var links = Array.prototype.slice.call(document.querySelectorAll('#links a')), ind = $('ind');
  function moveInd(a) { if (!a) { ind.style.setProperty('--w', 0); return; } var box = $('links').getBoundingClientRect(), r = a.getBoundingClientRect(); ind.style.width = r.width + 'px'; ind.style.setProperty('--x', (r.left - box.left) + 'px'); ind.style.setProperty('--w', 1); }
  var spy = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var a = links.filter(function (l) { return l.getAttribute('href') === '#' + e.target.id; })[0]; links.forEach(function (l) { l.removeAttribute('aria-current'); }); if (a) a.setAttribute('aria-current', 'true'); moveInd(a); } }); }, { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'experience', 'events', 'contact'].forEach(function (id) { spy.observe($(id)); });
  var dr = $('drawer'), bu = $('burger');
  function drawer(open) { dr.classList.toggle('open', open); dr.setAttribute('aria-hidden', String(!open)); bu.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; if (open) $('dclose').focus(); else bu.focus(); }
  bu.addEventListener('click', function () { drawer(true); }); $('dclose').addEventListener('click', function () { drawer(false); });
  Array.prototype.forEach.call(dr.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { drawer(false); }); });
  addEventListener('keydown', function (e) {
    if (!dr.classList.contains('open')) return;
    if (e.key === 'Escape') drawer(false);
    if (e.key === 'Tab') { var f = dr.querySelectorAll('a,button'), first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });

  /* ---- hero spotlight (fine pointer only; transform-only; throttled to rAF) ---- */
  var hero = document.querySelector('.hero'), px = 0, py = 0, raf = 0;
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) hero.addEventListener('pointermove', function (e) {
    if (reduced()) return; var r = hero.getBoundingClientRect(); px = (e.clientX - r.left - r.width / 2) * .08; py = (e.clientY - r.top - r.height / 2) * .08;
    if (!raf) raf = requestAnimationFrame(function () { hero.style.setProperty('--sx', px + 'px'); hero.style.setProperty('--sy', py + 'px'); raf = 0; });
  });

  /* ---- timeline rail fallback when scroll-driven animations are unsupported ---- */
  if (!CSS.supports('animation-timeline: view()')) {
    var tl = $('tl'), t2 = false;
    var upd = function () { var r = tl.getBoundingClientRect(), vh = innerHeight; tl.style.setProperty('--p', Math.max(0, Math.min(1, (vh * .7 - r.top) / r.height)).toFixed(3)); t2 = false; };
    addEventListener('scroll', function () { if (!t2) { t2 = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }

  /* ---- preview control: reduce-motion switch (simulates the OS setting) ---- */
  $('rm').addEventListener('click', function () {
    var on = root.dataset.motion !== 'reduced'; root.dataset.motion = on ? 'reduced' : ''; this.setAttribute('aria-pressed', String(on)); this.textContent = 'Reduce motion: ' + (on ? 'on' : 'off');
    if (on) Array.prototype.forEach.call(document.querySelectorAll('.rv'), function (n) { n.classList.add('in'); });
  });
  if (reduced()) { $('rm').setAttribute('aria-pressed', 'true'); $('rm').textContent = 'Reduce motion: OS setting'; }
})();
