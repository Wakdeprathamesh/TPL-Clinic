/* ============================================================================
   The scroll film — scroll-driven hero (currently Hero V7)
   ----------------------------------------------------------------------------
   The model, from the spec:

       film plays (no text) -> FREEZES -> text in -> holds -> text out
                            -> film plays (no text) -> ...

   Scroll keeps advancing while the film is frozen; it drives the text instead
   of the frames. Text and film never move at the same time, with exactly one
   deliberate exception (the diagnostics CAPTION, below).

   Three beat types:

     STOP     the film freezes on one frame. Text fades in, holds, fades out.
              Links are live for the whole hold. This is where scroll stops
              driving frames and starts driving type.

     CAPTION  the film keeps advancing, slowly, while a kicker + headline fade
              in and out. NO LINKS — a link that is moving cannot be clicked
              reliably, which is the whole reason captions and stops are
              different things. Used once, for diagnostics, on the client's
              instruction.

     TRAVEL   the film runs clean with nothing over it.

   Numbers here come from hero-v7/hero-v7-spec.json, which came from measuring
   the film. Do not hand-tune the frame numbers without re-running that.

   No scrim. The rooms are white (cell luma 219-240 on V7) so the copy is dark
   ink on the film itself: measured 7.08:1 to 13.14:1 against the worst-case
   pixel of each copy zone, all clearing WCAG AA with ZERO darkening. White text
   would have needed roughly a 0.45-0.50 black overlay, which is the full-frame
   scrim V5 had and this hero exists to be rid of.
   ========================================================================= */
