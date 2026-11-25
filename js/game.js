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

const W=800,H=480,T=32;
let currentLevelIndex=0;
let levelData,rows,BASE_COLS,REPEATS,ROWS,COLS,g;
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
let P,E,fireballs,projectiles,snowPickups,ammo=10,coins,total=0,got=0,kills=0,lives=3,state='select',cam=0,flag,tm=0,goalHintUntil=0;
const GOAL_KILLS=5,GOAL_COINS=50,MAX_AMMO=50;
const runStep = .08;
const keys={};
let padConfirmWasDown=false,padSelectWasDown=false,padBackWasDown=false;
function reset(){
  configureLevel(currentLevelIndex);
  E=[];fireballs=[];projectiles=[];snowPickups=new Set();ammo=window.GameCharacters[selectedCharacterId].startingAmmo;coins=new Set();got=0;kills=0;total=0;flag=null;goalHintUntil=0;
  const surfaceRow=(column,fromRow=1)=>{
    for(let row=Math.max(1,fromRow);row<ROWS;row++)if(solid(column,row)&&!solid(column,row-1))return row;
    return -1;
  };
  const addEnemy=(column,row)=>E.push({kind:'grenadier',x:column*T-5,y:row*T-40,w:34,h:40,vx:E.length%2?-35:35,vy:0,shot:0.65+(column%4)*0.28,hp:2,shooting:false,shotFired:false,animOffset:(column%6)*.12});
  for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){
    const ch=g[j][i];
    if(ch==='o'){coins.add(i+','+j);total++}
    if(ch==='E'||ch==='B'){
      const floor=surfaceRow(i,j+1);
      if(floor>0)addEnemy(i,floor);
    }
    if(ch==='F')flag={x:i*T+8,y:j*T-64,w:16,h:96};
  }
  for(let part=0;part<REPEATS;part++){
    for(const localColumn of levelData.ammoPickupColumns||[]){
      const column=part*BASE_COLS+localColumn,row=surfaceRow(column);
      if(row>0)snowPickups.add(column+','+(row-1));
    }
    let bonusCount=0;
    for(const localColumn of [18,52,74]){
      if(bonusCount>=2)break;
      const column=part*BASE_COLS+localColumn,row=surfaceRow(column);
      if(row<1||E.some(enemy=>Math.abs(enemy.x-(column*T-5))<T*7))continue;
      addEnemy(column,row);bonusCount++;
    }
  }
  P={x:64,y:330,w:22,h:30,vx:0,vy:0,ground:false,coy:0,buf:0,face:1,dj:1,runAnimTime:0,landTimer:0,shotCooldown:0};
  cam=0;
}
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
let deathTime=0;
function die(){
  if(state==='dead'||state==='select')return;
  window.GameAudio.play('dead');deathTime=tm;lives--;
  if(lives<=0){currentLevelIndex=0;lives=3;characterIntroPlayed=false;reset();state='select'}
  else state='dead';
}
function enterLevel(){
  reset();
  window.GameAudio.startMusic();
  if(!characterIntroPlayed){
    window.GameAudio.playOnce(window.GameCharacters[selectedCharacterId].introSound);
    characterIntroPlayed=true;
  }
  const character=window.GameCharacters[selectedCharacterId];
  state='play';
  if(character.dozerEntry || character.dinoEntry){
    P.x=150;
    P.y=8;
    P.ground=false;
    state=character.dozerEntry ? 'dozerEntry' : 'dinoEntry';
  }else if (character.parachuteEntry) {
    P.y = 115;
    state = 'parachute';
  }
}
  function restartAfterDeath(){characterIntroPlayed=false;enterLevel()}
  function returnToCharacterSelect(){currentLevelIndex=0;lives=3;characterIntroPlayed=false;reset();state='select';window.GameAudio.startMusic()}
