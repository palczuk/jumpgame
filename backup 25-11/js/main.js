window.addEventListener('DOMContentLoaded', () => {
  const language = document.getElementById('language');
  language.value = window.GameI18n.language;
  window.GameI18n.set(language.value);
  language.addEventListener('change', () => window.GameI18n.set(language.value));
  window.GameAudio.startMusic();
  window.Game.start();

  document.querySelectorAll('#touch-controls button').forEach(button => {
    const release = event => {
      event.preventDefault();
      if (button.dataset.key) window.Game.setTouchKey(button.dataset.key, false);
    };
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      if (button.dataset.key) window.Game.setTouchKey(button.dataset.key, true);
      if (button.dataset.action === 'jump') window.Game.touchJump();
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });

  document.getElementById('fullscreen').addEventListener('click', async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });
});
