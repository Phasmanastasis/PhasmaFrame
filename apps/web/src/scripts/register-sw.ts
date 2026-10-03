// Registers the service worker on window load. Framework-agnostic plain TS.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Swallow registration errors — the app works fine without the SW.
    });
  });
}
