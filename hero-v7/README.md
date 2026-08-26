# HeroV7 — the scroll film

The homepage hero. `Hero V7 4K.mp4` is scrubbed by scroll as a sequence of 598 WebP
frames, with seven beats of copy set as dark ink directly on the picture — no
scrim anywhere.

- **Engine** — `site/assets/js/hero-film.js`
- **Stylesheet** — `site/assets/css/hero-film.css` (shared by the live hero and the preview page)
- **Frames** — `site/assets/hero-v7-4k-frames/` — 598 files, 3840×2160, q98 (see §4K below)
- **Preview** — `site/hero-v7.html`, with a debug strip and `?beat=` / `?seek=` review URLs
- **Numbers** — `hero-v7-spec.json`, and the reasoning in `hero-v7-analysis.md`

The code is named `hero-film`, not `hero-v7`. Three revisions of version-stamped
filenames was enough. The **frames path stays versioned** on purpose: it carries
an immutable one-year cache header in `vercel.json`, so a new film has to arrive
at a new URL or viewers would be served stale frames for a year.

## The one thing to know before touching the frame numbers

A 3×3 grid cell is **not** the region to measure. The copy block is routinely
taller than its cell — 432px of block in a 242px cell — so it hangs into the
cell below, and cell statistics quietly miss whatever is down there.

Body was chosen as `top-centre` on cell numbers that looked excellent (mean luma
234, variance 1.4, 12.79:1) and measured **1.22:1** once it was on screen,
because the block's lower half sat over a practitioner in black.

So the `ink` figure on every beat is now the 5th-percentile contrast of **the
block's own footprint, sampled off the painted canvas**. That is also the only
measurement that accounts for the cover-crop: at 1440×900 the canvas shows the
middle 1728 of the 1920-wide frame, so source-space cell maths is offset by 96px
a side before it is even wrong for the other reason.

If you move a beat, re-measure it in the browser. Do not trust the grid.

## Relationship to V6

Same shoot, re-cut longer — not new footage. All seven beats appear in the same
order with the same shots, including the graphic surgical close-up V6 already
had. 42.167s against 35.285s, 1011 source frames against 846.

Which is why **every line of copy carried over unchanged**. The work was
re-extract, re-time, re-point.

## Frame budget

598 frames holds V6's temporal density almost exactly — 14.18 fps against 14.17
— so the scrub feels the same. The alternatives were costed before choosing:

| Frames | fps | Size | Against V6 |
|---|---|---|---|
| **598** | **14.18** | **93.4 MB** | density matched, +16% payload |
| 550 | 13.04 | 96.8 MB (est.) | −8% density |
| 500 | 11.86 | 88.0 MB (est.) | −16% density |

V7 is 16% heavier in total than V6 but **7% lighter per frame** (152.5 KB against
164.2). An early estimate of 105 MB came from a 14-frame sample that
over-weighted the two extreme close-ups — the scalp frame is 315 KB and the
surgical one 497 KB. The full run came in under it.

## Regenerating the frames

`cwebp -q 98 -sharp_yuv -m 6`, one frame at a time, PNG written by **Pillow and
not by ffmpeg**. That is not a style preference: ffmpeg's PNG muxer stamps
`cICP`/`cHRM`/`gAMA`, and on V6 decoders applied a gamma shift off the back of
them worth a mean error of 7.2/255 on what was supposed to be a lossless
round-trip. Pillow emits no colour chunks, so the failure mode is gone rather
than worked around.

Verified after encoding: PSNR 46.6–50.6 dB, mean absolute error 0.39–0.72, luma
drift under 0.27/255 — rounding noise, not a shift.

One PNG exists on disk at a time. 598 full-res PNGs would be about 1.5 GB and
the machine this was built on had under 3 GB free.

## Known limits

- **Resolution ceiling — resolved.** The 4K master landed 2026-08-25; see §The
  4K remaster below. The cap logic stayed, it just stopped biting.
- **Face has no footage** in any master supplied. It is a nav pillar and a card
  in the phone deck — never a beat of the film.
- **`Hero V7 (1).mp4`** in the repo root is byte-identical to `Hero V7.mp4`
  (MD5 `21fe86116de8dfa8b4a99f7cf3baf29c`). 94 MB of duplicate, ignored by git,
  safe to delete.


## The 4K remaster (2026-08-25)

The client supplied `Hero V7 4K.mp4` — the **same cut, same grade** as the
1080p master (1011 frames, 42.167125s; frame-500 diff vs the 1080p master is
mean 1.54/255, codec noise) at 3840×2160, 45 Mbps. Everything beat-related
carried over untouched; only the pixels changed.

