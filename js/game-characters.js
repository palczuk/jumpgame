// Desenha as animacoes de cada heroi a partir de seu atlas de sprites.
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

// Seleciona e desenha a animacao adequada do inimigo.
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

