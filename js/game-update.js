// Atualiza controles, fisica, inimigos, ataques, itens e objetivo da fase.
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
    projectiles.push({type:shot.type,color:shot.color,outline:shot.outline,damage:shot.damage||1,x:P.x+P.w/2+P.face*16,y:P.y+P.h/2,vx:P.face*shot.speed,r:shot.radius,life: selectedCharacterId === 'luke' ? Infinity : (10 * T) / shot.speed,spin:0,spinSpeed:shot.type==='wrench'?10:shot.type==='shovel'?9:shot.type==='banana'?7:0});
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
      if(!e.shotFired&&elapsed>=.18){
        const flight=Math.max(.48,Math.min(1.25,Math.abs(dx)/220));
        const sx=e.x+e.w/2+Math.sign(dx)*12,sy=e.y+e.h*.38;
        const ty=P.y+P.h/2,gravity=560;
        fireballs.push({x:sx,y:sy,vx:dx/flight,vy:(ty-sy-.5*gravity*flight*flight)/flight,r:8,life:3.5,blastRadius:T*1.6,explosionDuration:.32,exploding:false,damageApplied:false,shell:e.kind==='blueGrenadier'?'blue':'normal',damage:e.kind==='blueGrenadier'?2:1});
        window.GameAudio.play('enemyFire');
        e.shotFired=true;
      }
      if(elapsed>=.72)e.shooting=false;
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
    const tempoDeVoo = Math.min(dt, b.life);
    b.x += b.vx * tempoDeVoo;
    b.spin += b.spinSpeed * tempoDeVoo;
    b.life -= tempoDeVoo;
    const target=E.find(e=>!e.dying&&hit({x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2},e));
    if(target){target.hp-=b.damage;b.life=0;if(target.hp<=0){target.dying=true;target.deathStarted=tm;target.shooting=false;target.vx=0;target.vy=0;kills++;window.GameAudio.play('enemyDefeat')}}
  }
  for(const f of fireballs){
    if(f.exploding){f.life-=dt;continue}
    const previousX=f.x,previousY=f.y,previousBottom=f.y+f.r;
    f.vy+=560*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;
    if(!f.damageApplied&&shellTouchesHero(previousX,previousY,f.x,f.y,f.r,P)){
      f.damageApplied=true;P.mortarHits+=f.damage;P.mortarInvulnerableUntil=tm+.75;
      P.vx=P.x+P.w/2<f.x?-220:220;P.vy=-260;P.ground=false;
      if(P.mortarHits>=2){die();return}
    }
    let impactRow=-1;
    for(let row=Math.max(0,ROWS-2);row<ROWS&&impactRow<0;row++){
      const floorY=row*T;
      if(previousBottom<=floorY&&f.y+f.r>=floorY){
        const firstColumn=Math.floor((Math.min(previousX,f.x)-f.r)/T);
        const lastColumn=Math.floor((Math.max(previousX,f.x)+f.r)/T);
        for(let column=firstColumn;column<=lastColumn;column++){
          if(solid(column,row)){impactRow=row;break}
        }
      }
    }
    if(impactRow>=0){
      f.y=impactRow*T-f.r;f.vx=0;f.vy=0;f.exploding=true;f.life=f.explosionDuration;
      const closestX=Math.max(P.x,Math.min(f.x,P.x+P.w));
      const closestY=Math.max(P.y,Math.min(f.y,P.y+P.h));
      const nearby=Math.hypot(f.x-closestX,f.y-closestY)<=f.blastRadius;
      if(nearby&&!f.damageApplied&&(f.damage>=2||tm>=P.mortarInvulnerableUntil)){
        f.damageApplied=true;P.mortarHits+=f.damage;P.mortarInvulnerableUntil=tm+.75;
        P.vx=P.x+P.w/2<f.x?-220:220;P.vy=-260;P.ground=false;
        if(P.mortarHits>=2){die();return}
      }
    }
  }
  fireballs=fireballs.filter(f=>f.life>0&&f.x>-100&&f.x<COLS*T+100&&f.y<H+500);
  projectiles=projectiles.filter(b=>b.life>0&&b.x>-100&&b.x<COLS*T+100);
  E=E.filter(e=>!e.dying||tm-e.deathStarted<.84);
  if(hit(P,flag)){
    if(kills>=goalKills&&got>=goalCoins){state='win';window.GameAudio.play('levelComplete')}
    else goalHintUntil=tm+3.5;
  }
  const want=Math.max(0,Math.min(COLS*T-W,P.x+P.w/2-W/2));
  cam+=(want-cam)*Math.min(1,dt*8);
}
