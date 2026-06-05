# Fazal Elahi — Personal Brand Website

A premium, educator-first personal brand site for **Fazal Elahi** (Crypto Educator · Content Creator · Community Builder · Ambassador · BD · KOL Manager · Pakistan Regional Lead), with a full no-code admin CMS.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Public website (17 sections) |
| `admin.html` | Admin CMS — login-gated content manager |
| `data.js` | Shared data layer + defaults (both pages read/write `localStorage` here) |
| `render.js` | Public-site rendering + animations |

All four are plain static files. **No build step, no server, no dependencies** (GSAP + Google Fonts load from CDN; the site still works if they fail).

## Running locally

Because the pages load `data.js`/`render.js` via `<script src>`, open them through a local server (not `file://`) so the browser allows the scripts:

```powershell
# from this folder
python -m http.server 8080
# then visit http://localhost:8080/index.html  and  /admin.html
```

(Opening `index.html` directly off disk works in most browsers too, but a server is the reliable path.)

## Admin panel

- Open `admin.html`
- **Default password: `fazal2026`** — change it immediately under **🔒 Security**
- Auth uses SHA-256 (`crypto.subtle`); only the hash is stored, never the plain password
- All content is editable: Profile/Stats, Roles, Experience, Case Studies, Events (17 pre-loaded), Projects, KOL Network, Community, Social Links, Affiliates, Testimonials (3 pre-loaded), Content/YouTube, Keywords, Inquiries inbox, Site Settings, Security
- Changes save to `localStorage`; **reload the public site** to see them
- **Backup/Restore** and **Reset to Defaults** live under ⚙️ Site Settings

> Note: `localStorage` is per-browser/per-device. The admin edits and the public site must be viewed in the **same browser** to share data. For multi-device editing, export the JSON backup and import it elsewhere, or wire the data layer to a hosted backend later.

## Placeholders to fill before launch

Replace these via the admin panel (or directly in `data.js` defaults / `index.html` `<head>`):

```
[CLIENT_PHOTO_URL]        Profile photo (Profile & Stats → Photo URL)
[OG_IMAGE_URL]            Open Graph image 1200×630 (index.html <head> + Site Settings)
[SITE_URL]                Final domain (index.html <head> + Site Settings)
[CV_DOWNLOAD_URL]         CV/resume PDF link (Profile & Stats)
[BINANCE_AFFILIATE_URL]   Affiliates → Binance
[OKX_AFFILIATE_URL]       Affiliates → OKX
[BITBULLET_AFFILIATE_URL] Affiliates → Bitbullet
[CREATORX_PROOF_URL]      Case Studies → CreatorX
[EFSANE_PROOF_URL]        Case Studies → Efsane
[YOUTUBE_VIDEO_ID_1..3]   Content/YouTube → Featured Videos (the ID from ?v=XXXX)
[YT_SUBSCRIBERS] etc.     Content/YouTube + Social Links counts
[TG_*/WA_* MEMBERS]       Community + Social Links counts
[EVENT_DATE]              Events Manager → each event's date
```

> ⚠️ `<head>` meta tags (`og:image`, `og:url`, JSON-LD `url`) are static in `index.html` — edit those two spots by hand since social scrapers read the raw HTML, not localStorage.

## Deployment

Drop all four files into any static host — Netlify, Vercel, Cloudflare Pages, GitHub Pages, or shared hosting. No configuration needed. Enable HTTPS (automatic on those platforms) and 2FA on the host account.

## Notes

- Contact email used throughout is **fazalelahi5577@gmail.com** (from the brief). The account email on file was `fazalelahi057@gmail.com` — change it in Profile & Stats if the brief's value is wrong.
- Contact-form submissions are stored in the admin **Inquiries** inbox and also open the visitor's mail client as a fallback.
- Respects `prefers-reduced-motion`; semantic HTML, ARIA labels, skip link, and gold focus rings throughout.
