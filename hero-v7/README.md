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
