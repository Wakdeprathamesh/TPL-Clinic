# HeroV7 — analysis

What was measured, what it said, and what was decided. Numbers here are computed,
not estimated; where a figure was an estimate that later proved wrong, both are
kept.

## 1. The master

| | V7 | V6 |
|---|---|---|
| Resolution | 1920×1080 | 1920×1080 |
| Frame rate | 23.976 fps | 23.976 fps |
| Duration | 42.167 s | 35.285 s |
| Source frames | 1011 | 846 |
| Codec / range | h264, yuv420p, bt709 | h264, yuv420p |

`Hero V7.mp4` and `Hero V7 (1).mp4` are byte-identical — MD5
`21fe86116de8dfa8b4a99f7cf3baf29c` both. The second is 94 MB of duplicate.

## 2. It is the same film, longer

This was checked before any copy was touched, because the whole beat structure
depends on it. Contact sheets were pulled across both masters and compared shot
by shot.

V7 runs reception → consultation → diagnostics → hair → body → surgical →
dispensary. So does V6. Same shots, same order, including the graphic surgical
close-up (blue gown, gloved hands, marked hairline) which is **not** new in V7 —
V6 had it at the equivalent point. The extra 6.9 seconds is longer holds, not
new material.

**Consequence: every line of copy carried over unchanged.** The task was
re-extract, re-time, re-point.

## 3. Structure

Global motion, mean absolute luma difference between adjacent source frames at
480×270, smoothed ±2:

- mean 5.59, median 3.24, p95 17.53, max 87.20

Six shot boundaries, at single-frame deltas above `max(25, p99 = 29.46)`:

| Boundary | Delta |
|---|---|
| 394→395 | 48.16 |
| 421→424 (cluster) | 29.56, 41.79, 63.73 |
| 466→468 (cluster) | 40.74, 66.90 |
| 515→516 | 31.18 |
| 701→704 (cluster) | 31.04, 39.73, 83.31 |
| 767→768 | 87.20 |

Twelve quiet runs of ≥6 frames under the 25th percentile of smoothed motion
(threshold 1.20). The longest is src 583–624 — 42 frames, 1.75 s, mean motion
0.24.

## 4. Copy zones — and the method error worth recording

The first pass followed V6's method: a 3×3 grid at full resolution, per-cell mean
luma, variance, 5th percentile and per-cell motion. It produced a clean-looking
answer for every beat.

**It was wrong for body, and it was wrong for a structural reason.** The copy
block is routinely taller than its cell — 432px of block in a 242px cell — so it
hangs down into the cell beneath, and cell statistics say nothing about what is
down there. There is a second error stacked on top: at 1440×900 the canvas shows
the middle 1728 of the 1920-wide frame, so source-space cell boundaries are
offset by 96px a side before the first problem even applies.

Body on cell numbers: `top-centre`, mean luma 234.4, variance 1.4, **12.79:1**.
Body measured in the browser under the actual block: **1.22:1** — the lower half
of the block was sitting over a practitioner in black.

Every beat was re-measured against the block's own footprint, sampled off the
painted canvas with `getImageData`, at the 5th and 1st percentile:

| Beat | Frame | Cell | 5th pct | 1st pct | Fits viewport |
|---|---|---|---|---|---|
| Title | 1 | top-right | 11.94 | 11.26 | yes |
| 01 Consultation | 58 | mid-left | 13.19 | 12.99 | yes |
| Diagnostics *(caption)* | 110–139 | top-left | 13.38 | 12.99 | yes |
| 02 Hair | 259 | bot-right | 10.69 | 9.01 | yes |
| 03 Body | 325 | mid-right | 11.90 | 11.81 | yes |
| 04 Surgical | 396 | top-left | 12.61 | 12.37 | yes |
| 05 Dispensary | 590 | top-right | 11.36 | 11.25 | yes |

**No scrim, again.** Worst case anywhere is hair at 10.69:1 on the 5th percentile
and 9.01:1 on the 1st, against an AA floor of 4.5. Zero darkening. White text
would have needed roughly a 0.45–0.50 black overlay — the full-frame scrim V5 had
and this hero exists to be rid of.

## 5. Hair needed a sweep

The wide hair shots leave exactly **one** cell clearing AA, and it is a
high-variance one (bottom-right, variance 1343, 5.25:1). Rather than accept it,
all 121 frames of the shot were swept in sliding 14-frame windows, scoring every
(window, cell) pair that clears AA — 44 of them did.

