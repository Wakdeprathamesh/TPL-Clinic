# TPL Clinic

Website for **TPL Clinic** — 22 Seymour Street, Mayfair, London W1H 7HY.

A hand-built static site: plain HTML, no framework, no build step. Open it with any static file server.

## Run locally

```bash
python3 -m http.server 4174 --directory site
```

Then open <http://localhost:4174>.

## Pages

| Page | File |
|---|---|
| Homepage | [site/index.html](site/index.html) |
| Services — all 20 treatments | [site/services.html](site/services.html) |
| PRP treatment page | [site/prp.html](site/prp.html) |
| Sofwave™ treatment page | [site/sofwave.html](site/sofwave.html) |

Journey to test: **home → Services in the nav → click a row → treatment page.** Rows 01 (PRP) and 05 (Sofwave) open pages in this repo; the other 18 point at the current live site.

## Structure

```
site/
├── index.html          homepage (446-frame scroll-scrubbed hero)
├── services.html       filterable 20-treatment index
├── prp.html            treatment template
├── sofwave.html        treatment template, cloned from prp.html
├── support.js          runtime (generated — do not edit)
└── assets/
    ├── brand/                 logo, white + gold variants
    ├── icons/                 20 treatment icons
    ├── hero-frames-webp/      446 frames — the homepage hero sequence
    ├── hero-fallback/         hero-mobile.mp4 (phones get this instead of the scrub)
    ├── hero-poster/           first-paint poster
    ├── images/                section + Sofwave before/afters
    ├── section-images-webp/   stills from the hero film
    └── videos/                philosophy + PRP ambient loops, Sofwave treatment film
```

Adding a treatment page? See [site/README-HANDOFF.md](site/README-HANDOFF.md) — it covers cloning a page, which content is fenced for editing, and how to deploy.

## Deploying to Vercel

`index.html` lives in `site/`, not at the repo root, so Vercel needs to be told where to
serve from. [vercel.json](vercel.json) does that with `"outputDirectory": "site"`, and sets
cache headers — the 446-frame hero sequence is immutable for a year, other assets get a week
with `stale-while-revalidate`, HTML always revalidates.

There is no build step. Import the repo and deploy; leave the framework preset as **Other**
and the build command empty.

> If the root URL 404s after the first deploy, the `outputDirectory` key didn't take — set
> **Root Directory** to `site` in Project Settings → General instead, and clear the
> `outputDirectory` line. One or the other, not both.

## Design constraints

- **Light theme only.** White and grey led, gold `#B8925D` as a restrained accent.
- **No online booking.** Enquiries route to phone and WhatsApp by design.
- Nav mirrors the live site: Face · Body · Hair · Services ▾ · About us.

## Two things to be careful about

**1. `support.js` is a render-once runtime — `setState` never re-renders.** Every interactive element (mobile drawer, mega-menu, enquiry modal) is therefore plain DOM wired up inside `componentDidMount`. Keep to that pattern, or interactions will look correct in code and do nothing in the browser.

**2. In-page anchors need the Lenis handler.** Lenis owns scrolling and the page sets `scroll-behavior: auto !important`, so a plain `href="#section"` changes the URL and does nothing else. Every page has an `onAnchorClick` delegate in `componentDidMount` routing anchors through `lenis.scrollTo(target, { offset: -90 })` — the −90 clears the fixed header. Copy that handler onto any new page.

## Performance note

The homepage hero streams 446 WebP frames (~33 MB total) for the scroll-scrub effect. Phones are served `assets/hero-fallback/hero-mobile.mp4` instead. Consider a CDN in front of `assets/` in production.
