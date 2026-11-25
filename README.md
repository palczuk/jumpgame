# JUMP

Creditos: Desenvolvido por Palczuk J.

## Estrutura do projeto

- `index.html`: pagina e canvas do jogo.
- `css/style.css`: estilos responsivos para computador e celular.
- `js/main.js`: inicializa a musica e o jogo.
- `js/game.js`: motor, controles, fisica, inimigos e telas.
- `js/levels.js`: mapas e configuracoes das fases.
- `js/characters.js`: personagens, sprites, sons de entrada e ataques.
- `js/character-select.js`: tela de selecao de personagem.
- `js/i18n.js`: textos em portugues e ingles.
- `js/audio.js`: trilhas e efeitos sonoros.
- `assets/audio/`: arquivos MP3 do jogo.

## Musicas e efeitos

- `trilhasonora.mp3`: trilha sonora contínua do jogo (em loop).
- `superlucas.mp3`: toca uma vez quando Luke começa uma partida.
- `jumpmaster.mp3`: toca uma vez quando SSG Jump Master começa uma partida.
- `superskinny-intro.mp3`: toca uma vez quando Super Skinny começa uma partida.
- `boladefogo.mp3`: disparo do inimigo.
- `enemydied.mp3`: toca quando um inimigo e derrotado.
- `lancamento.mp3`: ataque do personagem.
- `moeda.mp3`: moeda coletada.
- `jump.mp3`: salto.
- `dead.mp3`: morte.

O jogo tenta iniciar `trilhasonora.mp3` ao abrir e mantém essa faixa em loop. Se o navegador bloquear o autoplay, ela começa na primeira interação. O som próprio do personagem toca uma vez no início da partida e não entra em loop.

## Idioma e menus

Use o seletor no topo para alternar entre portugues e ingles. A escolha fica salva no navegador. A tela de morte oferece Reiniciar e Selecao de personagens.

## Celular e computador

Extraia o ZIP preservando as pastas e abra `index.html` no Edge ou Chrome. No celular, use os botoes na tela. Toque em Tela cheia para ampliar o jogo. No computador, use setas ou A/D, Espaco para pular e X ou F para atacar. No controle Xbox, o direcional move, A confirma/pula e X ataca.

Se o navegador bloquear algum recurso ao abrir o arquivo diretamente, execute `py -m http.server 8000` no PowerShell dentro da pasta do jogo e abra `http://localhost:8000`.

## Inimigos

Os inimigos marcados como `E` e `B` nas fases usam o mesmo granadeiro militar. Ele mira e dispara foguetes, precisa de dois acertos para ser derrotado e mostra a animacao de morte antes de desaparecer. A folha `assets/enemies/grenadier-atlas.png` tem 6 quadros de prontidao, 6 de disparo e 6 de derrota.

## SSG 12 November

O quarto personagem usa o sprite `assets/ssg12november-sprites.png`, chega com uma escavadeira e lanca pas de escavacao. Seu som de entrada e `assets/audio/ssg12november.mp3`. A partida comeca com 10 pas; os pontos de municao ha quatro pontos de municao por segmento, com 5 pas em cada coleta. Ao perder a terceira vida, o jogo volta direto para a selecao de personagens.

O canvas agora renderiza em 1280 x 768 pixels. O idioma inicial e ingles; o controle `LANGUAGE / IDIOMA` permite alternar para portugues.

## Animacoes de Luke e Super Skinny

Os dois personagens usam atlas transparentes em grade 6 x 6, com tamanho e alinhamento de desenho constantes. O atlas separa repouso, corrida, salto, ataque, dano/morte e entrada especial. Luke tem cinco quadros novos de corrida, cinco de lancamento de bolas de neve e monta no dinossauro apenas durante a entrada e depois corre sozinho; Super Skinny tem corrida e salto em escala constante, ataque de banana e chegada de paraquedas. O nome Super Skinny aparece na selecao em ingles e portugues.

## Meta e dificuldade da fase

Para concluir a primeira fase, alcance a bandeira, derrote pelo menos um terco dos inimigos e colete pelo menos metade das moedas. A meta e calculada a partir do conteudo da fase e aparece no HUD. O mapa tem 333 blocos, 27 inimigos e 90 moedas, com tres trechos de floresta diferentes em progressao: borda, floresta densa e clareira. Os inimigos aumentam de 7 para 9 e depois 11; as plataformas, lacunas, cores do terreno e fundos tambem mudam entre os trechos.

## Super PACO

O quinto personagem usa `assets/paco-sprites.png`, um atlas 6 x 6 com repouso, corrida, salto, arremesso de chave, derrota e entrada de paraquedas. Ele inicia com 10 chaves, causa 1 ponto de dano e arremessa a ferramenta por ate 10 blocos. O som de entrada esta configurado em `assets/audio/paco.mp3`.