function confirmMenu(){
  if(state==='parachute'||state==='dozerEntry'||state==='dinoEntry'||state==='play')return;
  if(state==='select'){lives=3;enterLevel();return}
  if(state==='dead'||state==='over'){restartAfterDeath();return}
  if(state==='win'){
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
function update(dt){
  tm+=dt;
  if(state==='dozerEntry' || state==='dinoEntry'){
    move(P,0,135*dt);
    if(P.ground) state='play';
    return;
  }
  const pad=Array.from(navigator.getGamepads?.()||[]).find(gamepad=>gamepad&&gamepad.connected);
  const padA=Boolean(pad?.buttons[0]?.pressed);
  const padB=Boolean(pad?.buttons[1]?.pressed);
  const padX=Boolean(pad?.buttons[2]?.pressed);
  const padStart=Boolean(pad?.buttons[9]?.pressed);
  const padConfirm=padA||padStart;
  if (state==='parachute') {
    padConfirmWasDown=padConfirm;
    move(P,0,125*dt);
    if(P.ground){P.landTimer=.14;state='play'}
    return;
  }
  const axis=pad?.axes?.[0]||0;
  const axisDir=Math.abs(axis)>.25?Math.sign(axis):0;
  const dpadDir=pad?.buttons[15]?.pressed?1:pad?.buttons[14]?.pressed?-1:0;
  const selectDir=axisDir||dpadDir;
  if(state==='select'&&selectDir&&!padSelectWasDown)moveCharacterSelection(selectDir);
  padSelectWasDown=state==='select'&&Boolean(selectDir);
  if(state!=='play'){
    if((state==='dead'||state==='over')&&padB&&!padBackWasDown)returnToCharacterSelect();
    else if((state==='dead'||state==='over')&&padConfirm&&!padConfirmWasDown)restartAfterDeath();
    else if(padConfirm&&!padConfirmWasDown)confirmMenu();
    padConfirmWasDown=padConfirm;
    padBackWasDown=padB;
    return;
  }
  if(padA&&!padConfirmWasDown)P.buf=.12;
  padConfirmWasDown=padConfirm;
  const right=keys.ArrowRight||keys.KeyD||axisDir>0||dpadDir>0;
  const left=keys.ArrowLeft||keys.KeyA||axisDir<0||dpadDir<0;
  const dir=(right?1:0)-(left?1:0);
  const target=dir*210,acc=P.ground?1800:1100;
  if(P.vx<target)P.vx=Math.min(target,P.vx+acc*dt);
  else if(P.vx>target)P.vx=Math.max(target,P.vx-acc*dt);
  if(dir)P.face=dir;
  P.coy=P.ground?.1:P.coy-dt;P.buf-=dt;if(P.ground)P.dj=1;
  if(P.buf>0&&P.coy>0){P.vy=-600;P.buf=0;P.coy=0;window.GameAudio.play('jump')}
  else if(P.buf>0&&P.dj>0){P.vy=-560;P.buf=0;P.dj=0;window.GameAudio.play('jump')}
  P.vy=Math.min(P.vy+1500*dt,800);
  const wasGround=P.ground;
  move(P,P.vx*dt,0);move(P,0,P.vy*dt);
  if(!wasGround&&P.ground)P.landTimer=.14;
  else P.landTimer=Math.max(0,P.landTimer-dt);
  P.runAnimTime=P.ground&&Math.abs(P.vx)>25?P.runAnimTime+dt:0;
  P.shotCooldown=Math.max(0,P.shotCooldown-dt);
  if((keys.KeyX||keys.KeyF||padX)&&P.shotCooldown<=0&&ammo>0){
    const shot=window.GameCharacters[selectedCharacterId].projectile;
    projectiles.push({type:shot.type,color:shot.color,outline:shot.outline,damage:shot.damage||1,x:P.x+P.w/2+P.face*16,y:P.y+P.h/2,vx:P.face*shot.speed,r:shot.radius,life:1.8});
    window.GameAudio.play('throw');
    ammo--;P.shotCooldown=shot.cooldown;
  }
  if(P.y>ROWS*T+80){die();return}
  const ci=Math.floor((P.x+P.w/2)/T),cj=Math.floor((P.y+P.h/2)/T);
  for(let j=cj-1;j<=cj+1;j++)for(let i=ci-1;i<=ci+1;i++){
    const k=i+','+j;
    if(coins.has(k)&&Math.hypot(i*T+16-(P.x+11),j*T+16-(P.y+15))<24){coins.delete(k);got++;window.GameAudio.play('coin')}
  }
  for(const k of snowPickups){
    const [i,j]=k.split(',').map(Number);
    if(Math.hypot(i*T+16-(P.x+P.w/2),j*T+16-(P.y+P.h/2))<27){snowPickups.delete(k);ammo=Math.min(MAX_AMMO,ammo+5);window.GameAudio.play('ammo')}
  }
  for(const e of E){
    if(e.dying)continue;
    e.vy=Math.min(e.vy+1500*dt,800);
    move(e,e.vx*dt,0);move(e,0,e.vy*dt);
    if(e.hitx)e.vx*=-1;
    if(e.ground){
      const ai=Math.floor((e.x+(e.vx>0?e.w+2:-2))/T),aj=Math.floor((e.y+e.h+2)/T);
      if(!solid(ai,aj))e.vx*=-1;
    }
    e.shot-=dt;
    const dx=P.x+P.w/2-(e.x+e.w/2);
    if(e.shooting){
      const elapsed=tm-e.shootStart;
      if(!e.shotFired&&elapsed>=.11){
        const flight=Math.max(.48,Math.min(1.25,Math.abs(dx)/220));
        const sx=e.x+e.w/2+Math.sign(dx)*12,sy=e.y+e.h*.38;
        const ty=P.y+P.h/2,gravity=560;
        fireballs.push({x:sx,y:sy,vx:dx/flight,vy:(ty-sy-.5*gravity*flight*flight)/flight,r:7,life:flight+.45});
        window.GameAudio.play('enemyFire');
        e.shotFired=true;
      }
      if(elapsed>=.66)e.shooting=false;
    }else if(e.shot<=0&&Math.abs(dx)<460){
      e.shooting=true;
      e.shootStart=tm;
      e.shotFired=false;
      e.shot=1.6;
    }
    if(hit(P,e)){
      if(P.vy>0&&P.y+P.h-e.y<20){P.vy=-380}
      else{die();return}
    }
  }
  for(const b of projectiles){
    b.x+=b.vx*dt;b.life-=dt;
    const target=E.find(e=>!e.dying&&hit({x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2},e));
    if(target){target.hp-=b.damage;b.life=0;if(target.hp<=0){target.dying=true;target.deathStarted=tm;target.shooting=false;target.vx=0;target.vy=0;kills++;window.GameAudio.play('enemyDefeat')}}
  }
  for(const f of fireballs){
    f.vy+=560*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;
    if(hit(P,{x:f.x-f.r,y:f.y-f.r,w:f.r*2,h:f.r*2})){die();return}
  }
  fireballs=fireballs.filter(f=>f.life>0&&f.x>-100&&f.x<COLS*T+100&&f.y<H+500);
  projectiles=projectiles.filter(b=>b.life>0&&b.x>-100&&b.x<COLS*T+100);
  E=E.filter(e=>!e.dying||tm-e.deathStarted<.84);
  if(hit(P,flag)){
    if(kills>=GOAL_KILLS&&got>=GOAL_COINS){state='win';window.GameAudio.play('levelComplete')}
    else goalHintUntil=tm+3.5;
  }
  const want=Math.max(0,Math.min(COLS*T-W,P.x+P.w/2-W/2));
  cam+=(want-cam)*Math.min(1,dt*8);
}
function drawKnife(bladeColor='#dbe6ec',handleColor='#243641'){
  x.save();
  x.shadowColor='rgba(0,0,0,.32)';x.shadowBlur=2;x.shadowOffsetY=1;
  const handle=x.createLinearGradient(-12,-4,-4,4);
  handle.addColorStop(0,'#53694f');handle.addColorStop(.48,handleColor);handle.addColorStop(1,'#18241f');
  x.fillStyle=handle;x.strokeStyle='#101a18';x.lineWidth=1;
  x.beginPath();x.roundRect(-13,-3.2,9,6.4,2.2);x.fill();x.stroke();
  x.beginPath();x.arc(-12.5,0,2.3,0,Math.PI*2);x.fill();x.stroke();
  x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetY=0;
  x.strokeStyle='rgba(226,233,212,.72)';x.lineWidth=.65;
  for(let groove=-1;groove<=1;groove++){
    x.beginPath();x.moveTo(-11+groove*2,-2.2);x.lineTo(-9+groove*2,2.2);x.stroke();
  }
  x.fillStyle='#b6c1bd';x.strokeStyle='#28343a';x.lineWidth=1;
  x.beginPath();x.moveTo(-4,-4.4);x.lineTo(-2.1,-4.4);x.lineTo(-1.2,-2.1);x.lineTo(-1.2,2.1);x.lineTo(-2.1,4.4);x.lineTo(-4,4.4);x.lineTo(-5.1,2);x.lineTo(-5.1,-2);x.closePath();x.fill();x.stroke();
  const steel=x.createLinearGradient(-1,-4,13,3);
  steel.addColorStop(0,'#f7fbff');steel.addColorStop(.28,bladeColor);steel.addColorStop(.62,'#8999a1');steel.addColorStop(.82,'#e7eef0');steel.addColorStop(1,'#52636b');
  x.fillStyle=steel;x.strokeStyle='#26343a';x.lineWidth=1.05;
  x.beginPath();x.moveTo(-1.8,-3.6);x.lineTo(7.4,-3.1);x.lineTo(14,0);x.lineTo(7.2,3.15);x.lineTo(-1.8,3.6);x.lineTo(1.2,.6);x.closePath();x.fill();x.stroke();
  x.strokeStyle='rgba(255,255,255,.88)';x.lineWidth=.8;x.beginPath();x.moveTo(0,-2.7);x.lineTo(11.2,-.35);x.stroke();
  x.strokeStyle='rgba(45,58,64,.72)';x.lineWidth=.65;x.beginPath();x.moveTo(1.1,2.7);x.lineTo(7.1,2.7);x.stroke();
  x.restore();
}

function drawBanana(color='#ffdc43',outline='#8f5717'){
  x.save();x.shadowColor='rgba(94,57,9,.28)';x.shadowBlur=2;x.shadowOffsetY=1;
  const peel=x.createLinearGradient(-7,-14,5,13);
  peel.addColorStop(0,'#fff3a0');peel.addColorStop(.25,'#ffe54e');peel.addColorStop(.68,color);peel.addColorStop(1,'#d89116');
  x.fillStyle=peel;x.strokeStyle=outline;x.lineWidth=1.05;x.lineJoin='round';
  x.beginPath();
  x.moveTo(-11,-8);
  x.bezierCurveTo(-5,-15,4,-15,11,-7);
  x.quadraticCurveTo(14,-4,11,-1);
  x.bezierCurveTo(5,-7,0,-7,-4,-2);
  x.bezierCurveTo(-7,1,-8,5,-9,9);
  x.quadraticCurveTo(-13,8,-13,4);
  x.bezierCurveTo(-12,0,-11,-4,-11,-8);
  x.closePath();x.fill();x.stroke();x.shadowBlur=0;x.shadowOffsetY=0;
  x.strokeStyle='rgba(255,249,190,.9)';x.lineWidth=1.25;x.lineCap='round';
  x.beginPath();x.moveTo(-9,-8);x.bezierCurveTo(-4,-12,3,-12,8,-7);x.stroke();
  x.strokeStyle='rgba(174,111,13,.68)';x.lineWidth=.8;
  x.beginPath();x.moveTo(-9,5);x.quadraticCurveTo(-7,2,-5,-1);x.stroke();
  x.fillStyle='#6f4818';x.beginPath();x.roundRect(-13,-9,3.4,4,1);x.fill();
  x.fillStyle='#6f4818';x.beginPath();x.roundRect(-11,7,3.2,3,1);x.fill();
  x.restore();
}

function drawShovel(blade='#c9d0d3',handle='#594332'){
  x.strokeStyle=handle;x.lineWidth=3;x.lineCap='round';
  x.beginPath();x.moveTo(-9,5);x.lineTo(5,-4);x.stroke();
  x.fillStyle=blade;x.strokeStyle='#34414a';x.lineWidth=1;
  x.beginPath();x.moveTo(3,-7);x.lineTo(12,-8);x.lineTo(15,-3);x.lineTo(8,1);x.lineTo(4,-2);x.closePath();x.fill();x.stroke();
}

function drawSsg12(character,airborne,walking){
  const sprite=character.image;
  if(!sprite.complete||!sprite.naturalWidth)return;
  const columns=character.gridColumns,rows=character.gridRows;
  const fw=sprite.naturalWidth/columns,fh=sprite.naturalHeight/rows;
  let frame=0;
  if(state==='dozerEntry')frame=47;
  else if(state==='dead'||state==='over')frame=36+Math.min(4,Math.floor((tm-deathTime)/.16));
  else if(state==='play'&&P.shotCooldown>0){
    frame=24+Math.min(5,Math.floor((1-P.shotCooldown/character.projectile.cooldown)*6));
  }else if(airborne){
    frame=18+(P.vy<-250?0:P.vy<0?1:P.vy<180?2:3);
  }else if(P.landTimer>0)frame=21;
  else if(walking){
    const start=Math.abs(P.vx)<150?6:12;
    frame=start+Math.floor(P.runAnimTime/runStep)%6;
  }else frame=Math.floor(tm*4)%4;
  const sx=(frame%columns)*fw,sy=Math.floor(frame/columns)*fh;
  x.save();
  if(state==='dozerEntry'){
    const center=P.x+P.w/2, bottom=P.y+P.h;
    drawParachute('#797e43',bottom-118,1.42);
    // The last cell also contains a standing soldier. Draw just the vehicle.
    x.drawImage(sprite,sx,sy+fh*.18,fw*.71,fh*.73,center-55,bottom-88,110,88);
    // Frame zero supplies the operator visible through the cab window.
    x.save();
    x.beginPath();
    x.roundRect(center-24,bottom-66,19,25,3);
    x.clip();
    x.drawImage(sprite,0,0,fw,fh,center-38,bottom-68,48,50);
    x.restore();
  }else{
    x.translate(P.x+P.w/2,P.y+P.h+(character.groundOffset||0));x.scale(P.face,1);
    x.drawImage(sprite,sx,sy,fw,fh,-27,-54,54,54);
  }
  x.restore();
}

function drawGridHero(character,airborne,walking){
  const sprite=character.image;
  if(!sprite.complete||!sprite.naturalWidth)return;
  const columns=character.gridColumns,rows=character.gridRows;
  const fw=sprite.naturalWidth/columns,fh=sprite.naturalHeight/rows;
  const phase=Math.floor(P.runAnimTime/.105)%6;
  let frame=0;
  if(state==='dead'||state==='over'){
    const elapsed=tm-deathTime;
    frame=24+(elapsed<.22?Math.min(1,Math.floor(elapsed/.11)):2+Math.min(2,Math.floor((elapsed-.22)/.16)));
  }else if(state==='dinoEntry')frame=30;
  else if(state==='parachute')frame=30+Math.min(5,Math.floor((P.y-115)/32));
  else if(state==='play'&&P.shotCooldown>.08){
    frame=18+Math.min(4,Math.floor((1-P.shotCooldown/character.projectile.cooldown)*5));
  }else if(airborne)frame=12+(P.vy<-250?0:P.vy<0?1:P.vy<180?2:3);
  else if(P.landTimer>0)frame=15;
  else if(walking)frame=6+phase;
  else frame=0;
  if(state==='dinoEntry'){
    const bottom=P.y+P.h;
    drawParachute('#c69241',bottom-109,1.25);
    x.drawImage(sprite,0,5*fh,fw,fh,P.x+P.w/2-49,bottom-96,98,98);
    return;
  }
  x.save();
  x.translate(P.x+P.w/2,P.y+P.h+(character.groundOffset||0));
  x.scale(P.face,1);
  x.drawImage(sprite,(frame%columns)*fw,Math.floor(frame/columns)*fh,fw,fh,-27,-54,54,54);
  x.restore();
}

function drawGrenadier(e){
  if(!grenadierSheet.complete||!grenadierSheet.naturalWidth)return;
  let frame;
  if(e.dying){
    frame=12+Math.min(5,Math.floor((tm-e.deathStarted)/.14));
  }else if(e.shooting){
    frame=6+Math.min(5,Math.floor((tm-e.shootStart)/.11));
  }else{
    frame=Math.floor((tm+(e.animOffset||0))*5)%6;
  }
  const frameWidth=grenadierSheet.naturalWidth/6;
  const frameHeight=grenadierSheet.naturalHeight/3;
  const faceLeft=P.x+P.w/2<e.x+e.w/2;
  x.save();
  x.translate(e.x+e.w/2,e.y+e.h+6);
  x.scale(faceLeft?1:-1,1);
  x.drawImage(grenadierSheet,(frame%6)*frameWidth,Math.floor(frame/6)*frameHeight,frameWidth,frameHeight,-30,-60,60,60);
  x.restore();
}

function drawParachute(color='#e6b861', canopyY=P.y-58, scale=1){
  x.save();
  x.translate(P.x+P.w/2,canopyY);
  x.scale(scale,scale);
  x.strokeStyle='#f8e9bd';
  x.lineWidth=1.5;
  for(const side of [-1,1]){
    x.beginPath();x.moveTo(side*44,5);x.lineTo(side*9,44);
    x.moveTo(side*16,3);x.lineTo(side*9,44);x.stroke();
  }
  x.fillStyle=color;
  x.beginPath();
  x.ellipse(0,7,46,29,0,Math.PI,Math.PI*2);
  x.quadraticCurveTo(24,-3,0,5);
  x.quadraticCurveTo(-24,-3,-46,7);
  x.closePath();x.fill();x.stroke();
  x.restore();
}

function drawSpriteStrip(character, airborne, walking){
  const sprite=character.image;
  if(!sprite.complete||!sprite.naturalWidth)return;
  const fw=sprite.naturalWidth/character.stripFrames;
  const fh=sprite.naturalHeight;
  let frame=0;
  if(state==='dead'||state==='over')frame=13;
  else if(P.shotCooldown>.09&&state==='play')frame=10+Math.min(2,Math.floor((.3-P.shotCooldown)/.07));
  else if(airborne)frame=P.vy<0?7:8;
  else if(P.landTimer>0)frame=9;
  else if(walking)frame=1+Math.floor(P.runAnimTime/runStep)%6;
  if(character.tacticalAnimations){
    if(state==='dead'||state==='over'){
      const elapsed=tm-deathTime;
      frame=elapsed<.24?26+Math.min(2,Math.floor(elapsed/.08)):29+Math.min(4,Math.floor((elapsed-.24)/.105));
    }else if(state==='play'&&P.shotCooldown>0){
      frame=20+Math.min(5,Math.floor((1-P.shotCooldown/character.projectile.cooldown)*6));
    }else if(state==='parachute')frame=18;
    else if(airborne)frame=P.vy<-235?17:P.vy<170?18:19;
    else if(P.landTimer>0)frame=19;
    else if(walking)frame=(Math.abs(P.vx)<150?4:10)+Math.floor(P.runAnimTime/runStep)%6;
    else frame=state==='play'?Math.floor(tm*4)%4:0;
  }
  const height=52,width=fw*height/fh;
  x.save();
  x.translate(P.x+P.w/2,P.y+P.h+(character.groundOffset||0));
  x.scale(P.face,1);
  x.drawImage(sprite,frame*fw,0,fw,fh,-width/2,-height,width,height);
  x.restore();
}

// Original portrait coordinates, used as pivots to animate the legs.
const jumpMasterLegs=[
  {hip:[473,785],edge:[[390,762],[554,778],[552,874],[481,1140],[394,1430],[205,1430],[211,1065],[306,839]]},
  {hip:[649,785],edge:[[547,778],[724,758],[788,832],[810,1130],[859,1430],[560,1430],[539,1072],[552,874]]}
];
function drawJumpMaster(sprite, airborne, walking){
  if(!sprite.complete||!sprite.naturalWidth)return;
  const pose=Math.floor(P.runAnimTime/runStep)%10;
  const stride=walking ? Math.sin(pose*Math.PI/5)*.32 : 0;
  const landing=P.landTimer>0&&!airborne;
  x.save();
  x.translate(P.x+P.w/2,P.y+P.h+(window.GameCharacters[selectedCharacterId].groundOffset||0));
  x.scale(P.face,1);
  x.rotate(walking ? .09 : airborne && state!=='parachute' ? -.07 : 0);
  x.scale(50/1405,50/1405*(landing ? .87 : 1));
  x.translate(-540,-1405+(walking ? Math.abs(stride)*36 : 0));
  const drawPortrait=()=>x.drawImage(sprite,0,0,1080,1440);
  if(!walking&&!airborne){
    drawPortrait();
  }else{
    jumpMasterLegs.forEach(({hip,edge},index)=>{
      x.save();
      x.translate(...hip);
      x.rotate(airborne ? (state==='parachute' ? (index===0 ? .08 : -.08) : (index===0 ? .39 : -.47)) : (index===0 ? stride : -stride));
      x.translate(-hip[0],-hip[1]);
      x.beginPath();
      x.moveTo(...edge[0]);
      for(const point of edge.slice(1))x.lineTo(...point);
      x.closePath();x.clip();
      drawPortrait();
      x.restore();
    });
    x.save();
    x.beginPath();
    x.moveTo(0,0);x.lineTo(1080,0);x.lineTo(1080,880);
    x.lineTo(775,880);x.lineTo(724,798);x.lineTo(390,798);
    x.lineTo(340,880);x.lineTo(0,880);x.closePath();x.clip();
    drawPortrait();
    x.restore();
  }
  x.restore();
}

function draw(){
  const s=x.createLinearGradient(0,0,0,H);
  s.addColorStop(0,'#173d48');s.addColorStop(.55,'#66855b');s.addColorStop(1,'#d6aa72');
  x.fillStyle=s;x.fillRect(0,0,W,H);
  x.fillStyle='#ffe3a0';x.beginPath();x.arc(620,105,30,0,Math.PI*2);x.fill();
  x.fillStyle='#416b51';
  for(let k=-1;k<10;k++){
    const bx=k*118-(cam*.18%118),base=H-38-(k%3)*9;
    x.fillRect(bx-5,base-170,10,190);
    x.beginPath();x.arc(bx,base-180,42,0,Math.PI*2);x.arc(bx-26,base-154,32,0,Math.PI*2);x.arc(bx+27,base-150,35,0,Math.PI*2);x.fill();
  }
  x.fillStyle='#264f3e';
  for(let k=-1;k<12;k++){
    const bx=k*92-(cam*.34%92),base=H-18;
    x.fillRect(bx-4,base-130,8,145);
    x.beginPath();x.moveTo(bx,base-218);x.lineTo(bx-38,base-130);x.lineTo(bx-22,base-135);x.lineTo(bx-48,base-82);x.lineTo(bx+48,base-82);x.lineTo(bx+22,base-135);x.lineTo(bx+38,base-130);x.closePath();x.fill();
  }
  x.save();x.translate(-Math.round(cam),0);
  const i0=Math.floor(cam/T),i1=i0+Math.ceil(W/T)+1;
  for(let j=0;j<ROWS;j++)for(let i=i0;i<=i1&&i<COLS;i++){
    if(g[j][i]==='#'){
      x.fillStyle='#654b32';x.fillRect(i*T,j*T,T,T);
      if(!solid(i,j-1)){x.fillStyle='#66a34e';x.fillRect(i*T,j*T,T,7);x.fillStyle='#8cc75d';x.fillRect(i*T,j*T,T,2)}
      x.fillStyle='rgba(39,77,45,.3)';x.fillRect(i*T+4,j*T+13,3,3);x.fillRect(i*T+22,j*T+23,4,3);
      x.strokeStyle='rgba(24,46,32,.32)';x.strokeRect(i*T+.5,j*T+.5,T-1,T-1);
    }
  }
  for(const k of coins){
    const [i,j]=k.split(',').map(Number),turn=Math.max(.22,Math.abs(Math.cos(tm*3+i))),cx=i*T+16,cy=j*T+16+Math.sin(tm*4+i)*2;
    x.save();x.translate(cx,cy);x.scale(turn,1);x.shadowColor='rgba(255,204,60,.58)';x.shadowBlur=9;
    const coin=x.createRadialGradient(-3,-4,1,0,0,11);coin.addColorStop(0,'#fff4b0');coin.addColorStop(.38,'#f8c840');coin.addColorStop(.78,'#c57b17');coin.addColorStop(1,'#7b4510');
    x.fillStyle=coin;x.strokeStyle='#ffe59a';x.lineWidth=1.6;x.beginPath();x.arc(0,0,9,0,Math.PI*2);x.fill();x.stroke();
    x.shadowBlur=0;x.strokeStyle='rgba(255,248,197,.92)';x.lineWidth=.9;x.beginPath();x.arc(0,0,6.6,0,Math.PI*2);x.stroke();
    x.strokeStyle='rgba(123,69,16,.72)';x.lineWidth=.7;x.beginPath();x.arc(0,0,5.3,0,Math.PI*2);x.stroke();
    x.fillStyle='#fff0a0';x.strokeStyle='#8c5513';x.lineWidth=.65;x.beginPath();
    for(let point=0;point<10;point++){const angle=-Math.PI/2+point*Math.PI/5,radius=point%2?2.3:4.1;const px=Math.cos(angle)*radius,py=Math.sin(angle)*radius;if(point===0)x.moveTo(px,py);else x.lineTo(px,py)}
    x.closePath();x.fill();x.stroke();
    x.fillStyle='rgba(255,255,220,.75)';x.beginPath();x.ellipse(-3,-4,1.6,2.6,-.35,0,Math.PI*2);x.fill();x.restore();
  }
  for(const k of snowPickups){
    const [i,j]=k.split(',').map(Number),py=j*T+16+Math.sin(tm*4+i)*2,px=i*T+16;
    x.fillStyle='rgba(130,220,255,.25)';x.beginPath();x.arc(px,py,13,0,Math.PI*2);x.fill();
    if(window.GameCharacters[selectedCharacterId].projectile.type==='knife'){
      x.save();x.translate(px,py);x.rotate(-.65);drawKnife('#dbe6ec','#243641');x.restore();
      continue;
    }
    if(window.GameCharacters[selectedCharacterId].projectile.type==='banana'){
      x.save();x.translate(px,py);drawBanana('#ffdc43','#8f5717');x.restore();
      continue;
    }
    if(window.GameCharacters[selectedCharacterId].projectile.type==='shovel'){
      x.save();x.translate(px,py);drawShovel();x.restore();
      continue;
    }
    x.fillStyle='#f6fdff';x.strokeStyle='#9bdfff';x.lineWidth=2;x.beginPath();x.arc(px,py,8,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#d7f4ff';x.beginPath();x.arc(px-2,py-2,3,0,Math.PI*2);x.fill();
  }
  x.fillStyle='#ddd';x.fillRect(flag.x+6,flag.y,4,flag.h);
  x.fillStyle='#7be0c3';x.beginPath();x.moveTo(flag.x+10,flag.y+4);x.lineTo(flag.x+40,flag.y+18);x.lineTo(flag.x+10,flag.y+32);x.fill();
  for(const e of E)drawGrenadier(e);
  for(const f of fireballs){
    x.save();x.translate(f.x,f.y);x.rotate(Math.atan2(f.vy,f.vx));
    x.fillStyle='#ff9b36';x.beginPath();x.moveTo(-14,0);x.lineTo(-6,-4);x.lineTo(-8,0);x.lineTo(-6,4);x.closePath();x.fill();
    x.fillStyle='#a9211b';x.beginPath();x.moveTo(-8,-4);x.lineTo(7,-4);x.lineTo(13,0);x.lineTo(7,4);x.lineTo(-8,4);x.closePath();x.fill();
    x.fillStyle='#d8e0e3';x.fillRect(-6,-2.5,11,5);
    x.fillStyle='#d62f24';x.fillRect(-2,-3,3,6);
    x.fillStyle='#522922';x.beginPath();x.moveTo(-7,-4);x.lineTo(-11,-7);x.lineTo(-5,-4);x.moveTo(-7,4);x.lineTo(-11,7);x.lineTo(-5,4);x.fill();
    x.restore();
  }
  for(const b of projectiles){
    x.save();x.translate(b.x,b.y);
    if(b.type==='snowball'){
      x.fillStyle='rgba(180,235,255,.35)';x.beginPath();x.arc(0,0,b.r+2,0,Math.PI*2);x.fill();
      x.fillStyle=b.color;x.strokeStyle=b.outline;x.lineWidth=1;x.beginPath();x.arc(0,0,b.r,0,Math.PI*2);x.fill();x.stroke();
    }else if(b.type==='knife'){
      x.scale(Math.sign(b.vx),1);drawKnife(b.color,b.outline);
    }else if(b.type==='banana'){
      x.scale(Math.sign(b.vx),1);x.rotate(Math.sin(tm*5)*.12);drawBanana(b.color,b.outline);
    }else if(b.type==='shovel'){
      x.scale(Math.sign(b.vx),1);x.rotate(Math.sin(tm*18)*.12);drawShovel(b.color,b.outline);
    }else if(b.type==='fireball'){
      x.fillStyle='#ff7a32';x.beginPath();x.arc(0,0,b.r+2,0,Math.PI*2);x.fill();x.fillStyle=b.color;x.beginPath();x.arc(0,0,b.r,0,Math.PI*2);x.fill();
    }else if(b.type==='energy'){
      x.rotate(tm*7);x.fillStyle=b.color;x.strokeStyle=b.outline;x.lineWidth=1.5;x.beginPath();x.moveTo(0,-b.r-2);x.lineTo(b.r,0);x.lineTo(0,b.r+2);x.lineTo(-b.r,0);x.closePath();x.fill();x.stroke();
    }else{
      x.fillStyle=b.color;x.strokeStyle=b.outline;x.lineWidth=1;x.beginPath();x.arc(0,0,b.r,0,Math.PI*2);x.fill();x.stroke();
    }
    x.restore();
  }
  if(state!=='dead'||window.GameCharacters[selectedCharacterId].stripFrames||window.GameCharacters[selectedCharacterId].animationType==='ssg12'||window.GameCharacters[selectedCharacterId].gridColumns||Math.floor(tm*10)%2){
    const airborne=(state==='play'||state==='parachute')&&!P.ground;
    const walking=state==='play'&&P.ground&&Math.abs(P.vx)>25;
    const character=window.GameCharacters[selectedCharacterId];
    const heroSheet=character.image;
    if(state==='parachute'&&character.animationType!=='zam')drawParachute(character.canopyColor);
    if(character.animationType==='ssg12'){
      drawSsg12(character,airborne,state==='play'&&P.ground&&Math.abs(P.vx)>25);
    }else if(character.animationType==='luke'||character.animationType==='zam'){
      drawGridHero(character,airborne,walking);
    }else if(character.stripFrames){
      drawSpriteStrip(character, airborne, walking);
    }else if(character.parachuteEntry){
      drawJumpMaster(heroSheet, airborne, walking);
    }else{
    const fw=heroSheet.naturalWidth/4,fh=heroSheet.naturalHeight/4;
    const sheetReady=heroSheet.complete&&fw&&fh;
    const runFrames=[0,1,5,6,7,8,9,10,11,12];
    // Altura da sola em cada célula, medida no atlas de 1448 × 1086.
    const footY=[270,269,238,263,262,261,261,250,260,260,262,252,258];
    const bodyX=[205,198,186,185,202,191,196,181,194,182,182,179,192];
    const runStage=walking?Math.floor(P.runAnimTime/runStep)%runFrames.length:0;
    const drawFrame=(frame,rotation=0,scaleY=1)=>{
      x.save();x.translate(P.x+P.w/2,P.y+P.h+(character.groundOffset||0));x.scale(P.face,1);
      if(rotation)x.rotate(rotation);
      if(scaleY!==1)x.scale(1,scaleY);
      const anchorX=bodyX[frame]*fw/362;
      const anchorY=footY[frame]*fh/271.5;
      x.drawImage(heroSheet,(frame%4)*fw,Math.floor(frame/4)*fh,fw,fh,
        -anchorX*50/fh,-anchorY*50/fh,fw*50/fh,50);
      x.restore();
    };

    if(sheetReady){
      if(airborne){
        // Frame 2: salto, preservado da terceira imagem original.
        drawFrame(2,P.vy<0?-.045:.06,P.vy<0?1.05:.96);
      }else if(P.landTimer>0){
        // Frame 3: aterrissagem, preservado da quarta imagem original.
        drawFrame(3);
      }else if(!walking){
        // Frame 4: pose parada natural.
        drawFrame(4);
      }else{
        // Dez quadros de corrida: duas poses originais e oito novas.
        drawFrame(runFrames[runStage]);
      }
    }
    }
  }
  x.restore();
  x.fillStyle='#fff';x.font='bold 17px system-ui,sans-serif';x.textAlign='left';
  x.fillText(window.GameI18n.t('coins')+': '+got+'/'+GOAL_COINS+'   '+window.GameI18n.t('enemiesDefeated')+': '+kills+'/'+GOAL_KILLS,16,27);
  x.font='15px system-ui,sans-serif';
  x.fillText(window.GameI18n.t(window.GameCharacters[selectedCharacterId].projectile.labelKey)+': '+ammo,16,49);
  x.textAlign='right';x.fillText(window.GameI18n.t('lives')+': '+lives,W-16,28);
  if(goalHintUntil>tm){
    x.fillStyle='rgba(30,18,10,.86)';x.fillRect(130,72,540,44);
    x.fillStyle='#ffe58a';x.textAlign='center';x.font='bold 16px system-ui,sans-serif';x.fillText(window.GameI18n.t('objectiveHint'),W/2,100);
  }
  const msg=state==='win'?[window.GameI18n.t('win'),window.GameI18n.t('coins')+': '+got+'/'+total+' - '+window.GameI18n.t('continue')]:null;
  if(state==='select')window.CharacterSelect.draw(x,selectedCharacterId,W,H);
  else if((state==='dead'||state==='over')&&(!window.GameCharacters[selectedCharacterId].tacticalAnimations||tm-deathTime>=.77))drawDeathMenu();
  else if(msg){
    x.fillStyle='rgba(20,10,35,.6)';x.fillRect(0,0,W,H);
    x.fillStyle='#fff';x.textAlign='center';x.font='bold 36px system-ui,sans-serif';x.fillText(msg[0],W/2,H/2-8);
    x.font='20px system-ui,sans-serif';x.fillText(msg[1],W/2,H/2+30);
  }
}
function drawDeathMenu(){
  x.fillStyle='rgba(10,18,28,.82)';x.fillRect(0,0,W,H);
  x.fillStyle='#fff';x.textAlign='center';x.font='bold 36px system-ui,sans-serif';
  x.fillText(window.GameI18n.t(state==='over'?'over':'dead'),W/2,188);
  x.font='16px system-ui,sans-serif';x.fillText(window.GameI18n.t('retryHint'),W/2,224);
  const buttons=[
    {x:188,label:window.GameI18n.t('restart')},
    {x:412,label:window.GameI18n.t('backSelect')}
  ];
  for(const button of buttons){
    x.fillStyle='#244946';x.strokeStyle='#b8ec92';x.lineWidth=2;
    x.beginPath();x.roundRect(button.x,250,200,64,12);x.fill();x.stroke();
    x.fillStyle='#fff';x.font='bold 18px system-ui,sans-serif';x.fillText(button.label,button.x+100,289);
  }
  x.font='15px system-ui,sans-serif';
  x.fillText(window.GameI18n.t('restart')+': Enter/R   |   '+window.GameI18n.t('backSelect')+': Esc/C',W/2,350);
}
addEventListener('keydown',ev=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(ev.code))ev.preventDefault();
  if(ev.repeat)return;
  keys[ev.code]=true;
  if(state==='dead'||state==='over'){
    if(ev.code==='Escape'||ev.code==='KeyC')returnToCharacterSelect();
    else if(ev.code==='Enter'||ev.code==='KeyR'||ev.code==='Space')restartAfterDeath();
    return;
  }
  if(state==='select'){
    if(ev.code==='ArrowLeft'||ev.code==='KeyA')moveCharacterSelection(-1);
    else if(ev.code==='ArrowRight'||ev.code==='KeyD')moveCharacterSelection(1);
    else if(ev.code==='Space'||ev.code==='Enter')confirmMenu();
    return;
  }
  const jump=ev.code==='Space'||ev.code==='ArrowUp'||ev.code==='KeyW';
  if(state==='play'&&jump)P.buf=.12;
  else if(state!=='play'&&(jump||ev.code==='Enter'))confirmMenu();
});
addEventListener('keyup',ev=>{
  keys[ev.code]=false;
  if((ev.code==='Space'||ev.code==='ArrowUp'||ev.code==='KeyW')&&P&&P.vy<-200)P.vy*=.5;
});
c.addEventListener('click',event=>{
  const bounds=c.getBoundingClientRect();
  const px=(event.clientX-bounds.left)*W/bounds.width;
  const py=(event.clientY-bounds.top)*H/bounds.height;
  if(state==='dead'||state==='over'){
    if(py>=250&&py<=314){
      if(px>=188&&px<=388)restartAfterDeath();
      else if(px>=412&&px<=612)returnToCharacterSelect();
    }
    return;
  }
  if(state!=='select')return;
  const card=window.CharacterSelect.cards(W).find(card=>
    px>=card.x&&px<=card.x+card.w&&py>=card.y&&py<=card.y+card.h);
  if(!card)return;
  selectedCharacterId=card.character.id;
  confirmMenu();
});
window.Game={
  setTouchKey(code,pressed){keys[code]=pressed},
  touchJump(){
    if(state==='play')P.buf=.12;
    else confirmMenu();
  },
  start(){
    reset();
    let last=performance.now(),acc=0;
    function loop(now){
      acc+=Math.min(.1,(now-last)/1000);last=now;
      while(acc>=1/60){update(1/60);acc-=1/60}
      draw();requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
};
