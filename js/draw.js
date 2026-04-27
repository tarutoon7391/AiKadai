// draw.js – all drawing functions (background, platforms, UI, overlays)

function adjustColor(hex, d) {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + d));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + d));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + d));
  return `rgb(${r},${g},${b})`;
}

function drawPlatformAt(sx, sy, pw, ph, color) {
  ctx.fillStyle = color;
  ctx.fillRect(sx, sy, pw, ph);
  ctx.fillStyle = adjustColor(color, 40);
  ctx.fillRect(sx, sy, pw, 5);
  ctx.fillStyle = adjustColor(color, -40);
  ctx.fillRect(sx, sy + ph - 4, pw, 4);
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#0d1a2e');
  grad.addColorStop(1, '#1a3355');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y);

  ctx.fillStyle = 'rgba(80,80,110,0.4)';
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 200 + 80 - cameraX * (0.14 + i * 0.01)) % (W + 300) + W + 300) % (W + 300) - 150;
    const cy = 40 + i * 15;
    ctx.beginPath();
    ctx.arc(cx,      cy,      30, 0, Math.PI * 2);
    ctx.arc(cx + 30, cy - 10, 25, 0, Math.PI * 2);
    ctx.arc(cx + 55, cy,      28, 0, Math.PI * 2);
    ctx.fill();
  }

  const gGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gGrad.addColorStop(0,    '#2a3d12');
  gGrad.addColorStop(0.15, '#1e2d0a');
  gGrad.addColorStop(0.16, '#3B2210');
  gGrad.addColorStop(1,    '#2b1a0a');
  ctx.fillStyle = gGrad;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.strokeStyle = '#1a2d08';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 2); ctx.lineTo(W, GROUND_Y + 2);
  ctx.stroke();
}

function drawPlatforms() {
  for (const p of PLATFORMS) {
    const sx = p.x - cameraX;
    if (sx + p.w < 0 || sx > W) continue;
    drawPlatformAt(sx, p.y, p.w, p.h, p.color);
  }
}

function drawVanishPlatforms() {
  for (const p of vanishPlatforms) {
    if (p.state === 'gone') continue;
    const sx = p.x - cameraX;
    if (sx + p.w < 0 || sx > W) continue;
    let alpha = 1;
    let shake = 0;
    if (p.state === 'shaking') {
      alpha = Math.max(0.1, p.timer / 55);
      shake = (Math.random() - 0.5) * 3;
    }
    ctx.globalAlpha = alpha;
    drawPlatformAt(sx + shake, p.y, p.w, p.h, p.color);
    ctx.globalAlpha = 1;
  }
}

function drawFakePlatforms() {
  for (const p of fakePlatforms) {
    if (p.y > H + 50) continue;
    const sx = p.x - cameraX;
    if (sx + p.w < 0 || sx > W) continue;
    drawPlatformAt(sx, p.y, p.w, p.h, p.color);
  }
}

