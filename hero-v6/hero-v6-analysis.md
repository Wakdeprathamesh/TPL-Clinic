# HeroV6 — scroll-hero analysis

Analysis of `HeroV6.mp4`, replacing HeroV5. Frames, spec and this document only —
no site code. Every number below came from a computation that was run, not an estimate;
the scripts are named where it matters so the work can be repeated.

---

## 1. The film

| | |
|---|---|
| Source | `HeroV6.mp4`, 79.5 MB, h264, yuv420p, bt709 / limited range |
| Native | **1920 × 1080** |
| Duration | **35.28525 s** |
| Source frames | 846 @ 23.976024 fps |
| Extraction rate | `fps = 500 / 35.28525` = **14.170227** |
| Frames extracted | **500** — inside the 450–550 target, exactly on 500 |

Every 1.6920th source frame is sampled. No frame is duplicated or dropped.

---

## 2. Motion

Mean absolute luma difference between adjacent extracted frames on a 192 × 108
downsample, smoothed ±2 (5-tap box, edge-clamped).

| | V6 | (V5 for reference) |
|---|---|---|
| Mean motion | **9.586** | 8.55 |
| Mean raw adjacent delta | 9.603 | — |
| Median | 9.55 | — |
| Typical travel (median of non-settled) | **11.152** | 4.4 |
| Rest threshold (45% of mean) | **4.314** | 3.85 |
| Settled frames | **179 / 500 = 35.8%** | 44% |
| Hard-cut threshold (6× raw mean) | 57.616 | — |

V6 moves slightly more than V5 and rests less — 35.8% at rest against V5's 44%. The
camera is more often travelling, which matters for the scroll ramp: there is less
natural stillness to hang copy on.

### Plateaus — 12 settled runs

These are the runs where the **whole frame** settles. Two further stops come from a
per-cell measurement in §7, which is what the final stop list rests on.

| Frames | Length | Avg motion | Verdict |
|---|---|---|---|
| 1 – 8 | 8 | 1.56 | opening hold — **title card** |
| 30 – 50 | 21 | 1.98 | **stop 01** consultation |
| 103 – 109 | 7 | 3.22 | inside the **diagnostics caption** (98–112) — see §7 |
| 129 – 139 | 11 | 1.37 | plateau, copy zone too busy |
| 148 – 165 | 18 | 1.24 | **stop 02** hair |
| 175 – 192 | 18 | 0.99 | plateau, copy zone too busy |
| 212 – 226 | 15 | 1.42 | plateau, alternative body stop |
| 234 – 254 | 21 | 2.48 | **stop 03** body |
| 287 – 307 | 21 | 2.54 | **stop 04** surgical |
| 362 – 369 | 8 | 3.85 | texture (under 10) |
| 371 – 388 | 18 | 3.20 | plateau, **no copy space** — full-bleed |
| 488 – 500 | 13 | 2.46 | left clean — the plaques close the film (§7) |

### Cuts — two, not fewer than V5

The brief expected V6 to have improved on V5's two hard cuts. It has not: there are
**exactly two**, and both sit inside the hair montage.

| Boundary | Delta | × mean | What it actually is |
|---|---|---|---|
| 119 → 120 | 75.05 | 7.82× | cross-dissolve boundary |
| 121 → 122 | 71.99 | 7.50× | cross-dissolve boundary |
| **144 → 145** | **86.61** | **9.02×** | **hard cut** — hair wide to scalp close-up |
| **170 → 171** | **86.21** | **8.98×** | **hard cut** — scalp close-up to hair wide |

The 119/121 pair are not two cuts. They bracket a ~3-frame **cross-dissolve**: frame 120
carries a visible ghosted double image of the tablet shot over the hair shot. The engine
does not need V5's 8-frame dissolve treatment here — the film dissolves itself.

Softer transitions the 6× rule does not catch, all worth knowing about:

