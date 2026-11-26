// Desenhos vetoriais dos projeteis usados pelos herois.
const knifeProjectileSprite = new Image();
knifeProjectileSprite.src = 'assets/knife-projectile.png';
const bananaProjectileSprite = new Image();
bananaProjectileSprite.src = 'assets/banana-projectile.png';
const wrenchProjectileSprite = new Image();
wrenchProjectileSprite.src = 'assets/wrench-projectile.png';
const shovelProjectileSprite = new Image();
shovelProjectileSprite.src = 'assets/shovel-projectile.png';
const snowballProjectileSprite = new Image();
snowballProjectileSprite.src = 'assets/snowball-projectile.png';
const enemyMortarShellSprite = new Image();
enemyMortarShellSprite.src = 'assets/enemy-mortar-shell.png';
const blueEnemyMortarShellSprite = new Image();
blueEnemyMortarShellSprite.src = 'assets/enemy-mortar-shell-blue.png';
const enemyMortarExplosionSprite = new Image();
enemyMortarExplosionSprite.src = 'assets/mortar-impact-8frames.png';

function drawKnife(bladeColor='#dbe6ec',handleColor='#243641'){
  if(knifeProjectileSprite.complete&&knifeProjectileSprite.naturalWidth){
    x.drawImage(knifeProjectileSprite,-14,-4.5,28,9);
    return;
  }
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
  if(bananaProjectileSprite.complete&&bananaProjectileSprite.naturalWidth){
    x.drawImage(bananaProjectileSprite,-15,-12,30,24);
    return;
  }
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
  if(shovelProjectileSprite.complete&&shovelProjectileSprite.naturalWidth){
    x.drawImage(shovelProjectileSprite,-14,-12,28,24);
    return;
  }
  x.strokeStyle=handle;x.lineWidth=3;x.lineCap='round';
  x.beginPath();x.moveTo(-9,5);x.lineTo(5,-4);x.stroke();
  x.fillStyle=blade;x.strokeStyle='#34414a';x.lineWidth=1;
  x.beginPath();x.moveTo(3,-7);x.lineTo(12,-8);x.lineTo(15,-3);x.lineTo(8,1);x.lineTo(4,-2);x.closePath();x.fill();x.stroke();
}

function drawSnowballProjectile(){
  if(!snowballProjectileSprite.complete||!snowballProjectileSprite.naturalWidth)return false;
  x.drawImage(snowballProjectileSprite,-10,-8,20,16);
  return true;
}

function drawWrench(blade='#c9d0d3',handle='#594332'){
  if(wrenchProjectileSprite.complete&&wrenchProjectileSprite.naturalWidth){
    x.drawImage(wrenchProjectileSprite,-20,-14,40,28);
    return;
  }
  x.save();
  x.scale(.78,.78);
  x.lineCap='round';x.lineJoin='round';
  // Slim handle with the familiar ring at the end.
  x.strokeStyle=handle;x.lineWidth=6;
  x.beginPath();x.moveTo(-8,8);x.lineTo(4,-4);x.stroke();
  x.strokeStyle=blade;x.lineWidth=3.7;x.stroke();
  x.fillStyle=blade;x.strokeStyle=handle;x.lineWidth=1.8;
  x.beginPath();x.arc(-8,8,3.2,0,Math.PI*2);x.fill();x.stroke();
  x.fillStyle=handle;x.beginPath();x.arc(-8,8,1.35,0,Math.PI*2);x.fill();
  // Open, adjustable jaw at the head of the wrench.
  x.beginPath();
  x.moveTo(2,-6);x.lineTo(5,-9);x.lineTo(11,-10);x.lineTo(8,-6);
  x.lineTo(6,-4);x.lineTo(8,-2);x.lineTo(11,1);x.lineTo(8,4);
  x.lineTo(4,1);x.lineTo(2,-1);x.closePath();x.fill();x.stroke();
  x.strokeStyle=handle;x.lineWidth=1.3;
  x.beginPath();x.moveTo(5,-3);x.lineTo(7,-1);x.stroke();
  x.restore();
}

