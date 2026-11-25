// Cores e fundos das tres regioes da floresta; cada regiao usa um estilo proprio.
const forestPalettes={
  edge:{sky:['#173d48','#66855b','#d6aa72'],sun:'#ffe3a0',far:'#416b51',near:'#264f3e',soil:'#553b22',grass:'#508a39',highlight:'#8cc75d'},
  deep:{sky:['#101d31','#29463f','#68734c'],sun:'#d4d49b',far:'#263d3a',near:'#182f31',soil:'#443326',grass:'#3e6335',highlight:'#789747'},
  clearing:{sky:['#34445d','#9e6548','#e2ae6a'],sun:'#ffd385',far:'#76533f',near:'#493b3b',soil:'#61432b',grass:'#8b6937',highlight:'#d0a951'}
};
function forestRegionAt(column){
  return (levelData.regions||[]).find(region=>column>=region.start&&column<region.end)||{background:'edge'};
}
// Mistura as duas regioes ao longo de 20 blocos em vez de trocar no limite.
function forestRegionBlendAt(column){
  const regions=levelData.regions||[];
  for(let index=0;index<regions.length-1;index++){
    const boundary=regions[index].end,start=boundary-10,end=boundary+10;
    if(column<start||column>end)continue;
    const raw=(column-start)/(end-start);
    const amount=raw*raw*(3-2*raw);
    return {from:regions[index],to:regions[index+1],amount};
  }
  const region=forestRegionAt(column);
  return {from:region,to:region,amount:0};
}
function mixForestColor(first,second,amount){
  const a=parseInt(first.slice(1),16),b=parseInt(second.slice(1),16);
  const channel=shift=>Math.round(((a>>shift)&255)*(1-amount)+((b>>shift)&255)*amount);
  return '#'+[channel(16),channel(8),channel(0)].map(value=>value.toString(16).padStart(2,'0')).join('');
}
// Interpola cores do ceu e do terreno para evitar uma mudanca brusca entre biomas.
function forestPaletteAt(column){
  const blend=forestRegionBlendAt(column);
  const from=forestPalettes[blend.from.background]||forestPalettes.edge;
  const to=forestPalettes[blend.to.background]||forestPalettes.edge;
  return {
    sky:from.sky.map((color,index)=>mixForestColor(color,to.sky[index],blend.amount)),
    sun:mixForestColor(from.sun,to.sun,blend.amount),
    far:mixForestColor(from.far,to.far,blend.amount),
    near:mixForestColor(from.near,to.near,blend.amount),
    soil:mixForestColor(from.soil,to.soil,blend.amount),
    grass:mixForestColor(from.grass,to.grass,blend.amount),
    highlight:mixForestColor(from.highlight,to.highlight,blend.amount)
  };
}
// Desenha as silhuetas das arvores com transparencia durante a transicao.
function drawForestFarTrees(style,color,alpha){
  if(alpha<=0)return;
  x.save();x.globalAlpha=alpha;x.fillStyle=color;
  for(let k=-1;k<10;k++){
    const bx=k*118-(cam*.18%118),base=H-38-(k%3)*9;
    x.fillRect(bx-5,base-170,10,190);
    x.beginPath();
    if(style==='deep'){
      x.moveTo(bx,base-232);x.lineTo(bx-44,base-146);x.lineTo(bx-25,base-151);x.lineTo(bx-54,base-94);x.lineTo(bx+54,base-94);x.lineTo(bx+25,base-151);x.lineTo(bx+44,base-146);
    }else if(style==='clearing')x.ellipse(bx,base-169,38,54,-.12,0,Math.PI*2);
    else{x.arc(bx,base-180,42,0,Math.PI*2);x.arc(bx-26,base-154,32,0,Math.PI*2);x.arc(bx+27,base-150,35,0,Math.PI*2)}
    x.closePath();x.fill();
  }
  x.restore();
}
function drawForestNearTrees(style,color,alpha){
  if(alpha<=0)return;
  x.save();x.globalAlpha=alpha;x.fillStyle=color;
  for(let k=-1;k<12;k++){
    const bx=k*92-(cam*.34%92),base=H-18;
    x.fillRect(bx-4,base-130,8,145);
    x.beginPath();
    if(style==='clearing')x.ellipse(bx,base-145,30,42,.08,0,Math.PI*2);
    else{x.moveTo(bx,base-218);x.lineTo(bx-38,base-130);x.lineTo(bx-22,base-135);x.lineTo(bx-48,base-82);x.lineTo(bx+48,base-82);x.lineTo(bx+22,base-135);x.lineTo(bx+38,base-130)}
    x.closePath();x.fill();
  }
  x.restore();
}
// Desenha o fundo, o mapa, os personagens, os itens e a interface.
function draw(){
  const backgroundBlend=forestRegionBlendAt((cam+W/2)/T);
  const palette=forestPaletteAt((cam+W/2)/T);
  const s=x.createLinearGradient(0,0,0,H);
  s.addColorStop(0,palette.sky[0]);s.addColorStop(.55,palette.sky[1]);s.addColorStop(1,palette.sky[2]);
  x.fillStyle=s;x.fillRect(0,0,W,H);
  x.fillStyle=palette.sun;x.beginPath();x.arc(620,105,30,0,Math.PI*2);x.fill();
  const fromPalette=forestPalettes[backgroundBlend.from.background]||forestPalettes.edge;
  const toPalette=forestPalettes[backgroundBlend.to.background]||forestPalettes.edge;
  drawForestFarTrees(backgroundBlend.from.background,fromPalette.far,1-backgroundBlend.amount);
  drawForestFarTrees(backgroundBlend.to.background,toPalette.far,backgroundBlend.amount);
  drawForestNearTrees(backgroundBlend.from.background,fromPalette.near,1-backgroundBlend.amount);
  drawForestNearTrees(backgroundBlend.to.background,toPalette.near,backgroundBlend.amount);
  x.save();x.translate(-Math.round(cam),0);
  const i0=Math.floor(cam/T),i1=i0+Math.ceil(W/T)+1;
  for(let j=0;j<ROWS;j++)for(let i=i0;i<=i1&&i<COLS;i++){
    if(g[j][i]==='#'){
      const tilePalette=forestPaletteAt(i+.5);
      x.fillStyle=tilePalette.soil;x.fillRect(i*T,j*T,T,T);
      if(!solid(i,j-1)){x.fillStyle=tilePalette.grass;x.fillRect(i*T,j*T,T,7);x.fillStyle=tilePalette.highlight;x.fillRect(i*T,j*T,T,2)}
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
    if(window.GameCharacters[selectedCharacterId].projectile.type==='wrench'){
      x.save();x.translate(px,py);drawWrench();x.restore();
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
    }else if(b.type==='wrench'){
      x.scale(Math.sign(b.vx),1);x.rotate(Math.sin(tm*14)*.16);drawWrench(b.color,b.outline);
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
    if(state==='parachute'&&character.animationType!=='zam'&&!character.parachuteInSprite)drawParachute(character.canopyColor);
    if(character.animationType==='ssg12'){
      drawSsg12(character,airborne,state==='play'&&P.ground&&Math.abs(P.vx)>25);
    }else if(character.animationType==='luke'||character.animationType==='zam'||character.animationType==='paco'){
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
  x.fillText(window.GameI18n.t('coins')+': '+got+'/'+goalCoins+'   '+window.GameI18n.t('enemiesDefeated')+': '+kills+'/'+goalKills,16,27);
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
// Mostra as opcoes de reinicio ou retorno a selecao apos a derrota.
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