**Encode: q98 -sharp_yuv, chosen by looking, not by PSNR.** At 4K the h264
master's own grain dominates every metric — PSNR ranks grain reproduction, not
sharpness, and near-lossless spends 1.19 GB reproducing that grain (its error
tolerance also widens at 4K density: mean 3.0/255 vs the 1080p run's near-zero).
Side-by-side crops at true raster scale (2880×1620, what a DPR-2 laptop
actually paints) showed q95 ≈ q98 ≈ near-lossless, while today's 1080p was
visibly softer on the lettering. The client picked q98 from the measured
ladder: q95 362 MB · **q98** · nl60 1.19 GB (projected; the run came in under).

**The engine now EVICTS — this is not optional at 4K.** A decoded 3840×2160
RGBA bitmap is 33 MB; 598 resident at once would be 19.8 GB. Decoded frames
live in a ±64-frame window around the playhead, frame 1 and every stop freeze
stay pinned (a stop must land instantly from anywhere), evicted bitmaps are
close()d, and the whole film's bytes are fetch-warmed into the HTTP cache in
the background so re-decodes read from disk, not the network. Peak residency is
~137 frames ≈ the same 5 GB envelope the 1080p hero shipped with. The backing
store cap (`SRC_W/SRC_H`) went to 3840×2160, so a 1440-CSS DPR-2 stage now
downscales the frame instead of upscaling 1080p by 59% — this was the
documented "if a 4K master ever lands" path.

The 1080p near-lossless set is deleted from the tree (history keeps it); the
frames URL moved to `hero-v7-4k-frames/` because the old path carries a
one-year immutable cache header.

## The smoothness pass (2026-08-26)

Three engine changes, each against a measured defect:

**Sub-frame crossfade.** The film is 14.2fps of temporal density, so a slow
scroll used to STEP from frame to frame — the "film is stuck" feel. The scroll
position was always continuous; now the paint is too. The frame below the
playhead draws opaque, the frame above draws over it at the fractional alpha
(two blits, ~0.02ms each at the API). At a stop the fraction is 0 and the
second blit is skipped, so a freeze is still one exact frame. Proven live with
two positions sharing the same floor AND round frame: the old path painted
them identically, the new one interpolates between neighbours.

**Paint-time filtering to 'high' — RETRACTED a day later.** The 0.76ms figure
came from a broken microbenchmark (fifty draws of the same bitmap amortised
over one flush). Measured honestly — distinct bitmaps, flushed per tick — the
'high' filter cost 33ms A BLIT on the 2880-wide backing store, 81.5ms a tick
with the crossfade's two blits, and the client felt it immediately: "quality
is good but it lags while scrolling." The 258ms decode-resize figure that
justified rejecting the alternative was also wrong (a cold-path outlier;
steady-state is ~125ms at any resizeQuality). See §The lag fix below for what
replaced it. The lesson is recorded in both directions: the same bad yardstick
first shipped a laggy filter and nearly buried the right architecture.

**dt-normalised easing.** The scroll->progress damping was 0.14 per rAF tick,
which is twice as stiff on a 120Hz display as on 60Hz. It is now a time
constant (SMOOTH_MS: 110, chosen so 60Hz behaviour is bit-identical to the old
feel), so a ProMotion MacBook gets the same glide as everything else.

## The lag fix (2026-08-26, same day)

The 4K remaster made the scrub lag, and the cause was painting: every tick
downscaled a 3840-wide bitmap into the 2880-wide backing store — twice, with
the crossfade — through the 'high' filter shipped that morning. Measured with
an honest per-tick flush: **81.5ms a tick**, five times the 60Hz budget.

The fix is to resample ONCE, at decode, and never filter at paint again:

- `createImageBitmap(blob, {resizeWidth, resizeHeight, resizeQuality:'high'})`
  produces the frame already at the backing store's cover size (3200×1800 on a
  1440-CSS DPR-2 stage). Cost ~125ms against 90ms plain — a 1.4x hit the
  12-deep decode queue absorbs — and 'high' costs the same as 'low' there.
- Every paint is then a **1:1 blit at (geom.x, geom.y)**: 15.1ms a tick with
  the crossfade under the flush-forced yardstick (the readback overstates
  steady state), against 81.5 shipped. Quality goes UP at the same time: one
  proper multi-tap resample beats any per-paint filter.
- Memory per resident frame drops ~35% (3200×1800 vs 3840×2160 RGBA).
- `store.rescale()` handles window resizes: stale-size bitmaps still paint
  (the draw path scales any mismatch), get dropped, and the window refills at
  the new size — verified live by resizing the viewport and watching the pins
  come back at the new cover width.
- Browsers that ignore the resize options are detected off the first decode
  (returned width != requested) and fall back to plain decodes with cheap
  scaled paints for the session.
