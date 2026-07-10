// Site-wide behaviors shared by every page: force-start autoplay/loop
// videos (some mobile browsers need an explicit play() call even with the
// autoplay attribute set) and scroll-triggered reveal animations.
(function () {
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
      // Some browsers only allow playback once enough data is buffered.
      video.addEventListener('loadeddata', tryPlay, { once: true });
      video.addEventListener('canplay', tryPlay, { once: true });
      // If a video ever stalls out of its loop (dropped frame, tab
      // backgrounding, etc.), restart it instead of leaving a frozen frame.
      video.addEventListener('pause', () => {
        if (!document.hidden) tryPlay();
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) forcePlayVideos();
    });
  }

  function setUpScrollReveal() {
    const targets = Array.from(document.querySelectorAll('[data-reveal-section], [data-reveal-hero]'));
    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px 0px 0px' }
    );

    targets.forEach((el) => observer.observe(el));

    // Belt-and-suspenders: a fast scroll (End key, scrollbar drag, momentum
    // fling) can move an element past the viewport between the frames the
    // observer samples, leaving it stuck at opacity:0. On every scroll,
    // reveal anything the user has already scrolled past or into.
    let ticking = false;
    function revealPassed() {
      const viewportBottom = window.innerHeight;
      targets.forEach((el) => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        // Anything from the current viewport bottom on up — whether still
        // on screen or already scrolled past above it — should be visible.
        if (rect.top < viewportBottom) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(revealPassed);
        ticking = true;
      }
    }, { passive: true });
    revealPassed();
  }

  document.addEventListener('DOMContentLoaded', () => {
    forcePlayVideos();
    setUpScrollReveal();
  });
})();
