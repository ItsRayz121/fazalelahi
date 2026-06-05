/* =====================================================================
   FAZAL ELAHI — Public site renderer
   Reads from FAZAL.Store (data.js) and paints every dynamic section.
   ===================================================================== */
(async function () {
  'use strict';
  var Store = FAZAL.Store, Util = FAZAL.Util, esc = Util.escape;
  await Store.bootstrap(); // load shared cloud content (or seed local defaults)

  /* ---------- Official SVG icons (brand-correct) ---------- */
  var ICON = {
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.5v-7l6.3 3.5z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.6 8.2-1.9 8.9c-.1.6-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.5-5c.2-.2 0-.3-.4-.1L8 12.1l-2.9-.9c-.6-.2-.6-.6.1-.9l11.4-4.4c.5-.2 1 .1.8.9z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a11.9 11.9 0 0 0-10.2 18l-1.7 6.2 6.3-1.7A12 12 0 1 0 12 0zm0 2.2a9.8 9.8 0 0 1 8.3 15l-.2.3.9 3.3-3.4-.9-.3.2A9.8 9.8 0 1 1 12 2.2zm5.6 13c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-.9 1.1-.4.2-.7 0a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3.4 3.4 0 0 0-1 2.5 5.8 5.8 0 0 0 1.3 3.1 13.4 13.4 0 0 0 5.1 4.5c2.5 1 2.5.7 3 .6a3 3 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.4-.3-.7-.4z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2H21l-6.5 7.4L22 22h-6l-4.7-6.1L5.9 22H3l7-8-7.3-12h6.1l4.3 5.7zm-1 18h1.6L7.1 3.7H5.4z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1a3.8 3.8 0 0 1 3.4-1.9c3.6 0 4.3 2.4 4.3 5.5zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zm1.8 13H3.5V9h3.6zM22.2 0H1.8A1.8 1.8 0 0 0 0 1.8v20.4A1.8 1.8 0 0 0 1.8 24h20.4a1.8 1.8 0 0 0 1.8-1.8V1.8A1.8 1.8 0 0 0 22.2 0z"/></svg>',
    linktree: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2h2v6.3l4.5-4.5 1.4 1.4L14.4 9.7H21v2h-6.6l4.5 4.5-1.4 1.4L13 13.6V22h-2v-8.4l-4.5 4.5-1.4-1.4 4.5-4.5H3v-2h6.6L5.1 5.2l1.4-1.4L11 8.3z"/></svg>',
    generic: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8z"/></svg>'
  };
  function iconFor(name) {
    var n = (name || '').toLowerCase();
    if (n.indexOf('youtube') > -1) return ICON.youtube;
    if (n.indexOf('telegram') > -1) return ICON.telegram;
    if (n.indexOf('whatsapp') > -1) return ICON.whatsapp;
    if (n.indexOf('twitter') > -1 || n === 'x') return ICON.twitter;
    if (n.indexOf('facebook') > -1) return ICON.facebook;
    if (n.indexOf('linkedin') > -1) return ICON.linkedin;
    if (n.indexOf('linktree') > -1) return ICON.linktree;
    return ICON.generic;
  }
  function badgeColor(c) {
    return 'var(--' + ({ blue:'blue',red:'red',emerald:'emerald',gold:'gold',purple:'purple',orange:'orange',pkgreen:'pkgreen' }[c] || 'gold') + ')';
  }
  var ext = 'target="_blank" rel="noopener noreferrer"';

  /* ---------- Settings & maintenance ---------- */
  var settings = Store.get('fazal_settings');
  if (settings.maintenance) {
    document.getElementById('maintenance').style.display = 'flex';
    document.getElementById('main').style.display = 'none';
  }
  if (settings.title) document.title = settings.title;
  document.getElementById('footTagline').textContent = settings.footerTagline || '';
  if (!settings.showDisclaimer) document.getElementById('disclaimerLine').style.display = 'none';

  // custom CSS injection
  var css = Store.get('fazal_customcss');
  if (css) { var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

  /* ---------- Profile / hero / about ---------- */
  var p = Store.get('fazal_profile');
  var headline = (settings.heroHeadline || p.tagline || '');
  document.getElementById('heroHeadline').innerHTML = headline.split(' ').map(function (w, i) {
    return '<span style="animation-delay:' + (0.3 + i * 0.08) + 's">' + esc(w) + '</span>';
  }).join(' ');
  document.getElementById('heroSub').textContent = settings.heroSub || p.subTagline;
  document.getElementById('heroBody').textContent = p.mission;
  document.getElementById('heroPhoto').src = Util.imageUrl(p.photo);
  document.getElementById('aboutPhoto').src = Util.imageUrl(p.photo);
  document.getElementById('aboutPhoto').alt = 'Fazal Elahi';
  document.getElementById('bio1').textContent = p.bio1;
  document.getElementById('bio2').textContent = p.bio2;
  document.getElementById('bio3').textContent = p.bio3;
  document.getElementById('emailBtn').href = 'mailto:' + p.email;
  document.getElementById('cvBtn').href = p.cvUrl;

  document.getElementById('aboutCred').innerHTML = [
    '📍 Based in ' + esc(p.location),
    '⏱️ ' + esc('2.5 Years Daily Web3'),
    '📧 ' + esc(p.email),
    '💼 ' + esc(p.availability) + ' Available'
  ].map(function (t) { return '<span class="pill">' + t + '</span>'; }).join('');

  document.getElementById('tagCloud').innerHTML = (p.expertise || [])
    .map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');

  document.getElementById('contactCards').innerHTML = [
    '📧 ' + esc(p.email), '💼 linkedin.com/in/fazal-elahi',
    '📱 ' + esc(p.phone) + ' (WhatsApp)', '🌍 ' + esc(p.location) + ' · ' + esc(p.availability)
  ].map(function (t) { return '<div class="card reveal">' + t + '</div>'; }).join('');

  /* ---------- Mini + footer social ---------- */
  var social = Store.get('fazal_social').filter(function (s) { return s.visible !== false; });
  function socialIconHTML(s) {
    return '<a href="' + esc(s.url) + '" ' + ext + ' aria-label="' + esc(s.platform) +
      '" style="color:' + esc(s.color) + '">' + iconFor(s.platform) + '</a>';
  }
  document.getElementById('heroSocial').innerHTML = social.map(socialIconHTML).join('');
  document.getElementById('footSocial').innerHTML = social.map(socialIconHTML).join('');

  /* ---------- Roles ---------- */
  document.getElementById('rolesGrid').innerHTML = Store.get('fazal_roles')
    .filter(function (r) { return r.visible !== false; })
    .map(function (r, i) {
      var col = badgeColor(r.color);
      return '<div class="card role-card reveal tilt" style="transition-delay:' + (i * 0.07) + 's">' +
        '<div class="ico" style="background:' + col + '22;color:' + col + '">' + esc(r.icon) + '</div>' +
        '<h3>' + esc(r.title) + '</h3><p>' + esc(r.desc) + '</p>' +
        '<span class="badge" style="background:' + col + '22;color:' + col + '">' + esc(r.title) + '</span></div>';
    }).join('');

  /* ---------- Stats ---------- */
  document.getElementById('statsGrid').innerHTML = p.stats.map(function (s) {
    return '<div class="stat reveal"><div class="num c-' + ({gold:'gold',emerald:'em',blue:'blue'}[s.accent] || 'gold') +
      '" data-count="' + esc(s.value) + '">0</div><div class="lbl">' + esc(s.label) + '</div></div>';
  }).join('');

  /* ---------- Content / YouTube ---------- */
  var content = Store.get('fazal_content');
  document.getElementById('contentSub').textContent = content.frequency;
  document.getElementById('channels').innerHTML = content.channels.map(function (c) {
    return '<div class="card channel-card reveal"><div class="yt c-red">' + ICON.youtube + '</div>' +
      '<h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p>' +
      '<div class="metric">📺 ' + esc(c.subs) + ' subscribers</div>' +
      '<a class="btn btn-gold shimmer" href="' + esc(c.url) + '" ' + ext + '>Subscribe</a></div>';
  }).join('');
  document.getElementById('videos').innerHTML = content.videos.map(function (v, i) {
    var em = Util.videoEmbed(v);
    var inner;
    if (em.type === 'iframe') {
      inner = '<iframe src="' + esc(em.src) + '" title="Video ' + (i + 1) +
        '" allowfullscreen loading="lazy"></iframe>';
    } else if (em.type === 'video') {
      inner = '<video src="' + esc(em.src) + '" controls playsinline preload="metadata" ' +
        'style="width:100%;height:100%;object-fit:cover;border:0;display:block"></video>';
    } else {
      inner = 'Video ' + (i + 1) + ' — add a link or upload in admin';
    }
    return '<div class="video-card reveal"><div class="frame">' + inner +
      '</div><div class="vt">Latest Upload ' + (i + 1) + '</div></div>';
    // ADMIN: paste a YouTube/Drive link or upload a video file in Content → Featured Videos.
  }).join('');
  document.getElementById('pillars').innerHTML = content.pillars.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
  document.getElementById('hashtags').innerHTML = content.hashtags.map(function (t) { return '<span class="chip hash">' + esc(t) + '</span>'; }).join('');

  /* ---------- Community ---------- */
  var comm = Store.get('fazal_community');
  document.getElementById('commGrid').innerHTML = comm.cards.filter(function (c) { return c.visible !== false; }).map(function (c) {
    var col = c.platform === 'whatsapp' ? '#25D366' : '#2AABEE';
    var ic = c.platform === 'whatsapp' ? ICON.whatsapp : ICON.telegram;
    return '<div class="card comm-card reveal"><div class="ico" style="background:' + col + '22;color:' + col + '">' + ic + '</div>' +
      '<h3>' + esc(c.name) + '</h3><div class="cnt">' + esc(c.count) + '</div><p>' + esc(c.desc) + '</p>' +
      '<a class="btn btn-glass" href="' + esc(c.url) + '" ' + ext + '>' + esc(c.cta) + '</a></div>';
  }).join('');
  document.getElementById('featStrip').innerHTML = comm.features.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('');

  /* ---------- Experience ---------- */
  document.getElementById('expList').innerHTML = Store.get('fazal_experience').map(function (e) {
    return '<div class="card exp-card reveal ' + (e.accent === 'emerald' ? 'em' : '') + '">' +
      '<div class="exp-head"><div><h3>' + esc(e.company) + '</h3><span class="role">' + esc(e.role) + '</span></div>' +
      '<div style="text-align:right"><div class="status-badge status-' + esc(e.status) + '">' +
        (e.status === 'Active' ? '🟢 ' : '✅ ') + esc(e.status) + '</div>' +
        '<div style="font-family:var(--mono);font-size:12px;color:var(--muted);margin-top:6px">' + esc(e.start) + ' – ' + esc(e.end) + '</div></div></div>' +
      '<p>' + esc(e.desc) + '</p>' +
      '<div class="metrics">' + e.metrics.map(function (m) { return '<span class="metric">' + esc(m) + '</span>'; }).join('') + '</div>' +
      '<div class="skills">' + e.skills.map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join('') + '</div></div>';
  }).join('');

  /* ---------- KOL ---------- */
  var kol = Store.get('fazal_kol_network');
  document.getElementById('kolIntro').textContent = kol.intro;
  document.getElementById('kolServices').innerHTML = kol.services.map(function (s) {
    return '<div class="card reveal tilt"><div class="ico">' + esc(s.icon) + '</div><h4>' + esc(s.title) + '</h4><p>' + esc(s.desc) + '</p></div>';
  }).join('');
  document.getElementById('kolPartners').innerHTML = kol.partners.map(function (k) {
    return '<a class="kol-partner reveal" href="' + esc(k.url) + '" ' + ext + '>' + esc(k.name) + '<span>' + esc(k.platform) + '</span></a>';
  }).join('') + '<div class="kol-partner reveal" style="color:var(--gold)">+ Dozens More in Network</div>';
  document.getElementById('kolMarkets').innerHTML = kol.markets.map(function (m) { return '<span>' + esc(m.flag) + ' ' + esc(m.name) + '</span>'; }).join(' · ');
  document.getElementById('kolSynd').textContent = kol.syndicates;

  /* ---------- Case studies ---------- */
  document.getElementById('caseList').innerHTML = Store.get('fazal_casestudies').map(function (c) {
    return '<div class="card case-card reveal"><span class="badge">' + esc(c.badge) + '</span><h3>' + esc(c.title) + '</h3>' +
      '<div class="case-block"><strong>Challenge:</strong> ' + esc(c.challenge) + '</div>' +
      '<div class="case-block"><strong>Strategy:</strong> ' + esc(c.strategy) + '</div>' +
      '<div class="case-block"><strong>Results:</strong> ' + esc(c.results) + '</div>' +
      '<div class="metrics">' + c.metrics.map(function (m) { return '<span class="metric">' + esc(m) + '</span>'; }).join('') + '</div>' +
      '<div class="skills" style="margin:14px 0">' + c.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<a class="btn btn-emerald" href="' + esc(c.proofUrl) + '" ' + ext + '>🔗 Live Proof</a></div>';
  }).join('');

  /* ---------- Events + filters ---------- */
  var events = Store.get('fazal_events');
  var catColors = { Milestone:'gold', Speaker:'red', Network:'emerald', Partnership:'purple', Campaign:'orange', Education:'blue' };
  function eventCard(e) {
    var col = badgeColor(catColors[e.category] || 'gold');
    var roleCat = (e.role || '').toLowerCase();
    var filterKey = e.category;
    return '<div class="card event-card reveal" data-cat="' + esc(filterKey) + '" data-role="' + esc(roleCat) + '">' +
      (e.image ? '<img src="' + esc(Util.imageUrl(e.image)) + '" alt="' + esc(e.name) + '" loading="lazy" style="width:100%;height:150px;object-fit:cover;border-radius:10px;border:1px solid var(--border);margin-bottom:4px">' : '') +
      (e.milestone ? '<span class="cat-badge" style="background:var(--gold);color:#000">🏆 Milestone</span>' : '') +
      '<h4>' + esc(e.name) + '</h4>' +
      '<div class="event-meta"><span class="cat-badge" style="background:' + col + '22;color:' + col + '">' + esc(e.category) + '</span>' +
      '<span class="cat-badge" style="background:var(--glass);color:var(--silver)">' + esc(e.role) + '</span>' +
      '<span class="cat-badge" style="background:var(--glass);color:var(--silver)">' + (e.mode === 'In-Person' ? '📍 In-Person' : '🌐 Virtual') + '</span>' +
      '<span class="cat-badge" style="background:var(--glass);color:var(--muted)">' + esc(e.date) + '</span></div>' +
      (e.url ? '<a class="btn btn-glass" style="margin-top:10px" href="' + esc(e.url) + '" ' + ext + '>View Event</a>' : '') +
      '</div>';
  }
  document.getElementById('eventsGrid').innerHTML = events.map(eventCard).join('');
  var filters = ['All','Speaker','Organizer','Partnership','Campaign','Education','Network'];
  document.getElementById('eventFilters').innerHTML = filters.map(function (f, i) {
    return '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" data-filter="' + f + '">' + f + '</button>';
  }).join('');
  document.getElementById('eventFilters').addEventListener('click', function (ev) {
    var btn = ev.target.closest('.filter-btn'); if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var f = btn.dataset.filter.toLowerCase();
    document.querySelectorAll('.event-card').forEach(function (card) {
      var match = f === 'all' || (card.dataset.cat || '').toLowerCase().indexOf(f) > -1 || (card.dataset.role || '').indexOf(f) > -1;
      card.style.display = match ? '' : 'none';
    });
  });

  /* ---------- Affiliates ---------- */
  document.getElementById('affGrid').innerHTML = Store.get('fazal_affiliates').filter(function (a) { return a.visible !== false; }).map(function (a) {
    var affLogo = a.logo
      ? '<div class="aff-logo" style="background:' + esc(a.color) + ';overflow:hidden;padding:0"><img src="' + esc(Util.imageUrl(a.logo)) + '" alt="' + esc(a.name) + '" style="width:100%;height:100%;object-fit:cover"></div>'
      : '<div class="aff-logo" style="background:' + esc(a.color) + '">' + esc(a.name[0]) + '</div>';
    return '<div class="card aff-card reveal tilt">' + affLogo +
      '<h3>' + esc(a.name) + '</h3><p>' + esc(a.desc) + '</p><p class="aff-offer">' + esc(a.offer) + '</p>' +
      '<a class="btn btn-gold shimmer" href="' + esc(a.url) + '" ' + ext + '>' + esc(a.cta) + '</a></div>';
  }).join('');

  /* ---------- Social hub ---------- */
  document.getElementById('socialGrid').innerHTML = social.map(function (s) {
    return '<a class="card social-card reveal" href="' + esc(s.url) + '" ' + ext + ' aria-label="' + esc(s.platform) + '">' +
      '<span style="color:' + esc(s.color) + '">' + iconFor(s.platform) + '</span>' +
      '<span><span class="nm">' + esc(s.platform) + '</span><br><span class="hd">' + esc(s.handle) + (s.count ? ' · ' + esc(s.count) : '') + '</span></span></a>';
  }).join('');

  /* ---------- Testimonials ---------- */
  document.getElementById('testGrid').innerHTML = Store.get('fazal_testimonials').map(function (t) {
    return '<div class="card test-card reveal"><p class="q">"' + esc(t.quote) + '"</p>' +
      '<div class="test-author"><div class="test-avatar"' + (t.avatar ? ' style="background:none;overflow:hidden"' : '') + '>' +
      (t.avatar ? '<img src="' + esc(Util.imageUrl(t.avatar)) + '" alt="' + esc(t.name) + '" style="width:100%;height:100%;object-fit:cover">' : esc((t.name || '?')[0])) + '</div>' +
      '<div><div class="n">' + esc(t.name) + '</div><div class="t">' + esc(t.title) + '</div></div></div></div>';
  }).join('');

  /* ---------- Contact form → inquiries ---------- */
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(e.target), san = FAZAL.Util.sanitize;
    var entry = { name: san(fd.get('name')), email: san(fd.get('email')), company: san(fd.get('company')),
      type: san(fd.get('type')), message: san(fd.get('message')), status: 'New', ts: new Date().toISOString() };
    Store.submitInquiry(entry); // saves to cloud (and local cache)
    document.getElementById('formMsg').textContent = '✅ Message sent! Opening your email client as backup…';
    e.target.reset();
    var body = encodeURIComponent('Name: ' + entry.name + '\nCompany: ' + entry.company + '\nType: ' + entry.type + '\n\n' + entry.message);
    window.location.href = 'mailto:' + p.email + '?subject=' + encodeURIComponent('Website Inquiry — ' + entry.type) + '&body=' + body;
  });

  /* ===================================================================
     INTERACTIONS
     =================================================================== */
  // Nav scroll + scroll spy
  var nav = document.getElementById('nav');
  var sections = document.querySelectorAll('main section');
  var navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    document.getElementById('progress').style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
    var cur = '';
    sections.forEach(function (s) { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
  }, { passive: true });

  // Mobile nav
  var mob = document.getElementById('mobileNav'), burger = document.getElementById('burger');
  function toggleMob(open) { mob.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); mob.setAttribute('aria-hidden', !open); }
  burger.addEventListener('click', function () { toggleMob(true); });
  document.getElementById('mobileClose').addEventListener('click', function () { toggleMob(false); });
  mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggleMob(false); }); });

  // Custom cursor
  var cursor = document.getElementById('cursor');
  if (window.matchMedia('(min-width:900px)').matches) {
    document.addEventListener('mousemove', function (e) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });
    document.addEventListener('mouseover', function (e) { if (e.target.closest('a,button,.tilt')) cursor.classList.add('big'); });
    document.addEventListener('mouseout', function (e) { if (e.target.closest('a,button,.tilt')) cursor.classList.remove('big'); });
  }

  // Reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Count-up
  var counted = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, raw = el.dataset.count;
      var num = parseFloat(raw.replace(/[^0-9.]/g, '')); var suffix = raw.replace(/[0-9.,]/g, '');
      var hasComma = raw.indexOf(',') > -1;
      if (isNaN(num)) { el.textContent = raw; counted.unobserve(el); return; }
      var start = 0, dur = 1600, t0 = null;
      function step(ts) { if (!t0) t0 = ts; var prog = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - prog, 3); var val = Math.floor(eased * num);
        el.textContent = (hasComma ? val.toLocaleString() : val) + suffix;
        if (prog < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step); counted.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function (el) { counted.observe(el); });

  // 3D tilt
  document.querySelectorAll('.tilt').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      var ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      card.style.borderColor = 'rgba(242,169,0,.4)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; card.style.borderColor = ''; });
  });

  // Particle canvas
  var canvas = document.getElementById('particles'), ctx = canvas.getContext('2d');
  var particles = [], W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  for (var i = 0; i < 70; i++) particles.push({ x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.8 + 0.4 });
  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function (pt) {
      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.x < 0 || pt.x > W) pt.vx *= -1; if (pt.y < 0 || pt.y > H) pt.vy *= -1;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, 6.283);
      ctx.fillStyle = 'rgba(242,169,0,0.5)'; ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) drawParticles();

  // Parallax hero photo (subtle)
  window.addEventListener('scroll', function () {
    var hp = document.querySelector('.hero-photo-wrap');
    if (hp && window.scrollY < window.innerHeight) hp.style.transform = 'translateY(' + window.scrollY * 0.12 + 'px)';
  }, { passive: true });

  // GSAP scroll polish (progressive enhancement)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.sec-title').forEach(function (t) {
      gsap.from(t, { scrollTrigger: { trigger: t, start: 'top 85%' }, y: 30, opacity: 0, duration: 0.8 });
    });
  }
})();
