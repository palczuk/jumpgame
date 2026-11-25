// Controles de teclado, mouse, toque e acesso publico usado pela pagina.
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
