const selectionPortraitSheets = {
  original: new Image(),
  caricature: new Image()
};
selectionPortraitSheets.original.src = 'assets/selection-portraits-original.png';
selectionPortraitSheets.caricature.src = 'assets/selection-portraits.png';

window.CharacterSelect = {
  list() {
    return Object.values(window.GameCharacters).sort((a,b)=>a.selectionOrder-b.selectionOrder);
  },
  move(currentId, direction) {
    const roster = this.list();
    const index = roster.findIndex(character => character.id === currentId);
    return roster[(index + direction + roster.length) % roster.length].id;
  },
  cards(width) {
    const roster = this.list();
    const step = Math.min(250, (width - 40) / roster.length);
    return roster.map((character, i) => ({
      character,
      x: (width - roster.length * step) / 2 + i * step + 8,
      y: 127,
      w: step - 16,
      h: 234
    }));
  },
  draw(ctx, selectedId, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 25, 33, .90)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 34px system-ui,sans-serif';
    ctx.fillText(window.GameI18n.t('selectTitle'), width / 2, 85);

    for (const { character, x, y, w, h } of this.cards(width)) {
      const selected = character.id === selectedId;
      ctx.fillStyle = selected ? '#244946' : '#1b3039';
      ctx.strokeStyle = selected ? '#a7e27b' : '#537078';
      ctx.lineWidth = selected ? 3 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 16);
      ctx.fill();
      ctx.stroke();
      const cx = x + w / 2;
      const portraitSheet=selectionPortraitSheets[character.selectionPortraitSet];
      if (portraitSheet?.complete && portraitSheet.naturalWidth) {
        const cellWidth=portraitSheet.naturalWidth/4;
        const cellHeight=portraitSheet.naturalHeight;
        const scale=Math.min((w-28)/cellWidth,138/cellHeight);
        const drawWidth=cellWidth*scale,drawHeight=cellHeight*scale;
        const sourceX=character.selectionPortraitIndex*cellWidth;
        ctx.drawImage(portraitSheet,sourceX,0,cellWidth,cellHeight,
          cx-drawWidth/2,y+5+(138-drawHeight)/2,drawWidth,drawHeight);
      }
      ctx.fillStyle = '#fff';
      ctx.font = character.id === 'superSkinny' ? 'bold 15px system-ui,sans-serif' : character.id === 'ssg12' ? 'bold 19px system-ui,sans-serif' : 'bold 21px system-ui,sans-serif';
      ctx.fillText(window.GameI18n.t(character.nameKey), cx, y + 159);
      ctx.fillStyle = '#cddfe0';
      ctx.font = '17px system-ui,sans-serif';
      ctx.fillText(window.GameI18n.t(character.projectile.labelKey), cx, y + 188);
      if (selected) {
        ctx.fillStyle = '#b8ec92';
        ctx.font = 'bold 15px system-ui,sans-serif';
        ctx.fillText(window.GameI18n.t('selected'), cx, y + 214);
      }
    }

    ctx.fillStyle = '#fff';
    ctx.font = '16px system-ui,sans-serif';
    ctx.fillText(window.GameI18n.t('selectHint'), width / 2, 412);
    ctx.restore();
  }
};