(function () {
  'use strict';

  var TOTAL_FRAMES = 598;
  var FRAME_URL = function (n) {
    return 'assets/hero-v7-4k-frames/frame-' + String(n).padStart(4, '0') + '.webp';
  };

  /* ── Scroll budget ─────────────────────────────────────────────────────────
     Everything is measured in SCREENS (1 screen = 100vh of scroll). The hero's
     height is the sum, so changing a weight here changes the hero's length and
     nothing else.

     TRAVEL_FRAMES_PER_SCREEN is the one number that decides how fast the film
     runs when nothing is on top of it. Lower = slower film, longer page. */
  var CFG = {
    TRAVEL_FRAMES_PER_SCREEN: 140,
    TITLE_SCREENS: 0.85,   // opening card, no links
    STOP_SCREENS: 1.00,    // a stop with a headline, a sub and up to 3 links
    CAPTION_SCREENS: 0.75, // kicker + headline only, film still moving
    // Share of a beat's scroll spent arriving / holding / leaving.
    IN: 0.30, OUT: 0.24,
    /* Scroll -> progress easing as a TIME CONSTANT, not a per-tick factor.
       The old form (current += delta * 0.14 per rAF) ran twice as stiff on a
       120Hz display as on a 60Hz one, because it eased per frame painted, not
       per millisecond elapsed. 110ms reproduces the old 60Hz feel exactly
       (1 - e^(-16.7/110) = 0.14) and now a ProMotion MacBook gets the same
       glide instead of a stiffer one. */
    SMOOTH_MS: 110,

    /* ── Motion ────────────────────────────────────────────────────────────
       A frozen film reads as a stall unless something is still answering the
       wheel. During a stop the frames are deliberately not moving, so the TYPE
       carries the motion instead, and it is all driven by scroll position
       rather than by time — scroll forward and it advances, scroll back and it
       reverses. Nothing here runs on its own.

       DRIFT is the important one: the whole block travels this many pixels
       across the beat, arrival to departure, so even mid-hold the scroll is
       visibly doing something.
       RISE is how far each element travels on its way in.
       SPREAD is how much of the arrival phase is spent staggering children. */
    DRIFT: 44,
    RISE: 30,
    SPREAD: 0.55
  };

  /* ── The beats ─────────────────────────────────────────────────────────────
     freeze  the frame a STOP holds on (the plateau's midpoint — the most
             settled frame in the run, so the camera has genuinely come to rest)
     a, b    the measured plateau, kept for reference and for the caption's
             frame span
     cell    the copy zone from the 3x3 analysis
     ink     measured worst-case contrast against that zone

     One correction learned on V7: a 3x3 cell is NOT the region to measure. The
     copy block is routinely taller than its cell — 432px of block in a 242px
     cell — so it hangs into the cell below, and cell statistics quietly miss
     whatever is down there. Body was picked as top-centre on cell numbers
     (luma 234, variance 1.4, 12.79:1) and measured 1.22:1 in the browser,
     because the block's lower half sat over the practitioner. The ink figures
     below are now measured against the BLOCK'S OWN FOOTPRINT on the painted
     canvas, at the 5th percentile, which is the number that actually governs
     whether the type is readable.                                           */
  var BEATS = [
    { type: 'stop', id: 'title', freeze: 1, a: 1, b: 4, cell: 'top-right', ink: 11.94,
      kicker: 'TPL Clinic — Mayfair',
      headline: 'One specialty, followed all the way through.',
      sub: '', links: [] },

    { type: 'stop', id: 'consultation', freeze: 58, a: 50, b: 65, cell: 'mid-left', ink: 13.19,
      kicker: '01 — Consultation',
      headline: 'It begins with a conversation.',
      sub: 'Assessment and diagnostics before anything is recommended.',
      links: [
        { label: 'Consultation', href: 'prp.html' },
        { label: 'Diagnostics', href: 'services.html' },
        { label: 'TrichoComp™', href: 'services.html' }
      ] },

    /* The one caption. Film keeps running through 110-139 while this fades in
       and out — twice the span it had on V6, because V7 holds the diagnostics
       shot longer. Safe over moving film because the top-left cell peaks at
       1.10 motion across the run while the frame as a whole averages 2.64 —
       the two people move, the wall the type sits on does not. */
    { type: 'caption', id: 'diagnostics', a: 110, b: 139, cell: 'top-left', ink: 13.38,
      kicker: 'Diagnostics',
      headline: 'Measured before anything is recommended.',
      sub: '', links: [] },

    { type: 'stop', id: 'hair', freeze: 259, a: 255, b: 263, cell: 'bot-right', ink: 10.69,
      kicker: '02 — Hair',
      headline: 'Density, restored at the root.',
      sub: 'Platelet-rich plasma placed directly into the scalp.',
      links: [
        { label: 'Enhanced PRP', href: 'prp.html' },
        { label: 'Regenera Activa®', href: 'services.html' },
        { label: 'Invisible Hair Transplant™', href: 'https://treatment.tplclinic.com/hair-transplant/' }
      ] },

    { type: 'stop', id: 'body', freeze: 325, a: 320, b: 330, cell: 'mid-right', ink: 11.90,
      kicker: '03 — Body',
      headline: 'Skin quality, below the neck.',
      sub: 'The same protocols, adjusted for depth and area.',
      links: [
        { label: 'Morpheus8®', href: 'services.html' },
        { label: 'Soprano Ice Titanium™', href: 'services.html' },
        { label: 'Mesotherapy', href: 'services.html' }
      ] },

    { type: 'stop', id: 'surgical', freeze: 396, a: 386, b: 405, cell: 'top-left', ink: 12.61,
      kicker: '04 — Surgical',
      headline: 'The Invisible Hair Transplant™',
      sub: 'Surgeon-led, and designed to be undetectable.',
      links: [
        { label: 'Invisible Hair Transplant™', href: 'https://treatment.tplclinic.com/hair-transplant/' },
        { label: 'Surgeon consultation', href: 'https://treatment.tplclinic.com/hair-transplant/' }
      ] },

    /* Moved off the brand-plaque end card so the plaques can close the film
       clean — they already list the five brands, so captioning them would only
       repeat them. Links collapsed to two: all five brand links pointed at the
       same services.html, and five labels on one destination is not
       navigation. */
    { type: 'stop', id: 'dispensary', freeze: 590, a: 583, b: 597, cell: 'top-right', ink: 11.36,
      kicker: '05 — Dispensary',
      headline: 'What you take home with you.',
      sub: 'The regimen that holds the result between visits.',
      links: [
        { label: 'Skincare', href: 'services.html' },
        { label: 'Hair care', href: 'services.html' }
      ] }
  ];

  /* ── Build the timeline ────────────────────────────────────────────────────
     A flat list of segments, each owning a slice of scroll. Travel segments are
     generated between the beats so the film always has somewhere to go. */
  function buildTimeline() {
    var segs = [];
    var frame = 1;

    function travelTo(target) {
      var span = Math.abs(target - frame);
      if (span <= 0) return;
      segs.push({ kind: 'travel', from: frame, to: target,
                  screens: span / CFG.TRAVEL_FRAMES_PER_SCREEN });
      frame = target;
    }

    BEATS.forEach(function (b) {
      if (b.type === 'stop') {
        travelTo(b.freeze);
        segs.push({ kind: 'stop', beat: b, frame: b.freeze,
                    screens: b.id === 'title' ? CFG.TITLE_SCREENS : CFG.STOP_SCREENS });
      } else {
        travelTo(b.a);
        // the film advances across the caption's own frames, slowly
        segs.push({ kind: 'caption', beat: b, from: b.a, to: b.b,
                    screens: CFG.CAPTION_SCREENS });
        frame = b.b;
      }
    });
    travelTo(TOTAL_FRAMES); // let the plaques play out

    var total = segs.reduce(function (s, x) { return s + x.screens; }, 0);
    var acc = 0;
    segs.forEach(function (s) {
      s.t0 = acc / total; acc += s.screens; s.t1 = acc / total;
    });
    return { segs: segs, screens: total };
  }

  /* ── Frame store ───────────────────────────────────────────────────────────
     Decode off the main thread where the browser allows it (createImageBitmap).
     With the 4K frames the store EVICTS: decoded frames live in a sliding
     window around the playhead, the beat freezes and frame 1 stay pinned, and
     the whole film's bytes are fetch-warmed into the HTTP cache in the
     background so a re-decode after eviction reads from disk, not the network.

     Draw falls back to the nearest decoded frame, so a gap degrades to a
     slightly coarser scrub rather than a blank canvas. */
  function FrameStore(onDecode, pins, getSize) {
    var store = new Array(TOTAL_FRAMES + 1);
    /* 12 in flight. Above roughly this the browser's own per-host connection
       limit is the bottleneck rather than us, and the queue just gets longer. */
    var inflight = 0, MAX_PARALLEL = 12, queue = [], queued = {}, started = false;
    var supportsBitmap = typeof createImageBitmap === 'function';
    /* Whether this browser honours createImageBitmap's resize options.
       Detected from the first resized decode: a browser that ignores them
       hands back the full-size bitmap, and we fall back to plain decodes with
       scaled paints for the whole session. */
    var resizeOK = supportsBitmap ? undefined : false;
    var lastWantAt = 0;

    /* ── Eviction ──────────────────────────────────────────────────────────
       Not optional at 4K. A decoded 3840x2160 RGBA bitmap is 33MB; 598 of them
       resident at once would be 19.8GB, and the 1080p set's always-resident
       5GB was already the ceiling of what a laptop forgives. WINDOW frames
       either side of the playhead stay warm — 129 frames plus the pins is the
       same ~5GB envelope the 1080p hero shipped with — and everything else is
       close()d as the playhead moves away. */
    var WINDOW = 64;
    var pinned = {};
    (pins || []).forEach(function (n) { pinned[n] = 1; });
    var BUDGET = (2 * WINDOW + 1) + (pins ? pins.length : 0) + 16;
    var decodedCount = 0, center = 1, lastDir = 1;

    function keep(n, img) {
      if (!store[n]) decodedCount++;
      store[n] = img;
    }
    function drop(n) {
      var b = store[n];
      if (!b) return;
      if (b.close) { try { b.close(); } catch (e) {} }
      store[n] = null; decodedCount--;
    }
    function evict() {
      if (decodedCount <= BUDGET) return;
      for (var i = 1; i <= TOTAL_FRAMES; i++) {
        if (store[i] && !pinned[i] && Math.abs(i - center) > WINDOW) drop(i);
      }
    }

    /* THE architectural decision of the 4K hero, remade with honest numbers.
       Painting the 3840-wide frame scaled every tick costs 33ms a blit with
       the 'high' filter and 13ms with 'low' on the machine this was tuned on —
       the crossfade doubled it and the scrub visibly lagged. Resampling ONCE
       here, at decode, costs ~125ms against 90ms plain (a 1.4x hit the
       12-deep queue absorbs), and every paint after it is a 1:1 blit measured
       at 4-7ms WITH the crossfade. resizeQuality 'high' costs the same as
       'low' at decode, so the film also looks better than any per-paint
       filter made it. Memory per resident frame drops ~35% as a side effect. */
    function decode(n) {
      if (store[n]) return Promise.resolve();
      var sz = getSize ? getSize() : null;
      if (supportsBitmap) {
        return fetch(FRAME_URL(n), { cache: 'force-cache' })
          .then(function (r) { return r.ok ? r.blob() : Promise.reject(r.status); })
          .then(function (blob) {
            if (sz && resizeOK !== false) {
              return createImageBitmap(blob, {
                resizeWidth: sz.w, resizeHeight: sz.h, resizeQuality: 'high'
              }).then(function (bmp) {
                if (resizeOK === undefined) resizeOK = (bmp.width === sz.w);
                if (!resizeOK) { bmp.close(); return createImageBitmap(blob); }
                return bmp;
              });
            }
            return createImageBitmap(blob);
          })
          .then(function (bmp) { keep(n, bmp); })
          .catch(function () { return viaImage(n); });
      }
      return viaImage(n);
    }
    function viaImage(n) {
      return new Promise(function (res) {
        var im = new Image();
        im.decoding = 'async';
        im.onload = function () { keep(n, im); res(); };
        im.onerror = function () { res(); };
        im.src = FRAME_URL(n);
      });
    }
    /* Every decode reports back, not just the first. The draw path is allowed
       to fall back to the nearest decoded frame, which means an early paint can
       be showing the wrong shot entirely — without a per-decode signal the
       canvas has no reason to ever repaint, and the hero opens on the wrong
       picture until the first scroll. */
    function pump() {
      while (inflight < MAX_PARALLEL && queue.length) {
        var n = queue.shift(); delete queued[n];
        if (store[n]) continue;
        inflight++;
        (function (which) {
          decode(which).then(function () {
            inflight--;
            onDecode && onDecode(which);
            pump();
          });
        })(n);
      }
      evict();
    }
    function push(n, front) {
      n = Math.round(n);
      if (n < 1 || n > TOTAL_FRAMES || store[n] || queued[n]) return;
      queued[n] = 1;
      if (front) queue.unshift(n); else queue.push(n);
    }
    return {
      get: function (n) {
        if (store[n]) return store[n];
        for (var d = 1; d < TOTAL_FRAMES; d++) {
          if (n - d >= 1 && store[n - d]) return store[n - d];
          if (n + d <= TOTAL_FRAMES && store[n + d]) return store[n + d];
        }
        return null;
      },
      ready: function (n) { return !!store[n]; },
      count: function () { return decodedCount; },
      /* The draw path calls this with every frame it asks for. Requests are
         biased in the direction of travel — a short tail behind the playhead,
         a long head in front — and unshifted so the nearest frame is always
         the next decode. */
      want: function (n) {
        if (n === center) return;
        lastWantAt = Date.now();
        lastDir = n > center ? 1 : -1;
        center = n;
        for (var b = 1; b <= 8; b++) push(n - lastDir * b, true);
        for (var a = 32; a >= 0; a--) push(n + lastDir * a, true);
        pump();
      },
      /* The stage was resized, so every resident bitmap is the wrong size.
         Stale ones still paint (the draw path scales any mismatched bitmap),
         but they are dropped here so the window refills at the new size. */
      rescale: function () {
        var sz = getSize ? getSize() : null;
        if (!sz || resizeOK === false) return;
        for (var i = 1; i <= TOTAL_FRAMES; i++) {
          if (store[i] && store[i].width !== sz.w) drop(i);
        }
        (pins || []).forEach(function (n) { push(n, true); });
        pump();
      },
      start: function () {
        if (started) return; started = true;
        (pins || []).forEach(function (n) { push(n); });
        for (var n = 1; n <= WINDOW; n++) push(n);
        pump();
        /* Warm the whole film's BYTES into the HTTP cache — no decode, one
           request at a time, and it stands aside while the reader is actively
           scrubbing so the window's own fetches never queue behind it. */
        if (typeof fetch === 'function') {
          (function warm(i) {
            if (i > TOTAL_FRAMES) return;
            if (Date.now() - lastWantAt < 350) { setTimeout(function () { warm(i); }, 400); return; }
            fetch(FRAME_URL(i), { cache: 'force-cache' })
              .catch(function () {})
              .then(function () { setTimeout(function () { warm(i + 1); }, 0); });
          })(1);
        }
      }
    };
  }

  /* ── Copy overlay ──────────────────────────────────────────────────────────
     Real DOM, not canvas text: the links have to be focusable, selectable and
     crawlable. A 3x3 grid over the film puts each block in the cell the
     analysis chose for it. */
  var CELL_POS = {
    'top-left':   [1, 1], 'top-centre': [1, 2], 'top-right':   [1, 3],
    'mid-left':   [2, 1], 'centre':     [2, 2], 'mid-right':   [2, 3],
    'bot-left':   [3, 1], 'bot-centre': [3, 2], 'bot-right':   [3, 3]
  };

  function buildCopy(root) {
    var grid = document.createElement('div');
    grid.className = 'hv6-grid';
    BEATS.forEach(function (b) {
      var pos = CELL_POS[b.cell] || CELL_POS['mid-left'];
      var cell = document.createElement('div');
      cell.className = 'hv6-cell hv6-cell--' + b.cell +
                       (b.type === 'caption' ? ' hv6-cell--caption' : '');
      cell.style.gridRow = pos[0];
      cell.style.gridColumn = pos[1];
      cell.setAttribute('data-beat', b.id);

      var block = document.createElement('div');
      block.className = 'hv6-block';
      var html = '';
      if (b.kicker) html += '<div class="hv6-kicker">' + b.kicker + '</div>';
      if (b.headline) html += '<h2 class="hv6-headline">' + b.headline + '</h2>';
      if (b.sub) html += '<p class="hv6-sub">' + b.sub + '</p>';
      if (b.links.length) {
        html += '<div class="hv6-links">' + b.links.map(function (l) {
          var ext = /^https?:/.test(l.href);
          return '<a class="hv6-link" href="' + l.href + '"' +
                 (ext ? ' target="_blank" rel="noopener"' : '') + '>' + l.label + '</a>';
        }).join('') + '</div>';
      }
      block.innerHTML = html;
      cell.appendChild(block);
      grid.appendChild(cell);
      b._el = cell;
      b._block = block;
    });
    root.appendChild(grid);
    return grid;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Split a headline into its rendered lines so each can mask up from its own
     baseline — the reveal the rest of the site already uses on section headings.
     Lines depend on wrapping, so this measures word positions and has to be
     redone whenever the column width changes. */
  function splitLines(h2) {
    var text = h2.getAttribute('data-text');
    if (text === null) { text = h2.textContent.trim(); h2.setAttribute('data-text', text); }
    var words = text.split(/\s+/);
    h2.innerHTML = words.map(function (w) {
      return '<span class="hv6-w">' + escapeHtml(w) + '</span>';
    }).join(' ');

    var lines = [], top = null, cur = null;
    Array.prototype.forEach.call(h2.querySelectorAll('.hv6-w'), function (w) {
      var t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 3) { cur = []; lines.push(cur); top = t; }
      cur.push(w.textContent);
    });

    h2.innerHTML = lines.map(function (l) {
      return '<span class="hv6-line"><span class="hv6-line-i">' +
             escapeHtml(l.join(' ')) + '</span></span>';
    }).join('');
    return Array.prototype.slice.call(h2.querySelectorAll('.hv6-line-i'));
  }

  /* The ordered list of things that animate in, per beat: the kicker, then each
     headline line, then the sub, then the links. */
  function buildAnimTargets(beat) {
    var block = beat._block;
    var items = [];
    var k = block.querySelector('.hv6-kicker');
    if (k) items.push(k);
    var h2 = block.querySelector('.hv6-headline');
    if (h2) items = items.concat(splitLines(h2));
    var sub = block.querySelector('.hv6-sub');
    if (sub) items.push(sub);
    var links = block.querySelector('.hv6-links');
    if (links) items.push(links);
    beat._items = items;
  }

  /* ── Easing ────────────────────────────────────────────────────────────── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* Text envelope across a beat.

     in  = how far through the arrival phase (0 -> 1)
     out = how far through the departure phase (1 -> 0)
     held = fully up, which is the only window where links may be clicked.

     The film opens with nothing on it: at the top of the page local is exactly
     0, so the title card is invisible and arrives as the reader starts to move.
     That is deliberate — the first thing the hero does should be a response to
     scrolling, not a card that is already there. */
  function envelope(local) {
    var i = CFG.IN > 0 ? clamp01(local / CFG.IN) : 1;
    var o = CFG.OUT > 0 ? clamp01((1 - local) / CFG.OUT) : 1;
    return { in: i, out: o, o: Math.min(easeOutCubic(i), easeOutCubic(o)),
             held: i >= 1 && o >= 1 };
  }

  /* Staggered arrival. Each child of a block gets its own slice of the arrival
     phase, so a beat BUILDS as you scroll — kicker, then the headline line by
     line, then the sub, then the links — instead of one block appearing at once.
     `spread` is how much of the arrival is spent staggering; the remainder is
     the time any single element takes to travel. */
  function stagger(inT, i, n, spread) {
    if (n <= 1) return inT;
    var step = spread / (n - 1);
    return clamp01((inT - i * step) / (1 - spread));
  }

  /* ── Boot ──────────────────────────────────────────────────────────────── */
  function init() {
    var root = document.querySelector('[data-hv6]');
    if (!root) return;

    var stage = root.querySelector('[data-hv6-stage]');
    var canvas = root.querySelector('[data-hv6-canvas]');
    var copyRoot = root.querySelector('[data-hv6-copy]');
    var readout = root.querySelector('[data-hv6-frame]');
    var cue = root.querySelector('[data-hv6-cue]');
    if (!stage || !canvas || !copyRoot) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var phone = window.matchMedia('(max-width: 767px)').matches ||
                /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    document.documentElement.setAttribute('data-hv6-mode', reduced ? 'reduced' : phone ? 'phone' : 'scrub');

    /* Phones get the hardware video: 500 frames is 35MB and a canvas scrub on a
       phone is both a download and a decode the device should not be asked for.
       Reduced motion gets the poster. Both keep the title copy, so the hero
       still says something. */
    if (reduced || phone) {
      root.style.height = '100svh';
      var media = reduced
        ? '<img src="assets/hero-v7/hero-poster.webp" alt="TPL Clinic, Mayfair" class="hv6-fallback" />'
        : '<video class="hv6-fallback" src="assets/hero-v7/hero-mobile.mp4" ' +
          'poster="assets/hero-v7/hero-poster.webp" autoplay loop muted playsinline></video>';
      canvas.outerHTML = media;
      buildCopy(copyRoot);
      BEATS.forEach(function (b) {
        b._el.style.opacity = b.id === 'title' ? '1' : '0';
        b._el.style.pointerEvents = b.id === 'title' ? 'auto' : 'none';
        if (b.id !== 'title') b._el.setAttribute('aria-hidden', 'true');
      });
      if (readout) readout.textContent = reduced ? 'HERO POSTER' : 'HERO — MOBILE';
      return;
    }

    var tl = buildTimeline();
    root.style.height = (tl.screens * 100).toFixed(1) + 'vh';

    buildCopy(copyRoot);
    BEATS.forEach(buildAnimTargets);
    var ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    /* Filtering stays CHEAP at paint time on purpose. The high-quality
       resample happens once, at decode (see FrameStore) — a 'high' paint-time
       filter was measured at 33ms a blit on the 2880-wide backing store, which
       with the crossfade's two blits is how the scrub lagged. The only scaled
       paints left are transitional: a stale-size bitmap right after a window
       resize, or a browser that ignores createImageBitmap's resize options.
       Assigning canvas.width resets context state, so resize() re-calls this. */
    function setSmoothing() {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'low';
    }
    setSmoothing();

    /* Repaint when the frame we actually want lands, if what is on screen is a
       stand-in. Cheap: one comparison per decode, and it only ever draws when
       the picture would otherwise be wrong. */
    var pinnedFrames = [1];
    BEATS.forEach(function (bt) { if (bt.type === 'stop') pinnedFrames.push(bt.freeze); });
    var store = FrameStore(function (n) {
      if ((n === wantFrame || n === wantFrame + 1) && !drawnExact) draw(true);
    }, pinnedFrames, function () { return decodeSize; });
    /* store.start() happens inside the first resize(): decodes must not begin
       until the backing size exists, or the first ~70 frames would arrive at
       full 4K and be dropped again by the first rescale(). */

    /* ── Backing store, capped at the source ──────────────────────────────────
       The 4K master landed, so this cap now stops biting on anything up to a
       4K-raster display — a 1440px DPR-2 stage (2880px wanted) draws the
       3840px frame DOWN for the first time instead of upscaling 1080p by 59%.
       The cap still matters above that: pixels past the source's cannot be
       invented, so the backing store never exceeds what the frame can cover at
       scale 1, and the compositor does the final stretch. */
    var SRC_W = 3840, SRC_H = 2160;
    var dpr = 1, geom = null, decodeSize = null;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var wantW = Math.max(1, Math.round(stage.clientWidth * dpr));
      var wantH = Math.max(1, Math.round(stage.clientHeight * dpr));
      var cap = Math.min(1, SRC_W / wantW, SRC_H / wantH);
      canvas.width = Math.max(1, Math.round(wantW * cap));
      canvas.height = Math.max(1, Math.round(wantH * cap));
      setSmoothing();   // assigning width/height wiped every ctx setting

      /* Cover geometry is a function of canvas size and source size only, so it
         is computed here and not per drawn frame. */
      var s = Math.max(canvas.width / SRC_W, canvas.height / SRC_H);
      geom = { w: SRC_W * s, h: SRC_H * s,
               x: (canvas.width - SRC_W * s) / 2, y: (canvas.height - SRC_H * s) / 2,
               scale: s };

      /* The size every decode resamples to: the full frame at cover scale,
         so a painted frame is a 1:1 blit at (geom.x, geom.y). */
      var newSize = { w: Math.max(1, Math.round(geom.w)), h: Math.max(1, Math.round(geom.h)) };
      var changed = !decodeSize || newSize.w !== decodeSize.w;
      decodeSize = newSize;
      if (changed) store.rescale();
      store.start();   // no-op after the first call
      draw(true);
    }

    var target = 0, current = 0, looping = false, lastFrame = -1;
    /* wantFrame is what the timeline asks for; drawnExact says whether that is
       what is on the canvas, as opposed to the nearest decoded neighbour. */
    var wantFrame = 1, drawnExact = false;

    function readScroll() {
      var rect = root.getBoundingClientRect();
      var span = root.offsetHeight - window.innerHeight;
      if (span <= 0) return 0;
      return clamp01(-rect.top / span);
    }

    /* Which segment are we in, and how far through it. */
    function locate(p) {
      var segs = tl.segs;
      for (var i = 0; i < segs.length; i++) {
        if (p <= segs[i].t1 || i === segs.length - 1) {
          var s = segs[i];
          var local = s.t1 === s.t0 ? 0 : clamp01((p - s.t0) / (s.t1 - s.t0));
          return { seg: s, local: local };
        }
      }
      return { seg: segs[segs.length - 1], local: 1 };
    }

    /* Sub-frame crossfade. The film is 598 frames over 42 seconds — 14fps of
       temporal density — so a slow scroll used to STEP from frame to frame,
       which reads as the film being stuck. The scroll position is continuous,
       and now the paint is too: the frame below the playhead is drawn opaque
       and the frame above it is drawn over the top at the fractional alpha.
       Two 1:1 blits per tick, measured 4-7ms flushed on a 2880-wide backing
       store — the bitmaps arrive pre-resampled from decode, so no filtering
       happens here. At a stop the position is an integer, the alpha is 0, and
       the second blit is skipped — a freeze is still a single exact frame. */
    function blit(img) {
      var iw = img.width || img.naturalWidth;
      if (decodeSize && iw === decodeSize.w) {
        ctx.drawImage(img, Math.round(geom.x), Math.round(geom.y));      // 1:1
      } else {
        ctx.drawImage(img, geom.x, geom.y, geom.w, geom.h);              // stale size / no-resize browser
      }
    }
    function drawFrame(f) {
      var n0 = Math.floor(f), frac = f - n0;
      var n1 = Math.min(TOTAL_FRAMES, n0 + 1);
      var img = store.get(n0);
      if (!img || !geom) { drawnExact = false; return; }
      ctx.globalAlpha = 1;
      blit(img);
      drawnExact = store.ready(n0);
      if (frac > 0.01 && n1 !== n0) {
        if (store.ready(n1)) {
          ctx.globalAlpha = frac;
          blit(store.get(n1));
          ctx.globalAlpha = 1;
        } else {
          drawnExact = false;   // the blend half is missing; repaint when it lands
        }
      }
    }

    function draw(force) {
      var at = locate(current);
      var seg = at.seg, local = at.local;

      var frame, env = { o: 0, held: false }, active = null;

      if (seg.kind === 'travel') {
        frame = seg.from + (seg.to - seg.from) * local;
      } else if (seg.kind === 'stop') {
        frame = seg.frame;                     // frozen
        env = envelope(local, seg.beat.id === 'title'); active = seg.beat;
      } else {                                 // caption: film runs under the text
        frame = seg.from + (seg.to - seg.from) * local;
        env = envelope(local); active = seg.beat;
      }

      var f = Math.max(1, Math.min(TOTAL_FRAMES, frame));
      var n = Math.floor(f);
      wantFrame = n;
      store.want(n);   // slide the decode window with the playhead
      // repaint on any visible movement (a 1/300th-frame change is sub-alpha),
      // when forced, or when the last paint was a stand-in
      if (force || Math.abs(f - lastFrame) > 0.003 || !drawnExact) { drawFrame(f); lastFrame = f; }

      BEATS.forEach(function (b) {
        var on = b === active;
        var o = on ? env.o : 0;

        if (on) {
          /* Continuous drift across the whole beat. This is what stops a frozen
             frame reading as a stall: the block is always somewhere different
             for a different scroll position, including mid-hold. */
          var drift = (0.5 - local) * CFG.DRIFT;
          b._el.style.opacity = 1;
          b._block.style.transform = 'translate3d(0,' + drift.toFixed(2) + 'px,0)';

          var items = b._items || [];
          for (var i = 0; i < items.length; i++) {
            var p = easeOutCubic(stagger(env.in, i, items.length, CFG.SPREAD));
            var leave = easeOutCubic(env.out);
            var el = items[i];
            var isLine = el.className === 'hv6-line-i';
            // lines mask up from their own baseline; everything else rises and fades
            el.style.transform = 'translate3d(0,' +
              ((1 - p) * (isLine ? 100 : CFG.RISE)).toFixed(2) + (isLine ? '%' : 'px') + ',0)';
            el.style.opacity = isLine ? leave : Math.min(p, leave);
          }
          b._o = -1;                       // force a reset when this beat leaves
        } else if (b._o !== 0) {
          b._el.style.opacity = 0;
          b._o = 0;
        }
        // Links live for the whole hold, and only then — a link you cannot see
        // must not be tabbable, and a link mid-fade must not be clickable.
        var live = on && env.held;
        if (b._live !== live) {
          b._el.style.pointerEvents = live ? 'auto' : 'none';
          if (live) b._el.removeAttribute('aria-hidden');
          else b._el.setAttribute('aria-hidden', 'true');
          b._el.querySelectorAll('a').forEach(function (a) {
            a.tabIndex = live ? 0 : -1;
          });
          b._live = live;
        }
      });

      if (readout) {
        readout.textContent = 'FRAME ' + String(n).padStart(4, '0') + ' / ' + TOTAL_FRAMES;
      }
      if (cue) cue.style.opacity = current > 0.02 ? '0' : '1';
    }

    /* One rAF loop, easing toward the scroll target, parked when settled. The
       scroll handler never draws and never decodes — it records a number. */
    var lastTick = 0;
    function loop(ts) {
      var delta = target - current;
      if (Math.abs(delta) < 0.00002) {
        current = target; draw(false); looping = false; return;
      }
      var dt = lastTick ? Math.min(100, ts - lastTick) : 16.7;
      lastTick = ts;
      current += delta * (1 - Math.exp(-dt / CFG.SMOOTH_MS));
      draw(false);
      requestAnimationFrame(loop);
    }
    function kick() {
      if (!looping) { looping = true; lastTick = 0; requestAnimationFrame(loop); }
    }
    function onScroll() { target = readScroll(); kick(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      /* Line breaks move with the column width, so the headline has to be
         re-split. Cheap and rare — it is a resize, not a scroll. */
      BEATS.forEach(buildAnimTargets);
      resize(); onScroll();
    });
    resize();
    onScroll();
    current = target;
    draw(true);

    /* Jump straight to a point on the timeline and paint it, with no easing and
       no rAF. Two uses: the preview page's beat-stepper, and review — open the
       page with ?beat=hair and it lands on that beat, which is the only way to
       screenshot a beat without scrolling to it by hand. */
    function seek(p, alsoScroll) {
      current = target = clamp01(p);
      if (alsoScroll !== false) {
        var span = root.offsetHeight - window.innerHeight;
        if (span > 0) window.scrollTo(0, current * span);
      }
      target = current;               // scrollTo fires onScroll; keep them agreed
      draw(true);
    }
    function seekBeat(id, alsoScroll) {
      var s = tl.segs.filter(function (x) { return x.kind !== 'travel' && x.beat.id === id; })[0];
      if (s) seek((s.t0 + s.t1) / 2, alsoScroll);
      return !!s;
    }

    /* Review mode: ?beat=hair paints that beat with the document left at the top,
       so the beat is on screen without the page having scrolled to it. Scrolling
       from there re-syncs to the real scroll position on the first wheel event. */
    var q = new URLSearchParams(location.search);
    if (q.has('beat')) seekBeat(q.get('beat'), false);
    else if (q.has('seek')) seek(parseFloat(q.get('seek')), false);

    // exposed for the demo page's debug strip and for review
    window.__hv6 = { timeline: tl, store: store, beats: BEATS, cfg: CFG,
                     at: function () { return locate(current); },
                     progress: function () { return current; },
                     seek: seek, seekBeat: seekBeat, draw: draw };
  }

  /* ── Boot ──────────────────────────────────────────────────────────────────
     Two hosts, one rule. On a plain page (hero-v7.html) the markup is in the
     document from the start. On index.html it ships inside <x-dc>, which the
     render-once runtime parses into a React tree and then discards — so an
     element found before that swap is a node about to be thrown away, along
     with every listener bound to it and every style written onto it. This is
     the trap documented in README-HANDOFF, and it is why tpl-mobile.js waits
     the same way.

     Waiting for [data-hv6] to exist is not sufficient on its own: the template
     copy exists too. Wait for <x-dc> to have LEFT the document. */
  function ready() {
    return !document.querySelector('x-dc') && !!document.querySelector('[data-hv6]');
  }
  function boot() {
    if (ready()) { init(); return; }
    var obs = new MutationObserver(function () {
      if (!ready()) return;
      obs.disconnect();
      init();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    // If the runtime never boots there is nothing to enhance; do not observe
    // for the life of the tab.
    setTimeout(function () { obs.disconnect(); }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