| Boundary | × mean | What |
|---|---|---|
| 199 → 201 | 4.65×, 3.82× | hair → body, camera whip |
| 340 → 341 | 3.83× | surgical wide → close, dissolve |
| 358 → 359 | 5.51× | **patient change inside the close-up** — see notes |
| 414 → 415 | 3.72× | surgical → retail, dissolve |

---

## 3. Content verification

Every one of the 500 frames was reviewed on labelled contact sheets before any copy was
assigned. This has shipped wrong twice, so the checks are recorded individually.

| Check | Result |
|---|---|
| Reception opening — three arches, TPL logo, two Macs | **CONFIRMED**, frames 1–20 |
| Consultation | **CONFIRMED**, frames 29–70 |
| Hair | **CONFIRMED**, frames 121–200 |
| Body / laser | **CONFIRMED**, frames 205–280 — torso and forearm only |
| Surgical | **CONFIRMED**, frames 281–414 — hair transplantation at the hairline |
| Retail ending on brand plaques | **CONFIRMED**, retail 415–487, plaques 471–500 |
| **Any face-treatment footage?** | **NONE.** Zero frames. Same gap as V5 |
| **Black uniform throughout?** | **NO.** Three variants — see below |
| **Blue shoe covers?** | **YES**, throughout, clients and staff |

### The V5 mislabelling does not recur

In V5, frames 346–414 were hair-transplant surgery but shipped as `04 — FACE` with
face-treatment links. In V6 the equivalent footage is frames 281–414, it is
unambiguously hair transplantation — four-person team working at a shaved hairline with
an implanter pen — and stop 04 carries hair-transplant copy and hair-transplant links.
Checked frame by frame across the whole surgical block.

### Uniform — broken in two places, not one

| Frames | Dress |
|---|---|
| 1–28, 71–280, 415–500 | **black** — reception, diagnostics, hair, body, retail |
| **29–70** | **white coat** — the consulting clinician |
| **281–341** | **navy scrubs** — surgical team |
| **342–414** | **bright blue surgical gowns** — close-up |

V5 broke the black standard once. V6 breaks it twice: the consultation white coat is a
new outlier, on top of the surgical dress.

---

## 4. Copy space and the scrim

### Killing the global scrim

The V5 hero laid a full-frame navy overlay across every frame, costing 60% of image
brightness — the white rooms read as navy. The brief's instruction was to darken only
the text area, only while text is up.

**Measurement says the scrim should not come back in any form, because white text is the
wrong choice for this film.** The clinic is white: mean cell luma across the stops runs
186–233 of 255. For white text to reach 4.5:1 against that, the worst-case bright pixel
behind it must drop to a relative luminance of 0.1833 — which needs a black overlay of:

| Stop | Cell | White text needs |
|---|---|---|
| Title (f1) | top-right | 0.449 |
| 01 consultation | mid-left | 0.499 |
| diagnostics (caption) | top-centre | 0.501 |
| 02 hair | bot-right | 0.486 |
| 03 body | top-left | 0.483 |
| 04 surgical | top-left | 0.495 |
| 05 dispensary | top-right | 0.455 |

Across all nine cells of all stops the range is **0.441 – 0.528**. Localising a ~48%
black panel does not solve the problem the brief is trying to solve; it just makes the
damage smaller and gives it a hard edge.

### Dark text needs no darkening at all

Against the same backgrounds, near-black ink `#242424` clears AA on the worst-case
*darkest* pixel with **zero** overlay:

| Stop | Frames | Cell | Variance | Luma | Ink contrast | Darkening needed |
|---|---|---|---|---|---|---|
| Title | 1 – 8 | top-right | 30.6 | 209.1 | **9.10 : 1** | **0.0** |
| 01 — consultation | 30 – 50 | mid-left | 21.7 | 231.3 | **11.69 : 1** | **0.0** |
| diagnostics *(caption)* | 98 – 112 | top-centre | 0.2 | 237.3 | **13.24 : 1** | **0.0** |
| 02 — hair | 148 – 165 | bot-right | 265.4 | 218.3 | **7.06 : 1** | **0.0** |
| 03 — body | 234 – 254 | top-left | 8.2 | 226.5 | **11.30 : 1** | **0.0** |
| 04 — surgical | 287 – 307 | top-left | 17.0 | 228.0 | **11.51 : 1** | **0.0** |
| 05 — dispensary | 443 – 461 | top-right | 60.2 | 198.0 | **7.47 : 1** | **0.0** |

