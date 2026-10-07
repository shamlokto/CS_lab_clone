/* Sham Lab site scripts: theme, menu, Tn-seq graphics, publication filters,
   gallery lightbox, contact form. No dependencies. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // Small seeded PRNG so the graphics look the same on every visit.
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /* ---------- Theme toggle ---------- */
  function currentTheme() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function initTheme() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var btn = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  }

  /* ---------- Hero: circular Tn-seq insertion map ----------
     Ticks around the chromosome are transposon insertions (height ~ reads);
     gaps are essential genes that tolerate no insertions; chords inside are
     genetic interactions (teal positive, orange negative). Illustrative only. */
  function drawGenome(host) {
    var R = rng(39), size = 400, c = size / 2, r0 = 128;
    var svg = el('svg', { viewBox: '0 0 ' + size + ' ' + size, class: 'genome', role: 'img',
      'aria-label': 'Illustration of a circular bacterial chromosome with transposon insertion sites and genetic interaction links' });
    var spin = el('g', { class: 'spin' }, svg);
    el('circle', { cx: c, cy: c, r: r0, class: 'ring', 'stroke-width': 1 }, spin);
    el('circle', { cx: c, cy: c, r: r0 + 62, class: 'ring', 'stroke-width': .6, 'stroke-dasharray': '2 6' }, spin);

    // Essential regions: no insertions.
    var gaps = [];
    for (var g = 0; g < 26; g++) { var s = R(); gaps.push([s, s + 0.004 + R() * 0.012]); }
    function essential(t) { for (var i = 0; i < gaps.length; i++) if (t > gaps[i][0] && t < gaps[i][1]) return true; return false; }

    var N = 540, ticks = el('g', {}, spin);
    for (var i = 0; i < N; i++) {
      var t = i / N + R() * 0.0015;
      if (essential(t)) continue;
      var reads = Math.pow(R(), 2.4);
      var len = 3 + reads * 52;
      var a = t * Math.PI * 2 - Math.PI / 2;
      var x1 = c + Math.cos(a) * (r0 + 3), y1 = c + Math.sin(a) * (r0 + 3);
      var x2 = c + Math.cos(a) * (r0 + 3 + len), y2 = c + Math.sin(a) * (r0 + 3 + len);
      el('line', { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), class: 'tick',
        'stroke-width': 1.1, 'stroke-opacity': (0.35 + reads * 0.65).toFixed(2) }, ticks);
    }
    // Position labels (D39 chromosome is ~2.05 Mb)
    ['0', '0.5', '1.0', '1.5'].forEach(function (lab, k) {
      var a = k * Math.PI / 2 - Math.PI / 2 + 0.06, rr = r0 - 14;
      var tx = el('text', { x: (c + Math.cos(a) * rr).toFixed(1), y: (c + Math.sin(a) * rr + 3).toFixed(1), 'text-anchor': 'middle' }, spin);
      tx.textContent = lab + ' Mb';
    });

    // Genetic interaction chords
    var arcs = el('g', {}, spin), list = [];
    for (var j = 0; j < 46; j++) {
      var ta = R(), tb = (ta + 0.12 + R() * 0.6) % 1;
      var aa = ta * Math.PI * 2 - Math.PI / 2, ab = tb * Math.PI * 2 - Math.PI / 2, rr2 = r0 - 4;
      var ax = c + Math.cos(aa) * rr2, ay = c + Math.sin(aa) * rr2, bx = c + Math.cos(ab) * rr2, by = c + Math.sin(ab) * rr2;
      var pull = 0.15 + R() * 0.35;
      var mx = c + ((ax + bx) / 2 - c) * pull, my = c + ((ay + by) / 2 - c) * pull;
      var p = el('path', { d: 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1),
        class: 'arc ' + (R() < 0.42 ? 'neg' : 'pos') }, arcs);
      list.push(p);
    }
    // Centre label on a dark disc so chords don't run through the text
    el('circle', { cx: c, cy: c, r: 46, fill: '#0b1017', 'fill-opacity': .9, stroke: '#223042' }, svg);
    var t1 = el('text', { x: c, y: c - 4, 'text-anchor': 'middle', style: 'font-size:11px;fill:#e3e9ef;font-style:italic;letter-spacing:0' }, svg);
    t1.textContent = 'S. pneumoniae';
    var t2 = el('text', { x: c, y: c + 12, 'text-anchor': 'middle' }, svg);
    t2.textContent = 'D39 · 2.05 Mb';
    host.appendChild(svg);

    if (!reduceMotion) {
      var last = null;
      setInterval(function () {
        if (document.hidden) return;
        if (last) last.classList.remove('live');
        last = list[Math.floor(Math.random() * list.length)];
        last.classList.add('live');
      }, 1400);
    }
  }

  /* ---------- Page-head insertion track ---------- */
  function drawTrack(host) {
    var R = rng(parseInt(host.getAttribute('data-track'), 10) * 7919 + 13);
    var w = 1200, h = 36;
    var svg = el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none' });
    var x = 0;
    while (x < w) {
      if (R() < 0.035) { x += 14 + R() * 40; continue; } // essential gene: gap
      var reads = Math.pow(R(), 2.2);
      var hh = 2 + reads * (h - 6);
      el('line', { x1: x.toFixed(1), x2: x.toFixed(1), y1: h, y2: (h - hh).toFixed(1), 'stroke-width': 1.2,
        'stroke-opacity': (0.25 + reads * 0.6).toFixed(2), class: R() < 0.04 ? 'w' : '' }, svg);
      x += 3 + R() * 4;
    }
    host.appendChild(svg);
  }

  /* ---------- Publication filters ---------- */
  function initPubs() {
    var root = document.querySelector('[data-pubs]');
    if (!root) return;
    var input = root.querySelector('input[type="search"]');
    var buttons = root.querySelectorAll('.filter');
    var items = root.querySelectorAll('.pub');
    var groups = root.querySelectorAll('.year-group');
    var count = root.querySelector('.pub-count');
    var empty = root.querySelector('.empty');
    var topic = 'all';
    function apply() {
      var q = (input.value || '').trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var okT = topic === 'all' || (' ' + it.getAttribute('data-topics') + ' ').indexOf(' ' + topic + ' ') > -1;
        var okQ = !q || it.textContent.toLowerCase().indexOf(q) > -1;
        var ok = okT && okQ;
        it.classList.toggle('hidden', !ok);
        if (ok) shown++;
      });
      groups.forEach(function (g) { g.classList.toggle('hidden', !g.querySelector('.pub:not(.hidden)')); });
      if (count) count.textContent = shown + (shown === 1 ? ' paper' : ' papers');
      if (empty) empty.classList.toggle('show', shown === 0);
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        topic = b.getAttribute('data-topic');
        apply();
      });
    });
    input.addEventListener('input', apply);
    apply();
  }

  /* ---------- Gallery lightbox ---------- */
  function initGallery() {
    var dlg = document.querySelector('dialog.lightbox');
    var items = document.querySelectorAll('.gallery button');
    if (!dlg || !items.length) return;
    var img = dlg.querySelector('img'), cap = dlg.querySelector('p'), idx = 0;
    function show(i) {
      idx = (i + items.length) % items.length;
      var b = items[idx];
      img.src = b.getAttribute('data-full');
      img.alt = b.querySelector('img').alt;
      cap.textContent = b.getAttribute('data-caption');
    }
    items.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- Contact form: compose an email ---------- */
  function initContact() {
    var form = document.querySelector('form[data-mailto]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var subject = f.subject.value || 'Enquiry from the lab website';
      var body = f.message.value + '\n\n' + f.name.value + (f.affiliation.value ? '\n' + f.affiliation.value : '');
      window.location.href = 'mailto:' + form.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initMenu();
    document.querySelectorAll('[data-genome]').forEach(drawGenome);
    document.querySelectorAll('[data-track]').forEach(drawTrack);
    initPubs();
    initGallery();
    initContact();
    initReveal();
  });
})();
