# Design preview — "Signal" (NOT deployed, awaiting your approval)

**How to view it (nothing in production is touched):**
```
cd fazalelahi
python -m http.server 8080 --bind 127.0.0.1
# open http://127.0.0.1:8080/design-preview/index.html   (resize the window to see tablet/phone layouts)
```
Use the **"Reduce motion"** button (bottom-left) to see the reduced-motion version, or switch your OS setting.
The folder is in `.vercelignore`, so it can never be deployed by accident. The live site files are unchanged by it.

Content (name, stats, roles, events, photos, links) is read from the site's own default data (`../data.js`, local mode, no network),
inserted with `textContent` only. The contact form is a **disabled layout study** and says so; nothing in the preview sends data.

Screenshots: `05_Fazal_Elahi/qa-reports/preview/` (desktop 1440, tablet 820, mobile 390 — hero, about, experience, events, contact).

## What it shows (your 10 points)
| # | Item | How it works | Motion cost |
|---|---|---|---|
| 1 | Cinematic hero, professional type | Bebas Neue display at up to 168px, three masked lines; gold light bed behind the portrait; real stat cards | 1 transform animation per word, once |
| 2 | Lightweight entrance | Words rise out of a mask (`translateY` 105%→0, 700ms, 90ms stagger); supporting text fades up | transform+opacity, once, no layout |
| 3 | Interactive career timeline | Accordion cards (`aria-expanded`, grid-rows 0fr→1fr), a gold rail that fills as you scroll (CSS scroll-driven animation; 12-line rAF fallback where unsupported) | Compositor-only rail; height animation via `grid-template-rows` (no JS measuring) |
| 4 | Event cards & gallery | Bento grid, category filter (pressed-state buttons, live count), native `<dialog>` viewer: focus trap, Escape, focus return and backdrop click for free | hover scale on one image; nothing animates until hovered |
| 5 | Section transitions | One shared IntersectionObserver adds `.in` → fade + 26px rise (420ms) | ~1 observer for the whole page, unobserves after firing |
| 6 | Navigation | Sticky bar goes solid after 40px and tucks away when scrolling down; active-section indicator slides (a scaled/translated 2px bar); full-screen drawer with focus trap + Escape | one rAF-throttled passive scroll listener |
| 7 | Buttons / hover / click | Arrow nudge, lift on hover (fine pointers only), 0.985 press-scale on `:active` | CSS only |
| 8 | Collaboration section | Real contact routes (email, WhatsApp, LinkedIn) as large tap targets + a visible, honest "preview only" form | CSS only |
| 9 | Mobile arrangements | 1-column hero with portrait first, 12-column events grid collapses to 2 then 1 column, drawer instead of inline nav, 48px targets | none extra |
| 10 | Dark-theme consistency, focus | Same void/gold tokens as the live site; one gold `:focus-visible` ring everywhere; AA text contrast | none |

## Recommended motion patterns (and why)
1. **Transform + opacity only.** No `top/left/width/height` animation, so no layout work per frame and no CLS. (The accordion uses `grid-template-rows`, which the browser interpolates without JS measurement.)
2. **CSS first, one IntersectionObserver.** No GSAP/ScrollTrigger: a previous ScrollTrigger setup kept a 60 fps rAF loop alive for 13 fades. Add GSAP only if a future effect (e.g. complex sequenced timelines) can't be done in CSS, and lazy-load it then.
3. **Animate once, never loop for decoration.** The only infinite animations are the credentials marquee (compositor transform, pauses on hover) and the scroll cue; both stop under reduced motion.
4. **Progressive enhancement.** Without JS, `.no-js` shows all content immediately. Scroll-driven rail uses `animation-timeline: view()` where supported; otherwise a passive rAF-throttled fallback.
5. **Reduced motion is first-class.** OS setting *or* the preview toggle: all animation/transition disabled, reveals shown immediately, no count-up, no pointer spotlight, rail still shows progress statically. Verified by tests (0 running animations).
6. **Pointer-only effects are gated** with `(hover:hover) and (pointer:fine)`, so phones never pay for hover/spotlight code.
7. **Budget.** `preview.css` 19 KB (5.2 KB gzipped), `preview.js` 11 KB (4.0 KB gzipped), zero dependencies. Heaviest paint cost is the blurred nav background (`backdrop-filter`, only when scrolled).

## What approval would mean
If you approve, I would port these components into the live pages one commit each (hero → nav → timeline → events → contact), reusing the existing IDs/data/render code and tests (axe, CLS, reduced-motion, keyboard) so each step is reversible. Until then **none of this is applied to the live site.**