Brand navy `#081359` is marginally better again (9.87 : 1 to 12.67 : 1 on the same
cells). Either passes comfortably. **Recommendation: dark text, no scrim, anywhere.**

The one place this reverses is the surgical close-ups (362–388), where luma falls to
84–167 and dark text fails. Those carry no copy by design, so it never arises.

Method: 3 × 3 grid at full resolution, sampled across each run rather than only at its
midpoint — a cell that is clean at the midpoint can have a head in it ten frames earlier. Variance and
mean luma per cell; contrast computed from WCAG relative luminance, using the 95th
percentile for white text (worst case is the brightest pixel) and the 5th for dark text
(worst case is the darkest). Cells were ranked on variance first — a quiet cell is one
where type will not sit over moving detail — then on contrast.

---

## 5. Encode

`cwebp -q 98 -sharp_yuv -m 6`, native 1920 × 1080, `frame-0001.webp` … `frame-0500.webp`.

### Quality test — measured at the size it is actually drawn

First pass chose q90 by judging frames at 1:1. That was the wrong test. The hero
**upscales**: a 1440 x 860 stage on a DPR-2 display rasterises each frame at
3058 x 1720, so 1:1 numbers flatter every setting. Re-measured at the delivered
size, on the two busiest frames:

| Quality | PSNR @ delivered | Sharpness lost to WebP | 500 frames |
|---|---|---|---|
| q90 | 44.79 / 43.51 dB | 11.2% / 5.4% | 37 MB |
| q95 | 46.66 / 45.58 dB | 4.4% / 2.0% | 62 MB |
| **q98** | **47.71 / 46.88 dB** | **1.9% / −0.3%** | **81 MB** |
| q100 | 47.89 / 47.18 dB | 3.0% / −0.1% | 96 MB |
| lossless | ∞ | 0% | 285 MB |

**q98 is the knee.** WebP's own contribution falls into noise — −0.3% on frame 364
is measurement noise, not a gain. q100 costs 12 MB more and measures no better.
Lossless is 285 MB, which would wreck the thing it is meant to protect.

**Shipped: `cwebp -q 98 -sharp_yuv -m 6`, 500 frames, 80.2 MB, 164 KB average.**

### The real ceiling is the master, not the encoder

| | |
|---|---|
| Master | **1920 x 1080** = 2,073,600 px |
| Asked for by a 1440 x 860 stage at DPR 2 | **2880 x 1720** = 4,953,600 px |
| Deficit | **2.39 x** |
| Upscale applied to every frame | **59.3%** |

Measured separately, on the same frames:

- lost to **upscaling**: **31%** and **30%** of edge sharpness
- lost to **WebP at q98**: **1.9%** and **−0.3%**

Upscaling costs roughly fifteen times what the encoder now does. No encoder
setting recovers it, because the pixels were never shot. **A higher-resolution
export of HeroV6 is the only thing that adds real detail** — 2560px wide removes
most of the deficit, 3840px removes all of it at any sane viewport. Worth asking
the film's producer for before anything else is tuned.

Two consequences already applied in the engine:

- The canvas backing store is **capped at what the source can fill**. At
  1440 x 860 / DPR 2 that is 1808 x 1080 rather than 2880 x 1720 — the frame is
  blitted **1:1** with no resampling in canvas, and the compositor scales the
  element up. Identical sharpness, **61% fewer pixels** to fill every frame.
- `devicePixelRatio` is capped at **2, and must not be raised to 2.5**: that would
  ask for 3600px of width from a 1920px source, an 87% upscale, for no possible
  gain in detail.

