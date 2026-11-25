window.GameAudioFiles = {
  music: 'assets/audio/trilhasonora.mp3',
  lukeIntro: 'assets/audio/superlucas.mp3',
  jumpMasterIntro: 'assets/audio/jumpmaster.mp3',
  superSkinnyIntro: 'assets/audio/superskinny-intro.mp3',
  ssg12Intro: 'assets/audio/ssg12november.mp3',
  pacoIntro: 'assets/audio/paco.mp3',
  enemyFire: 'assets/audio/boladefogo.mp3',
  enemyDefeat: 'assets/audio/enemydied.mp3',
  throw: 'assets/audio/lancamento.mp3',
  coin: 'assets/audio/moeda.mp3',
  jump: 'assets/audio/jump.mp3',
  dead: 'assets/audio/dead.mp3'
};

window.GameAudio = (() => {
  const effects = new Map();
  let music;

  function startMusic() {
    const src = window.GameAudioFiles.music;
    if (!src) return Promise.resolve();
    if (!music) {
      music = new Audio(src);
      music.loop = true;
      music.volume = 0.32;
      music.preload = 'auto';
    }
    return music.play().catch(() => {});
  }

  function play(name, volume = 0.8) {
    const src = window.GameAudioFiles[name];
    if (!src) return;
    let sound = effects.get(name);
    if (!sound) {
      sound = new Audio(src);
      sound.preload = 'auto';
      effects.set(name, sound);
    }
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play().catch(() => {});
  }

  function playOnce(name, volume = 0.55) {
    const src = window.GameAudioFiles[name];
    if (!src) return;
    let sound = effects.get(name);
    if (!sound) {
      sound = new Audio(src);
      sound.preload = 'auto';
      sound.loop = false;
      effects.set(name, sound);
    }
    sound.loop = false;
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play().catch(() => {});
  }

  window.addEventListener('pointerdown', () => startMusic(), { once: true });
  window.addEventListener('keydown', () => startMusic(), { once: true });
  return { play, playOnce, startMusic };
})();
