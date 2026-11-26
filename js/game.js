// Inicializacao do canvas e variaveis que controlam a partida atual.
const c=document.getElementById('g'),x=c.getContext('2d');
x.scale(1.6,1.6);

let selectedCharacterId='luke';
let characterIntroPlayed=false;
for (const character of Object.values(window.GameCharacters)) {
  character.image = new Image();
  character.image.src = character.sprite;
}
const grenadierSheet = new Image();
grenadierSheet.src = 'assets/enemies/grenadier-atlas.png';
const blueGrenadierSheet = new Image();
blueGrenadierSheet.src = 'assets/enemies/blue-grenadier-atlas.png';
const greenScoutSheet = new Image();
greenScoutSheet.src = 'assets/enemies/green-scout-atlas.png';

const W=800,H=480,T=32;
let currentLevelIndex=0;
let levelData,rows,BASE_COLS,REPEATS,ROWS,COLS,g;
// Monta a grade da fase e prepara o tamanho do mundo para a camera.
function configureLevel(index=currentLevelIndex){
  currentLevelIndex=Math.max(0,Math.min(index,window.GameLevels.length-1));
  levelData=window.GameLevels[currentLevelIndex];
  rows=levelData.rows;
  BASE_COLS=Math.max(...rows.map(r=>r.length));
  REPEATS=levelData.repeats||1;
  ROWS=rows.length;COLS=BASE_COLS*REPEATS;
  g=rows.map(row=>{
    const segment=row.padEnd(BASE_COLS,' ');
    return Array.from({length:REPEATS},(_,part)=>part===REPEATS-1?segment:segment.replace('F',' ')).join('');
  });
}
configureLevel();
const solid=(i,j)=>i<0||i>=COLS?true:(j<0||j>=ROWS)?false:g[j][i]==='#';
let P,E,fireballs,enemyBullets,projectiles,snowPickups,ammo=10,coins,total=0,got=0,kills=0,lives=3,state='select',cam=0,flag,checkpointFlag,checkpointReached=false,tm=0,goalHintUntil=0,goalKills=0,goalCoins=0;
const MAX_AMMO=50; // Limite de municao que o jogador pode carregar.
const runStep = .08;
const keys={};
let padConfirmWasDown=false,padSelectWasDown=false,padBackWasDown=false;
// Recria moedas, inimigos, itens e jogador quando uma fase recomeca.
function reset(preserveCheckpoint=false){
  const keepCheckpoint=preserveCheckpoint&&checkpointReached;
  configureLevel(currentLevelIndex);
  checkpointReached=Boolean(keepCheckpoint&&levelData.checkpointBlock);
  E=[];fireballs=[];enemyBullets=[];projectiles=[];snowPickups=new Set();ammo=levelData.startingAmmo??window.GameCharacters[selectedCharacterId].startingAmmo;coins=new Set();got=0;kills=0;total=0;flag=null;checkpointFlag=null;goalHintUntil=0;goalKills=0;goalCoins=0;
  const surfaceRow=(column,fromRow=1)=>{
    for(let row=Math.max(1,fromRow);row<ROWS;row++)if(solid(column,row)&&!solid(column,row-1))return row;
    return -1;
  };
  const addEnemy=(column,row,kind='grenadier')=>{
    const greenScout=kind==='greenScout';
    const speed=greenScout?25:35;
    E.push({kind,x:column*T-5,y:row*T-40,w:34,h:40,vx:E.length%2?-speed:speed,vy:0,shot:greenScout?1.8:0.65+(column%4)*0.28,hp:greenScout?1:kind==='blueGrenadier'?3:2,shooting:false,shotFired:false,animOffset:(column%8)*.12});
  };
  for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){
    const ch=g[j][i];
    if(ch==='o'){coins.add(i+','+j);total++}
    if(ch==='G'||ch==='E'||ch==='B'){
      const floor=surfaceRow(i,j+1);
      if(floor>0)addEnemy(i,floor,ch==='G'?'greenScout':ch==='B'?'blueGrenadier':'grenadier');
    }
    if(ch==='F')flag={x:i*T+8,y:j*T-64,w:16,h:96};
    if(ch==='C')checkpointFlag={x:i*T+8,y:j*T-64,w:16,h:96,raisedAt:checkpointReached?tm-.8:null};
  }
  // A ordem das recompensas e definida da esquerda para a direita.
  E.sort((a,b)=>a.x-b.x);
  const ammoDropEnemies=new Set(levelData.ammoDropEnemies||[]);
  E.forEach((enemy,index)=>{enemy.order=index+1;enemy.dropsAmmo=ammoDropEnemies.has(index+1)});
  for(let part=0;part<REPEATS;part++){
    for(const localColumn of levelData.ammoPickupColumns||[]){
      const column=part*BASE_COLS+localColumn,row=surfaceRow(column);
      if(row>0)snowPickups.add(column+','+(row-1));
    }
  }
  // As metas acompanham o conteudo da fase: um terco dos inimigos e metade das moedas.
  goalKills=Math.ceil(E.length/3);
  goalCoins=Math.ceil(total/2);
  const checkpointColumn=checkpointReached?(levelData.checkpointBlock-1):0;
  P={x:checkpointReached?checkpointColumn*T:64,y:330,w:22,h:30,vx:0,vy:0,ground:false,coy:0,buf:0,face:1,dj:1,runAnimTime:0,landTimer:0,shotCooldown:0,mortarHits:0,mortarInvulnerableUntil:0,health:levelData.startingHealth||0,maxHealth:levelData.healthCells||0,hitInvulnerableUntil:0};
  cam=checkpointReached?Math.max(0,P.x+P.w/2-W/2):0;
}
// Move um objeto e impede que atravesse blocos solidos do mapa.
function move(o,dx,dy){
  o.hitx=false;o.x+=dx;
  if(dx){
    const l=Math.floor(o.x/T),r=Math.floor((o.x+o.w-1)/T),a=Math.floor(o.y/T),b=Math.floor((o.y+o.h-1)/T);
    for(let j=a;j<=b;j++){
      if(dx>0&&solid(r,j)){o.x=r*T-o.w;o.hitx=true;break}
      if(dx<0&&solid(l,j)){o.x=(l+1)*T;o.hitx=true;break}
    }
  }
  o.y+=dy;o.ground=false;
  if(dy){
    const l=Math.floor(o.x/T),r=Math.floor((o.x+o.w-1)/T),a=Math.floor(o.y/T),b=Math.floor((o.y+o.h)/T);
    for(let i=l;i<=r;i++){
      if(dy>0&&solid(i,b)){o.y=b*T-o.h;o.vy=0;o.ground=true;break}
      if(dy<0&&solid(i,a)){o.y=(a+1)*T;o.vy=0;break}
    }
  }
}
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function shellTouchesHero(x0,y0,x1,y1,r,hero){
  const left=hero.x-r,right=hero.x+hero.w+r,top=hero.y-r,bottom=hero.y+hero.h+r;
  let enter=0,exit=1;
  for(const [start,end,min,max] of [[x0,x1,left,right],[y0,y1,top,bottom]]){
    const delta=end-start;
    if(Math.abs(delta)<1e-8){if(start<min||start>max)return false;continue}
    let near=(min-start)/delta,far=(max-start)/delta;
    if(near>far)[near,far]=[far,near];
    enter=Math.max(enter,near);exit=Math.min(exit,far);
    if(enter>exit)return false;
  }
  return true;
}
let deathTime=0;
// Trata a perda de vida e retorna a selecao quando as vidas acabam.
function die(){
  if(state==='dead'||state==='select')return;
  window.GameAudio.play('dead');deathTime=tm;lives--;
  if(lives<=0){currentLevelIndex=0;lives=3;characterIntroPlayed=false;reset();state='select'}
  else state='dead';
}
// Cada impacto remove uma barra na fase que usa energia; nas outras fases vale a regra atual.
function damageHero(direction=0){
  if(levelData.healthCells){
    if(tm<(P.hitInvulnerableUntil||0))return false;
    P.health=Math.max(0,P.health-1);
    P.hitInvulnerableUntil=tm+.85;
    P.vx=(direction||P.face)*220;P.vy=-260;P.ground=false;
    if(P.health===0){die();return true}
    return false;
  }
  die();return true;
}
// Mantem os danos maiores dos morteiros nas fases sem barra de energia.
function damageHeroFromMortar(amount,direction){
  if(levelData.healthCells)return damageHero(direction);
  P.mortarHits+=amount;P.mortarInvulnerableUntil=tm+.75;
  P.vx=direction*220;P.vy=-260;P.ground=false;
  if(P.mortarHits>=2){die();return true}
  return false;
}
// Inicia a fase, toca a entrada do heroi e prepara sua chegada especial.
function enterLevel(preserveCheckpoint=false){
  const checkpointRespawn=preserveCheckpoint&&checkpointReached;
  reset(preserveCheckpoint);
  window.GameAudio.startMusic();
  if(!characterIntroPlayed){
    window.GameAudio.playOnce(window.GameCharacters[selectedCharacterId].introSound);
    characterIntroPlayed=true;
  }
  const character=window.GameCharacters[selectedCharacterId];
  state='play';
  if(!checkpointRespawn&&(character.dozerEntry || character.dinoEntry)){
    P.x=150;
    // A entrada com paraquedas comeca mais abaixo para deixar a copa visivel.
    P.y=character.dozerEntry ? 170 : 8;
    P.ground=false;
    state=character.dozerEntry ? 'dozerEntry' : 'dinoEntry';
  }else if (!checkpointRespawn&&character.parachuteEntry) {
    P.y = 115;
    state = 'parachute';
  }
}
  function restartAfterDeath(){characterIntroPlayed=false;enterLevel(true)}
  function returnToCharacterSelect(){currentLevelIndex=0;lives=3;characterIntroPlayed=false;reset();state='select';window.GameAudio.startMusic()}
// Confirma a opcao atual: iniciar, reiniciar, avancar ou voltar ao menu.
function confirmMenu(){
  if(state==='parachute'||state==='dozerEntry'||state==='dinoEntry'||state==='play')return;
  if(state==='select'){lives=3;enterLevel();return}
  if(state==='dead'||state==='over'){restartAfterDeath();return}
  if(state==='win'){
    if(levelData.returnToTitleOnWin){
      currentLevelIndex=0;lives=3;characterIntroPlayed=false;reset();state='select';window.GameAudio.startMusic();return;
    }
    currentLevelIndex=(currentLevelIndex+1)%window.GameLevels.length;
    lives=3;
    if (currentLevelIndex === 0) { state='select';return }
    enterLevel();return;
  }
  reset();state='play';
}
function moveCharacterSelection(direction){
  selectedCharacterId=window.CharacterSelect.move(selectedCharacterId,direction);
}