### One thing that would have shipped broken

ffmpeg tags its PNG output with `cICP`, `cHRM` and `gAMA` copied from the source's bt709
flags, and WebP tools then apply a gamma transform on read. A **lossless** round-trip came
back with mean error 7.2/255 and max 11/255 — impossible for lossless, and the giveaway.
A synthetic PNG round-tripped at 0, which isolated it to the chunks. Stripping
`cICP`/`cHRM`/`gAMA` restores an exact round-trip and leaves raw pixel values untouched —
the chunks only instructed decoders to shift gamma.

All 500 PNGs were stripped before encoding, so the frames match the film. **Anyone
re-running the extraction must strip them too**, or the entire sequence ships with a
visible colour shift against the video. The first quality test was measured against a
mis-transformed reference and had to be discarded and redone.

---

## 6. Smoothness

The engine is out of scope here, but the analysis produced numbers that bear directly on
whether the scroll feels buttery, so they are recorded rather than lost.

- **Frame budget.** 72.4 KB average, 224 KB worst case. A WebP of that size decodes in
  roughly 2–4 ms on a mid-range laptop, so decode is not the constraint; *arrival* is.
- **Where the stalls will be.** The four highest-detail runs are 148–170 and 342–414
  (all over 150 KB per frame). These are also where the film moves fastest, so they are
  the frames most likely to be needed before they land.
- **Rest is unevenly distributed.** 35.8% of frames are settled, but they cluster: 30–50,
  148–192, 212–254, 287–307, 488–500. The long travel stretches — 51–102, 255–286,
  389–487 — are where scroll needs the most frames per second of reading and where a
  linear frame-to-scroll mapping will feel fastest.
- **The ramp has more work to do than V5's.** V5 weighted rest frames 3× travel frames to
  turn a 26-frame hold into roughly 0.6 of a screen. V6 rests less (35.8% vs 44%) and its
  stops are longer, so the same 3× weighting will produce a different rhythm; it should be
  re-derived against these plateau lengths rather than carried over.
- **Decode-ahead, not just preload.** Because text and film never move at the same time,
  every frozen beat is free time: 6 stops totalling 96 frames of scroll during which no
  new film frame is needed. That is the natural window to decode the next travel run.

---

## 7. Per-cell motion — the measurement that changed two stops

The first pass measured motion across the **whole frame**. That answers "is the picture
still?" — but the question that actually matters is **"is the type still?"** A frame can be
moving while the cell holding the copy sits perfectly static: people gesture, a camera
eases, and the blank wall above them does not move at all.

Re-running the same metric restricted to each of the nine grid cells:

| Beat | Global motion | Cell | Cell motion | Still for |
|---|---|---|---|---|
| Diagnostics 73–120 | mean **16.17**, never settles for 10f | top-centre | max **0.36** | **19 frames** (94–112) |
| Retail 415–487 | mean **9.53**, never settles at all | top-right | max **2.37** | **19 frames** (443–461) |

Both beats were written off in the first pass. Both are usable.

### Diagnostics → a full stop at 98–112 (15 frames)

Trimmed from 94–112 to **98–112** to stay clear of the cross-dissolve that begins at 115.
The copy zone is a blank white wall between the two heads, directly above the dashboard:
**variance 0.0–0.3, contrast 13.24 : 1** — the cleanest type surface in the film.

**On putting text over a running film instead.** Considered, and not needed here — there are
15 measurably still frames, so a proper freeze is available. Two reasons to prefer it:

1. The model rests on scroll driving *one thing at a time*. Fading text in while the film
   advances makes the same scroll input do two jobs, and puts motion directly behind the
   words.
2. Harder constraint: **clickable links require a stop.** A link that is fading or sliding
   while the film scrubs cannot be reliably hit — and this beat carries the Diagnostics and
   TrichoComp™ links. Any beat with links must freeze.

