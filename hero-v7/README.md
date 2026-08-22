# HeroV7 — the scroll film

The homepage hero. `Hero V7.mp4` is scrubbed by scroll as a sequence of 598 WebP
frames, with seven beats of copy set as dark ink directly on the picture — no
scrim anywhere.

- **Engine** — `site/assets/js/hero-film.js`
- **Stylesheet** — `site/assets/css/hero-film.css` (shared by the live hero and the preview page)
- **Frames** — `site/assets/hero-v7-frames-webp/` — 598 files, 93.4 MB
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

- **Resolution ceiling**, unchanged from V6. The master is 1920×1080 and the
  stage rasterises larger than that on a DPR-2 display, so the engine caps its
  backing store rather than upscaling. A 4K master is still the only real fix.
- **Face has no footage** in any master supplied. It is a nav pillar and a card
  in the phone deck — never a beat of the film.
- **`Hero V7 (1).mp4`** in the repo root is byte-identical to `Hero V7.mp4`
  (MD5 `21fe86116de8dfa8b4a99f7cf3baf29c`). 94 MB of duplicate, ignored by git,
  safe to delete.
