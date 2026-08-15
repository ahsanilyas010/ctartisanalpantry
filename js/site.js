// Site-wide behavior shared by every page.
(function () {
  /* ── Autoplay/loop videos ──────────────────────────────── */
  function forcePlayVideos() {
    document.querySelectorAll('video[autoplay]').forEach((video) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      const tryPlay = () => {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      };
      tryPlay();
      video.addEventListener('loadeddata', tryPlay, { once: true });
      video.addEventListener('canplay', tryPlay, { once: true });
      video.addEventListener('pause', () => {
        if (!document.hidden) tryPlay();
      });
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) forcePlayVideos();
    });
  }

  /* ── Dynamic content from DB ───────────────────────────── */
  function applyContent(content) {
    // Banner
    const bannerActive = content['banner:active'];
    const bannerText   = content['banner:text'];
    const bannerBg     = content['banner:bg_color'];
    const dismissed    = sessionStorage.getItem('ann_banner_dismissed');
    if (bannerActive === 'true' && bannerText && !dismissed) {
      const div = document.createElement('div');
      div.className = 'ann-banner';
      div.style.background = bannerBg || '#E2202D';
      div.innerHTML = `<span>${escHtml(bannerText)}</span>
        <button class="ann-banner-close" aria-label="Dismiss">&times;</button>`;
      div.querySelector('.ann-banner-close').addEventListener('click', () => {
        div.remove();
        sessionStorage.setItem('ann_banner_dismissed', '1');
      });
      document.body.insertAdjacentElement('afterbegin', div);
    }

    // Apply data-content-key text elements
    document.querySelectorAll('[data-content-key]').forEach((el) => {
      const k = el.getAttribute('data-content-key');
      if (content[k] !== undefined && typeof content[k] === 'string') {
        el.textContent = content[k];
      }
    });

    // Apply data-content-img → img src
    document.querySelectorAll('[data-content-img]').forEach((el) => {
      const k = el.getAttribute('data-content-img');
      if (content[k] && typeof content[k] === 'string') el.src = content[k];
    });

    // Apply data-content-key-alt → img alt
    document.querySelectorAll('[data-content-key-alt]').forEach((el) => {
      const k = el.getAttribute('data-content-key-alt');
      if (content[k]) el.alt = content[k];
    });

    // Hide partner logo items that have no logo URL yet; hide whole strip if all empty
    document.querySelectorAll('.partner-logo-item img').forEach((img) => {
      if (!img.src || img.src === window.location.href) {
        img.closest('.partner-logo-item').style.display = 'none';
      }
    });
    document.querySelectorAll('.partner-logos').forEach((row) => {
      const anyVisible = [...row.querySelectorAll('.partner-logo-item')].some(
        (el) => el.style.display !== 'none'
      );
      if (!anyVisible) row.closest('[data-reveal-section]').style.display = 'none';
    });

    // Apply data-content-bg → CSS background-image
    document.querySelectorAll('[data-content-bg]').forEach((el) => {
      const k = el.getAttribute('data-content-bg');
      if (content[k] && typeof content[k] === 'string') el.style.backgroundImage = `url(${content[k]})`;
    });

    // Apply data-content-href → anchor href
    document.querySelectorAll('[data-content-href]').forEach((el) => {
      const k = el.getAttribute('data-content-href');
      if (content[k] && typeof content[k] === 'string') el.href = content[k];
    });

    // Homepage-specific: rebuild hero slides, ticker
    rebuildHeroSlides(content);
    rebuildTicker(content);
  }

  function rebuildHeroSlides(content) {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = ['slide_1', 'slide_2', 'slide_3']
      .map((k) => content[`hero:${k}`])
      .filter((s) => s && typeof s === 'object' && s.active !== false);

    if (!slides.length) return;

    // Replace existing slide divs
    const existing = slider.querySelectorAll('.hero-slide');
    existing.forEach((el) => el.remove());

    slides.forEach((slide, i) => {
      const div = document.createElement('div');
      div.className = 'hero-slide';
      div.style.backgroundImage = `url(${slide.image || ''})`;
      div.style.animationDelay = `${i * 6}s`;
      slider.insertAdjacentElement('afterbegin', div);
    });

    // Hero text
    const eyebrow = document.querySelector('.hero-content .eyebrow');
    const heading  = document.querySelector('.hero-heading');
    const cta1     = document.querySelector('.hero-ctas .btn-primary');
    const cta2     = document.querySelector('.hero-ctas .btn-outline-inverse');

    if (eyebrow && content['hero:eyebrow']) eyebrow.textContent = content['hero:eyebrow'];
    if (heading  && content['hero:heading'])  heading.textContent  = content['hero:heading'];
    if (cta1 && content['hero:cta_primary_text'])   cta1.textContent = content['hero:cta_primary_text'];
    if (cta1 && content['hero:cta_primary_url'])    cta1.href        = content['hero:cta_primary_url'];
    if (cta2 && content['hero:cta_secondary_text']) cta2.textContent = content['hero:cta_secondary_text'];
    if (cta2 && content['hero:cta_secondary_url'])  cta2.href        = content['hero:cta_secondary_url'];
  }

  function rebuildTicker(content) {
    const keywords = content['ticker:keywords'];
    if (!Array.isArray(keywords) || !keywords.length) return;
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    const bullet = '<span class="accent">&bull;</span>';
    const items  = keywords.map((kw) => `<span>${escHtml(kw)}</span>${bullet}`).join('');
    track.innerHTML = items + items; // doubled for seamless scroll
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fetchAndApplyContent() {
    fetch('/api/content')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data && data.content) applyContent(data.content); })
      .catch(() => {}); // silently skip on local dev without DB
  }

  /* ── Boot ──────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    forcePlayVideos();
    fetchAndApplyContent();
  });
})();
