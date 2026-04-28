// engine.js – physics, collision detection, update functions

function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

const VCEIL_BREAK_TOLERANCE = 2;

function getVceilSupportPlatform(o) {
  const trapBottom = o.y + o.h;
  const candidates = [];
  for (const p of PLATFORMS) candidates.push(p);
  for (const p of vanishPlatforms) if (p.state !== 'gone') candidates.push(p);
  for (const p of fakePlatforms) if (p.y <= H + 50) candidates.push(p);

  for (const p of candidates) {
    if (o.x + o.w <= p.x || o.x >= p.x + p.w) continue;
    if (trapBottom < p.y - VCEIL_BREAK_TOLERANCE || trapBottom > p.y + p.h + VCEIL_BREAK_TOLERANCE) continue;
    return p;
  }
  return null;
}

function tryBreakVceilFromBelow(o, playerPrevTop, playerTopAfterMove, playerVyAfterMove) {
  if (o.type !== 'vceil' || !o.active || !o.settled) return false;
  if (playerVyAfterMove >= 0) return false;

  const support = getVceilSupportPlatform(o);
  if (!support) return false;
  if (player.x + player.w <= support.x || player.x >= support.x + support.w) return false;

  const supportBottom = support.y + support.h;
  if (playerPrevTop < supportBottom - VCEIL_BREAK_TOLERANCE || playerTopAfterMove > supportBottom) return false;

  player.y = supportBottom;
  player.vy = 0;
  o.active = false;
  o.vy = 0;
  return true;
}

function collidePlatform(px, py, pw, ph, wasOnGround) {
  if (!rectOverlap(player.x, player.y, player.w, player.h, px, py, pw, ph)) return false;
  const prevBottom = player.y + player.h - player.vy;
  if (prevBottom <= py + 2 && player.vy >= 0) {
    player.y  = py - player.h;
    player.vy = 0;
    if (!wasOnGround) player.jumpCooldown = JUMP_CD;
    player.onGround = true;
    return true;
  } else if (player.vy < 0 && player.y <= py + ph) {
    player.y  = py + ph;
    player.vy = 0;
  } else {
    const overlapX = Math.min(player.x + player.w - px, px + pw - player.x);
    if (player.x + player.w / 2 < px + pw / 2) player.x -= overlapX;
    else                                         player.x += overlapX;
  }
  return false;
}

function loseLife() {
  if (player.invincible > 0) return;
  deathCount++;
  deathFlash = 25;
  lives--;
  if (lives <= 0) {
    lives     = 0;
    gameState = 'gameover';
    return;
  }
  player           = makePlayer();
  cameraX          = 0;
  player.invincible = 60;
  resetTraps();
}

