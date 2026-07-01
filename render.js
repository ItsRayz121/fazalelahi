/* =====================================================================
   FAZAL ELAHI — Public site renderer
   Reads from FAZAL.Store (data.js) and paints every dynamic section.
   ===================================================================== */
(async function () {
  'use strict';
  var Store = FAZAL.Store, Util = FAZAL.Util, esc = Util.escape, clean = Util.clean;
  // True when a URL is real (not empty and not an unfilled [TOKEN]).
  function liveUrl(u) { return !!clean(u); }
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
  // Only show the Download CV button when a real file URL is set.
  var cvBtn = document.getElementById('cvBtn');
  if (liveUrl(p.cvUrl)) { cvBtn.href = clean(p.cvUrl); }
  else { cvBtn.style.display = 'none'; }

  document.getElementById('aboutCred').innerHTML = [
    '📍 Based in ' + esc(p.location),
    '⏱️ ' + esc('2.5 Years Daily Web3'),
    '📧 ' + esc(p.email),
    '💼 ' + esc(p.availability) + ' Available'
  ].map(function (t) { return '<span class="pill">' + t + '</span>'; }).join('');

  document.getElementById('tagCloud').innerHTML = (p.expertise || [])
    .map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');

  // Icon-only contact — raw email/number live in href only (privacy), never shown as text.
  function contactIcon(href, iconHTML, label, hd) {
    var isLink = href.indexOf('http') === 0;
    return '<a class="card contact-icon reveal" href="' + esc(href) + '" ' + (isLink ? ext + ' ' : '') +
      'aria-label="' + esc(label) + '"><span class="ci-ic">' + iconHTML + '</span>' +
      '<span class="ci-tx"><span class="ci-nm">' + esc(label) + '</span><span class="ci-hd">' + esc(hd) + '</span></span></a>';
  }
  document.getElementById('contactCards').innerHTML =
    contactIcon('mailto:' + p.email, '<span class="ci-emoji">✉️</span>', 'Email', 'Tap to email') +
    contactIcon(liveUrl(p.whatsapp) ? clean(p.whatsapp) : 'https://wa.me/', ICON.whatsapp, 'WhatsApp', 'Chat on WhatsApp') +
    contactIcon(liveUrl(p.linkedin) ? clean(p.linkedin) : 'https://linkedin.com/in/fazal-elahi', ICON.linkedin, 'LinkedIn', 'Connect') +
    '<div class="card contact-icon reveal"><span class="ci-ic"><span class="ci-emoji">🌍</span></span>' +
      '<span class="ci-tx"><span class="ci-nm">' + esc(p.location) + '</span><span class="ci-hd">' + esc(p.availability) + '</span></span></div>';

  /* ---------- Mini + footer social ---------- */
  var social = Store.get('fazal_social').filter(function (s) { return s.visible !== false; });
  function socialIconHTML(s) {
    return '<a href="' + esc(s.url) + '" ' + ext + ' aria-label="' + esc(s.platform) +
      '" style="color:' + esc(s.color) + '">' + iconFor(s.platform) + '</a>';
  }
  document.getElementById('heroSocial').innerHTML = social.map(socialIconHTML).join('');
  document.getElementById('footSocial').innerHTML = social.map(socialIconHTML).join('');
  // Compact discovery sets — nav (top picks) + mobile menu (all).
  var navSocialEl = document.getElementById('navSocial');
  var mobileSocialEl = document.getElementById('mobileSocial');
  if (navSocialEl) {
    var navPicks = ['youtube', 'telegram', 'twitter', 'whatsapp', 'linkedin'];
    var picked = navPicks.map(function (key) {
      return social.filter(function (s) { return (s.platform || '').toLowerCase().indexOf(key) > -1; })[0];
    }).filter(Boolean);
    navSocialEl.innerHTML = (picked.length ? picked : social.slice(0, 5)).map(socialIconHTML).join('');
  }
  if (mobileSocialEl) mobileSocialEl.innerHTML = social.map(socialIconHTML).join('');

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
    var subs = clean(c.subs);
    return '<div class="card channel-card reveal"><div class="yt c-red">' + ICON.youtube + '</div>' +
      '<h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p>' +
      (subs ? '<div class="metric">📺 ' + esc(subs) + ' subscribers</div>' : '') +
      '<a class="btn btn-gold shimmer" href="' + esc(c.url) + '" ' + ext + '>Subscribe</a></div>';
  }).join('');
  // Only render videos that resolve to a real embed — never show empty "add a
  // link" frames on the public site (admin still manages them in Content).
  var liveVideos = content.videos
    .map(function (v) { return Util.videoEmbed(v); })
    .filter(function (em) { return em.type === 'iframe' || em.type === 'video'; });
  var videosWrap = document.getElementById('videos');
  if (liveVideos.length) {
    videosWrap.innerHTML = liveVideos.map(function (em, i) {
      var inner = em.type === 'iframe'
        ? '<iframe src="' + esc(em.src) + '" title="Video ' + (i + 1) + '" allowfullscreen loading="lazy"></iframe>'
        : '<video src="' + esc(em.src) + '" controls playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;border:0;display:block"></video>';
      return '<div class="video-card reveal"><div class="frame">' + inner +
        '</div><div class="vt">Latest Upload ' + (i + 1) + '</div></div>';
    }).join('');
  } else {
    videosWrap.style.display = 'none'; // no videos set yet — collapse the row
  }
  document.getElementById('pillars').innerHTML = content.pillars.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
  document.getElementById('hashtags').innerHTML = content.hashtags.map(function (t) { return '<span class="chip hash">' + esc(t) + '</span>'; }).join('');

  /* ---------- Community ---------- */
  var comm = Store.get('fazal_community');
  document.getElementById('commGrid').innerHTML = comm.cards.filter(function (c) { return c.visible !== false; }).map(function (c) {
    var col = c.platform === 'whatsapp' ? '#25D366' : '#2AABEE';
    var ic = c.platform === 'whatsapp' ? ICON.whatsapp : ICON.telegram;
    var cnt = clean(c.count);
    return '<div class="card comm-card reveal"><div class="ico" style="background:' + col + '22;color:' + col + '">' + ic + '</div>' +
      '<h3>' + esc(c.name) + '</h3>' + (cnt ? '<div class="cnt">' + esc(cnt) + '</div>' : '') + '<p>' + esc(c.desc) + '</p>' +
      '<a class="btn btn-glass" href="' + esc(c.url) + '" ' + ext + '>' + esc(c.cta) + '</a></div>';
  }).join('');
  document.getElementById('featStrip').innerHTML = comm.features.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('');

  /* ---------- Regional Leadership cards ---------- */
  var regionGrid = document.getElementById('regionGrid');
  if (regionGrid) {
    regionGrid.innerHTML = (Store.get('fazal_regions') || []).filter(function (r) { return r.visible !== false; })
      .map(function (r) {
        var secondary = /secondary/i.test(r.tier || '');
        function row(ic, v) { return clean(v) ? '<div class="rc-row"><span class="ic">' + ic + '</span><span>' + esc(clean(v)) + '</span></div>' : ''; }
        return '<div class="card region-card reveal' + (secondary ? ' secondary' : '') + '">' +
          '<div class="rc-head"><span class="rc-flag">' + esc(r.flag) + '</span><span class="rc-name">' + esc(r.name) + '</span></div>' +
          (clean(r.tier) ? '<span class="rc-tier">' + esc(clean(r.tier)) + '</span>' : '') +
          (clean(r.reach) ? '<div class="rc-reach">' + esc(clean(r.reach)) + '</div>' : '') +
          row('👥', r.communities) + row('🗣️', r.languages) + row('⚡', r.activity) +
          '</div>';
      }).join('');
  }

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
    var initial = (String(k.name || '').replace(/^@/, '').charAt(0) || '?').toUpperCase();
    var avatar = clean(k.avatar)
      ? '<span class="kp-avatar"><img src="' + esc(Util.imageUrl(k.avatar)) + '" alt="' + esc(k.name) + '" loading="lazy"></span>'
      : '<span class="kp-avatar kp-initial">' + esc(initial) + '</span>';
    var followers = clean(k.followers);
    var country = clean(k.country);
    return '<a class="kol-partner reveal" href="' + esc(k.url) + '" ' + ext + '>' + avatar +
      '<span class="kp-body"><span class="kp-name">' + esc(k.name) + '</span>' +
      '<span class="kp-plat">' + esc(k.platform) + '</span>' +
      '<span class="kp-meta">' + (followers ? '<span>👥 ' + esc(followers) + '</span>' : '') +
        (country ? '<span>' + esc(country) + '</span>' : '') + '</span></span></a>';
  }).join('') + '<div class="kol-partner kp-more reveal">+ Dozens More<span class="kp-plat">in the Network</span></div>';
  document.getElementById('kolMarkets').innerHTML = kol.markets.map(function (m) { return '<span>' + esc(m.flag) + ' ' + esc(m.name) + '</span>'; }).join(' · ');
  document.getElementById('kolSynd').textContent = kol.syndicates;

  /* ---------- Work With Me (services) ---------- */
  var SVC_ICON = {
    kol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    growth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    region: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    ambassador: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5"/></svg>',
    generic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-3V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M9 7V5h6v2"/></svg>'
  };
  (function () {
    var svc = Store.get('fazal_services'); if (!svc) return;
    var introEl = document.getElementById('servicesIntro');
    if (introEl) introEl.textContent = svc.intro || '';
    var grid = document.getElementById('servicesGrid');
    if (grid) {
      grid.innerHTML = (svc.items || []).filter(function (s) { return s.visible !== false; }).map(function (s) {
        var pts = (s.points || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('');
        return '<div class="svc-card card reveal tilt">' +
          '<div class="svc-ico">' + (SVC_ICON[s.icon] || SVC_ICON.generic) + '</div>' +
          '<h3>' + esc(s.title) + '</h3>' +
          '<p class="svc-tag">' + esc(s.tagline) + '</p>' +
          (pts ? '<ul class="svc-points">' + pts + '</ul>' : '') +
          (clean(s.ideal) ? '<p class="svc-ideal"><span>Ideal for</span> ' + esc(s.ideal) + '</p>' : '') +
          '<a class="btn btn-emerald svc-cta" href="#contact">' + esc(s.cta || 'Get in Touch') + ' →</a>' +
          '</div>';
      }).join('');
    }
    var steps = document.getElementById('servicesSteps');
    if (steps) {
      steps.innerHTML = (svc.steps || []).map(function (st) {
        return '<div class="svc-step reveal"><span class="svc-step-n">' + esc(st.step) + '</span>' +
          '<h4>' + esc(st.title) + '</h4><p>' + esc(st.desc) + '</p></div>';
      }).join('');
    }
  })();

  /* ---------- Case studies ---------- */
  document.getElementById('caseList').innerHTML = Store.get('fazal_casestudies').filter(function (c) { return c.visible !== false; }).map(function (c) {
    return '<div class="card case-card reveal"><span class="badge">' + esc(c.badge) + '</span><h3>' + esc(c.title) + '</h3>' +
      '<div class="case-block"><strong>Challenge:</strong> ' + esc(c.challenge) + '</div>' +
      '<div class="case-block"><strong>Strategy:</strong> ' + esc(c.strategy) + '</div>' +
      '<div class="case-block"><strong>Results:</strong> ' + esc(c.results) + '</div>' +
      '<div class="metrics">' + c.metrics.map(function (m) { return '<span class="metric">' + esc(m) + '</span>'; }).join('') + '</div>' +
      '<div class="skills" style="margin:14px 0">' + c.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      (liveUrl(c.proofUrl) ? '<a class="btn btn-emerald" href="' + esc(clean(c.proofUrl)) + '" ' + ext + '>🔗 Live Proof</a>' : '') + '</div>';
  }).join('');

  /* ---------- Milestone banner: tabbed horizontal video player ----------
     Videos flagged `bannerVideo` in fazal_gallery render as tabs inside the
     milestone box. Each tab shows a poster + play icon; clicking loads the
     embed (Drive/YouTube iframe or direct <video>) and plays. */
  (function () {
    var host = document.getElementById('milestoneVideos');
    if (!host) return;
    var vids = (Store.get('fazal_gallery') || []).filter(function (g) {
      return g && g.visible !== false && g.bannerVideo;
    }).map(function (g) {
      var vm = (g.media || []).filter(function (m) { return m.type === 'video'; })[0];
      if (!vm) return null;
      var embed = Util.videoEmbed(vm.src);
      if (embed.type === 'none') return null;
      return { label: g.bannerLabel || g.title, title: g.title, embed: embed, poster: Util.videoPoster(embed) };
    }).filter(Boolean);

    if (!vids.length) { host.style.display = 'none'; return; }

    var tabsHTML = vids.length > 1
      ? '<div class="mv-tabs">' + vids.map(function (v, i) {
          return '<button class="mv-tab' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' + esc(v.label) + '</button>';
        }).join('') + '</div>'
      : '';
    host.innerHTML = tabsHTML + '<div class="mv-stage" id="mvStage"></div>';
    var stage = document.getElementById('mvStage');
    var active = 0;

    function facade(v) {
      var poster = v.poster ? '<img src="' + esc(v.poster) + '" alt="' + esc(v.title) + '" loading="lazy">' : '';
      return '<button class="mv-facade" aria-label="Play ' + esc(v.title) + '">' + poster +
        '<span class="mv-play"></span><span class="mv-cap">' + esc(v.label) + '</span></button>';
    }
    function playing(v) {
      if (v.embed.type === 'iframe')
        return '<iframe src="' + esc(v.embed.src) + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
      return '<video src="' + esc(v.embed.src) + '" controls autoplay playsinline preload="auto"></video>';
    }
    function showFacade(i) { active = i; stage.innerHTML = facade(vids[i]); }

    stage.addEventListener('click', function (e) {
      if (e.target.closest('.mv-facade')) stage.innerHTML = playing(vids[active]);
    });
    if (vids.length > 1) {
      host.addEventListener('click', function (e) {
        var t = e.target.closest('.mv-tab'); if (!t) return;
        var tabs = host.querySelectorAll('.mv-tab');
        for (var k = 0; k < tabs.length; k++) tabs[k].classList.toggle('active', tabs[k] === t);
        showFacade(parseInt(t.dataset.i, 10));
      });
    }
    showFacade(0);
  })();

  /* ---------- Events & Gallery (timeline + lightbox) ---------- */
  (function () {
    var gallery = (Store.get('fazal_gallery') || []).filter(function (g) {
      return g && g.visible !== false && (g.media && g.media.length);
    });
    var grid = document.getElementById('eventsGrid');
    var filtersEl = document.getElementById('eventFilters');
    if (!grid) return;

    var catColors = { CreatorX:'gold', Exchange:'emerald', University:'blue', 'Industry Event':'purple',
      Speaker:'red', Partnership:'purple', Campaign:'orange', Community:'emerald', Network:'emerald',
      Education:'blue', Milestone:'gold' };

    // Build a flat media list per event (images + valid videos), each with caption.
    function mediaOf(g) {
      return (g.media || []).map(function (m) {
        if (m.type === 'video') return { kind: 'video', embed: Util.videoEmbed(m.src), orient: m.orient || '', caption: m.caption || '' };
        return { kind: 'image', src: m.src, caption: m.caption || '' };
      }).filter(function (m) { return m.kind === 'image' || (m.embed && m.embed.type !== 'none'); });
    }
    function counts(g) {
      var imgs = 0, vids = 0;
      (g.media || []).forEach(function (m) {
        if (m.type === 'video') { if (Util.videoEmbed(m.src).type !== 'none') vids++; }
        else imgs++;
      });
      return { imgs: imgs, vids: vids };
    }
    grid.className = 'timeline';
    grid.innerHTML = gallery.map(function (g, gi) {
      if (g.hideCard) return ''; // shown in the milestone banner player instead of the timeline
      var col = badgeColor(catColors[g.category] || 'gold');
      var c = counts(g), media = mediaOf(g);
      // Cover slideshow uses only the images (videos play in the lightbox on click).
      var imgSlides = [];
      media.forEach(function (m, k) { if (m.kind === 'image') imgSlides.push({ src: m.src, mi: k }); });
      // Video-only events have no photo cover — fall back to the first video's thumbnail.
      if (!imgSlides.length) {
        for (var vp = 0; vp < media.length; vp++) {
          if (media[vp].kind === 'video') {
            var poster = Util.videoPoster(media[vp].embed);
            if (poster) { imgSlides.push({ src: poster, mi: vp, poster: true }); break; }
          }
        }
      }
      var slidesHTML = imgSlides.length
        ? '<div class="tl-slides">' + imgSlides.map(function (o, si) {
            return '<div class="tl-slide' + (si === 0 ? ' active' : '') + '" data-mi="' + o.mi + '">' +
              '<img src="' + esc(o.poster ? o.src : Util.imageUrl(o.src)) + '" alt="' + esc(g.title) + '" loading="lazy"></div>';
          }).join('') + '</div>'
        : '';
      var navHTML = imgSlides.length > 1
        ? '<button class="tl-arrow tl-prev" aria-label="Previous photo">‹</button>' +
          '<button class="tl-arrow tl-next" aria-label="Next photo">›</button>' +
          '<div class="tl-dots">' + imgSlides.map(function (_, si) {
            return '<span class="tl-cdot' + (si === 0 ? ' active' : '') + '" data-si="' + si + '"></span>';
          }).join('') + '</div>'
        : '';
      var tags = (c.imgs ? '<span class="cat-badge" style="background:rgba(7,7,15,.7);color:#fff">📷 ' + c.imgs + '</span>' : '') +
        (c.vids ? '<span class="cat-badge" style="background:rgba(255,59,59,.85);color:#fff">▶ ' + c.vids + '</span>' : '');
      return '<div class="tl-item reveal" data-cat="' + esc(g.category) + '" data-role="' + esc((g.role || '').toLowerCase()) + '">' +
        '<div class="tl-dot"></div>' +
        '<div class="tl-card gcard" data-gi="' + gi + '" role="button" tabindex="0" aria-label="Open gallery for ' + esc(g.title) + '">' +
          '<div class="tl-cover">' + slidesHTML + navHTML +
            '<div class="tl-tags">' + tags + '</div>' +
            (g.milestone ? '<span class="tl-mile">🏆 Milestone</span>' : '') + '</div>' +
          '<div class="tl-body">' +
            (g.date ? '<div class="tl-date">' + esc(g.date) + '</div>' : '') +
            '<h4>' + esc(g.title) + '</h4>' +
            '<div class="event-meta">' +
              '<span class="cat-badge" style="background:' + col + '22;color:' + col + '">' + esc(g.category) + '</span>' +
              (g.role ? '<span class="cat-badge" style="background:var(--glass);color:var(--silver)">' + esc(g.role) + '</span>' : '') +
              (g.location ? '<span class="cat-badge" style="background:var(--glass);color:var(--muted)">📍 ' + esc(g.location) + '</span>' : '') +
            '</div>' +
          '</div>' +
        '</div></div>';
    }).join('');

    // Auto-rotating cover slideshows (staggered, pause on hover, reduced-motion aware).
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    Array.prototype.forEach.call(grid.querySelectorAll('.tl-item'), function (item, gi) {
      var cover = item.querySelector('.tl-cover'); if (!cover) return;
      var slides = cover.querySelectorAll('.tl-slide');
      var dots = cover.querySelectorAll('.tl-cdot');
      if (slides.length < 2) return;
      var idx = 0, timer = null;
      function show(n) {
        idx = (n + slides.length) % slides.length;
        for (var k = 0; k < slides.length; k++) slides[k].classList.toggle('active', k === idx);
        for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('active', d === idx);
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function start() { if (reduceMotion) return; stop(); timer = setInterval(function () { show(idx + 1); }, 3500); }
      var prev = cover.querySelector('.tl-prev'), next = cover.querySelector('.tl-next');
      if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); stop(); show(idx - 1); start(); });
      if (next) next.addEventListener('click', function (e) { e.stopPropagation(); stop(); show(idx + 1); start(); });
      Array.prototype.forEach.call(dots, function (dot) {
        dot.addEventListener('click', function (e) { e.stopPropagation(); stop(); show(+dot.dataset.si); start(); });
      });
      cover.addEventListener('mouseenter', stop);
      cover.addEventListener('mouseleave', start);
      cover._activeMi = function () { var s = slides[idx]; return s ? +s.getAttribute('data-mi') : 0; };
      setTimeout(start, 500 + gi * 500); // stagger so cards don't flip in unison
    });

    // Filters from the categories actually present.
    if (filtersEl) {
      var cats = ['All'];
      gallery.forEach(function (g) { if (!g.hideCard && g.category && cats.indexOf(g.category) < 0) cats.push(g.category); });
      filtersEl.innerHTML = cats.map(function (f, i) {
        return '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" data-filter="' + esc(f) + '">' + esc(f) + '</button>';
      }).join('');
      filtersEl.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.filter-btn'); if (!btn) return;
        filtersEl.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.dataset.filter.toLowerCase();
        grid.querySelectorAll('.tl-item').forEach(function (item) {
          var match = f === 'all' || (item.dataset.cat || '').toLowerCase() === f ||
            (item.dataset.role || '').indexOf(f) > -1;
          item.style.display = match ? '' : 'none';
        });
      });
    }

    // ---- Lightbox ----
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var lbStage = document.getElementById('lbStage');
    var lbThumbs = document.getElementById('lbThumbs');
    var lbTitle = document.getElementById('lbTitle');
    var lbCount = document.getElementById('lbCount');
    var lbCaption = document.getElementById('lbCaption');
    var curMedia = [], curIdx = 0, curTitle = '';

    function renderStage() {
      var item = curMedia[curIdx]; if (!item) return;
      var html;
      var pc = item.orient === 'portrait' ? ' class="lb-portrait"' : '';
      if (item.kind === 'image') html = '<img src="' + esc(Util.imageUrl(item.src)) + '" alt="' + esc(item.caption || curTitle) + '">';
      else if (item.embed.type === 'iframe') html = '<iframe' + pc + ' src="' + esc(item.embed.src) + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
      else html = '<video' + pc + ' src="' + esc(item.embed.src) + '" controls autoplay playsinline></video>';
      lbStage.innerHTML = html;
      lbCount.textContent = (curIdx + 1) + ' / ' + curMedia.length;
      if (lbCaption) { lbCaption.textContent = item.caption || ''; lbCaption.style.display = item.caption ? '' : 'none'; }
      Array.prototype.forEach.call(lbThumbs.children, function (b, i) { b.classList.toggle('active', i === curIdx); });
      var active = lbThumbs.children[curIdx];
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    function openLightbox(gi, start) {
      var g = gallery[gi]; curMedia = mediaOf(g);
      if (!curMedia.length) return;
      curIdx = (start && start < curMedia.length) ? start : 0; curTitle = g.title;
      lbTitle.textContent = g.title + (g.location ? ' — ' + g.location : '');
      lbThumbs.innerHTML = curMedia.map(function (m, i) {
        var inner = m.kind === 'image' ? '<img src="' + esc(Util.imageUrl(m.src)) + '" alt="thumb ' + (i + 1) + '" loading="lazy">' : '<span class="vthumb">▶</span>';
        return '<button data-i="' + i + '" aria-label="Item ' + (i + 1) + '">' + inner + '</button>';
      }).join('');
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; renderStage();
    }
    function closeLightbox() {
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
      lbStage.innerHTML = ''; document.body.style.overflow = '';
    }
    function step(d) { if (!curMedia.length) return; curIdx = (curIdx + d + curMedia.length) % curMedia.length; renderStage(); }

    grid.addEventListener('click', function (e) {
      if (e.target.closest('.tl-arrow') || e.target.closest('.tl-cdot')) return; // carousel controls, not open
      var card = e.target.closest('.gcard'); if (!card) return;
      var cover = card.querySelector('.tl-cover');
      var start = (cover && cover._activeMi) ? cover._activeMi() : 0;
      openLightbox(parseInt(card.dataset.gi, 10), start);
    });
    grid.addEventListener('keydown', function (e) {
      var card = e.target.closest('.gcard'); if (!card) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(parseInt(card.dataset.gi, 10)); }
    });
    document.getElementById('lbClose').addEventListener('click', closeLightbox);
    document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
    document.getElementById('lbNext').addEventListener('click', function () { step(1); });
    lbThumbs.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      curIdx = parseInt(b.dataset.i, 10); renderStage();
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  })();

  /* ---------- Affiliates ---------- */
  document.getElementById('affGrid').innerHTML = Store.get('fazal_affiliates').filter(function (a) { return a.visible !== false; }).map(function (a) {
    var affLogo = a.logo
      ? '<div class="aff-logo" style="background:' + esc(a.color) + ';overflow:hidden;padding:0"><img src="' + esc(Util.imageUrl(a.logo)) + '" alt="' + esc(a.name) + '" style="width:100%;height:100%;object-fit:cover"></div>'
      : '<div class="aff-logo" style="background:' + esc(a.color) + '">' + esc(a.name[0]) + '</div>';
    var affCta = liveUrl(a.url)
      ? '<a class="btn btn-gold shimmer" href="' + esc(clean(a.url)) + '" ' + ext + '>' + esc(a.cta) + '</a>'
      : '<span class="btn btn-glass" style="opacity:.55;cursor:default" aria-disabled="true">Link Coming Soon</span>';
    return '<div class="card aff-card reveal tilt">' + affLogo +
      '<h3>' + esc(a.name) + '</h3><p>' + esc(a.desc) + '</p><p class="aff-offer">' + esc(a.offer) + '</p>' +
      affCta + '</div>';
  }).join('');

  /* ---------- Social hub ---------- */
  document.getElementById('socialGrid').innerHTML = social.map(function (s) {
    var scount = clean(s.count);
    return '<a class="card social-card reveal" href="' + esc(s.url) + '" ' + ext + ' aria-label="' + esc(s.platform) + '">' +
      '<span style="color:' + esc(s.color) + '">' + iconFor(s.platform) + '</span>' +
      '<span><span class="nm">' + esc(s.platform) + '</span><br><span class="hd">' + esc(s.handle) + (scount ? ' · ' + esc(scount) : '') + '</span></span></a>';
  }).join('');

  /* ---------- Testimonials ---------- */
  document.getElementById('testGrid').innerHTML = Store.get('fazal_testimonials').filter(function (t) { return t.visible !== false; }).map(function (t) {
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
      type: san(fd.get('type')), message: san(fd.get('message')) };
    var msg = document.getElementById('formMsg');
    function openMail() {
      var body = encodeURIComponent('Name: ' + entry.name + '\nEmail: ' + entry.email + '\nCompany: ' +
        entry.company + '\nType: ' + entry.type + '\n\n' + entry.message);
      window.location.href = 'mailto:' + p.email + '?subject=' +
        encodeURIComponent('Website Inquiry — ' + entry.type) + '&body=' + body;
    }
    var endpoint = (FAZAL.CONTACT_ENDPOINT || '').trim();
    if (endpoint) { // Formspree (or similar) — visitor stays on the page
      msg.style.color = 'var(--silver)'; msg.textContent = 'Sending…';
      var body = new FormData();
      Object.keys(entry).forEach(function (k) { body.append(k, entry[k]); });
      fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          msg.style.color = 'var(--emerald)';
          msg.textContent = "✅ Message sent! I'll get back to you soon.";
          e.target.reset();
        })
        .catch(function () { msg.style.color = 'var(--emerald)'; msg.textContent = '✅ Opening your email app…'; openMail(); });
    } else { // no service configured — open the visitor's email app
      msg.style.color = 'var(--emerald)'; msg.textContent = '✅ Opening your email app…';
      openMail(); e.target.reset();
    }
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

  // Whole-section show/hide. Hidden sections are removed from flow (display:none),
  // so the next section moves up naturally with no empty gap. Hero + contact are
  // always shown (core); everything else is toggle-able from the admin.
  (function applySectionVisibility() {
    var vis = Store.get('fazal_sections') || {};
    var toggleable = ['roles','stats','about','content','community','regional','experience',
      'kol','cases','services','events','affiliates','social','testimonials'];
    toggleable.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = (vis[id] === false) ? 'none' : '';
    });
  })();

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