**The moving-caption idea is still worth keeping, for a different job:** a kicker-only label,
2–4 words, no headline, no sub, **no links**, fading in and out over a travel run purely to
name a shot. If the reception walk-in or the body overhead later needs naming without adding
a stop, that is the pattern. It must never carry a link.

### Dispensary → moved off the plaques to 443–461 (19 frames)

The retail conversation never settles globally — quietest smoothed motion 4.476 against the
4.314 threshold, missing by 3.8% — but its top-right cell holds under 2.4 for 19 frames.
Contrast 7.47 : 1 across the run.

Better on three counts: a **longer hold** than the 13-frame plaque card; the **better image**
for "what you take home with you", because it shows the act rather than a sign; and it ends
the **five-links-over-five-identical-plaques** duplication. The plaques (471–500) now close
the film with nothing over them — they list the five brands themselves.

**Brand links collapsed from five to two.** All five pointed at `services.html` — one
destination behind five labels, and the brief notes the brand pages do not exist. Five links
to the same page is not navigation. Replaced with *Skincare* and *Hair care*. The film still
names all five brands on the closing plaques, which is where brand names belong.

### Consequences

- **Stop numbering shifts:** Hair 02→03, Body 03→04, Surgical 04→05, Dispensary 05→06. If
  the client's original numbering must hold, diagnostics can run as an unnumbered sub-beat
  of 01 instead.
- **Stop 01 now carries one link**, not three. Diagnostics and TrichoComp™ moved to the beat
  whose footage actually shows them — the scored scalp analysis and the blood-tube rack.
  Leaving them on the consultation shot was the same category of error as the V5 face
  mislabelling, just milder.
- **The hero gets about 6% longer.** Held frames rise from 102 to 123 of 500; at V5's 3×
  rest weighting, weighted scroll goes 704 → 746 units, roughly 760vh → 806vh.

### Final stop list

| # | Stop | Frames | Held | Cell | Contrast | Links |
|---|---|---|---|---|---|---|
| 0 | Title | 1 – 8 | 8 | top-right | 9.10 : 1 | — |
| 1 | 01 — Consultation | 30 – 50 | 21 | mid-left | 11.69 : 1 | 3 |
| — | *diagnostics* **(caption, unnumbered)** | 98 – 112 | film runs | top-centre | **13.24 : 1** | 0 |
| 2 | 02 — Hair | 148 – 165 | 18 | bot-right | 7.06 : 1 | 3 |
| 3 | 03 — Body | 234 – 254 | 21 | top-left | 11.30 : 1 | 3 |
| 4 | 04 — Surgical | 287 – 307 | 21 | top-left | 11.51 : 1 | 2 |
| 5 | 05 — Dispensary | 443 – 461 | 19 | top-right | 7.47 : 1 | 2 |

Every stop clears AA with **zero darkening**. No scrim anywhere.

---

## 8. What needs a human decision

Full detail in `hero-v6-spec.json` → `notes` (22 entries). The ones that block sign-off:

1. **Face has no footage.** Face is a nav pillar and V6 shows none of it, exactly as V5.
   Either shoot it, or drop Face from the hero — but do not caption body or hair footage
   with face copy, which is the error that shipped twice.
2. **Stop numbering shifts** now that diagnostics is a stop of its own — Hair 02→03, Body
   03→04, Surgical 04→05, Dispensary 05→06. Confirm, or run diagnostics unnumbered under 01.
3. **Brand links went five to two.** All five pointed at the same `services.html`. Confirm
   *Skincare* / *Hair care* is acceptable, or name the brands and accept the duplication
   against the closing plaques.
4. **Uniform and shoe covers.** White coat at 29–70, navy scrubs at 281–341, blue gowns at
   342–414, blue shoe covers throughout.
5. **Patient continuity.** The surgical close-up changes patient at 358→359 — bearded man
   to clean-shaven man — inside what reads as one continuous shot.
6. **Subheads are unapproved.** Headlines and links are the client's, re-mapped. The
   one-line subs and the whole title card were written here to fill the schema.
