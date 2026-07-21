// Site-wide behavior shared by every page: force-start autoplay/loop videos
// (some mobile browsers need an explicit play() call even with the autoplay
// attribute set). Scroll-reveal animation now lives in js/animations.js.
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

  document.addEventListener('DOMContentLoaded', () => {
    forcePlayVideos();
  });
})();
