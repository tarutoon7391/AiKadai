// player.js – player creation and rendering

function makePlayer() {
  return {
    x: stageStartX, y: GROUND_Y - 36,
    w: 28, h: 36,
    vx: 0, vy: 0,
    onGround: false,
    dir: 1,
    walkFrame: 0,
    invincible: 0,
    jumpCooldown: 0,
  };
}

function drawPlayer() {
  if (player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0) return;
  const sx = player.x - cameraX;
  const sy = player.y;
  const d  = player.dir;
  const cx = sx + player.w / 2;

  let legL = 0, legR = 0;
  if (player.onGround && player.vx !== 0) {
    legL =  Math.sin(animTick * 0.25) * 6;
    legR = -legL;
  }

  // Legs
  ctx.fillStyle = '#223399';
  ctx.fillRect(sx + 1,             sy + player.h - 8 + legL, 11, 8);
  ctx.fillRect(sx + player.w - 12, sy + player.h - 8 + legR, 11, 8);
  ctx.fillStyle = '#3344bb';
  ctx.fillRect(sx + 3,             sy + player.h - 16 + legL, 9, 10);
  ctx.fillRect(sx + player.w - 12, sy + player.h - 16 + legR, 9, 10);

  // Body
  ctx.fillStyle = '#1155cc';
  ctx.fillRect(sx + 3, sy + 13, player.w - 6, player.h - 25);
  ctx.fillStyle = '#aaddff';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AI', cx, sy + 23);

  // Arms
  const armSwing = player.vx !== 0 ? Math.sin(animTick * 0.25) * 5 : 0;
  ctx.fillStyle = '#1155cc';
  ctx.fillRect(sx - 2,            sy + 14 - armSwing, 5, 12);
  ctx.fillRect(sx + player.w - 3, sy + 14 + armSwing, 5, 12);

  // Hands
  ctx.fillStyle = '#ffddaa';
  ctx.beginPath();
  ctx.arc(sx,            sy + 24 - armSwing, 4, 0, Math.PI * 2);
  ctx.arc(sx + player.w, sy + 24 + armSwing, 4, 0, Math.PI * 2);
  ctx.fill();

  // Visor base
  ctx.fillStyle = '#0088ee';
  ctx.beginPath();
  ctx.roundRect(sx + 2, sy + 1, player.w - 4, 14, 5);
  ctx.fill();

  // Visor inner dark
  ctx.fillStyle = '#001133';
  ctx.beginPath();
  ctx.roundRect(sx + 5, sy + 4, player.w - 10, 8, 3);
  ctx.fill();

  // Visor glow
  ctx.fillStyle = '#00ffcc';
  ctx.globalAlpha = 0.7 + Math.sin(animTick * 0.1) * 0.3;
  ctx.beginPath();
  ctx.roundRect(sx + 6, sy + 5, player.w - 12, 6, 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Antenna
  ctx.strokeStyle = '#0088ee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + d * 2, sy + 1);
  ctx.lineTo(cx + d * 5, sy - 7);
  ctx.stroke();
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(cx + d * 5, sy - 8, 3, 0, Math.PI * 2);
  ctx.fill();
}