Best by variance: **src 431–444, bottom-right, variance 261–290, 7.08:1
cell-wide** and 10.69:1 once measured under the block. That window is the extreme
scalp close-up, where the bottom-right corner is clean white void. Against V6's
hair beat at variance 265.4 it is the same quality of ground — on a stronger
shot.

## 6. The caption

Diagnostics stays an unnumbered caption over a film that keeps moving, per the
decision taken on V6. The test is not whether the frame is still — it is whether
the *type's ground* is still.

Across the full 50-source-frame span (output 110–139), inside the caption's own
footprint:

| | Footprint | Whole frame |
|---|---|---|
| Mean motion | 0.28 | 2.64 |
| Max motion | 0.70 | 5.71 |

The ground is **9.3× stiller than the picture**. Worst contrast on any single
frame of the span is 13.38:1. The people move; the wall the type sits on does
not.

The span is twice V6's — 30 output frames against 15 — because V7 holds the
diagnostics shot longer. Extending it further was tested and rejected: pushing to
src 250 takes footprint variance from 8.0 to 215.4 and max motion from 1.10 to
4.05.

## 7. Frame budget

V7 is 19.5% longer, so matching V6's smoothness costs frames.

| Frames | fps | Size | Density vs V6 |
|---|---|---|---|
| **598** *(chosen)* | 14.18 | **93.4 MB** | matched (V6: 14.17) |
| 550 | 13.04 | 96.8 MB (est.) | −8% |
| 500 | 11.86 | 88.0 MB (est.) | −16% |

A fourth option — variable-rate sampling, full density through motion and half
through the static stops, roughly 90 MB — was costed and declined as it needs a
frame lookup table in the engine.

**An estimate that proved wrong, kept on the record:** the 598-frame payload was
projected at 105 MB from a 14-frame sample. It came in at **93.4 MB**. The sample
over-weighted the two extreme close-ups, which are the most expensive frames in
the film by a wide margin — the scalp frame is 315 KB and the surgical one 497 KB
against a 152.5 KB average. Per frame V7 is 7% *lighter* than V6 (152.5 vs
164.2), not heavier.

## 8. Encode fidelity

`cwebp -q 98 -sharp_yuv -m 6`, quality settings inherited from V6 where they were
chosen by measuring at the size the frames are actually rasterised.

PNG is written by Pillow, not ffmpeg. ffmpeg's PNG muxer stamps
`cICP`/`cHRM`/`gAMA`; on V6 decoders applied a gamma shift off the back of those
worth a mean error of 7.2/255 on a supposedly lossless round-trip, and the first
quality comparison had to be thrown away because of it. Pillow emits no colour
chunks at all.

Verified on seven frames spread across the film — one per beat:

| | Range |
|---|---|
| PSNR | 46.63 – 50.56 dB |
| Mean absolute error | 0.386 – 0.720 |
| Luma drift | +0.043 – +0.266 |

A gamma shift would show as consistent, substantial drift. 0.27/255 at the worst
is rounding noise.

## 9. Scroll length

| | V7 | V6 |
|---|---|---|
| Total | 10.66 screens | 9.96 screens |
| Travel | 4.06 | 3.57 |
| Beats | 6.60 | 6.60 |

+7%, all of it travel, because there is more film. Beat weights are untouched.

The "460vh" figure that sat in `index.html` describing the hero was **V5's**, and
had been stale through the whole of V6. It now reads 1066vh.

## 10. Text effects — unchanged, and why

`IN 0.30 · OUT 0.24 · DRIFT 44 · RISE 30 · SPREAD 0.55 · DAMPING 0.14`

All of these operate on normalised progress within a beat, not on frame numbers,
so a longer film re-times them automatically and none needed adjusting. The
silent first frame survives too, and was re-verified rather than assumed: at
progress 0 the kicker is at opacity 0 offset 30px, and every headline line is
pushed a full line-height out of its clip mask. Nothing is on the picture until
the reader moves.

## 11. Verified

- All 598 frames decode; 250 requests on the homepage, **0 failures, 0 console errors**
- Seven beats, correct cells, every block inside the viewport at 1440×900
- Silent first frame
- Engine boots correctly through the `<x-dc>` runtime swap on `index.html`
- Mobile path still swaps the canvas for the fallback video below 1024px

## 12. Open

- **A 4K master** remains the only fix for the resolution ceiling.
- **Face has no footage.** It is a nav pillar and a phone-deck card, never a beat.
  The phone deck used to claim it mirrored the film "word for word"; that claim
  was untrue on V6 as well and has been removed rather than restated.
