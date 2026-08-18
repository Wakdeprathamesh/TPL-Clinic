# HeroV6 — analysis package

The measurement work behind the homepage hero. Two documents:

| File | What it is |
|---|---|
| `hero-v6-analysis.md` | how the film was measured, and why each decision went the way it did |
| `hero-v6-spec.json` | the machine-readable spec — beats, frames, copy zones, contrast, encode settings, and 25 notes |

**The assets themselves are not here.** They live where the site serves them from, so
there is only ever one copy of each:

| Asset | Path |
|---|---|
| 500 frames, q98, 80.2 MB | `site/assets/hero-v6-frames-webp/` |
| poster · LQIP · phone mp4 | `site/assets/hero-v6/` |
| the engine | `site/assets/js/hero-v6.js` |
| the styling | `site/assets/css/hero-v6.css` |
| preview page | `site/hero-v6.html` — `?beat=hair` jumps to a beat |

The master `HeroV6.mp4` is gitignored: 80 MB, past the size GitHub warns on. Keep it in
the drive. Everything shipped is reproducible from it — but note the extraction must strip
the `cICP`/`cHRM`/`gAMA` chunks ffmpeg writes into its PNGs, or the whole sequence ships
with a gamma shift against the film. See the analysis, §5.
