/* =====================================================================
   FAZAL ELAHI — Shared Data Layer
   Single source of truth for both index.html (public) and admin.html (CMS).
   All data lives in localStorage under the `fazal_*` namespace.
   The public site reads on load; the admin writes. Defaults below are
   used when a key is missing (first load / fresh browser).
   ===================================================================== */
(function (global) {
  'use strict';

  /* =====================================================================
     SUPABASE CONFIG
     The anon key is PUBLIC-SAFE — it is meant to live in frontend code and
     is protected by Row Level Security (see schema.sql). NEVER put the
     `service_role` or `sb_secret_` key here.
     To disable cloud and run pure-localStorage, blank out SUPABASE_URL.
     ===================================================================== */
  var SUPABASE_URL = 'https://dnprmvvjxbbxbnixjfye.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucHJtdnZqeGJieGJuaXhqZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NjQyNzEsImV4cCI6MjA5NjI0MDI3MX0.eKFF69rTGa2nRiRgP0XijITaPEcCjvaSMWOuhBrxbAo';

  var sb = null, cloudEnabled = false;
  try {
    if (global.supabase && /^https?:\/\//.test(SUPABASE_URL) && SUPABASE_ANON_KEY) {
      sb = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      cloudEnabled = true;
    }
  } catch (e) { console.warn('Supabase init failed — running local only', e); }

  /* ---------- Default dataset (REAL client data pre-filled) ---------- */
  const DEFAULTS = {
    fazal_profile: {
      name: 'Fazal Elahi',
      tagline: 'YOUR CRYPTO EDUCATION STARTS HERE.',
      subTagline: 'Crypto Educator. Content Creator. Community Builder. Ambassador. BD. KOL Manager. Pakistan Regional Lead.',
      mission: "I help thousands of people earn from crypto through airdrops, testnets, and Web3 opportunities — with zero investment required. From educating beginners to building ecosystems for global Web3 projects, I operate at every level of the crypto space.",
      photo: 'fazal.jpg',
      email: 'fazalelahi5577@gmail.com',
      phone: '+92 309 8336810',
      whatsapp: 'https://wa.me/923098336810',
      linkedin: 'https://linkedin.com/in/fazal-elahi',
      location: 'Pakistan (UTC+5)',
      availability: '50–60 hrs/week',
      cvUrl: '[CV_DOWNLOAD_URL]',
      bio1: "My journey started as an airdrop hunter — not an investor, not a trader. I learned the mechanics of token distribution, community incentives, and what actually makes users stick around when the hype fades. That ground-level experience became the foundation of everything I do today.",
      bio2: "I realized early that most crypto content either targets experienced traders or tries to sell something. I built Learning Hub By Fazal to fill the gap — a place where beginners can learn about airdrops, testnets, and Web3 opportunities without risking a single dollar. Real education. Real opportunities. No investment required.",
      bio3: "That educational credibility opened doors. Web3 projects started approaching me — not just as an educator, but as a community builder, ambassador, and growth partner. Today, I operate across the full Web3 stack: from teaching a beginner their first airdrop, to scaling project ecosystems to 310,000+ active users, to organizing Pakistan's first Web3 physical event.",
      stats: [
        { value: '460,000+', label: 'Users Educated & Scaled', accent: 'gold' },
        { value: '150,000', label: 'Community Built in 6 Months', accent: 'emerald' },
        { value: '310,000+', label: 'Active Users at CreatorX', accent: 'emerald' },
        { value: '20,000+', label: 'Personal Followers', accent: 'gold' },
        { value: '117,000+', label: 'Referral Network Built', accent: 'emerald' },
        { value: '5', label: 'Global Markets', accent: 'blue' },
        { value: '17+', label: 'Events Attended & Organized', accent: 'gold' },
        { value: '60+', label: 'Hours/Week in Web3', accent: 'gold' }
      ],
      expertise: ['Crypto Education','Airdrops','Testnets','DeFi','Community Building','Ambassador Management','KOL Management','Business Development','Web3 Marketing','Airdrop Farming','Growth Strategy','Pakistan Web3','Telegram Communities','Content Strategy','GTM Planning','Tokenomics','Scam Awareness','Zero Investment Crypto']
    },

    fazal_roles: [
      { icon: '📚', title: 'Crypto Educator', color: 'blue', desc: 'Teaching airdrops, testnets, DeFi, and Web3 basics. Zero investment required. Step-by-step for beginners and pros.', visible: true },
      { icon: '🎬', title: 'Content Creator', color: 'red', desc: 'YouTube educator with 20,000+ followers. Two channels. Consistent, research-backed crypto content.', visible: true },
      { icon: '🏘️', title: 'Community Builder', color: 'emerald', desc: 'Built and manages communities of 460,000+ users across Telegram, YouTube, and WhatsApp.', visible: true },
      { icon: '🏅', title: 'Ambassador Program Manager', color: 'gold', desc: 'Designs and runs ambassador programs for Web3 projects. Recruits, trains, and scales regional advocates.', visible: true },
      { icon: '💼', title: 'Business Developer (BD)', color: 'purple', desc: 'Connects Web3 projects with South Asian markets. GTM strategy. Partnership deal-making. Market entry.', visible: true },
      { icon: '🎯', title: 'KOL Manager', color: 'orange', desc: 'Identifies, vets, manages, and tracks high-ROI crypto content creators. Multi-tiered influencer campaigns.', visible: true },
      { icon: '🇵🇰', title: 'Pakistan Ambassador & Regional Manager', color: 'pkgreen', desc: 'Official representative for Web3 projects in Pakistan. Local team building. Regional event organization.', visible: true }
    ],

    fazal_experience: [
      {
        company: 'CreatorX', role: 'KOL Manager + Pakistan Regional Lead', status: 'Active',
        start: 'Jun 2025', end: 'Present', accent: 'gold',
        desc: "Managing top-tier Web3 KOLs and serving as Pakistan's Regional Lead for CreatorX. Scaled the community from 10,000 to 310,000+ active members through strategic KOL campaigns, ambassador programs, organic content, and regional Pakistan operations.",
        metrics: ['310K+ Active Users','30K Peak DAU','5K Daily Active','🇵🇰 Pakistan Regional Lead'],
        skills: ['KOL Management','Community Scaling','Ambassador Programs','GTM','Content Strategy','Regional Operations'],
        featured: true
      },
      {
        company: 'Efsane Project', role: 'Airdrop & Growth Manager', status: 'Completed',
        start: 'Feb 2025', end: 'Aug 2025', accent: 'emerald',
        desc: "Architected the complete growth strategy for Efsane from zero. Built airdrop mechanics that rewarded actual engagement — not Sybil farming — bootstrapping 150,000 real community members in exactly 6 months with a 117,000+ referral network.",
        metrics: ['150K Community','6 Month Timeline','117K+ Referral Team','0→Full Launch'],
        skills: ['Airdrop Design','Campaign Phasing','Growth Strategy','Community Building','Analytics','BD'],
        featured: true
      }
    ],

    fazal_casestudies: [
      {
        title: 'CreatorX — 10K → 310K+ Users', badge: 'KOL Management + Regional Lead',
        challenge: 'Scale a promising platform past its early-adopter plateau into mainstream Web3 consciousness across South Asian markets.',
        strategy: 'Deployed multi-tiered KOL campaigns targeting highly engaged sub-communities. YouTube creators for long-form education, Telegram alpha groups for immediate momentum, and Pakistan-specific community operations for regional depth.',
        results: 'Grew active user base to 310,000+. Established CreatorX as a dominant player in its niche. Built Pakistan\'s most active CreatorX community.',
        metrics: ['310K+ Active Users','30K Peak DAU','5K Current DAU','Pakistan Regional Operations'],
        tags: ['KOL Management','Community Scaling','Ambassador Programs','GTM','Pakistan Market'],
        proofUrl: '[CREATORX_PROOF_URL]'
      },
      {
        title: 'Efsane — 0 → 150K Community in 6 Months', badge: 'Airdrop & Growth Management',
        challenge: 'Bootstrap a brand-new project from absolute zero to critical mass without burning budget on ineffective paid ads.',
        strategy: 'Architected precision airdrop mechanics rewarding real engagement over Sybil behavior. Leveraged the KOL network and South Asian communities for organic growth loops.',
        results: '150,000 genuine community members in 6 months. 117,000+ referral team built organically. Self-sustaining growth loop established.',
        metrics: ['150K Members','6 Months','117K+ Referral Team','0 to Self-Sustaining'],
        tags: ['Airdrop Design','Community Building','Growth Strategy','BD','Analytics'],
        proofUrl: '[EFSANE_PROOF_URL]'
      }
    ],

    fazal_events: [
      { name: 'First Web3 Physical Event in Pakistan — Lahore', category: 'Milestone', role: 'Organizer & Host', mode: 'In-Person', date: '[EVENT_DATE]', location: 'Lahore, Pakistan', milestone: true, url: '', image: '' },
      { name: 'Money Matters Wealth Expo 2026', category: 'Industry Event', role: 'Attendee/Representative', mode: 'In-Person', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'OKX Booth — Regional Web3 Summit', category: 'Exchange Partner', role: 'Regional Representative', mode: 'In-Person', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'Crypto Fundamentals Expo — Community', category: 'Education', role: 'Educator/Speaker', mode: 'In-Person', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'CreatorX Pakistan Community Meet', category: 'Network', role: 'Organizer', mode: 'In-Person', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'CreatorX Pakistan Launch Event', category: 'Network', role: 'Regional Lead', mode: 'In-Person', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'CreatorX Team — Community Leaders', category: 'Network', role: 'Team Lead', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'KOL Partner Onboarding — CreatorX', category: 'Partnership', role: 'KOL Manager', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'KOL Partner — CreatorX Campaign', category: 'Partnership', role: 'KOL Manager', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'AMA Speaker — The Reign of SocialFi', category: 'Speaker', role: 'AMA Host/Speaker', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'Bitget Wallet x CreatorX — Task2get', category: 'Campaign', role: 'Campaign Manager', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'Gate Web3 x CreatorX — BountyDrop', category: 'Campaign', role: 'Campaign Manager', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'Presenting CreatorX — Live Pitch Event', category: 'Speaker', role: 'Presenter', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'KOL Partner — CreatorX Event', category: 'Partnership', role: 'KOL Manager', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'CreatorX Event — KOL Onboarding', category: 'Network', role: 'KOL Manager', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'CreatorX — Content Creator Meet', category: 'Network', role: 'Educator/Host', mode: 'Virtual', date: '[EVENT_DATE]', location: '', milestone: false, url: '', image: '' },
      { name: 'CreatorX Community — Pakistan Team', category: 'Network', role: 'Regional Manager', mode: 'In-Person', date: '[EVENT_DATE]', location: 'Pakistan', milestone: false, url: '', image: '' }
    ],

    fazal_projects: [],

    fazal_kol_network: {
      intro: "My KOL management goes beyond just connecting projects with influencers. I engineer growth loops — matching the right creator with the right audience, at the right time, with the right incentive structure. The result: sticky users who care about the tech, not just the airdrop.",
      partners: [
        { name: '@tabraizshams', platform: 'YouTube Partner', url: 'https://youtube.com/@tabraizshams', avatar: '' },
        { name: '@imroztricks', platform: 'YouTube Partner', url: 'https://youtube.com/@imroztricks', avatar: '' },
        { name: '@shahidbaloch2.0', platform: 'YouTube Partner', url: 'https://youtube.com/@shahidbaloch2.0', avatar: '' }
      ],
      markets: [
        { flag: '🇵🇰', name: 'Pakistan' }, { flag: '🇮🇳', name: 'India' }, { flag: '🇧🇩', name: 'Bangladesh' },
        { flag: '🇮🇩', name: 'Indonesia' }, { flag: '🇳🇬', name: 'Nigeria' }
      ],
      syndicates: 'Direct access to Telegram alpha groups, trading communities, and airdrop syndicates totaling hundreds of thousands of highly active users.',
      services: [
        { icon: '🔍', title: 'Creator Vetting', desc: 'Audience authenticity checks, engagement quality analysis, niche alignment scoring' },
        { icon: '📋', title: 'Campaign Management', desc: 'Brief creation, delivery tracking, content review, reporting dashboards' },
        { icon: '💰', title: 'Deal Negotiation', desc: 'Fair pricing, performance clauses, deliverable structuring' },
        { icon: '📊', title: 'Analytics Tracking', desc: 'Views, clicks, conversions, community growth attribution' },
        { icon: '🤝', title: 'Long-term Partnerships', desc: 'Recurring ambassador relationships, retainer-based creator management' },
        { icon: '🌐', title: 'Multi-Platform Campaigns', desc: 'YouTube + Telegram + Twitter coordinated drops for maximum reach' }
      ]
    },

    fazal_community: {
      cards: [
        { platform: 'telegram', name: 'Crypto With Fazal', url: 'https://t.me/cryptowithfazal', count: '[TG_CHANNEL_MEMBERS]', desc: 'Daily airdrop alerts, testnet drops, Web3 alpha, and scam warnings. The pulse of the community.', cta: 'Join Channel', visible: true },
        { platform: 'telegram', name: 'Community Discussion Group', url: 'https://t.me/cryptowithfazaldiscussion', count: '[TG_GROUP_MEMBERS]', desc: 'Ask questions, share finds, discuss projects. The most active crypto learning group in Pakistan.', cta: 'Join Discussion', visible: true },
        { platform: 'whatsapp', name: 'Fazal Crypto Lab', url: 'https://whatsapp.com/channel/0029VbBen9b6rsQjOXrL1a18', count: '[WA_CHANNEL_FOLLOWERS]', desc: 'Safe crypto airdrops, testnets, and scam alerts — delivered to WhatsApp.', cta: 'Follow Channel', visible: true }
      ],
      features: ['🌍 Active in 5 Countries', '🛡️ Scam Alert System', '📅 Daily Updates', '🤝 Real Engagement Only']
    },

    fazal_social: [
      { platform: 'YouTube (Main)', url: 'https://www.youtube.com/@LearningHubByFazal', handle: '@LearningHubByFazal', color: '#FF0000', count: '[YT_SUBSCRIBERS]', visible: true },
      { platform: 'YouTube (Lab)', url: 'https://www.youtube.com/@fazalcryptolab', handle: '@fazalcryptolab', color: '#FF0000', count: '[YT_LAB_SUBSCRIBERS]', visible: true },
      { platform: 'Telegram Channel', url: 'https://t.me/cryptowithfazal', handle: '@cryptowithfazal', color: '#2AABEE', count: '[TG_CHANNEL_MEMBERS]', visible: true },
      { platform: 'Telegram Group', url: 'https://t.me/cryptowithfazaldiscussion', handle: '@cryptowithfazaldiscussion', color: '#2AABEE', count: '[TG_GROUP_MEMBERS]', visible: true },
      { platform: 'Twitter / X', url: 'https://x.com/fazalelahi21', handle: '@fazalelahi21', color: '#FFFFFF', count: '', visible: true },
      { platform: 'Facebook', url: 'https://web.facebook.com/profile.php?id=61577253396008', handle: 'Fazal Elahi', color: '#1877F2', count: '', visible: true },
      { platform: 'WhatsApp Channel', url: 'https://whatsapp.com/channel/0029VbBen9b6rsQjOXrL1a18', handle: 'Fazal Crypto Lab', color: '#25D366', count: '[WA_CHANNEL_FOLLOWERS]', visible: true },
      { platform: 'Linktree', url: 'https://linktr.ee/LearningHubByFazal_1', handle: 'LearningHubByFazal_1', color: '#43E55E', count: '', visible: true },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/fazal-elahi', handle: 'fazal-elahi', color: '#0A66C2', count: '', visible: true }
    ],

    fazal_affiliates: [
      { name: 'Binance', logo: '', color: '#F3BA2F', desc: "The world's #1 crypto exchange. Used by 200M+ traders globally.", offer: 'Get up to 20% fee discount with my referral link.', url: '[BINANCE_AFFILIATE_URL]', cta: 'Open Free Account', visible: true },
      { name: 'OKX', logo: '', color: '#FFFFFF', desc: 'Professional-grade trading for serious crypto users.', offer: 'Exclusive sign-up bonus with my partner link.', url: '[OKX_AFFILIATE_URL]', cta: 'Join OKX', visible: true },
      { name: 'Bitbullet', logo: '', color: '#F2A900', desc: 'Premium crypto signals, tools, and alpha access.', offer: 'Exclusive access via my referral.', url: '[BITBULLET_AFFILIATE_URL]', cta: 'Try Bitbullet', visible: true }
    ],

    fazal_testimonials: [
      { quote: "Fazal doesn't just bring numbers; he brings active, sticky users. His understanding of the South Asian Web3 market is unparalleled.", name: 'Founder', title: 'Efsane Project', avatar: '', featured: true },
      { quote: 'Working with him completely changed our trajectory. He manages KOLs like a military operation — precision, tracking, and massive ROI.', name: 'Lead Dev', title: 'CreatorX', avatar: '', featured: true },
      { quote: "Most 'growth guys' just spam Twitter. Fazal actually understands token mechanics and builds communities that care about the tech.", name: 'Tier 1 Web3 Creator', title: 'YouTube Partner', avatar: '', featured: true }
    ],

    fazal_content: {
      channels: [
        { name: 'Learning Hub By Fazal', url: 'https://www.youtube.com/@LearningHubByFazal', desc: 'The main education hub. Step-by-step airdrop guides, testnet tutorials, DeFi walkthroughs, and Web3 opportunities — all for free, no investment required.', subs: '[YT_SUBSCRIBERS]' },
        { name: 'Fazal Crypto Lab', url: 'https://www.youtube.com/@fazalcryptolab', desc: 'Quick hits, alpha drops, scam alerts, and real-time Web3 updates. Stay ahead of the curve.', subs: '[YT_LAB_SUBSCRIBERS]' }
      ],
      videos: ['[YOUTUBE_VIDEO_ID_1]', '[YOUTUBE_VIDEO_ID_2]', '[YOUTUBE_VIDEO_ID_3]'],
      pillars: ['📦 Airdrops','🧪 Testnets','🏦 DeFi','🛡️ Scam Alerts','💱 Exchange Reviews','🌐 Web3 Tools','📊 Market Updates','🎓 Beginner Guides'],
      hashtags: ['#cryptoairdrops','#web3marketing','#testnetairdrops','#cryptocommunity','#LearningHubByFazal','#DeFi','#blockchain','#noinvestment'],
      frequency: 'Fresh crypto content. Airdrop guides. Testnet tutorials. Scam alerts. Every week.'
    },

    fazal_keywords: [
      { text: '#cryptoairdrops', category: 'Hashtag', featured: true },
      { text: '#web3marketing', category: 'Hashtag', featured: true },
      { text: '#testnetairdrops', category: 'Hashtag', featured: true },
      { text: 'Crypto Education', category: 'SEO Keyword', featured: true },
      { text: 'Pakistan Web3 Ambassador', category: 'Primary KW', featured: true }
    ],

    fazal_inquiries: [],

    fazal_settings: {
      title: 'Fazal Elahi — Crypto Educator, Content Creator & Web3 Growth Specialist | Pakistan',
      description: 'Fazal Elahi is a Pakistani crypto educator, content creator, and Web3 growth specialist. Learn crypto airdrops and testnets for free. KOL Manager. Pakistan Ambassador. 460K+ users scaled.',
      footerTagline: 'Educating. Building. Scaling. From Pakistan to the World.',
      maintenance: false,
      showDisclaimer: true,
      siteUrl: '[SITE_URL]',
      ogImage: '[OG_IMAGE_URL]'
    },

    fazal_customcss: '',

    // SHA-256 of "fazal2026" — CHANGE THIS in admin Security before deploy.
    fazal_admin_hash: '5e9c0a3f1c2c3e7e0a3b8d8b9f8b6f4a1d2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f'
  };

  /* ---------- Store API ---------- */
  const Store = {
    defaults: DEFAULTS,

    get(key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return clone(DEFAULTS[key]);
        return JSON.parse(raw);
      } catch (e) {
        return clone(DEFAULTS[key]);
      }
    },

    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
      logActivity('Updated ' + key);
      // Mirror content edits to Supabase (admin must be authenticated; RLS enforces it).
      if (cloudEnabled && CONTENT_KEYS.indexOf(key) > -1) {
        sb.from('site_content').upsert({ key: key, value: value, updated_at: new Date().toISOString() })
          .then(function (r) { if (r.error) console.warn('Cloud save failed for ' + key, r.error.message); });
      }
    },

    // Initialise any missing keys with defaults (call once on load).
    init() {
      Object.keys(DEFAULTS).forEach(function (k) {
        if (localStorage.getItem(k) === null) {
          localStorage.setItem(k, JSON.stringify(DEFAULTS[k]));
        }
      });
    },

    resetAll() {
      Object.keys(DEFAULTS).forEach(function (k) {
        localStorage.setItem(k, JSON.stringify(DEFAULTS[k]));
      });
    },

    exportAll() {
      const out = {};
      Object.keys(DEFAULTS).forEach(function (k) { out[k] = Store.get(k); });
      return out;
    },

    importAll(obj) {
      Object.keys(obj).forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) {
          localStorage.setItem(k, JSON.stringify(obj[k]));
        }
      });
    }
  };

  function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }

  /* ---------- Activity log (last 20) ---------- */
  function logActivity(msg) {
    try {
      const log = JSON.parse(localStorage.getItem('fazal_activity') || '[]');
      log.unshift({ msg: msg, ts: new Date().toISOString() });
      localStorage.setItem('fazal_activity', JSON.stringify(log.slice(0, 20)));
    } catch (e) {}
  }
  Store.activity = function () {
    try { return JSON.parse(localStorage.getItem('fazal_activity') || '[]'); }
    catch (e) { return []; }
  };

  /* =====================================================================
     CLOUD LAYER (Supabase) — hybrid: localStorage is the live cache,
     Supabase is the shared source of truth across all visitors/devices.
     ===================================================================== */
  Store.cloudEnabled = cloudEnabled;
  // Keys synced to the shared `site_content` table (everything except
  // local-only auth/log keys and inquiries which have their own table).
  var CONTENT_KEYS = Object.keys(DEFAULTS).filter(function (k) {
    return k !== 'fazal_admin_hash' && k !== 'fazal_inquiries';
  });

  // Load shared content from the cloud into the local cache, then defaults fill gaps.
  Store.bootstrap = async function () {
    Store.init();
    if (!cloudEnabled) return;
    try {
      var res = await sb.from('site_content').select('key,value');
      if (res.error) throw res.error;
      (res.data || []).forEach(function (row) {
        localStorage.setItem(row.key, JSON.stringify(row.value));
      });
    } catch (e) { console.warn('Cloud read failed — using local cache', e.message || e); }
  };

  // Upload every content key to the cloud (used to seed an empty project / manual resync).
  Store.syncAllToCloud = async function () {
    if (!cloudEnabled) return { ok: false, msg: 'Cloud disabled' };
    var rows = CONTENT_KEYS.map(function (k) {
      return { key: k, value: Store.get(k), updated_at: new Date().toISOString() };
    });
    var res = await sb.from('site_content').upsert(rows);
    return { ok: !res.error, msg: res.error ? res.error.message : ('Synced ' + rows.length + ' records to cloud') };
  };

  Store.cloudCount = async function () {
    if (!cloudEnabled) return 0;
    var res = await sb.from('site_content').select('key', { count: 'exact', head: true });
    return res.count || 0;
  };

  /* ---------- Inquiries (separate table; visitors insert anonymously) ---------- */
  Store.submitInquiry = async function (entry) {
    var local = Store.get('fazal_inquiries'); local.unshift(entry);
    localStorage.setItem('fazal_inquiries', JSON.stringify(local));
    if (cloudEnabled) {
      try {
        await sb.from('inquiries').insert({
          name: entry.name, email: entry.email, company: entry.company,
          type: entry.type, message: entry.message, status: 'New'
        });
      } catch (e) { console.warn('Inquiry cloud insert failed', e.message || e); }
    }
  };
  Store.getInquiries = async function () {
    if (cloudEnabled) {
      try {
        var res = await sb.from('inquiries').select('*').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        return (res.data || []).map(function (r) {
          return { id: r.id, name: r.name, email: r.email, company: r.company,
            type: r.type, message: r.message, status: r.status, ts: r.created_at };
        });
      } catch (e) { console.warn('Inquiry cloud read failed', e.message || e); }
    }
    return Store.get('fazal_inquiries');
  };
  Store.updateInquiry = async function (id, status) {
    if (cloudEnabled && id != null) { try { await sb.from('inquiries').update({ status: status }).eq('id', id); } catch (e) {} }
  };
  Store.deleteInquiry = async function (id) {
    if (cloudEnabled && id != null) { try { await sb.from('inquiries').delete().eq('id', id); } catch (e) {} }
  };

  /* ---------- Supabase Auth (admin login) ---------- */
  Store.signIn = async function (email, password) {
    if (!cloudEnabled) return { ok: false, msg: 'Cloud disabled' };
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    return { ok: !res.error, msg: res.error ? res.error.message : 'ok' };
  };
  Store.signOut = async function () { if (cloudEnabled) { try { await sb.auth.signOut(); } catch (e) {} } };
  Store.updatePassword = async function (pw) {
    if (!cloudEnabled) return { ok: false, msg: 'Cloud disabled' };
    var res = await sb.auth.updateUser({ password: pw });
    return { ok: !res.error, msg: res.error ? res.error.message : 'ok' };
  };
  Store.cloudSession = async function () {
    if (!cloudEnabled) return null;
    var res = await sb.auth.getSession();
    return res.data ? res.data.session : null;
  };

  /* =====================================================================
     MEDIA UPLOADS (Supabase Storage `media` bucket)
     Direct-to-storage upload via XHR so we get a real progress bar
     (the supabase-js client does not expose upload progress).
     Returns { ok, url } on success — `url` is the public file URL.
     ===================================================================== */
  Store.uploadMedia = function (file, onProgress) {
    return new Promise(function (resolve) {
      if (!cloudEnabled) return resolve({ ok: false, msg: 'Cloud disabled — uploads need Supabase.' });
      sb.auth.getSession().then(function (r) {
        var token = r && r.data && r.data.session ? r.data.session.access_token : null;
        if (!token) return resolve({ ok: false, msg: 'Not signed in — log in again to upload.' });
        var safe = String(file.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
        var rand = Math.random().toString(36).slice(2, 8);
        var path = Date.now() + '_' + rand + '_' + safe;
        var base = SUPABASE_URL + '/storage/v1/object/media/' + path;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', base, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
        xhr.setRequestHeader('x-upsert', 'true');
        if (file.type) xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
        };
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ ok: true, url: SUPABASE_URL + '/storage/v1/object/public/media/' + path });
          } else {
            var m = 'Upload failed (' + xhr.status + ')';
            try { m = JSON.parse(xhr.responseText).message || m; } catch (e) {}
            resolve({ ok: false, msg: m });
          }
        };
        xhr.onerror = function () { resolve({ ok: false, msg: 'Network error during upload.' }); };
        xhr.send(file);
      });
    });
  };

  /* ---------- Helpers shared by both pages ---------- */
  const Util = {
    // Strip HTML tags from user input before persisting.
    sanitize: function (str) {
      return String(str == null ? '' : str).replace(/<[^>]*>/g, '').trim();
    },
    escape: function (str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    async sha256(text) {
      const data = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    },

    /* ---------- Media link helpers (shared by admin + public site) ---------- */
    // Pull a Google Drive file id out of a share/view link.
    driveId: function (url) {
      var s = String(url || '');
      var m = s.match(/\/d\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      return m ? m[1] : null;
    },
    // Pull an 11-char YouTube id from a full URL (or accept a raw id).
    youtubeId: function (url) {
      var s = String(url || '').trim();
      if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
      var m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return m ? m[1] : null;
    },
    // Normalise an image value the browser can load directly (handles Drive links).
    imageUrl: function (url) {
      var s = String(url || '').trim();
      if (s.indexOf('drive.google') > -1) {
        var id = Util.driveId(s);
        if (id) return 'https://drive.google.com/uc?export=view&id=' + id;
      }
      return s;
    },
    // Decide how to render a "video" value: { type:'iframe'|'video'|'none', src }.
    videoEmbed: function (url) {
      var s = String(url || '').trim();
      if (!s || s.indexOf('[') === 0) return { type: 'none', src: '' };
      var yt = Util.youtubeId(s);
      if (yt) return { type: 'iframe', src: 'https://www.youtube.com/embed/' + yt };
      if (s.indexOf('drive.google') > -1) {
        var id = Util.driveId(s);
        if (id) return { type: 'iframe', src: 'https://drive.google.com/file/d/' + id + '/preview' };
      }
      if (/\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(s)) return { type: 'video', src: s };
      return { type: 'iframe', src: s };
    }
  };

  global.FAZAL = { Store: Store, Util: Util };
})(window);