function drawSpikes() {
  for (const s of SPIKES) {
    const sx = s.x - cameraX;
    if (sx + s.w < 0 || sx > W) continue;
    const count = Math.max(1, Math.floor(s.w / 14));
    const sw = s.w / count;
    for (let i = 0; i < count; i++) {
      const tx = sx + i * sw;
      ctx.fillStyle = '#bb2222';
      ctx.beginPath();
      if (s.dir === 'up') {
        ctx.moveTo(tx,        s.y + s.h);
        ctx.lineTo(tx + sw / 2, s.y);
        ctx.lineTo(tx + sw,   s.y + s.h);
      } else {
        ctx.moveTo(tx,        s.y);
        ctx.lineTo(tx + sw / 2, s.y + s.h);
        ctx.lineTo(tx + sw,   s.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ee5555';
      ctx.beginPath();
      if (s.dir === 'up') {
        ctx.moveTo(tx + sw * 0.15, s.y + s.h);
        ctx.lineTo(tx + sw * 0.45, s.y + s.h * 0.15);
        ctx.lineTo(tx + sw * 0.3,  s.y + s.h * 0.6);
      } else {
        ctx.moveTo(tx + sw * 0.15, s.y);
        ctx.lineTo(tx + sw * 0.45, s.y + s.h * 0.85);
        ctx.lineTo(tx + sw * 0.3,  s.y + s.h * 0.4);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawMovingObstacles() {
  for (const o of movingObstacles) {
    if (!o.active) continue;
    const sx = o.x - cameraX;
    if (sx + o.w < 0 || sx > W) continue;
    ctx.fillStyle = o.color;
    ctx.fillRect(sx, o.y, o.w, o.h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, o.y, o.w, o.h);
    ctx.clip();
    ctx.fillStyle = '#ffaa00';
    for (let i = -o.h; i < o.w + o.h; i += 20) {
      ctx.fillRect(sx + i, o.y, 10, o.h);
    }
    ctx.restore();
    ctx.strokeStyle = '#ff2200';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, o.y, o.w, o.h);
  }
}

function drawCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    const sx = c.x - cameraX;
    if (sx < -20 || sx > W + 20) continue;
    const bob = Math.sin(animTick * 0.08 + c.x * 0.05) * 3;
    ctx.fillStyle = '#cc8800';
    ctx.beginPath();
    ctx.ellipse(sx, c.y + bob, c.r, c.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    ctx.ellipse(sx, c.y + bob, c.r * 0.65, c.r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffaaa';
    ctx.beginPath();
    ctx.ellipse(sx - 2, c.y + bob - 2, c.r * 0.3, c.r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGoal() {
  const sx = goalX - cameraX;
  if (sx < -50 || sx > W + 50) return;
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(sx, GROUND_Y - 120, 6, 120);
  const wave = Math.sin(animTick * 0.12) * 5;
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.moveTo(sx + 6,       GROUND_Y - 120);
  ctx.lineTo(sx + 50 + wave, GROUND_Y - 100 + wave * 0.5);
  ctx.lineTo(sx + 6,       GROUND_Y - 80);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOAL', sx + 22, GROUND_Y - 98);
}

function drawUI() {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, W, 40);

  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'left';

  ctx.fillStyle = '#ff6688';
  ctx.fillText('\u2665 \xd7 ' + lives, 10, 26);

  ctx.fillStyle = '#ff4444';
  ctx.fillText('\ud83d\udc80 ' + deathCount + '\u56de', 105, 26);

  const collected = coins.filter(function(c) { return c.collected; }).length;
  ctx.fillStyle = '#ffcc00';
  ctx.fillText('\ud83e\ude99 ' + collected + '/' + TOTAL_COINS, 228, 26);

  // Stage indicator
  ctx.fillStyle = '#88ddff';
  ctx.fillText('ST ' + (stageIndex + 1) + '/' + STAGES.length, 360, 26);

  // Progress bar
  ctx.fillStyle = '#333';
  ctx.fillRect(430, 15, 240, 10);
  const progress = Math.min(1, player.x / WORLD_WIDTH);
  ctx.fillStyle = '#00ffcc';
  ctx.fillRect(430, 15, 240 * progress, 10);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.strokeRect(430, 15, 240, 10);
  ctx.fillStyle = '#aaa';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PROGRESS', 550, 13);

  if (deathFlash > 0) {
    ctx.fillStyle = 'rgba(255,0,0,' + ((deathFlash / 25) * 0.5) + ')';
    ctx.fillRect(0, 0, W, H);
    deathFlash--;
  }

  // Debug display – bottom-right corner
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(W - 92, H - 20, 88, 15);
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('x:' + Math.floor(player.x) + ' y:' + Math.floor(player.y), W - 6, H - 8);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 50px monospace';
  ctx.fillText('GAME OVER', W / 2, H / 2 - 50);

  ctx.fillStyle = '#ffdd44';
  ctx.font = '20px monospace';
  ctx.fillText('\u6b7b\u4ea1\u56de\u6570: ' + deathCount + '\u56de', W / 2, H / 2 + 5);

  ctx.fillStyle = '#ff9988';
  ctx.font = '15px monospace';
  ctx.fillText('\u8aef\u3081\u308b\u306a\uff01\u6b7b\u3093\u3067\u899a\u3048\u308d\uff01', W / 2, H / 2 + 38);

  ctx.fillStyle = '#aaddff';
  ctx.font = '15px monospace';
  ctx.fillText('\u30b9\u30da\u30fc\u30b9\u30ad\u30fc\u3067\u30ea\u30b9\u30bf\u30fc\u30c8', W / 2, H / 2 + 68);
}

function drawStageClear() {
  ctx.fillStyle = 'rgba(0,20,40,0.8)';
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = '#ffdd44';
  for (let i = 0; i < 20; i++) {
    const sx = (i * 137 + animTick * 2) % W;
    const sy = (i * 97  + animTick)     % (H - 60);
    drawStar(sx, sy, 3 + Math.sin(animTick * 0.1 + i) * 2);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 42px monospace';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur  = 20;
  ctx.fillText('STAGE ' + (stageIndex + 1) + ' CLEAR!', W / 2, H / 2 - 55);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ff8888';
  ctx.font = '20px monospace';
  ctx.fillText('\u6b7b\u4ea1\u56de\u6570: ' + deathCount + '\u56de', W / 2, H / 2);

  if (stageIndex + 1 < STAGES.length) {
    ctx.fillStyle = '#aaffcc';
    ctx.font = '15px monospace';
    ctx.fillText('\u6b21\u306e\u30b9\u30c6\u30fc\u30b8\u3078\u81ea\u52d5\u9077\u79fb\u2026', W / 2, H / 2 + 38);
    ctx.fillStyle = '#aaddff';
    ctx.font = '13px monospace';
    ctx.fillText('\u30b9\u30da\u30fc\u30b9\u30ad\u30fc\u3067\u5373\u6642\u9077\u79fb', W / 2, H / 2 + 62);
  } else {
    ctx.fillStyle = '#ffffaa';
    ctx.font = '16px monospace';
    ctx.fillText('\u5168\u30b9\u30c6\u30fc\u30b8\u30af\u30ea\u30a2\uff01', W / 2, H / 2 + 38);
  }
}

function drawEnding() {
  ctx.fillStyle = 'rgba(0,0,20,0.92)';
  ctx.fillRect(0, 0, W, H);

  // Many stars
  ctx.fillStyle = '#ffdd44';
  for (let i = 0; i < 35; i++) {
    const sx = (i * 137 + animTick * 2) % W;
    const sy = (i * 97  + animTick)     % (H - 60);
    drawStar(sx, sy, 2 + Math.sin(animTick * 0.1 + i) * 2);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 36px monospace';
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur  = 25;
  ctx.fillText('ALL STAGES CLEAR!!', W / 2, H / 2 - 68);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ff8888';
  ctx.font = '20px monospace';
  ctx.fillText('\u7dcf\u6b7b\u4ea1\u56de\u6570: ' + deathCount + '\u56de', W / 2, H / 2 - 18);

  const msg =
    deathCount === 0 ? '\u5b8c\u74a7\uff01\u4f1d\u8aac\u306e\u30b2\u30fc\u30de\u30fc\uff01' :
    deathCount < 10  ? '\u5929\u624d\uff01\u3055\u3059\u304c\u3067\u3059\uff01' :
    deathCount < 30  ? '\u3088\u304f\u9811\u5f35\u3063\u305f\uff01' :
    deathCount < 60  ? '\u3060\u3044\u3076\u82e6\u52b4\u3057\u305f\u306d\u2026' :
                       '\u8af8\u3081\u306a\u3044\u7cbe\u795e\u304c\u5927\u4e8b\uff01';
  ctx.fillStyle = '#aaffcc';
  ctx.font = '18px monospace';
  ctx.fillText(msg, W / 2, H / 2 + 22);

  ctx.fillStyle = '#aaddff';
  ctx.font = '14px monospace';
  ctx.fillText('\u30b9\u30da\u30fc\u30b9\u30ad\u30fc\u3067\u3082\u3046\u4e00\u5ea6', W / 2, H / 2 + 60);
}

function drawStar(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
    const b = ((i * 4 + 2) * Math.PI / 5) - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r,       Math.sin(a) * r);
    else         ctx.lineTo(Math.cos(a) * r,       Math.sin(a) * r);
    ctx.lineTo(Math.cos(b) * r * 0.4, Math.sin(b) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