function updatePlayer() {
  if (player.invincible > 0) player.invincible--;
  if (player.jumpCooldown > 0) player.jumpCooldown--;

  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = Math.max(player.vx - ACCEL, -PLAYER_SPEED);
    player.dir = -1;
  } else if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = Math.min(player.vx + ACCEL, PLAYER_SPEED);
    player.dir = 1;
  } else {
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  }

  if (player.onGround && player.vx !== 0 && animTick % 8 === 0)
    player.walkFrame = (player.walkFrame + 1) % 4;

  if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && player.onGround && player.jumpCooldown === 0) {
    player.vy      = JUMP_FORCE;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  player.x  += player.vx;
  player.y  += player.vy;
  const playerTopAfterMove = player.y;
  const playerPrevTop = player.y - player.vy;
  const playerVyAfterMove = player.vy;

  if (player.x < 0)                      player.x = 0;
  if (player.x + player.w > WORLD_WIDTH) player.x = WORLD_WIDTH - player.w;

  const wasOnGround = player.onGround;
  player.onGround = false;

  if (player.y + player.h >= GROUND_Y) {
    player.y  = GROUND_Y - player.h;
    player.vy = 0;
    if (!wasOnGround) player.jumpCooldown = JUMP_CD;
    player.onGround = true;
  }

  for (const p of PLATFORMS) collidePlatform(p.x, p.y, p.w, p.h, wasOnGround);

  for (const p of vanishPlatforms) {
    if (p.state === 'gone') continue;
    const landed = collidePlatform(p.x, p.y, p.w, p.h, wasOnGround);
    if (landed && p.state === 'solid') {
      p.state = 'shaking';
      p.timer = 55;
    }
  }

  for (const p of fakePlatforms) {
    if (p.y > H + 50) continue;
    const landed = collidePlatform(p.x, p.y, p.w, p.h, wasOnGround);
    if (landed && p.state === 'solid' && p.canFall !== false) {
      p.state = 'falling';
      p.vy    = 0.5;
    }
  }

  if (spikeTeleportPending) {
    var hasRemaining = false;
    for (const s of SPIKES) {
      if (s.teleportOnPlayerX === undefined || s.teleportToX === undefined) continue;
      if (!s.teleported && player.x > s.teleportOnPlayerX) {
        s.x = s.teleportToX;
        s.teleported = true;
      }
      if (!s.teleported) hasRemaining = true;
    }
    if (!hasRemaining) spikeTeleportPending = false;
  }

  if (player.invincible === 0) {
    for (const o of movingObstacles) {
      if (!o.active) continue;
      if (tryBreakVceilFromBelow(o, playerPrevTop, playerTopAfterMove, playerVyAfterMove)) continue;
      if (rectOverlap(player.x, player.y, player.w, player.h, o.x, o.y, o.w, o.h)) {
        loseLife();
        return;
      }
    }
  }

  if (player.invincible === 0) {
    for (const s of SPIKES) {
      if (rectOverlap(
        player.x + 3, player.y + 3, player.w - 6, player.h - 6,
        s.x + 3,      s.y + 3,      s.w - 6,      s.h - 6
      )) {
        loseLife();
        return;
      }
    }
  }

  if (player.y > H + 100) { loseLife(); return; }
}

function updateVanishPlatforms() {
  for (const p of vanishPlatforms) {
    if (p.state === 'shaking') {
      p.timer--;
      if (p.timer <= 0) { p.state = 'gone'; p.restoreTimer = 220; }
    } else if (p.state === 'gone') {
      p.restoreTimer--;
      if (p.restoreTimer <= 0) p.state = 'solid';
    }
  }
}

function updateFakePlatforms() {
  for (const p of fakePlatforms) {
    if (p.state !== 'falling') continue;
    p.vy += 0.6;
    p.y  += p.vy;
    if (p.y > H + 100) { p.y = p.origY; p.vy = 0; p.state = 'solid'; }
  }
}

function updateMovingObstacles() {
  for (const o of movingObstacles) {
    if (!o.triggered && player.x > o.triggerX) {
      o.triggered = true;
      o.active    = true;
    }
    if (!o.active) continue;

    if (o.type === 'hwall') {
      if (o.x > o.targetX + 1) {
        o.vx -= 1.0;
        if (o.vx < -14) o.vx = -14;
        o.x += o.vx;
        if (o.x < o.targetX) o.x = o.targetX;
      }
      if (o.x <= o.targetX + 1) {
        if (o.retractTimer === undefined) o.retractTimer = 80;
        o.retractTimer--;
        if (o.retractTimer <= 0) {
          o.x            = o.origX;
          o.vx           = 0;
          o.active       = false;
          o.triggered    = false;
          o.retractTimer = undefined;
        }
      }
    } else if (o.type === 'vceil') {
      if (!o.falling) { o.falling = true; o.vy = 2; }
      if (o.y < o.targetY) {
        o.vy += 0.7;
        if (o.vy > 18) o.vy = 18;
        o.y += o.vy;
        if (o.y >= o.targetY) {
          o.y = o.targetY;
          o.vy = 0;
          o.settled = true;
          o.falling = false;
        }
      }
    }
  }
}

function updateCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    if (rectOverlap(player.x, player.y, player.w, player.h, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2))
      c.collected = true;
  }
}

function checkGoal() {
  if (!goalReached && player.x + player.w >= goalX) {
    goalReached      = true;
    gameState        = 'stageclear';
    stageClearTimer  = 180;
  }
}

function updateCamera() {
  cameraX = Math.max(0, Math.min(player.x - W / 3, WORLD_WIDTH - W));
}
