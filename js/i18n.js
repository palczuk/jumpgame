window.GameI18n = (() => {
  const messages = {
    en: {
      title: 'JUMP', language: '🌐 LANGUAGE / IDIOMA', fullscreen: 'Fullscreen', developedBy: 'Developed by Palczuk J.',
      instructions: 'Keyboard: arrows or A/D to move, Space to jump, X/F to attack. On mobile, use the on-screen controls.',
      coins: 'Coins', enemiesDefeated: 'Defeated', objectiveHint: 'Meet the minimum goals and reach the flag.', lives: 'Lives', restart: 'Restart', backSelect: 'Character selection',
      dead: 'You died!', over: 'Game over', win: 'You reached the flag!',
      continue: 'Press Space to continue', retryHint: 'Choose an option below',
      selectTitle: 'Choose your character', selectHint: 'Arrows, A/D, or controller stick/D-pad; confirm with Space, Enter, or A.',
      attack: 'Attack', selected: 'Selected', snowball: 'Snowballs', knife: 'Knives', banana: 'Bananas',
      superPaco: 'Super PACO', wrench: 'Wrenches',
      left: 'Move left', right: 'Move right', jumpButton: 'Jump', attackButton: 'Attack',
      jumpMaster: 'Jump Master', superSkinny: 'Super Skinny', ssg12: '12 November', luke: 'Super Lucas',
      shovels: 'Shovels'
    },
    pt: {
      title: 'JUMP', language: 'Idioma', fullscreen: 'Tela cheia', developedBy: 'Desenvolvido por Palczuk J.',
      instructions: 'Teclado: setas ou A/D para mover, Espaço para pular, X/F para atacar. No celular, use os controles na tela.',
      coins: 'Moedas', enemiesDefeated: 'Derrotados', objectiveHint: 'Cumpra as metas e chegue a bandeira.', lives: 'Vidas', restart: 'Reiniciar', backSelect: 'Seleção de personagens',
      dead: 'Você morreu!', over: 'Fim de jogo', win: 'Você chegou à bandeira!',
      continue: 'Pressione Espaço para continuar', retryHint: 'Escolha uma opção abaixo',
      selectTitle: 'Escolha seu personagem', selectHint: 'Setas, A/D ou anal\u00f3gico/D-pad do controle; confirme com Espa\u00e7o, Enter ou A.',
      attack: 'Ataque', selected: 'Selecionado', snowball: 'Bolas de neve', knife: 'Facas', banana: 'Bananas',
      superPaco: 'Super PACO', wrench: 'Chaves',
      left: 'Mover para a esquerda', right: 'Mover para a direita', jumpButton: 'Pular', attackButton: 'Atacar',
      jumpMaster: 'Jump Master', superSkinny: 'Super Skinny', ssg12: '12 November', luke: 'Super Lucas',
      shovels: 'Pás'
    }
  };
  let language = 'en';
  try { language = localStorage.getItem('gameLanguageV2') || 'en'; } catch (_) {}
  function t(key) { return messages[language][key] || key; }
  function set(value) {
    language = messages[value] ? value : 'en';
    try { localStorage.setItem('gameLanguageV2', language); } catch (_) {}
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
    document.title = t('title');
    document.getElementById('game-title').textContent = t('title');
    document.getElementById('language-label').textContent = t('language');
    document.getElementById('fullscreen').textContent = t('fullscreen');
    document.getElementById('instructions').textContent = t('instructions');
    document.getElementById('credits').textContent = t('developedBy');
    document.getElementById('language').value = language;
    document.querySelectorAll('[data-label]').forEach(button => {
      button.setAttribute('aria-label', t(button.dataset.label));
      if (button.dataset.label === 'jumpButton' || button.dataset.label === 'attackButton') button.textContent = t(button.dataset.label);
    });
  }
  return { t, set, get language() { return language; } };
})();
