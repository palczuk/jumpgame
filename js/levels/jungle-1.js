(function(){
// Fase 1 do mundo Jungle: quatro vaos; o terceiro tem uma base para atravessar.
const width=198,height=15;
const tiles=Array.from({length:height},()=>Array(width).fill(' '));
const gaps=[[35,4],[71,5],[109,10],[143,12]];

// Preenche o chão deixando os quatro buracos livres.
for(let column=0;column<width;column++){
  if(gaps.some(([start,size])=>column>=start&&column<start+size))continue;
  tiles[13][column]='#';
  tiles[14][column]='#';
}

// Plataformas elevadas e uma base no terceiro buraco ajudam a atravessar o vao maior.
const platforms=[
  [23,28,10],[31,34,10],
  [47,53,9],[64,68,10],
  [83,89,10],[98,104,9],
  [112,115,10],
  [121,127,10],[136,141,9],
  [146,148,11],[151,153,10],
  [158,163,10],[168,173,9]
];
for(const [start,end,row] of platforms){
  for(let column=start;column<=end;column++)tiles[row][column]='#';
}

// Onze grupos de cinco moedas distribuem cinquenta e cinco moedas pelo percurso.
const coinGroups=[
  [13,12],[26,9],[49,8],[60,8],[88,9],
  [95,8],[120,9],[132,8],[155,9],[173,8],[188,9]
];
for(const [center,row] of coinGroups){
  for(let offset=-2;offset<=2;offset++)tiles[row][center+offset]='o';
}

// Onze batedores verdes nivel 1 e um inimigo vermelho nivel 2 no final.
const enemies=[
  [32,9],[42,12],[57,12],[68,9],[83,9],[100,8],
  [116,12],[124,9],[139,8],[153,12],[160,9],[167,12,'E']
];
for(const [column,row,type='G'] of enemies)tiles[row][column]=type;

// Bandeira de checkpoint no bloco 93 e bandeira final no bloco 198.
tiles[12][92]='C';
tiles[12][197]='F';

window.GameLevelJungle1={
  id:'jungle-1',
  name:'Jungle - Fase 1',
  world:'Jungle',
  phase:1,
  repeats:1,
  checkpointBlock:93,
  healthCells:4,
  startingHealth:2,
  ammoDropEnemies:[3,6,8],
  ammoPickupColumns:[],
  returnToTitleOnWin:true,
  winMessage:'next phase, 11/29/2026',
  regions:[
    {start:0,end:66,name:'Trilha de entrada',background:'edge'},
    {start:66,end:132,name:'Selva alta',background:'deep'},
    {start:132,end:198,name:'Clareira final',background:'clearing'}
  ],
  rows:tiles.map(row=>row.join(''))
};
})();
