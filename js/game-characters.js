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
  }else frame=0; // A pose parada fica fixa para nao parecer que o heroi esta andando.
  const sx=(frame%columns)*fw,sy=Math.floor(frame/columns)*fh;
  x.save();
  if(state==='dozerEntry'){
    const center=P.x+P.w/2, bottom=P.y+P.h;
    // Mantem a copa e os cordoes dentro da tela durante a entrada.
    drawDozerParachute(bottom-118,1.42);
    // Recorta apenas a escavadeira; o homem ao lado no atlas nao e desenhado.
    x.drawImage(sprite,0,7*fh+70,110,100,center-55,bottom-72,110,80);
    // O personagem aparece uma unica vez, sentado dentro da cabine.
    x.save();
    x.beginPath();
    x.roundRect(center-25,bottom-62,21,22,3);
    x.clip();
    x.drawImage(sprite,0,0,fw,fh,center-40,bottom-69,50,52);
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
  const sx=(frame%columns)*fw;
  let sy=Math.floor(frame/columns)*fh,sw=fw,sh=fh;
  if(character.id==='superSkinny'&&(state==='dead'||state==='over')){
    // Ajuste fino evita cortar o topo da animacao de queda.
    sy=820;sh=200;
  }
  if(character.id==='superSkinny'&&state==='parachute'){
    // O paraquedas comeca um pouco acima da celula; desenha a arte inteira.
    sy=1010;sh=sprite.naturalHeight-sy;
    const height=78,width=sw*height/sh;
    x.drawImage(sprite,sx,sy,sw,sh,-width/2,-height,width,height);
  }else{
    // O repouso usa sempre o quadro 0, sem alternancia ou respiracao animada.
    x.drawImage(sprite,sx,sy,sw,sh,-27,-54,54,54);
  }
  x.restore();
}

// Seleciona e desenha a animacao adequada do inimigo.
function drawGrenadier(e){
  const sprite=e.kind==='blueGrenadier'?blueGrenadierSheet:grenadierSheet;
  if(!sprite.complete||!sprite.naturalWidth)return;
  let frame;
  if(e.dying){
    frame=16+Math.min(7,Math.floor((tm-e.deathStarted)/.105));
  }else if(e.shooting){
    frame=8+Math.min(7,Math.floor((tm-e.shootStart)/.09));
  }else{
    frame=Math.floor((tm+(e.animOffset||0))*7)%8;
  }
  const frameWidth=sprite.naturalWidth/8;
  const frameHeight=sprite.naturalHeight/3;
  const faceLeft=P.x+P.w/2<e.x+e.w/2;
  x.save();
  x.translate(e.x+e.w/2,e.y+e.h+6);
  x.scale(faceLeft?1:-1,1);
  x.drawImage(sprite,(frame%8)*frameWidth,Math.floor(frame/8)*frameHeight,frameWidth,frameHeight,-30,-60,60,60);
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

// Paraquedas segmentado, com linhas de suspensao ancoradas na escavadeira.
function drawDozerParachute(canopyY,scale=1){
  x.save();
  x.translate(P.x+P.w/2,canopyY);
  x.scale(scale,scale);
  const canopy=()=>{
    x.beginPath();
    x.moveTo(-50,7);
    x.bezierCurveTo(-46,-22,-24,-40,0,-40);
    x.bezierCurveTo(24,-40,46,-22,50,7);
    x.quadraticCurveTo(25,1,0,8);
    x.quadraticCurveTo(-25,1,-50,7);
    x.closePath();
  };
  canopy();x.fillStyle='#738a3b';x.fill();
  x.save();canopy();x.clip();
  const panelEdges=[-50,-30,-10,10,30,50];
  for(let i=0;i<panelEdges.length-1;i++){
    const left=panelEdges[i],right=panelEdges[i+1];
    const leftY=3+4*(left/50)**2,rightY=3+4*(right/50)**2;
    x.beginPath();x.moveTo(0,-39);x.lineTo(left,leftY);
    x.quadraticCurveTo((left+right)/2,6,right,rightY);
    x.closePath();x.fillStyle=i%2?'#9eae57':'#849c49';x.fill();
  }
  x.restore();
  canopy();x.strokeStyle='#34452b';x.lineWidth=1.6;x.stroke();
  x.strokeStyle='#d0d2a0';x.lineWidth=1;
  for(const edge of [-30,-10,10,30]){
    x.beginPath();x.moveTo(0,-38);x.lineTo(edge,3+4*(edge/50)**2);x.stroke();
  }
  for(const side of [-1,1]){
    x.beginPath();
    x.moveTo(side*43,5);x.lineTo(side*20,53);
    x.moveTo(side*24,4);x.lineTo(side*10,53);
    x.moveTo(side*6,7);x.lineTo(0,53);
    x.stroke();
  }
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

// Quadros do atlas do Jump Master: cada pose tem seu recorte real, sem mascaras nas pernas.
const jumpMasterFrames={
  idle:[[54,3,119,207],[256,3,124,207],[462,4,125,206],[678,4,128,206]],
  run:[[42,214,143,193],[247,214,143,194],[443,216,156,164],[645,218,149,189],[845,214,149,193],[1032,214,178,193]],
  jump:[[44,444,134,155],[254,421,136,175],[442,395,164,180],[670,421,124,175]],
  knife:[[41,604,143,186],[243,603,149,186],[445,600,169,180],[648,603,169,183],[853,600,171,190]],
  hit:[[46,794,143,170],[245,804,143,160],[424,825,169,138],[630,857,178,103],[838,874,191,84]],
  parachute:[[18,971,276,270],[335,971,276,270],[636,971,276,270],[957,971,276,270]]
};
// Desenha quadros completos do Jump Master, inclusive o paraquedas que faz parte do atlas.
function drawJumpMasterAtlas(character,airborne,walking){
  const sprite=character.image;
  if(!sprite.complete||!sprite.naturalWidth)return;
  let frames=jumpMasterFrames.idle,index=0,destHeight=54;
  if(state==='parachute'){
    frames=jumpMasterFrames.parachute;
    const progress=Math.max(0,Math.min(.999,(P.y-115)/(H-150)));
    index=Math.floor(progress*frames.length);
    // O quadro do paraquedas mede 92 px; o soldado dentro dele fica com cerca de 54 px.
    destHeight=92;
  }else if(state==='dead'||state==='over'){
    frames=jumpMasterFrames.hit;
    index=Math.min(frames.length-1,Math.floor(Math.max(0,tm-deathTime)/.17));
  }else if(state==='play'&&P.shotCooldown>0){
    frames=jumpMasterFrames.knife;
    const progress=1-P.shotCooldown/character.projectile.cooldown;
    index=Math.min(frames.length-1,Math.floor(progress*frames.length));
  }else if(P.landTimer>0){
    frames=jumpMasterFrames.jump;
    index=3;
  }else if(airborne){
    frames=jumpMasterFrames.jump;
    index=P.vy<-320?1:P.vy<0?2:3;
  }else if(walking){
    frames=jumpMasterFrames.run;
    index=Math.floor(P.runAnimTime/runStep)%frames.length;
  }else{
    index=0;
  }
  const [sx,sy,sw,sh]=frames[index];
  const destWidth=sw*destHeight/sh;
  const center=P.x+P.w/2,bottom=P.y+P.h+(character.groundOffset||0);
  x.save();x.translate(center,0);x.scale(P.face,1);
  x.drawImage(sprite,sx,sy,sw,sh,-destWidth/2,bottom-destHeight,destWidth,destHeight);
  x.restore();
}

