# TPL Clinic — Repo Handoff Notes

This folder is the client-approved homepage demo (mirrored from the private
`imdhirajs/tpl-clinic-redesign` via the shared zip — `index.html` is byte-identical to
https://eloquent-medovik-488e50.netlify.app) **plus the two new inner pages** agreed in Meet 2
for the £800 scope.

```
index.html      — approved homepage (hero untouched; nav/footer now link to the new pages)
services.html   — NEW: full 20-treatment index with Face/Hair/Body filtering
prp.html        — NEW: the treatment-page template ("between the live PRP page and Sofwave")
support.js      — dc-runtime (unchanged)
assets/         — all demo assets incl. 446 hero frames, videos, images
uploads/        — original brief + colour tokens (from the zip)
```

Run locally: `python3 -m http.server 4174` in this folder → http://localhost:4174

---

## ⚠ Important discovery: the exported runtime is render-once

`support.js` renders the `<x-dc>` template once and runs `componentDidMount`, **but
`setState` does not re-render**. On the deployed demo this meant the mobile drawer, mega
menu and the enquiry "Send" modal were silently dead.

Fix pattern (now applied on **all three pages**, including index.html): all stateful UI is
driven by plain DOM listeners added in `componentDidMount` — look for the
`── Vanilla interactivity ──` block in each page's script. Template `{{ }}` bindings are
kept only for first-render content (e.g. the row lists). **When cloning pages, follow this
pattern — do not rely on `setState`.**

## Cloning a treatment page (for the other ~17)

1. `cp prp.html sofwave.html`
2. Edit the `<title>` + `<meta name="description">` at the top.
3. Edit everything between the
   `══ TREATMENT CONTENT — edit below ══` … `══ END TREATMENT CONTENT ══` fences:
   hero copy + hero image, at-a-glance values, overview, process (if different),
   areas, "Why TPL" stats, pricing rows, FAQ items.
4. The nav, drawer, consultation form, footer and modal need no changes.
5. Add the treatment's row link in `services.html` (change its `url` in the `T(...)` data
   from the live URL to the new local file).

## ⚠ Placeholder content — confirm with Kam before launch

- **PRP prices on prp.html are INDICATIVE placeholders** (£350 face / £400 scalp / £650
  combined / courses). The live site publishes no PRP prices. The page carries a visible
  "Indicative — confirmed at consultation" footnote; replace with real prices.
- **Before/after slots** on prp.html are labelled `CLINIC ASSET PENDING` — drop in the
  clinic's approved photography (or approved Higgsfield renders) as
  `<img>` inside each slot.
- **Hand-drawn icons**: Kam likes his services icons. Each services.html row has a
  commented icon slot next to the number — drop `assets/icons/*.png` in per row when he
  supplies them.
- **Services row links**: treatments not yet rebuilt point to their **current live pages**
  (tplclinic.com / treatment.tplclinic.com / xerf.clinic) so nothing dead-ends; flip each
  to its local file as pages get cloned.
- The enquiry form (all pages) shows the confirmation modal but **does not send data
  anywhere** — same as the approved demo. Wire it (Netlify Forms/Formspree/email endpoint)
  before go-live.

## Pushing to GitHub

The empty repo `Wakdeprathamesh/TPL-Clinic` is ready to receive this:

```bash
cd site
git init && git add -A && git commit -m "TPL Clinic — approved homepage + services & PRP template pages"
git branch -M main
git remote add origin https://github.com/Wakdeprathamesh/TPL-Clinic.git
git push -u origin main
```

Netlify: drag the folder into the existing site (or connect the repo) — `/services.html`
and `/prp.html` ship alongside the current deploy. Enable "Pretty URLs" for `/services`
and `/prp` paths.

## Still pending (later phase — homepage amendments from Meet 2)

White "Matrix" void hero film (Higgsfield) · real logo top-left · beat labels →
consultation / blood test / hair / face / body / hair transplant / academy · Kam's copy pass.
