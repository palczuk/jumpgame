(function(){
// Tamanho do mapa em blocos; as coordenadas abaixo sao colunas deste mapa.
const forestWidth=333;
const forestHeight=15;
const forestTiles=Array.from({length:forestHeight},()=>Array(forestWidth).fill(' '));

for(let column=0;column<forestWidth;column++){
  forestTiles[13][column]='#';
  forestTiles[14][column]='#';
}

// Cada area define buracos, plataformas, moedas e inimigos em posicoes proprias.
// Plataformas usam [coluna inicial, coluna final, linha]; gaps usam [inicio, largura].
const forestSections=[
  {
    name:'Forest Edge',
    background:'edge',
    gaps:[[25,4],[50,4],[70,4],[87,4],[102,4]],
    platforms:[[13,19,10],[35,40,9],[61,66,10],[78,83,9],[93,98,10]],
    groundCoins:[5,8,11,14,17,20,31,34,37,40,43,46,56,59,62,65,68,75,78,81,92,95,98,107],
    raisedCoins:[35,38,61,64,79,82],
    groundEnemies:[46,72],
    platformEnemies:[37,80,95]
  },
  {
    name:'Deep Forest',
    background:'deep',
    gaps:[[124,5],[143,4],[159,6],[180,5],[199,5],[215,4]],
    platforms:[[117,122,10],[134,139,9],[151,157,10],[169,174,9],[189,194,10],[207,212,9]],
    groundCoins:[113,116,119,122,130,133,136,139,142,149,152,155,158,166,169,172,175,178,186,189,192,195,205,219],
    raisedCoins:[134,137,169,172,208,211],
    groundEnemies:[115,130,149,166,186,205],
    platformEnemies:[136,171,210]
  },
  {
    name:'Forest Clearing',
    background:'clearing',
    gaps:[[234,6],[252,5],[270,6],[288,5],[304,6],[320,4]],
    platforms:[[228,233,10],[245,249,9],[261,267,10],[279,283,9],[296,302,10],[313,317,9],[326,330,10]],
    groundCoins:[224,227,230,233,241,244,247,250,259,262,265,268,277,280,283,286,295,298,301,303,311,314,317,325],
    raisedCoins:[245,246,249,279,282,283],
    groundEnemies:[224,242,258,260,277,293,302,310],
    platformEnemies:[247,281,314]
  }
];

// Transforma as definicoes das areas em uma grade que o motor consegue ler.
for(const section of forestSections){
  for(const [start,width] of section.gaps){
    for(let column=start;column<start+width;column++){
      forestTiles[13][column]=' ';
      forestTiles[14][column]=' ';
    }
  }
  for(const [start,end,row] of section.platforms){
    for(let column=start;column<=end;column++)forestTiles[row][column]='#';
  }
  for(const column of section.groundCoins)forestTiles[12][column]='o';
  for(const column of section.raisedCoins)forestTiles[8][column]='o';
  for(const column of section.groundEnemies)forestTiles[11][column]='E';
  for(const column of section.platformEnemies){
    const platform=section.platforms.find(([start,end])=>column>=start&&column<=end);
    forestTiles[platform[2]-1][column]='E';
  }
}

forestTiles[12][330]='F';
window.GameLevelForest1 = {
    id:'forest-1',
    name:'Floresta do Crepusculo',
    repeats:1,
    ammoPickupColumns:[15,44,96,117,151,193,230,267,300],
    regions:[
      {start:0,end:111,name:'Forest Edge',background:'edge'},
      {start:111,end:222,name:'Deep Forest',background:'deep'},
      {start:222,end:333,name:'Forest Clearing',background:'clearing'}
    ],
    rows:forestTiles.map(row=>row.join(''))
  };
})();