- `store.start()` now waits for the first `resize()`, so decodes never begin
  before the target size exists.
- The background byte-warming loop stands aside while the reader is actively
  scrubbing (350ms of want() silence before it resumes).

## The pyramid (2026-08-26, following the lag fix)

The 1:1 blits fixed the paint cost and the client still felt skips: the scrub
would hold, then jump. Second diagnosis, right one this time — **decode
starvation**. A sized 4K decode is ~125ms; twelve in flight is ~96 frames/s of
supply. Travel is 140 frames a screen, so a medium scroll demands 200+/s. The
playhead outran the decoder, the nearest-decoded fallback held, and each
landing batch made the film visibly jump.

No amount of paint tuning fixes a supply deficit, so the film is now a
two-tier pyramid:

- **hi** — the 4K frames as before, resampled at decode to the cover size.
- **lo** — the same 598 frames at 960×540, q87: 16.4MB TOTAL, ~27KB and
  ~8ms a frame. Supply ~700/s: unstarvable at any human scroll speed.

Fast travel paints lo (softness is invisible in motion); the moment the
playhead slows, hi has already landed and takes over — sharpness returns
exactly when the eye can use it. Stops are pinned in both tiers. The
crossfade blends only within a tier — a sharp frame faded over a soft one
reads as ghosting. Decode-driven repaints fire only at rest, so mid-motion
ticks are never doubled.

**A scheduler lesson recorded:** the prefetch queue was originally grown
incrementally — push the new window to the FRONT, dedupe with a seen-map.
Under motion that buries the playhead's immediate needs behind the previous
tick's far tail (n+96 ends up ahead of n+2). The queue is now REBUILT
nearest-first around the playhead on every change, ~140 pushes, always the
exact priority order. In-flight decodes are tracked in a busy-map so a
rebuild can never double-decode.

Verified on the engine's own playhead (not a synthetic want() driver, which
fights the real draw loop and measures nothing): a fast 3.5s sweep sampling
220 positions painted 179 hi + 42 lo + **0 misses**, and a cold-load
immediate-scroll run painted 155 hi + 26 lo + **0 misses**. The film no
longer has a frame it cannot show.

## Production readiness (2026-08-26, tested against the live deployment)

Everything before this was measured on localhost, where every fetch is
instant and no CDN or cache header exists. Testing the deployed site found
three defects localhost structurally could not show.

**1. The motion tier was 404 in production.** The pyramid commit was
orphaned — PR #21 was merged at 01:28 and that commit landed on the branch
at 01:54, so the merge took the branch at the previous commit. Production
was running 4K-only: the exact starving configuration the pyramid exists to
prevent. (Same trap as PR #13 earlier in this project. Check `git
merge-base --is-ancestor` after someone merges while work is in flight.)

**2. The cache headers were never applied.** Every asset came back with
Vercel's default `max-age=0, must-revalidate` — not the immutable year on
the frames. A returning visitor revalidated all 598 frames every visit. The
cause was not syntax: **Vercel's Root Directory for this project is `site`**,
so the repo-root `vercel.json` is outside the deployment and never read.
`outputDirectory: "site"` only ever LOOKED like it worked because site/ was
already the root. The live config is now `site/vercel.json`; the root copy
is kept in sync so either setting works.

**3. The 4K tier was taking the whole pipe on a cold visit** — 70 requests
averaging 3.07 SECONDS each while the motion tier was still filling. A 4K
frame that lands three seconds late is worthless. It now yields to lo, and
the warm loop no longer speculates 280MB per visitor.

Two of my own design errors surfaced in the same test:

- The lo warm loop was **serial**. At the ~486ms round trip a cold visit
  actually sees, 598 sequential fetches is about five minutes. Now eight
  interleaved chains.
- It also **stood aside while the reader was scrubbing** — but `want()`
  fires every tick, so through an eleven-second read it never ran once,
  having fetched 209 of 598 frames by the end of the film. It gates on the
  window's queue depth now, not on whether the reader is moving.

### Measured on production, real CDN, real latency

| Pass | Continuous | Misses / 681 |
|---|---|---|
| Cold first visit, whole film in ~11s | **99.3%** | 5 |
| Second read | 98.2% | 12 |
| Third read | **100%** | 0 |

When a miss does happen the fallback is 2–6 frames away (median 4) — a brief
held frame, not a jump. Measured edge bandwidth was ~26 Mbps from the bom1
edge; slower connections will hold longer on the first pass.

**Not yet verified:** Safari (all of the above is one Chromium engine), and
anything below ~10 Mbps. The 4K tier is still 280MB, which the AVIF
evaluation in this file's sibling notes could cut by roughly three quarters.
