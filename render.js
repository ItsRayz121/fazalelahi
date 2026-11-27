/* =====================================================================
   FAZAL ELAHI — Public site renderer (v3 "Field pass")
   Reads from FAZAL.Store (data.js) and paints every dynamic section.
   Section ids and data-block hooks are unchanged, so admin show/hide works.
   ===================================================================== */
(async function () {
  'use strict';
  var Store = FAZAL.Store, Util = FAZAL.Util, esc = Util.escape, clean = Util.clean;
  function liveUrl(u) { return !!clean(u); }
  function $(id) { return document.getElementById(id); }
  // Menu and nav work immediately, before content loads from the cloud.
  function initChrome() {
    // Nav border + scroll spy
    var nav = $('nav'), navLinks = document.querySelectorAll('.nav-links a');
    var spy = Array.prototype.map.call(navLinks, function (a) { return $(a.getAttribute('href').slice(1)); }).filter(Boolean);
    initChrome.spy = onScroll;
    var ticking = false;
    function onScroll() {
      ticking = false;
      nav.classList.toggle('scrolled', window.scrollY > 8);
      var cur = '';
      spy.forEach(function (s) { if (s.offsetParent !== null && s.getBoundingClientRect().top <= 120) cur = s.id; });
      navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    // Mobile menu
    var mob = $('mobileNav'), burger = $('burger');
    function toggleMob(open) {
      mob.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); mob.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) $('mobileClose').focus(); else burger.focus({ preventScroll: true });
    }
    burger.addEventListener('click', function () { toggleMob(true); });
    $('mobileClose').addEventListener('click', function () { toggleMob(false); });
    mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggleMob(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mob.classList.contains('open')) toggleMob(false); });

    // Light / dark toggle. The choice is remembered; without one, the device setting decides.
    var root = document.documentElement, meta = document.querySelector('meta[name=theme-color]');
    function setTheme(t, save) {
      root.dataset.theme = t;
      if (meta) meta.content = t === 'dark' ? '#0D1310' : '#F3F4F1';
      document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
        b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      });
      if (save) { try { localStorage.setItem('fe-theme', t); } catch (e) {} }
    }
    setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true); });
    });

  }
  initChrome();

  await Store.bootstrap();

  var HIDDEN = Store.get('fazal_hidden') || {};
  function shown(cat, arr) {
    var h = HIDDEN[cat] || [];
    return (arr || []).filter(function (t) { return h.indexOf(t) < 0; });
  }
  // Content in the CMS still carries emoji labels; the design uses line icons
  // instead, so strip decorative emoji (and flag pairs) from displayed text.
  function noEmoji(s) {
    return String(s == null ? '' : s)
      .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '')
      .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
      .replace(/\s{2,}/g, ' ').trim();
  }
  function visible(arr) { return (arr || []).filter(function (x) { return x && x.visible !== false; }); }
  var ext = 'target="_blank" rel="noopener noreferrer"';

  /* ---------- Icons: brand marks + one line set (1.5 stroke) ---------- */
  var ICON = {
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.5v-7l6.3 3.5z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.6 8.2-1.9 8.9c-.1.6-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.5-5c.2-.2 0-.3-.4-.1L8 12.1l-2.9-.9c-.6-.2-.6-.6.1-.9l11.4-4.4c.5-.2 1 .1.8.9z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a11.9 11.9 0 0 0-10.2 18l-1.7 6.2 6.3-1.7A12 12 0 1 0 12 0zm0 2.2a9.8 9.8 0 0 1 8.3 15l-.2.3.9 3.3-3.4-.9-.3.2A9.8 9.8 0 1 1 12 2.2zm5.6 13c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-.9 1.1-.4.2-.7 0a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3.4 3.4 0 0 0-1 2.5 5.8 5.8 0 0 0 1.3 3.1 13.4 13.4 0 0 0 5.1 4.5c2.5 1 2.5.7 3 .6a3 3 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.4-.3-.7-.4z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2H21l-6.5 7.4L22 22h-6l-4.7-6.1L5.9 22H3l7-8-7.3-12h6.1l4.3 5.7zm-1 18h1.6L7.1 3.7H5.4z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1a3.8 3.8 0 0 1 3.4-1.9c3.6 0 4.3 2.4 4.3 5.5zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zm1.8 13H3.5V9h3.6zM22.2 0H1.8A1.8 1.8 0 0 0 0 1.8v20.4A1.8 1.8 0 0 0 1.8 24h20.4a1.8 1.8 0 0 0 1.8-1.8V1.8A1.8 1.8 0 0 0 22.2 0z"/></svg>',
    linktree: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2h2v6.3l4.5-4.5 1.4 1.4L14.4 9.7H21v2h-6.6l4.5 4.5-1.4 1.4L13 13.6V22h-2v-8.4l-4.5 4.5-1.4-1.4 4.5-4.5H3v-2h6.6L5.1 5.2l1.4-1.4L11 8.3z"/></svg>'
  };
  function line(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  var LI = {
    book: line('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>'),
    video: line('<rect x="2.5" y="5" width="15" height="14" rx="3"/><path d="M17.5 10l4-2.5v9l-4-2.5"/>'),
    users: line('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>'),
    award: line('<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 8 5-3 5 3-1.5-8"/>'),
    briefcase: line('<rect x="2.5" y="7" width="19" height="13" rx="2.5"/><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M2.5 12.5h19"/>'),
    megaphone: line('<path d="M3 10v4a1 1 0 0 0 1 1h3l7 5V4L7 9H4a1 1 0 0 0-1 1z"/><path d="M18 8.5a5 5 0 0 1 0 7"/>'),
    pin: line('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    mail: line('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>'),
    image: line('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/>'),
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    plus: line('<path d="M12 5v14M5 12h14"/>'),
    globe: line('<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19"/>'),
    link: line('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>')
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
    return LI.link;
  }
  function roleIcon(title) {
    var t = (title || '').toLowerCase();
    if (/educat|teach/.test(t)) return LI.book;
    if (/content|creator|video/.test(t)) return LI.video;
    if (/community/.test(t)) return LI.users;
    if (/ambassador program/.test(t)) return LI.award;
    if (/business|bd/.test(t)) return LI.briefcase;
    if (/kol|influenc/.test(t)) return LI.megaphone;
    if (/pakistan|regional|ambassador/.test(t)) return LI.pin;
    return LI.globe;
  }
  // Local event photos have a pre-sized "-t.jpg" twin for covers; fall back to
  // the original if a new upload doesn't have one yet.
  function thumbSrc(src) {
    if (/^assets\/events\/.+\.(jpe?g|png)$/i.test(src) && !/-t\.jpg$/i.test(src)) return src.replace(/\.(jpe?g|png)$/i, '-t.jpg');
    return Util.imageUrl(src);
  }
  function imgTag(src, alt, extra) {
    var t = thumbSrc(src), full = Util.imageUrl(src);
    return '<img src="' + esc(t) + '"' + (t !== full ? ' data-full="' + esc(full) + '" onerror="this.onerror=null;this.src=this.dataset.full"' : '') +
      ' alt="' + esc(alt) + '" loading="lazy" decoding="async"' + (extra || '') + '>';
  }

  /* ---------- Settings & maintenance ---------- */
  var settings = Store.get('fazal_settings') || {};
  if (settings.maintenance) { $('maintenance').style.display = 'flex'; $('main').style.display = 'none'; }
  if (settings.title) document.title = settings.title;
  $('footTagline').textContent = settings.footerTagline || '';
  if (settings.showDisclaimer === false) $('disclaimerLine').style.display = 'none';
  var css = Store.get('fazal_customcss');
  if (css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }

  /* ---------- Profile / about ---------- */
  var p = Store.get('fazal_profile') || {};
  if (p.photo && clean(p.photo) && p.photo !== 'fazal.jpg') $('heroPhoto').src = Util.imageUrl(p.photo);
  // Keep the new hero copy unless the sub-tagline was edited in admin.
  var defSub = ((Store.defaults || {}).fazal_profile || {}).subTagline;
  if (clean(p.subTagline) && p.subTagline !== defSub) $('heroSub').textContent = p.subTagline;
  $('bio1').textContent = p.bio1 || '';
  $('bio2').textContent = p.bio2 || '';
  $('bio3').textContent = p.bio3 || '';
  var cvBtn = $('cvBtn');
  if (liveUrl(p.cvUrl)) cvBtn.href = clean(p.cvUrl); else cvBtn.style.display = 'none';
  // Raw email/number live only in hrefs (privacy), never as visible text.
  $('aboutCred').innerHTML = [
    ['Based in', esc(p.location || 'Pakistan')],
    ['In Web3', '2.5 years, every day'],
    ['Availability', esc(p.availability || '')],
    ['Contact', '<a class="link" href="mailto:' + esc(p.email) + '">Email me</a>']
  ].map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('');
  var tags = shown('expertise', p.expertise);
  if (tags.length) $('tagCloud').innerHTML = tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');

  /* ---------- Stats ---------- */
  $('statsGrid').innerHTML = visible(p.stats).map(function (s) {
    return '<div class="stat"><div class="stat-v" data-count="' + esc(s.value) + '">' + esc(s.value) + '</div><div class="stat-l">' + esc(s.label) + '</div></div>';
  }).join('');

  /* ---------- Contact links ---------- */
  function contactRow(href, icon, label, hd) {
    var isLink = /^https?:/.test(href);
    return '<a class="contact-icon" href="' + esc(href) + '" ' + (isLink ? ext : '') + '>' +
      '<span class="ci-ic">' + icon + '</span><span class="ci-tx"><span class="ci-nm">' + esc(label) + '</span><span class="ci-hd">' + esc(hd) + '</span></span></a>';
  }
  $('contactCards').innerHTML =
    contactRow('mailto:' + p.email, LI.mail, 'Email', 'Best for proposals and briefs') +
    contactRow(liveUrl(p.whatsapp) ? clean(p.whatsapp) : 'https://wa.me/923098336810', ICON.whatsapp, 'WhatsApp', 'Quick questions and calls') +
    contactRow(liveUrl(p.linkedin) ? clean(p.linkedin) : 'https://www.linkedin.com/in/fazal-elahi-bb59a8212', ICON.linkedin, 'LinkedIn', 'Connect and check references') +
    '<div class="contact-icon"><span class="ci-ic">' + LI.pin + '</span><span class="ci-tx"><span class="ci-nm">' + esc(p.location || 'Pakistan') +
      '</span><span class="ci-hd">' + esc(p.availability || '') + '</span></span></div>';
  var emailBtn = document.querySelector('.dock-mail'); if (emailBtn && p.email) emailBtn.href = 'mailto:' + p.email;

  /* ---------- Social ---------- */
  var social = visible(Store.get('fazal_social'));
  $('footSocial').innerHTML = social.map(function (s) {
    return '<a href="' + esc(s.url) + '" ' + ext + ' aria-label="' + esc(s.platform) + '" title="' + esc(s.platform) + '">' + iconFor(s.platform) + '</a>';
  }).join('');
  $('socialGrid').innerHTML = social.map(function (s) {
    var cnt = clean(s.count);
    return '<a class="social-card" href="' + esc(s.url) + '" ' + ext + '><span class="ic">' + iconFor(s.platform) + '</span>' +
      '<span class="tx"><span class="nm">' + esc(s.platform) + '</span><span class="hd">' + esc(s.handle) + (cnt ? ', ' + esc(cnt) : '') + '</span></span></a>';
  }).join('');

  /* ---------- Roles ---------- */
  $('rolesGrid').innerHTML = visible(Store.get('fazal_roles')).map(function (r) {
    return '<div class="role"><span class="role-ic">' + roleIcon(r.title) + '</span><div><h3>' + esc(noEmoji(r.title)) + '</h3><p>' + esc(r.desc) + '</p></div></div>';
  }).join('');

  /* ---------- Content / YouTube ---------- */
  var content = Store.get('fazal_content') || { channels: [], videos: [] };
  $('contentSub').textContent = content.frequency || '';
  $('channels').innerHTML = visible(content.channels).map(function (c) {
    var subs = clean(c.subs);
    return '<div class="channel-card"><span class="yt">' + ICON.youtube + '</span><h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p>' +
      (subs ? '<p class="num">' + esc(subs) + ' subscribers</p>' : '') +
      '<a class="btn btn-secondary" href="' + esc(c.url) + '" ' + ext + '>Subscribe</a></div>';
  }).join('');
  var liveVideos = (content.videos || []).map(function (v) { return Util.videoEmbed(v); })
    .filter(function (em) { return em.type === 'iframe' || em.type === 'video'; });
  if (liveVideos.length) {
    $('videos').innerHTML = liveVideos.map(function (em, i) {
      var inner = em.type === 'iframe'
        ? '<iframe src="' + esc(em.src) + '" title="Video ' + (i + 1) + '" allowfullscreen loading="lazy"></iframe>'
        : '<video src="' + esc(em.src) + '" controls playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover"></video>';
      return '<div class="video-card"><div class="frame">' + inner + '</div><p class="vt">Latest upload ' + (i + 1) + '</p></div>';
    }).join('');
  } else $('videos').style.display = 'none';
  $('pillars').innerHTML = shown('pillars', content.pillars).map(function (t) { return '<span class="chip">' + esc(noEmoji(t)) + '</span>'; }).join('');
  $('hashtags').innerHTML = shown('hashtags', content.hashtags).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');

  /* ---------- Community ---------- */
  var comm = Store.get('fazal_community') || { cards: [], features: [] };
  $('commGrid').innerHTML = visible(comm.cards).map(function (c) {
    var wa = c.platform === 'whatsapp', cnt = clean(c.count);
    return '<div class="comm-card"><span class="comm-ic" style="background:' + (wa ? '#1F9D57' : '#229ED9') + '">' + (wa ? ICON.whatsapp : ICON.telegram) + '</span>' +
      '<h3>' + esc(c.name) + '</h3>' + (cnt ? '<p class="cnt">' + esc(cnt) + ' members</p>' : '') + '<p>' + esc(c.desc) + '</p>' +
      '<a class="btn btn-secondary" href="' + esc(c.url) + '" ' + ext + '>' + esc(c.cta) + '</a></div>';
  }).join('');
  $('featStrip').innerHTML = (comm.features || []).map(function (f) { return '<span>' + esc(noEmoji(f)) + '</span>'; }).join('');

  /* ---------- Regional markets ---------- */
  var CODES = { pakistan: 'PK', india: 'IN', bangladesh: 'BD', indonesia: 'ID', nigeria: 'NG', 'sri lanka': 'LK', nepal: 'NP', uae: 'AE', vietnam: 'VN', philippines: 'PH', turkey: 'TR' };
  function dots(s) { return esc(clean(s) || '').replace(/\s*·\s*/g, ', '); }
  $('regionGrid').innerHTML = visible(Store.get('fazal_regions')).map(function (r) {
    var code = CODES[(r.name || '').toLowerCase()] || (r.name || '??').slice(0, 2).toUpperCase();
    var primary = !/secondary/i.test(r.tier || '');
    return '<tr><td><span class="mk-name"><span class="mk-code">' + esc(code) + '</span>' + esc(r.name) + '</span></td>' +
      '<td><span class="mk-tier' + (primary ? ' primary' : '') + '">' + esc((clean(r.tier) || '').replace(/ market$/i, '')) + '</span></td>' +
      '<td>' + esc(clean(r.reach) || '') + '</td><td>' + dots(r.communities) + '</td><td>' + dots(r.languages) + '</td></tr>';
  }).join('');

  /* ---------- Company logos (official files in assets/logos) ---------- */
  var ORG_LOGO = { creatorx: 'creatorx.png', efsane: 'efsane.png', 'efsane project': 'efsane.png',
    syndicate: 'syndicate.png', 'elyon chain': 'elyon.png', elyon: 'elyon.png' };
  function orgLogo(name, cls) {
    var f = ORG_LOGO[String(name || '').toLowerCase().trim()];
    return f ? '<img class="' + (cls || 'org-logo') + (f === 'efsane.png' ? ' lg-round' : '') + '" src="assets/logos/' + f + '" alt="" width="40" height="40" loading="lazy">' : '';
  }

  /* ---------- Experience ---------- */
  $('expList').innerHTML = visible(Store.get('fazal_experience')).map(function (e) {
    var on = /active/i.test(e.status);
    var when = clean(e.start) ? esc(e.start) + ' – ' + esc(clean(e.end) || 'Present') : (on ? 'Current role' : '');
    var name = liveUrl(e.url) ? '<a href="' + esc(clean(e.url)) + '" ' + ext + '>' + esc(e.company) + '</a>' : esc(e.company);
    return '<article class="exp"><div class="exp-when">' + when + '</div>' +
      '<div class="exp-body"><h3 class="exp-name">' + orgLogo(e.company) + '<span>' + name + '</span></h3><p class="exp-role">' + esc(e.role) + '</p>' +
      '<ul class="exp-metrics">' + (e.metrics || []).map(function (m) { return '<li>' + esc(noEmoji(m)) + '</li>'; }).join('') + '</ul>' +
      (clean(e.desc) ? '<details class="more"><summary>What I did ' + LI.plus + '</summary><p>' + esc(e.desc) + '</p></details>' : '') + '</div>' +
      '<span class="status' + (on ? ' on' : '') + '"><i></i>' + esc(on ? 'Current' : e.status) + '</span></article>';
  }).join('');

  /* ---------- Case studies ---------- */
  var openEventByTitle = function () {};
  // Real photos from events that belong to a case (matched by name) act as proof.
  function proofFor(name) {
    var key = String(name || '').toLowerCase().trim(); if (!key) return '';
    var evs = visible(Store.get('fazal_gallery')).filter(function (g) {
      return String(g.title || '').toLowerCase().indexOf(key) > -1 && (g.media || []).some(function (m) { return m.type !== 'video'; });
    }).slice(0, 4);
    if (!evs.length) return '';
    var cities = [];
    evs.forEach(function (g) { var c = String(g.location || '').split(',')[0].trim(); if (c && c !== 'Pakistan' && cities.indexOf(c) < 0) cities.push(c); });
    return '<div class="proof"><p class="proof-l">On the ground' + (cities.length ? ': ' + esc(name) + ' events in ' + esc(cities.join(', ')) : '') + '</p><div class="proof-row">' +
      evs.map(function (g) {
        var img = (g.media || []).filter(function (m) { return m.type !== 'video'; })[0];
        return '<button type="button" class="proof-ph" data-ev="' + esc(g.title) + '" aria-label="Photos: ' + esc(noEmoji(g.title)) + '">' + imgTag(img.src, '') + '</button>';
      }).join('') + '</div></div>';
  }
  $('caseList').innerHTML = visible(Store.get('fazal_casestudies')).map(function (c) {
    var tp = String(c.title || '').split(/\s+[—–-]\s+/), cname = tp[0], cstat = tp.slice(1).join(' — ');
    var cm = cstat.match(/^([\d.,]+\s*[KMB]?\+?)\s*(?:→|->|to)\s*([\d.,]+\s*[KMB]?\+?)/i);
    var statHTML = cm ? esc(cm[1].trim()) + '<span class="arr">→</span>' + esc(cm[2].trim()) : esc(cstat);
    return '<article class="case"><div><p class="case-badge">' + esc(c.badge) + '</p><h3 class="exp-name">' + orgLogo(cname) + '<span>' + esc(cname) + '</span></h3>' +
      (cstat ? '<p class="case-stat">' + statHTML + '</p>' : '') + '</div>' +
      '<div><ul class="metrics">' + (c.metrics || []).map(function (m) { return '<li>' + esc(noEmoji(m)) + '</li>'; }).join('') + '</ul>' +
      '<details class="more"><summary>Challenge, strategy, results ' + LI.plus + '</summary>' +
      '<p class="case-block"><strong>Challenge.</strong> ' + esc(c.challenge) + '</p>' +
      '<p class="case-block"><strong>Strategy.</strong> ' + esc(c.strategy) + '</p>' +
      '<p class="case-block"><strong>Results.</strong> ' + esc(c.results) + '</p></details>' +
      (liveUrl(c.proofUrl) ? '<a class="link case-proof" href="' + esc(clean(c.proofUrl)) + '" ' + ext + '>See the proof</a>' : '') +
      proofFor(cname) + '</div></article>';
  }).join('');
  $('caseList').addEventListener('click', function (e) { var b = e.target.closest('.proof-ph'); if (b) openEventByTitle(b.getAttribute('data-ev')); });

  /* ---------- KOL ---------- */
  var kol = Store.get('fazal_kol_network') || { services: [], partners: [], markets: [] };
  $('kolIntro').textContent = kol.intro || '';
  $('kolServices').innerHTML = (kol.services || []).map(function (s) {
    return '<div><h4>' + esc(s.title) + '</h4><p>' + esc(s.desc) + '</p></div>';
  }).join('');
  $('kolPartners').innerHTML = visible(kol.partners).map(function (k) {
    var initial = (String(k.name || '').replace(/^@/, '').charAt(0) || '?').toUpperCase();
    var av = clean(k.avatar) ? '<span class="kp-avatar"><img src="' + esc(Util.imageUrl(k.avatar)) + '" alt="" loading="lazy"></span>' : '<span class="kp-avatar">' + esc(initial) + '</span>';
    var meta = [clean(k.followers), noEmoji(clean(k.country))].filter(Boolean).join(', ');
    return '<a class="kol-partner" href="' + esc(k.url) + '" ' + ext + '>' + av + '<span class="kp-body"><span class="kp-name">' + esc(k.name) + '</span>' +
      '<span class="kp-plat">' + esc(k.platform) + (meta ? ', ' + esc(meta) : '') + '</span></span></a>';
  }).join('') + '<div class="kol-partner kp-more">And dozens more</div>';
  $('kolMarkets').textContent = visible(kol.markets).length ? 'Markets: ' + visible(kol.markets).map(function (m) { return m.name; }).join(', ') : '';
  $('kolSynd').textContent = kol.syndicates || '';

  /* ---------- Network wall ---------- */
  (function () {
    var nt = Store.get('fazal_network_tree'); var wall = $('ntWall');
    if (!nt || !wall) return;
    var people = visible(nt.people);
    if (!people.length) { $('network-tree').dataset.empty = '1'; return; }
    // Short default line; an intro edited in admin still wins.
    var ntDef = ((Store.defaults || {}).fazal_network_tree || {}).intro;
    $('ntIntro').textContent = (nt.intro && nt.intro !== ntDef) ? nt.intro : 'Founders, creators, exchange teams and community leaders. Tap a face to see who.';
    $('ntCount').textContent = people.length + ' people and counting';
    function thumbOf(x) { return Util.imageUrl(x.thumb || x.photo || ''); }
    function fullOf(x) { return Util.imageUrl(x.photo || x.thumb || ''); }
    function nameOf(x) { return clean(x.name) ? x.name : 'Network connection'; }
    wall.innerHTML = people.map(function (x, i) {
      return '<button class="nt-chip" data-i="' + i + '" aria-label="' + esc(nameOf(x)) + '"><img src="' + esc(thumbOf(x)) + '" alt="" loading="lazy" decoding="async">' +
        (clean(x.name) ? '<span class="nt-tip">' + esc(x.name) + '</span>' : '') + '</button>';
    }).join('');
    var modal = $('ntModal'), mPhoto = $('ntMPhoto'), mName = $('ntMName'), mRole = $('ntMRole'), mCount = $('ntMCount');
    var cur = 0, lastFocus = null;
    function show(i) {
      cur = (i + people.length) % people.length; var x = people[cur];
      mPhoto.src = fullOf(x); mPhoto.alt = nameOf(x);
      mName.textContent = nameOf(x);
      if (clean(x.role)) { mRole.textContent = x.role; mRole.classList.remove('empty'); }
      else { mRole.textContent = 'Part of Fazal’s Web3 network'; mRole.classList.add('empty'); }
      mCount.textContent = (cur + 1) + ' / ' + people.length;
    }
    function open(i) { lastFocus = document.activeElement; show(i); modal.classList.add('open'); document.body.style.overflow = 'hidden'; $('ntMClose').focus(); }
    function close() { modal.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    wall.addEventListener('click', function (e) { var b = e.target.closest('.nt-chip'); if (b) open(+b.dataset.i); });
    $('ntMClose').addEventListener('click', close);
    $('ntMPrev').addEventListener('click', function () { show(cur - 1); });
    $('ntMNext').addEventListener('click', function () { show(cur + 1); });
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
    });
  })();

  /* ---------- Services ---------- */
  (function () {
    var svc = Store.get('fazal_services'); if (!svc) return;
    var svcDef = ((Store.defaults || {}).fazal_services || {}).intro;
    $('servicesIntro').textContent = (svc.intro && svc.intro !== svcDef) ? svc.intro : 'Four ways to work together. Every engagement starts with your goals.';
    $('servicesGrid').innerHTML = visible(svc.items).map(function (s) {
      var pts = (s.points || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      return '<article class="svc"><div><h3>' + esc(s.title) + '</h3><p class="svc-tag">' + esc(s.tagline) + '</p></div>' +
        '<ul class="svc-points">' + pts + '</ul>' +
        '<a class="btn btn-secondary" href="#contact">' + esc(s.cta || 'Get in touch') + '</a></article>';
    }).join('');
    $('servicesSteps').innerHTML = (svc.steps || []).map(function (st) {
      return '<li class="svc-step"><span class="svc-step-n">Step ' + esc(String(st.step).replace(/^0/, '')) + '</span><h4>' + esc(st.title) + '</h4><p>' + esc(st.desc) + '</p></li>';
    }).join('');
  })();

  /* ---------- Milestone video player ---------- */
  (function () {
    var host = $('milestoneVideos'); if (!host) return;
    var vids = visible(Store.get('fazal_gallery')).filter(function (g) { return g.bannerVideo; }).map(function (g) {
      var vm = (g.media || []).filter(function (m) { return m.type === 'video'; })[0]; if (!vm) return null;
      var embed = Util.videoEmbed(vm.src); if (embed.type === 'none') return null;
      return { label: noEmoji(g.bannerLabel || g.title).replace(/\s+—\s+/, ', '), title: g.title, embed: embed, poster: Util.videoPoster(embed) };
    }).filter(Boolean);
    if (!vids.length) { host.style.display = 'none'; return; }
    host.innerHTML = (vids.length > 1 ? '<div class="mv-tabs" role="tablist">' + vids.map(function (v, i) {
      return '<button class="mv-tab' + (i ? '' : ' active') + '" role="tab" aria-selected="' + (i ? 'false' : 'true') + '" data-i="' + i + '">' + esc(v.label) + '</button>';
    }).join('') + '</div>' : '') + '<div class="mv-stage" id="mvStage"></div>';
    var stage = $('mvStage'), active = 0;
    function facade(v) {
      return '<button class="mv-facade" aria-label="Play video: ' + esc(v.label) + '">' + (v.poster ? '<img src="' + esc(v.poster) + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
        '<span class="mv-play">' + LI.play + '</span><span class="mv-cap">' + esc(v.label) + '</span></button>';
    }
    function playing(v) {
      return v.embed.type === 'iframe' ? '<iframe src="' + esc(v.embed.src) + '" title="' + esc(v.title) + '" allow="autoplay; fullscreen" allowfullscreen></iframe>'
        : '<video src="' + esc(v.embed.src) + '" controls autoplay playsinline></video>';
    }
    stage.addEventListener('click', function (e) { if (e.target.closest('.mv-facade')) stage.innerHTML = playing(vids[active]); });
    host.addEventListener('click', function (e) {
      var t = e.target.closest('.mv-tab'); if (!t) return;
      host.querySelectorAll('.mv-tab').forEach(function (b) { b.classList.toggle('active', b === t); b.setAttribute('aria-selected', b === t); });
      active = +t.dataset.i; stage.innerHTML = facade(vids[active]);
    });
    stage.innerHTML = facade(vids[0]);
  })();

  /* ---------- Events grid + lightbox ---------- */
  (function () {
    var gallery = visible(Store.get('fazal_gallery')).filter(function (g) { return g.media && g.media.length; });
    var grid = $('eventsGrid'), filtersEl = $('eventFilters');
    if (!grid) return;
    var rank = { Milestone: 0, CreatorX: 0, Exchange: 1, University: 2, 'Industry Event': 3, Speaker: 4 };
    gallery = gallery.map(function (g, i) { return { g: g, i: i }; }).sort(function (a, b) {
      var ra = rank[a.g.category] != null ? rank[a.g.category] : 9, rb = rank[b.g.category] != null ? rank[b.g.category] : 9;
      return ra - rb || a.i - b.i;
    }).map(function (o) { return o.g; });

    function mediaOf(g) {
      return (g.media || []).map(function (m) {
        if (m.type === 'video') return { kind: 'video', embed: Util.videoEmbed(m.src), orient: m.orient || '', caption: m.caption || '' };
        return { kind: 'image', src: m.src, caption: m.caption || '' };
      }).filter(function (m) { return m.kind === 'image' || (m.embed && m.embed.type !== 'none'); });
    }
    grid.innerHTML = gallery.map(function (g, gi) {
      if (g.hideCard) return '';
      var media = mediaOf(g), imgs = media.filter(function (m) { return m.kind === 'image'; }), nv = media.length - imgs.length;
      var cover = imgs.length ? imgTag(imgs[0].src, '') : '';
      if (!cover) { var v = media.filter(function (m) { return m.kind === 'video'; })[0]; var ps = v && Util.videoPoster(v.embed); if (ps) cover = '<img src="' + esc(ps) + '" alt="" loading="lazy" onerror="this.remove()">'; }
      var counts = (imgs.length ? '<span>' + LI.image + imgs.length + '</span>' : '') + (nv ? '<span>' + LI.play + nv + '</span>' : '');
      var meta = [g.category === 'Milestone' ? '' : g.category, clean(g.date)].filter(Boolean).join(', ');
      return '<button type="button" class="ev" data-gi="' + gi + '" data-cat="' + esc(g.category) + '" data-role="' + esc((g.role || '').toLowerCase()) + '">' +
        '<span class="ev-cover">' + cover + (g.milestone ? '<span class="ev-mile">Milestone</span>' : '') + '<span class="ev-count">' + counts + '</span></span>' +
        (meta ? '<span class="ev-meta">' + esc(meta) + '</span>' : '') +
        '<h3>' + esc(noEmoji(g.title).replace(/\s+—\s+/, ', ')) + '</h3>' +
        '<span class="ev-role">' + esc([g.role, g.location].filter(Boolean).join(', ').replace(/\s*\/\s*/g, ' and ')) + '</span></button>';
    }).join('');

    // Portrait phone screenshots (Spaces, AMAs) show whole instead of cropped.
    grid.querySelectorAll('.ev-cover img').forEach(function (img) {
      function check() { if (img.naturalHeight > img.naturalWidth * 1.55) img.parentNode.classList.add('tall'); }
      if (img.complete && img.naturalWidth) check(); else img.addEventListener('load', check, { once: true });
    });

    if (filtersEl) {
      var cats = ['All'];
      gallery.forEach(function (g) { if (!g.hideCard && g.category && cats.indexOf(g.category) < 0) cats.push(g.category); });
      if (cats.length < 3) filtersEl.style.display = 'none';
      filtersEl.innerHTML = cats.map(function (f, i) {
        return '<button class="filter-btn' + (i ? '' : ' active') + '" aria-pressed="' + (i ? 'false' : 'true') + '" data-filter="' + esc(f) + '">' + esc(f === 'All' ? 'All events' : f) + '</button>';
      }).join('');
      filtersEl.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.filter-btn'); if (!btn || btn.classList.contains('active')) return;
        filtersEl.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn); });
        var f = btn.dataset.filter.toLowerCase(), items = grid.querySelectorAll('.ev');
        var flip = window.Flip && !reduceMotion ? Flip.getState(items) : null;
        items.forEach(function (it) {
          var match = f === 'all' || (it.dataset.cat || '').toLowerCase() === f || (it.dataset.role || '').indexOf(f) > -1;
          it.style.display = match ? '' : 'none';
        });
        grid.scrollLeft = 0;
        if (flip) Flip.from(flip, { duration: 0.45, ease: 'power3.out', onEnter: function (els) { return gsap.fromTo(els, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' }); } });
      });
    }

    var lb = $('lightbox'), lbStage = $('lbStage'), lbThumbs = $('lbThumbs'), lbTitle = $('lbTitle'), lbCount = $('lbCount'), lbCaption = $('lbCaption');
    var curMedia = [], curIdx = 0, curTitle = '', lastFocus = null;
    function renderStage() {
      var item = curMedia[curIdx]; if (!item) return;
      var pc = item.orient === 'portrait' ? ' class="lb-portrait"' : '';
      lbStage.innerHTML = item.kind === 'image' ? '<img src="' + esc(Util.imageUrl(item.src)) + '" alt="' + esc(item.caption || curTitle) + '">'
        : item.embed.type === 'iframe' ? '<iframe' + pc + ' src="' + esc(item.embed.src) + '" title="' + esc(curTitle) + '" allow="autoplay; fullscreen" allowfullscreen></iframe>'
        : '<video' + pc + ' src="' + esc(item.embed.src) + '" controls autoplay playsinline></video>';
      lbCount.textContent = (curIdx + 1) + ' of ' + curMedia.length;
      lbCaption.textContent = item.caption || ''; lbCaption.style.display = item.caption ? '' : 'none';
      Array.prototype.forEach.call(lbThumbs.children, function (b, i) { b.classList.toggle('active', i === curIdx); });
      var a = lbThumbs.children[curIdx]; if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    function openLightbox(gi) {
      var g = gallery[gi]; curMedia = mediaOf(g); if (!curMedia.length) return;
      // Photos first: most people open an event to see who was there.
      curMedia.sort(function (a, b) { return (a.kind === 'image' ? 0 : 1) - (b.kind === 'image' ? 0 : 1); });
      curIdx = 0; curTitle = g.title; lastFocus = document.activeElement;
      var t = noEmoji(g.title).replace(/\s+—\s+/, ', '), city = (g.location || '').split(',')[0].trim();
      lbTitle.textContent = t + (city && t.indexOf(city) < 0 ? ', ' + g.location : '');
      lbThumbs.innerHTML = curMedia.map(function (m, i) {
        return '<button data-i="' + i + '" aria-label="Item ' + (i + 1) + '">' + (m.kind === 'image' ? imgTag(m.src, '') : '<span class="vthumb">' + LI.play + '</span>') + '</button>';
      }).join('');
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
      renderStage(); $('lbClose').focus();
    }
    function closeLightbox() {
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbStage.innerHTML = ''; document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    function step(d) { if (curMedia.length) { curIdx = (curIdx + d + curMedia.length) % curMedia.length; renderStage(); } }
    grid.addEventListener('click', function (e) { var c = e.target.closest('.ev'); if (c) openLightbox(+c.dataset.gi); });
    openEventByTitle = function (title) {
      for (var i = 0; i < gallery.length; i++) if (gallery[i].title === title) { openLightbox(i); return; }
    };
    $('lbClose').addEventListener('click', closeLightbox);
    $('lbPrev').addEventListener('click', function () { step(-1); });
    $('lbNext').addEventListener('click', function () { step(1); });
    lbThumbs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { curIdx = +b.dataset.i; renderStage(); } });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
    });
    // swipe between photos on touch screens
    var sx = null;
    lbStage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lbStage.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); sx = null; });
  })();

  /* ---------- Affiliates ---------- */
  function svgFrom(sel) { var el = document.querySelector(sel); return el ? el.innerHTML : ''; }
  var AFF_MARK = {
    binance: { bg: '#1E2026', fg: '#F0B90B', html: svgFrom('.lg-binance') },
    okx: { bg: '#000', fg: '#fff', html: svgFrom('.lg-okx') },
    bitget: { bg: '#00F0FF', fg: '#000', html: '<img src="assets/logos/bitget.png" alt="">' },
    bybit: { bg: '#17181E', fg: '#fff', html: '<img src="assets/logos/bybit.png" alt="">' },
    mexc: { bg: '#fff', fg: '#000', html: '<img src="assets/logos/mexc.png" alt="" style="width:70%;height:70%;object-fit:contain">' },
    bingx: { bg: '#2A54FF', fg: '#fff', html: '<img src="assets/logos/bingx.png" alt="">' }
  };
  $('affGrid').innerHTML = visible(Store.get('fazal_affiliates')).map(function (a) {
    var mark = AFF_MARK[(a.name || '').toLowerCase()];
    var logo = a.logo ? '<span class="aff-logo" style="background:' + esc(a.color) + '"><img src="' + esc(Util.imageUrl(a.logo)) + '" alt=""></span>'
      : mark ? '<span class="aff-logo" style="background:' + mark.bg + ';color:' + mark.fg + '">' + mark.html + '</span>'
      : '<span class="aff-logo" style="background:' + esc(a.color) + '">' + esc((a.name || '?')[0]) + '</span>';
    var live = liveUrl(a.url);
    return '<div class="aff-card">' + logo + '<h3>' + esc(a.name) + '</h3><p>' + esc(a.desc) + '</p>' +
      (live ? '<p class="aff-offer">' + esc(a.offer) + '</p><a class="btn btn-secondary" href="' + esc(clean(a.url)) + '" ' + ext + '>' + esc(a.cta) + '</a>' : '') + '</div>';
  }).join('');

  /* ---------- Testimonials ---------- */
  $('testGrid').innerHTML = visible(Store.get('fazal_testimonials')).map(function (t) {
    return '<figure class="test-card"><blockquote class="q">“' + esc(t.quote) + '”</blockquote><figcaption class="test-author"><span class="test-avatar">' +
      (t.avatar ? '<img src="' + esc(Util.imageUrl(t.avatar)) + '" alt="">' : esc((t.name || '?')[0])) + '</span>' +
      '<span><span class="n">' + esc(t.name) + '</span><br><span class="t">' + esc(t.title) + '</span></span></figcaption></figure>';
  }).join('');

  /* ---------- Contact form → inquiries ----------
     1) Save to the admin "Inquiries" panel (Supabase).
     2) Also ping FAZAL.CONTACT_ENDPOINT (e.g. Formspree) when configured.
     3) If neither is available, open the visitor's mail app. */
  $('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target, fd = new FormData(form), san = FAZAL.Util.sanitize;
    var entry = { name: san(fd.get('name')), email: san(fd.get('email')), company: san(fd.get('company')),
      type: san(fd.get('type')), message: san(fd.get('message')), status: 'New', ts: new Date().toISOString() };
    var msg = $('formMsg'), endpoint = (FAZAL.CONTACT_ENDPOINT || '').trim(), btn = form.querySelector('button[type=submit]');
    function openMail() {
      var body = encodeURIComponent('Name: ' + entry.name + '\nEmail: ' + entry.email + '\nCompany: ' + entry.company + '\nType: ' + entry.type + '\n\n' + entry.message);
      window.location.href = 'mailto:' + p.email + '?subject=' + encodeURIComponent('Website inquiry: ' + entry.type) + '&body=' + body;
    }
    function done(text) { msg.textContent = text; form.reset(); btn.disabled = false; btn.textContent = 'Send message'; }
    if (Store.cloudEnabled || endpoint) {
      btn.disabled = true; btn.textContent = 'Sending'; msg.textContent = '';
      var jobs = [];
      if (Store.cloudEnabled) jobs.push(Promise.resolve(Store.submitInquiry(entry)));
      if (endpoint) {
        var body = new FormData();
        Object.keys(entry).forEach(function (k) { if (k !== 'status' && k !== 'ts') body.append(k, entry[k]); });
        jobs.push(fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: body }).then(function (r) { if (!r.ok) throw new Error('bad status'); }));
      }
      Promise.allSettled(jobs).then(function (res) {
        if (res.some(function (r) { return r.status === 'fulfilled'; })) done('Message sent. Fazal will reply to ' + entry.email + '.');
        else { done('Opening your email app to send it instead.'); openMail(); }
      });
    } else { done('Opening your email app to send it.'); openMail(); }
  });

  /* ===================================================================
     INTERACTIONS
     =================================================================== */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Section + part visibility from admin
  (function () {
    var vis = Store.get('fazal_sections') || {};
    ['roles','stats','about','content','community','regional','experience','kol','network-tree','cases','services','events','affiliates','social','testimonials'].forEach(function (id) {
      var el = $(id), hidden = vis[id] === false || !!(el && el.dataset.empty);
      if (el) el.style.display = hidden ? 'none' : '';
      document.querySelectorAll('.nav-links a[href="#' + id + '"], #mobileNav a[href="#' + id + '"]').forEach(function (a) {
        (a.closest('li') || a).style.display = hidden ? 'none' : '';
      });
    });
    var blocks = Store.get('fazal_blocks') || {};
    document.querySelectorAll('[data-block]').forEach(function (el) { if (blocks[el.getAttribute('data-block')] === false) el.style.display = 'none'; });
  })();

  initChrome.spy();

  // The contact dock steps aside while the contact section or footer is on screen
  var dock = $('dock');
  if (dock && !('IntersectionObserver' in window)) dock.classList.remove('away');
  if (dock && 'IntersectionObserver' in window) {
    var onScreen = new Set();
    var dio = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) { if (en.isIntersecting) onScreen.add(en.target); else onScreen.delete(en.target); });
      dock.classList.toggle('away', onScreen.size > 0);
    }, { threshold: 0.15 });
    [$('contact'), document.querySelector('footer'), $('hero')].forEach(function (el) { if (el) dio.observe(el); });
  }

  /* ---------- Motion (GSAP). Everything is visible without it. ----------
     Set up after load so it never competes with the first paint. Scroll-based
     moments use IntersectionObserver (cheap) instead of ScrollTrigger. */
  function whenSeen(el, fn, margin) {
    if (!el || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (ens) {
      if (ens.some(function (en) { return en.isIntersecting; })) { io.disconnect(); fn(); }
    }, { rootMargin: margin || '0px 0px -10% 0px' });
    io.observe(el);
  }
  function startMotion() {
    if (!window.gsap) return;
    if (window.Flip) gsap.registerPlugin(Flip);
    var mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      // Figures count up once, the first time the band is on screen
      var counters = document.querySelectorAll('[data-count]');
      var band = $('statsGrid');
      if (counters.length && band && band.getBoundingClientRect().top > window.innerHeight) {
        var jobs = [];
        counters.forEach(function (el) {
          var raw = el.dataset.count, num = parseFloat(raw.replace(/[^0-9.]/g, ''));
          if (isNaN(num) || num < 10) return;
          var pre = raw.match(/^[^0-9]*/)[0], suf = raw.replace(/^[^0-9]*[0-9.,]+/, ''), comma = raw.indexOf(',') > -1;
          jobs.push({ el: el, num: num, fmt: function (v) { return pre + (comma ? v.toLocaleString('en-US') : v) + suf; } });
        });
        jobs.forEach(function (j) { j.el.textContent = j.fmt(0); });
        whenSeen(band, function () {
          jobs.forEach(function (j) {
            var o = { v: 0 };
            gsap.to(o, { v: j.num, duration: 1.4, ease: 'power2.out', onUpdate: function () { j.el.textContent = j.fmt(Math.round(o.v)); } });
          });
        });
      }
      // Network wall: faces arrive in one wave from the middle
      var wall = $('ntWall');
      if (wall && wall.children.length && wall.getBoundingClientRect().top > window.innerHeight) {
        var chips = gsap.utils.toArray(wall.children);
        gsap.set(chips, { autoAlpha: 0, scale: 0.8 });
        whenSeen(wall, function () {
          gsap.to(chips, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out', stagger: { amount: 0.7, grid: 'auto', from: 'center' } });
        });
      }
    });
    // On desktop the pass follows the pointer a little, like a badge on a lanyard
    mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (min-width: 901px)', function () {
      var pass = $('pass'), hero = $('hero'); if (!pass || !hero) return;
      gsap.set(pass, { transformOrigin: '50% 0%' });
      var rot = gsap.quickTo(pass, 'rotation', { duration: 0.8, ease: 'power3.out' });
      function move(e) { var r = hero.getBoundingClientRect(); rot(((e.clientX - r.left) / r.width - 0.5) * 5); }
      function leave() { rot(0); }
      hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', leave);
      return function () { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); };
    });
  }
  function idle(fn) { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(fn, { timeout: 1500 }); }
  if (document.readyState === 'complete') idle(startMotion);
  else window.addEventListener('load', function () { idle(startMotion); }, { once: true });
})();
