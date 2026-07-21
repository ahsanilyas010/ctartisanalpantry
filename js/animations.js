// Site-wide animation layer: GSAP/ScrollTrigger-driven scroll reveals with
// an IntersectionObserver backstop, a sticky nav that shrinks on scroll,
// hero parallax, Lenis smooth scroll (desktop only), a preloader, the hero
// ingredient word rotator, a custom cursor + magnetic buttons + card tilt
// (desktop only), and a lightbox for recipe/product photos.
//
// Nothing here hides content unless GSAP has actually loaded, and every
// motion effect respects prefers-reduced-motion with a lighter/faster
// variant rather than being switched off outright.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof Flip !== 'undefined') gsap.registerPlugin(Flip);
  }

  // ---- Preloader -----------------------------------------------------
  function initPreloader() {
    var el = document.getElementById('preloader');
    if (!el) return;
    var hide = function () {
      el.classList.add('is-hidden');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 750);
    };
    var delay = reduced ? 0 : 1100;
    var timer = setTimeout(hide, delay);
    // Safety net: never let the preloader outlive the page.
    window.addEventListener('load', function () {
      clearTimeout(timer);
      setTimeout(hide, reduced ? 0 : 300);
    });
    setTimeout(hide, 2500);
  }

  // ---- Scroll reveals (GSAP ScrollTrigger, batched/staggered) ---------
  function initReveals() {
    var sections = document.querySelectorAll('[data-reveal-hero], [data-reveal-section]');
    sections.forEach(function (el) {
      var grid = el.matches('.grid-2, .grid-3, .grid-4')
        ? el
        : el.querySelector(':scope > .grid-2, :scope > .grid-3, :scope > .grid-4');
      var targets = grid ? Array.prototype.slice.call(grid.children) : [el];
      gsap.set(targets, { opacity: 0, y: 24, filter: 'blur(6px)' });
      targets.forEach(function (t) { t.dataset.revealed = 'pending'; });
      ScrollTrigger.batch(targets, {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: reduced ? 0.2 : 0.9,
            ease: 'power2.out',
            stagger: reduced ? 0 : 0.1,
            onComplete: function () { batch.forEach(function (t) { t.dataset.revealed = 'done'; }); },
          });
        },
      });
    });
  }

  // ---- Reveal backstop -------------------------------------------------
  // Force-reveals anything ScrollTrigger missed (fast scrolls, elements
  // whose position shifted after images loaded, etc.) or that never got
  // hidden-and-shown at all because GSAP failed to load.
  function initRevealBackstop() {
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-hero], [data-reveal-section]'));
    var gridChildren = [];
    targets.forEach(function (el) {
      var kids = el.querySelectorAll(':scope > .grid-2 > *, :scope > .grid-3 > *, :scope > .grid-4 > *');
      if (kids.length) gridChildren = gridChildren.concat(Array.prototype.slice.call(kids));
    });
    var all = targets.concat(gridChildren);
    if (!all.length) return;

    function reveal(el) {
      if (el.dataset.revealed === 'done') return;
      el.dataset.revealed = 'done';
      if (gsapReady) {
        gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.3, overwrite: 'auto' });
      } else {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      }
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      all.forEach(function (el) { observer.observe(el); });
    }

    var ticking = false;
    function revealPassed() {
      var viewportBottom = window.innerHeight;
      all.forEach(function (el) {
        if (el.dataset.revealed === 'done') return;
        var rect = el.getBoundingClientRect();
        if (rect.top < viewportBottom) reveal(el);
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(revealPassed); ticking = true; }
    }, { passive: true });
    // Absolute last resort: nothing should still be hidden 4s after load.
    setTimeout(function () { all.forEach(reveal); }, 4000);
    revealPassed();
  }

  // ---- Sticky nav that shrinks on scroll -------------------------------
  function initNavShrink() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    ScrollTrigger.create({
      start: 'top -80',
      onToggle: function (self) { header.classList.toggle('is-scrolled', self.isActive); },
    });
  }

  // ---- Hero parallax ----------------------------------------------------
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    var slider = document.querySelector('.hero-slider');
    if (!hero || !slider || reduced) return;
    gsap.to(slider, {
      yPercent: 16,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // ---- Lenis smooth scroll (desktop only) ------------------------------
  function initLenis() {
    if (isTouch || reduced || typeof window.Lenis === 'undefined' || !gsapReady) return;
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ---- Hero ingredient word rotator ------------------------------------
  function initWordRotator() {
    var rotator = document.querySelector('.word-rotator');
    if (!rotator || reduced) return;
    var items = rotator.querySelectorAll('.word-rotator-item');
    if (items.length < 2) return;
    var idx = 0;
    setInterval(function () {
      items[idx].classList.remove('is-active');
      idx = (idx + 1) % items.length;
      items[idx].classList.add('is-active');
    }, 2600);
  }

  // ---- Custom cursor (desktop only) ------------------------------------
  function initCustomCursor() {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    var label = document.createElement('span');
    label.className = 'cursor-label';
    label.textContent = 'View';
    ring.appendChild(label);
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('has-custom-cursor');

    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = '1'; ring.style.opacity = '1'; });

    var viewTargets = document.querySelectorAll('.media-tile, .shop-card, .ingredient-card, [data-lightbox]');
    viewTargets.forEach(function (t) {
      t.addEventListener('mouseenter', function () { ring.classList.add('is-viewing'); });
      t.addEventListener('mouseleave', function () { ring.classList.remove('is-viewing'); });
    });
  }

  // ---- Magnetic buttons (desktop only) ----------------------------------
  function initMagneticButtons() {
    if (!gsapReady) return;
    var buttons = document.querySelectorAll('.btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ---- 3D card tilt (desktop only) --------------------------------------
  function initCardTilt() {
    if (!gsapReady) return;
    var cards = document.querySelectorAll('.ingredient-card, .recipe-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotateY: px * 8, rotateX: py * -8, transformPerspective: 600, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  // ---- Lightbox ----------------------------------------------------------
  function initLightbox() {
    var targets = document.querySelectorAll('[data-lightbox]');
    if (!targets.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    var img = document.createElement('img');
    img.className = 'lightbox-image';
    overlay.appendChild(closeBtn);
    overlay.appendChild(img);
    document.body.appendChild(overlay);

    function open(src, alt) {
      img.src = src;
      img.alt = alt || '';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (gsapReady && !reduced) {
        gsap.fromTo(img, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
      }
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    targets.forEach(function (el) {
      el.addEventListener('click', function () { open(el.src, el.alt); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    if (gsapReady) {
      initReveals();
      initNavShrink();
      initHeroParallax();
    }
    initRevealBackstop();
    initLenis();
    initWordRotator();
    initLightbox();
    if (!isTouch) {
      initCustomCursor();
      initMagneticButtons();
      initCardTilt();
    }
  });
})();
