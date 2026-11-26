# JUMP

Creditos: Desenvolvido por Palczuk J.

## Estrutura do projeto

- `index.html`: pagina e canvas do jogo.
- `css/style.css`: estilos responsivos para computador e celular.
- `js/main.js`: inicializa a musica e o jogo.
- `js/game.js`: estado da partida, configuracao do mapa e fluxo entre menus e fases.
- `js/game-update.js`: movimento, colisao, combate, itens e metas.
- `js/game-weapons.js`: desenho das ferramentas e projeteis.
- `js/game-characters.js`: animacoes dos herois e inimigos.
- `js/game-render.js`: cenarios, terreno, HUD e menus.
- `js/game-controls.js`: teclado, mouse, toque e inicializacao do ciclo do jogo.
- `js/levels/jungle-1.js`: mapa e configuracao ativa da primeira fase de Jungle.
- `js/levels/jungle-3.js`: fase 3 preservada e desabilitada para ativacao futura.
- `js/levels.js`: lista que registra as fases disponiveis.
- `js/characters.js`: personagens, sprites, sons de entrada e ataques.
- `js/character-select.js`: tela de selecao de personagem.
- `js/i18n.js`: textos em portugues e ingles.
- `js/audio.js`: trilhas e efeitos sonoros.
- `assets/audio/`: arquivos MP3 do jogo.

## Onde alterar cada parte

| O que voce quer mudar | Arquivo |
| --- | --- |
| Posicao de plataformas, buracos, moedas e inimigos da fase 1 de Jungle | `js/levels/jungle-1.js` |
| Fases disponiveis e fases reservadas | `js/levels.js` |
| Configuracao e fluxo da partida | `js/game.js` |
| Movimento, colisao, metas e combate | `js/game-update.js` |
| Cenarios, terreno, HUD e menus | `js/game-render.js` |
| Animacoes dos personagens | `js/game-characters.js` |
| Controles de teclado, mouse e toque | `js/game-controls.js` |
| Desenho de armas e projeteis | `js/game-weapons.js` |
| Ordem, sprites, entrada e ataques dos herois | `js/characters.js` |
| Cartoes e retratos da selecao de herois | `js/character-select.js` |
| Caminhos e reproducao de sons | `js/audio.js` |
| Textos em portugues e ingles | `js/i18n.js` |

Os comentarios em portugues no codigo marcam os principais blocos e explicam a funcao de cada parte.

### Como adicionar uma fase

Crie um arquivo proprio, por exemplo `js/levels/jungle-2.js`, carregue-o em `index.html` antes de `js/levels.js` e acrescente sua fase a `window.GameLevels`. So as fases nessa lista ficam habilitadas; fases futuras podem permanecer em `window.GameLevelCatalog` sem entrar no jogo.

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

Na primeira fase, os inimigos usam o soldado nivel 1 preto e verde: ele tem 1 ponto de vida, dispara em linha reta por ate 10 blocos e nao causa explosao. O nivel 2 vermelho precisa de 2 acertos para ser derrotado; o nivel 3 azul precisa de 3 e dispara morteiros mais fortes. Os tres atlas em `assets/enemies/` tem 8 quadros de prontidao, 8 de disparo e 8 de derrota. No mapa, `G` representa o soldado verde, `E` o vermelho e `B` o azul.

## SSG 12 November

O quarto personagem usa o sprite `assets/ssg12november-sprites.png`, chega com uma escavadeira e lanca pas de escavacao. Seu som de entrada e `assets/audio/ssg12november.mp3`. Os personagens mantem a reserva inicial configurada em `js/characters.js`; na nova fase Jungle 1 nao ha municao solta, e somente os inimigos 3, 6 e 8 deixam cinco municoes cada.

O canvas agora renderiza em 1280 x 768 pixels. O idioma inicial e ingles; o controle `LANGUAGE / IDIOMA` permite alternar para portugues.

## Animacoes de Luke e Super Skinny

Os dois personagens usam atlas transparentes em grade 6 x 6, com tamanho e alinhamento de desenho constantes. O atlas separa repouso, corrida, salto, ataque, dano/morte e entrada especial. Luke tem cinco quadros novos de corrida, cinco de lancamento de bolas de neve e monta no dinossauro apenas durante a entrada e depois corre sozinho; Super Skinny tem corrida e salto em escala constante, ataque de banana e chegada de paraquedas. O nome Super Skinny aparece na selecao em ingles e portugues.

## Fase 1 do mundo Jungle

A fase ativa tem 198 blocos, 11 inimigos nivel 1, um vermelho nivel 2 e 55 moedas. Para vencer, alcance a bandeira, derrote pelo menos quatro inimigos e colete pelo menos 28 moedas. Os inimigos 3, 6 e 8 deixam cinco municoes cada; nao ha coletas de municao soltas no mapa. Os dois primeiros buracos sao menores; o terceiro e maior e tem uma base; o ultimo fosso e maior e tem duas plataformas. O personagem inicia com duas barras preenchidas em uma barra visual de quatro partes e perde uma barra por acerto. A bandeira no bloco 93 vira checkpoint e permanece ativa durante as tres vidas. Ao concluir a fase, a mensagem `next phase, 11/29/2026` retorna a selecao de herois quando confirmada.

A antiga fase de 333 blocos esta preservada como Jungle 3, mas nao aparece nem pode ser jogada enquanto nao for adicionada a `window.GameLevels` em `js/levels.js`.

## Super PACO

O quinto personagem usa `assets/paco-sprites.png`, um atlas 6 x 6 com repouso, corrida, salto, arremesso de chave, derrota e entrada de paraquedas. Ele inicia com 10 chaves, causa 1 ponto de dano e arremessa a ferramenta por ate 10 blocos. O som de entrada esta configurado em `assets/audio/paco.mp3`.

## Jump Master

O Jump Master agora usa `assets/jumpmaster-sprites-v2.png` com quadros completos para repouso, corrida, salto, arremesso de faca, dano/queda e entrada de paraquedas. Os recortes de cada pose ficam em `jumpMasterFrames`, em `js/game-characters.js`; para ajustar escala e tempo da animacao, edite `drawJumpMasterAtlas`. O som de entrada continua configurado em `js/characters.js` e usa `assets/audio/jumpmaster.mp3`.
