/* ==========================================================================
   STARSS STUDIO — main.js
   Lightweight vanilla JavaScript. No dependencies.
   --------------------------------------------------------------------------
   Modules
     1. Helpers
     2. Header, mobile navigation, footer year, canonical URL
     3. Motion: scroll reveal and hero parallax
     4. Copy-to-clipboard (identity page)
     5. Data-driven content: projects, news, showcase, contact
     6. Lightbox
   The site is fully readable without this file: every page ships with its
   content and navigation in plain HTML. This script only adds behaviour.
   Content lives in assets/data/*.js — see README.md.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.STARSS || {};
  var doc = document;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. HELPERS ----------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /** Create an element. attrs: plain attributes; text: textContent (always escaped). */
  function el(tag, attrs, text) {
    var node = doc.createElement(tag);
    if (attrs) { Object.keys(attrs).forEach(function (k) { if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]); }); }
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /** Allow only http(s), mailto and relative URLs — blocks javascript: and similar. */
  function safeUrl(u) {
    if (typeof u !== 'string') return '';
    u = u.trim();
    if (!u) return '';
    if (/^(https?:|mailto:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return '';
    return u;
  }
  function isExternal(u) { return /^https?:/i.test(u) && u.indexOf(location.origin) !== 0; }

  function verified(list) {
    return (Array.isArray(list) ? list : []).filter(function (i) { return i && i.verified === true; });
  }

  function fmtDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
    if (!m) return s || '';
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  var ICONS = {
    game: '<svg class="icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5 41 14.5v19L24 43 7 33.5v-19z"/><path d="M7 14.5 24 24l17-9.5"/><path d="M24 24v19"/></svg>',
    software: '<svg class="icon" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="9" width="38" height="30" rx="2"/><path d="M5 17h38"/><path d="m19 24-5 4 5 4M29 24l5 4-5 4"/></svg>',
    android: '<svg class="icon" viewBox="0 0 48 48" aria-hidden="true"><rect x="13" y="4" width="22" height="40" rx="3"/><path d="M13 10h22M20 38h8"/></svg>',
    news: '<svg class="icon" viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="7" width="34" height="34" rx="2"/><path d="M14 16h20M14 24h20M14 32h12"/></svg>'
  };
  var CATEGORIES = {
    game: { label: 'Games', single: 'Game', text: 'Original games created from independent ideas and experimentation.' },
    software: { label: 'Software', single: 'Software', text: 'Software products designed around clarity, function and precision.' },
    android: { label: 'Android Applications', single: 'Android Application', text: 'Applications built for Android devices.' }
  };
  var ARROW = '<svg class="arrow" width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 6h16M11 1l5 5-5 5"/></svg>';

  function withArrow(node, label) {
    node.appendChild(doc.createTextNode(label + ' '));
    var s = el('span'); s.innerHTML = ARROW; node.appendChild(s.firstChild);
    return node;
  }

  /* 2. HEADER, NAVIGATION, FOOTER YEAR, CANONICAL ------------------------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    var toggle = $('.nav-toggle', header);
    var nav = $('#site-nav');

    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle || !nav) return;
    var mq = window.matchMedia('(min-width: 1180px)');

    function setOpen(open) {
      header.classList.toggle('nav-open', open);
      doc.body.classList.toggle('nav-locked', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    toggle.addEventListener('click', function () { setOpen(!header.classList.contains('nav-open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) { setOpen(false); toggle.focus(); }
    });
    doc.addEventListener('focusin', function (e) { // keep keyboard focus inside the open menu
      if (header.classList.contains('nav-open') && !header.contains(e.target)) toggle.focus();
    });
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);

    // index each nav item so the mobile menu can stagger in
    $$('.nav-list li', nav).forEach(function (li, i) { li.style.setProperty('--i', i); });
  }

  function initFooterYear() {
    $$('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
  }

  /** While the canonical URL is still the placeholder, point it at the live address. */
  function initCanonical() {
    if (!/^https?:$/.test(location.protocol)) return;
    var canon = $('link[rel="canonical"]');
    if (!canon || canon.href.indexOf('YOUR-') === -1) return;
    var url = location.origin + location.pathname;
    canon.setAttribute('href', url);
    var og = $('meta[property="og:url"]');
    if (og) og.setAttribute('content', url);
  }

  /* 3. MOTION -------------------------------------------------------------- */
  function initReveal() {
    $$('[data-stagger]').forEach(function (parent) {
      Array.prototype.slice.call(parent.children).forEach(function (child, i) {
        child.classList.add('reveal');
        child.style.setProperty('--i', Math.min(i, 6));
      });
    });
    revealAll($$('.reveal'));
  }
  var observer = null;
  function revealAll(nodes) {
    if (!nodes.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); observer.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    nodes.forEach(function (n) { observer.observe(n); });
  }

  function initParallax() {
    var layer = $('.hero-visual .logo-frame');
    if (!layer || reduceMotion) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      layer.style.setProperty('--py', Math.min(y * 0.07, 48).toFixed(1) + 'px');
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* 4. COPY TO CLIPBOARD --------------------------------------------------- */
  function initCopy() {
    var status = $('#copy-status');
    $$('[data-copy]').forEach(function (btn) {
      var original = btn.textContent;
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy');
        var done = function (ok) {
          btn.textContent = ok ? 'Copied' : 'Press Ctrl/Cmd+C';
          if (status) status.textContent = ok ? value + ' copied to clipboard' : '';
          setTimeout(function () { btn.textContent = original; }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
        } else {
          var ta = el('textarea', { 'aria-hidden': 'true' }); ta.value = value; ta.style.cssText = 'position:fixed;opacity:0;top:0';
          doc.body.appendChild(ta); ta.select();
          var ok = false; try { ok = doc.execCommand('copy'); } catch (e) { /* ignore */ }
          doc.body.removeChild(ta); done(ok);
        }
      });
    });
  }

  /* 5. DATA-DRIVEN CONTENT ------------------------------------------------- */
  function hideEmpty(root) { $$('[data-empty]', root || doc).forEach(function (n) { n.hidden = true; }); }

  /* Projects ---------------------------------------------------------------- */
  function projectCard(p) {
    var cat = CATEGORIES[p.category] || { single: 'Project' };
    var card = el('article', { 'class': 'card item-card', 'data-category': p.category || '' });

    var media = el('div', { 'class': 'media' });
    if (p.image) {
      media.appendChild(el('img', { src: safeUrl(p.image), alt: p.imageAlt || (p.title + ' — official project image'), width: '800', height: '500', loading: 'lazy', decoding: 'async' }));
    } else {
      media.className = 'media media--blank';
      media.innerHTML = ICONS[p.category] || ICONS.software;
    }
    card.appendChild(media);

    var body = el('div', { 'class': 'body' });
    var meta = el('div', { 'class': 'meta' });
    meta.appendChild(el('span', { 'class': 'chip' }, cat.single));
    if (p.status) meta.appendChild(el('span', { 'class': 'chip' }, p.status));
    if (p.version) meta.appendChild(el('span', null, 'Version ' + p.version));
    body.appendChild(meta);
    body.appendChild(el('h3', null, p.title));
    if (p.description) body.appendChild(el('p', null, p.description));

    var actions = el('div', { 'class': 'actions' });
    var detail = safeUrl(p.detailUrl), official = safeUrl(p.officialUrl);
    if (detail) { var d = el('a', { 'class': 'text-link', href: detail }); withArrow(d, 'View details'); actions.appendChild(d); }
    if (official) {
      var o = el('a', { 'class': 'text-link', href: official });
      if (isExternal(official)) { o.setAttribute('target', '_blank'); o.setAttribute('rel', 'noopener noreferrer'); }
      withArrow(o, 'Official page'); actions.appendChild(o);
    }
    if (actions.children.length) body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function initProjects() {
    var list = verified(S.projects).filter(function (p) { return p.title && CATEGORIES[p.category]; });
    if (!list.length) return;

    // Home: first three
    var home = $('[data-projects-home]');
    if (home) {
      hideEmpty(home.parentNode);
      list.slice(0, 3).forEach(function (p, i) { var c = projectCard(p); c.classList.add('reveal'); c.style.setProperty('--i', i); home.appendChild(c); });
      home.hidden = false;
      revealAll($$('.reveal', home));
    }

    // Projects page: filters + grouped categories
    var root = $('[data-projects-page]');
    if (!root) return;
    hideEmpty(doc);
    var filters = el('div', { 'class': 'filters', role: 'group', 'aria-label': 'Filter projects by category' });
    var blocksWrap = el('div');
    var buttons = [];

    function mkFilter(key, label) {
      var b = el('button', { type: 'button', 'class': 'filter-btn', 'aria-pressed': key === 'all' ? 'true' : 'false', 'data-filter': key }, label);
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $$('.cat-block', blocksWrap).forEach(function (blk) { blk.hidden = !(key === 'all' || blk.getAttribute('data-cat') === key); });
      });
      buttons.push(b); filters.appendChild(b);
    }
    mkFilter('all', 'All');
    Object.keys(CATEGORIES).forEach(function (key) {
      var items = list.filter(function (p) { return p.category === key; });
      if (!items.length) return;
      mkFilter(key, CATEGORIES[key].label);
      var block = el('section', { 'class': 'cat-block', 'data-cat': key, 'aria-labelledby': 'cat-' + key });
      var head = el('div', { 'class': 'cat-head' });
      var icon = el('span'); icon.innerHTML = ICONS[key]; head.appendChild(icon.firstChild);
      var hw = el('div'); var h = el('h2', { id: 'cat-' + key }, CATEGORIES[key].label); hw.appendChild(h); hw.appendChild(el('p', null, CATEGORIES[key].text)); head.appendChild(hw);
      block.appendChild(head);
      var grid = el('div', { 'class': 'grid grid--3' });
      items.forEach(function (p, i) { var c = projectCard(p); c.classList.add('reveal'); c.style.setProperty('--i', i % 3); grid.appendChild(c); });
      block.appendChild(grid); blocksWrap.appendChild(block);
    });
    root.appendChild(filters); root.appendChild(blocksWrap);
    root.hidden = false;
    revealAll($$('.reveal', root));
  }

  /* News -------------------------------------------------------------------- */
  function newsList() {
    return verified(S.news).filter(function (a) { return a.slug && a.title; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }
  function newsCard(a) {
    var card = el('article', { 'class': 'card item-card' });
    var media = el('div', { 'class': 'media' });
    if (a.image) media.appendChild(el('img', { src: safeUrl(a.image), alt: a.imageAlt || '', width: '800', height: '500', loading: 'lazy', decoding: 'async' }));
    else { media.className = 'media media--blank'; media.innerHTML = ICONS.news; }
    card.appendChild(media);
    var body = el('div', { 'class': 'body' });
    var meta = el('div', { 'class': 'meta' });
    if (a.category) meta.appendChild(el('span', { 'class': 'chip' }, a.category));
    if (a.date) { var t = el('time', { datetime: a.date }, fmtDate(a.date)); meta.appendChild(t); }
    body.appendChild(meta);
    var h = el('h3'); var link = el('a', { href: 'news.html#' + encodeURIComponent(a.slug), 'class': 'stretch' }, a.title); h.appendChild(link); body.appendChild(h);
    if (a.summary) body.appendChild(el('p', null, a.summary));
    var actions = el('div', { 'class': 'actions' }); var rm = el('span', { 'class': 'text-link', 'aria-hidden': 'true' }); withArrow(rm, 'Read more'); actions.appendChild(rm); body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function initNews() {
    var list = newsList();
    if (!list.length) return;

    var home = $('[data-news-home]');
    if (home) {
      hideEmpty(home.parentNode);
      list.slice(0, 3).forEach(function (a, i) { var c = newsCard(a); c.classList.add('reveal'); c.style.setProperty('--i', i); home.appendChild(c); });
      home.hidden = false; revealAll($$('.reveal', home));
    }

    var wrap = $('[data-news-page]');
    if (!wrap) return;
    var listView = $('[data-news-list]', wrap), articleView = $('[data-news-article]', wrap);
    var baseTitle = doc.title;
    hideEmpty(doc);

    // category filters
    var cats = []; list.forEach(function (a) { if (a.category && cats.indexOf(a.category) < 0) cats.push(a.category); });
    var grid = el('div', { 'class': 'grid grid--3' });
    list.forEach(function (a, i) { var c = newsCard(a); c.setAttribute('data-cat', a.category || ''); c.classList.add('reveal'); c.style.setProperty('--i', i % 3); grid.appendChild(c); });
    if (cats.length > 1) {
      var filters = el('div', { 'class': 'filters', role: 'group', 'aria-label': 'Filter news by category' });
      var btns = [];
      ['All'].concat(cats).forEach(function (label) {
        var b = el('button', { type: 'button', 'class': 'filter-btn', 'aria-pressed': label === 'All' ? 'true' : 'false' }, label);
        b.addEventListener('click', function () {
          btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          $$('.item-card', grid).forEach(function (c) { c.hidden = !(label === 'All' || c.getAttribute('data-cat') === label); });
        });
        btns.push(b); filters.appendChild(b);
      });
      listView.appendChild(filters);
    }
    listView.appendChild(grid);

    function showRoute() {
      var slug = decodeURIComponent((location.hash || '').replace(/^#/, ''));
      var a = list.filter(function (x) { return x.slug === slug; })[0];
      articleView.textContent = '';
      if (!a) { listView.hidden = false; articleView.hidden = true; doc.title = baseTitle; revealAll($$('.reveal', listView)); return; }
      listView.hidden = true; articleView.hidden = false;
      doc.title = a.title + ' — STARSS STUDIO';
      var art = el('article', { 'class': 'article' });
      var back = el('a', { 'class': 'text-link back', href: 'news.html' }); back.appendChild(doc.createTextNode('← All updates')); art.appendChild(back);
      var meta = el('div', { 'class': 'meta' });
      if (a.category) meta.appendChild(el('span', { 'class': 'chip' }, a.category));
      if (a.date) meta.appendChild(el('time', { datetime: a.date }, fmtDate(a.date)));
      art.appendChild(meta);
      art.appendChild(el('h1', null, a.title));
      if (a.summary) art.appendChild(el('p', { 'class': 'lead' }, a.summary));
      if (a.image) { var fig = el('figure'); fig.appendChild(el('img', { src: safeUrl(a.image), alt: a.imageAlt || '', width: '1200', height: '750', decoding: 'async' })); art.appendChild(fig); }
      var prose = el('div', { 'class': 'prose' });
      (Array.isArray(a.content) ? a.content : [String(a.content || '')]).forEach(function (para) { if (para) prose.appendChild(el('p', null, para)); });
      art.appendChild(prose);
      articleView.appendChild(art);
      window.scrollTo(0, 0);
      var heading = $('h1', articleView); if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }
    window.addEventListener('hashchange', showRoute);
    listView.hidden = false;
    showRoute();
    revealAll($$('.reveal', listView));
  }

  /* Showcase ---------------------------------------------------------------- */
  function initShowcase() {
    var root = $('[data-gallery]');
    var items = verified(S.showcase).filter(function (i) { return i.src && i.alt; });
    if (!root || !items.length) return;
    hideEmpty(doc);
    var grid = el('div', { 'class': 'gallery' });
    items.forEach(function (it, i) {
      var btn = el('button', { type: 'button', 'class': 'shot reveal', 'aria-label': 'Open image: ' + (it.title || it.alt), 'aria-haspopup': 'dialog' });
      btn.style.setProperty('--i', i % 3);
      btn.appendChild(el('img', { src: safeUrl(it.thumb || it.src), alt: it.alt, width: '800', height: '600', loading: i < 3 ? 'eager' : 'lazy', decoding: 'async' }));
      if (it.title) btn.appendChild(el('span', { 'class': 'cap' }, it.title));
      btn.addEventListener('click', function () { openLightbox(items, i, btn); });
      grid.appendChild(btn);
    });
    root.appendChild(grid); root.hidden = false;
    revealAll($$('.reveal', root));
  }

  /* Contact & footer links -------------------------------------------------- */
  function validEmail(v) { return typeof v === 'string' && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(v.trim()); }

  function initContact() {
    var cfg = S.config || {};
    var contact = cfg.contact || {};
    var email = validEmail(contact.email) ? contact.email.trim() : '';
    var links = (Array.isArray(cfg.links) ? cfg.links : []).filter(function (l) { return l && l.label && safeUrl(l.url) && /^https?:/i.test(safeUrl(l.url)); });

    // Footer social links
    var fs = $('[data-footer-social]');
    if (fs && links.length) {
      links.forEach(function (l) { fs.appendChild(el('a', { href: safeUrl(l.url), target: '_blank', rel: 'noopener noreferrer' }, l.label)); });
      fs.hidden = false;
    }

    // Contact page
    var avail = $('[data-contact-available]'), none = $('[data-contact-none]');
    if (!avail) return;
    if (!email && !links.length) return; // keep the "details will be published" notice
    var grid = $('[data-contact-grid]', avail);
    if (email) {
      var a = el('a', { 'class': 'contact-link', href: 'mailto:' + email });
      a.appendChild(el('small', null, 'Email')); a.appendChild(el('span', null, email)); grid.appendChild(a);
    }
    links.forEach(function (l) {
      var a2 = el('a', { 'class': 'contact-link', href: safeUrl(l.url), target: '_blank', rel: 'noopener noreferrer' });
      a2.appendChild(el('small', null, l.label)); a2.appendChild(el('span', null, safeUrl(l.url).replace(/^https?:\/\//i, ''))); grid.appendChild(a2);
    });
    avail.hidden = false; if (none) none.hidden = true;

    if (email) {
      $$('[data-inquiry]').forEach(function (card) {
        var subject = card.getAttribute('data-inquiry');
        var btn = el('a', { 'class': 'btn btn--ghost', href: 'mailto:' + email + '?subject=' + encodeURIComponent(subject) });
        withArrow(btn, 'Send an email'); card.appendChild(btn);
      });
    }
  }

  /* 6. LIGHTBOX ------------------------------------------------------------ */
  var lb = null;
  function buildLightbox() {
    var root = el('div', { 'class': 'lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image viewer' });
    var svg = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; };
    var count = el('div', { 'class': 'lb-count', 'aria-live': 'polite' });
    var close = el('button', { type: 'button', 'class': 'lb-btn lb-close', 'aria-label': 'Close image viewer' }); close.innerHTML = svg('<path d="M5 5l14 14M19 5 5 19"/>');
    var prev = el('button', { type: 'button', 'class': 'lb-btn lb-prev', 'aria-label': 'Previous image' }); prev.innerHTML = svg('<path d="M15 5l-7 7 7 7"/>');
    var next = el('button', { type: 'button', 'class': 'lb-btn lb-next', 'aria-label': 'Next image' }); next.innerHTML = svg('<path d="M9 5l7 7-7 7"/>');
    var stage = el('div', { 'class': 'lightbox-stage' });
    var img = el('img', { 'class': 'lightbox-img', alt: '' });
    var cap = el('div', { 'class': 'lightbox-cap' });
    stage.appendChild(img);
    [count, close, prev, next, stage, cap].forEach(function (n) { root.appendChild(n); });
    doc.body.appendChild(root);

    lb = { root: root, img: img, cap: cap, count: count, close: close, prev: prev, next: next, items: [], index: 0, opener: null };

    close.addEventListener('click', closeLightbox);
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    root.addEventListener('click', function (e) { if (e.target === root || e.target === stage) closeLightbox(); });
    img.addEventListener('load', function () { img.classList.add('is-loaded'); });
    doc.addEventListener('keydown', function (e) {
      if (!root.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'Tab') { // focus trap
        var f = [close, prev, next].filter(function (b) { return !b.hidden; });
        var i = f.indexOf(doc.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    var x0 = null; // swipe on touch screens
    root.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function show(i) {
    var it = lb.items[i]; lb.index = i;
    lb.img.classList.remove('is-loaded');
    lb.img.alt = it.alt;
    lb.img.src = safeUrl(it.src);
    lb.cap.textContent = '';
    if (it.title) lb.cap.appendChild(el('strong', null, it.title));
    if (it.caption) lb.cap.appendChild(doc.createTextNode(it.caption));
    lb.count.textContent = (i + 1) + ' / ' + lb.items.length;
    var multi = lb.items.length > 1; lb.prev.hidden = lb.next.hidden = !multi;
    [i - 1, i + 1].forEach(function (n) { if (lb.items[n]) { var p = new Image(); p.src = safeUrl(lb.items[n].src); } }); // preload neighbours
  }
  function step(d) { show((lb.index + d + lb.items.length) % lb.items.length); }
  function openLightbox(items, i, opener) {
    if (!lb) buildLightbox();
    lb.items = items; lb.opener = opener;
    show(i);
    lb.root.classList.add('is-open');
    doc.body.classList.add('nav-locked');
    lb.close.focus();
  }
  function closeLightbox() {
    lb.root.classList.remove('is-open');
    doc.body.classList.remove('nav-locked');
    if (lb.opener) lb.opener.focus();
  }

  /* BOOT ------------------------------------------------------------------- */
  function safely(fn) { try { fn(); } catch (err) { if (window.console) console.error('[STARSS]', err); } }
  function boot() {
    [initHeader, initFooterYear, initCanonical, initProjects, initNews, initShowcase, initContact, initCopy, initReveal, initParallax].forEach(safely);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
