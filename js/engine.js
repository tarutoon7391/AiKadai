// engine.js – physics, collision detection, update functions

function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

const VCEIL_BREAK_TOLERANCE = 2;
const STAGE01_JUMP_BOOST_X1 = 1920;
const STAGE01_JUMP_BOOST_X2 = 2000;
const STAGE01_JUMP_BOOST_MULTIPLIER = 3;
const STAGE01_SAFE_VCEIL_X1 = 2130;
const STAGE01_SAFE_VCEIL_X2 = 2200;
const SAFE_VCEIL_LANDING_INSET = 2;
const SAFE_VCEIL_LANDING_TOLERANCE = 2;
const GOAL_SPIKE_TRIGGER_MARGIN_X = 8;
const GOAL_SPIKE_TRIGGER_BOTTOM_OFFSET = 14;
const GOAL_SPIKE_TRIGGER_WINDOW_TOP = 58;
const GOAL_SPIKE_MAX_PLAYER_VY = 1;
const NORMAL_FAKE_FALL_ACCEL = 0.6;
const BOOSTED_FAKE_FALL_ACCEL = 1.2;
const GOAL_CRUSHER_ACCELERATION = 1.6;
const GOAL_CRUSHER_MAX_VELOCITY = 26;
const PLATFORM_UNDERPASS_MARGIN = 2;

function isOverGroundGap(x1, x2) {
  if (!groundGaps || groundGaps.length === 0) return false;
  for (const g of groundGaps) {
    const bounds = getGroundGapBounds(g);
    if (!bounds) continue;
    if (isRangeOverlapping(x1, x2, bounds.x1, bounds.x2)) return true;
  }
  return false;
}

function getGroundGapBounds(g) {
  if (g.x1 !== undefined && g.x2 !== undefined) return {x1: g.x1, x2: g.x2};
  if (g.x !== undefined && g.w !== undefined) return {x1: g.x, x2: g.x + g.w};
  return null;
}

function isOverLethalGroundGap(x1, x2) {
  if (!groundGaps || groundGaps.length === 0) return false;
  for (const g of groundGaps) {
    if (!g.lethal) continue;
    const bounds = getGroundGapBounds(g);
    if (!bounds) continue;
    if (isRangeOverlapping(x1, x2, bounds.x1, bounds.x2)) return true;
  }
  return false;
}

function findPlatformByTrapRole(role) {
  for (const p of PLATFORMS) {
    if (p.trapRole === role) return p;
  }
  return null;
}

function findSpikeById(id) {
  for (const s of SPIKES) {
    if (s.id === id) return s;
  }
  return null;
}

function setPurpleFirstSafe() {
  const p = findPlatformByTrapRole('purpleFirst');
  if (!p || p.purpleFirstSafe) return;
  p.purpleFirstSafe = true;
  p.color = p.safeColor || '#2fbf4a';
  const spike = findSpikeById('purpleFirstSpike');
  if (spike) spike.enabled = false;
}

function sendPlayerToStageStart(platform) {
  player = makePlayer();
  if (platform && platform.sendToX !== undefined) player.x = platform.sendToX;
  cameraX = 0;
  player.invincible = 30;
  resetTraps();
}

function triggerPurpleFirstPlatformDeath(p) {
  const spike = findSpikeById('purpleFirstSpike');
  if (spike) {
    spike.enabled = true;
    spike.x = p.x;
    spike.y = p.y - spike.h;
  }
  loseLife();
}

function updateRocketSpikes() {
  for (const spike of SPIKES) {
    if (!spike.rocketTriggerRole && spike.id !== 'goalRocketSpike') continue;

    if (!spike.launched && spike.rocketTriggerRole) {
      const basePlatform = findPlatformByTrapRole(spike.rocketTriggerRole);
      if (basePlatform) {
        const offsetX = spike.offsetX || 0;
        spike.x = basePlatform.x + offsetX;
        if (spike.attachToTop !== false) spike.y = basePlatform.y - spike.h;
      }
    }

    const marginX = spike.triggerMarginX !== undefined ? spike.triggerMarginX : GOAL_SPIKE_TRIGGER_MARGIN_X;
    const bottomOffset = spike.triggerBottomOffset !== undefined ? spike.triggerBottomOffset : GOAL_SPIKE_TRIGGER_BOTTOM_OFFSET;
    const windowTop = spike.triggerWindowTop !== undefined ? spike.triggerWindowTop : GOAL_SPIKE_TRIGGER_WINDOW_TOP;
    const maxPlayerVy = spike.triggerMaxPlayerVy !== undefined ? spike.triggerMaxPlayerVy : GOAL_SPIKE_MAX_PLAYER_VY;
    const shouldLaunch = !spike.launched &&
      isRangeOverlapping(player.x, player.x + player.w, spike.x - marginX, spike.x + spike.w + marginX) &&
      player.y + player.h <= spike.y + bottomOffset &&
      player.y >= spike.y - windowTop &&
      player.vy < maxPlayerVy;

    if (shouldLaunch) {
      spike.enabled = true;
      spike.launched = true;
      spike.vy = spike.launchVy !== undefined ? spike.launchVy : -24;
    }
    if (spike.enabled === false) continue;
    if (spike.launched) {
      spike.y += spike.vy;
      if (spike.y + spike.h < -60) spike.enabled = false;
    }
  }
}

function isRangeOverlapping(range1Start, range1End, range2Start, range2End) {
  return range1Start < range2End && range1End > range2Start;
}

function getJumpMultiplier() {
  if (
    stageIndex === 0 &&
    isRangeOverlapping(player.x, player.x + player.w, STAGE01_JUMP_BOOST_X1, STAGE01_JUMP_BOOST_X2)
  ) {
    return STAGE01_JUMP_BOOST_MULTIPLIER;
  }
  return 1;
}

function isSafeVceilArea(o) {
  if (o.safeLanding === true) return true;
  return (
    stageIndex === 0 &&
    o.type === 'vceil' &&
    isRangeOverlapping(o.x, o.x + o.w, STAGE01_SAFE_VCEIL_X1, STAGE01_SAFE_VCEIL_X2)
  );
}

function tryStandOnSafeVceil(obstacle, wasOnGround, playerTopBeforeMove) {
  if (!isSafeVceilArea(obstacle)) return false;
  if (player.vy < 0) return false;
  if (!isRangeOverlapping(
    player.x + SAFE_VCEIL_LANDING_INSET,
    player.x + player.w - SAFE_VCEIL_LANDING_INSET,
    obstacle.x,
    obstacle.x + obstacle.w
  )) return false;

  const playerBottomBeforeMove = playerTopBeforeMove + player.h;
  const currentBottom = player.y + player.h;
  const wasBottomAboveOrAtTop = playerBottomBeforeMove <= obstacle.y + SAFE_VCEIL_LANDING_TOLERANCE;
  const reachedTop = currentBottom >= obstacle.y;
  const playerTopAboveObstacleTop = player.y < obstacle.y;
  if (!wasBottomAboveOrAtTop || !reachedTop || !playerTopAboveObstacleTop) return false;

  player.y = obstacle.y - player.h;
  player.vy = 0;
  if (!wasOnGround) player.jumpCooldown = JUMP_CD;
  player.onGround = true;
  if (obstacle.safeLandingSwitch === 'purpleFirst') setPurpleFirstSafe();
  return true;
}

function getVceilSupportPlatform(o) {
  const trapBottom = o.y + o.h;

  const findSupport = (platforms, include) => {
    for (const p of platforms) {
      if (include && !include(p)) continue;
      if (o.x + o.w <= p.x || o.x >= p.x + p.w) continue;
      if (o.y > p.y + VCEIL_BREAK_TOLERANCE) continue;
      if (trapBottom < p.y - VCEIL_BREAK_TOLERANCE || trapBottom > p.y + p.h + VCEIL_BREAK_TOLERANCE) continue;
      return p;
    }
    return null;
  };

  let support = findSupport(PLATFORMS);
  if (support) return support;
  support = findSupport(vanishPlatforms, p => p.state !== 'gone');
  if (support) return support;
  support = findSupport(fakePlatforms, p => p.y <= H + 50);
  if (support) return support;

  return null;
}

function tryBreakVceilFromBelow(o, playerTopBeforeMove, playerTopAfterMove, playerVyAfterMove) {
  if (o.type !== 'vceil' || !o.active || !o.settled) return false;
  if (playerVyAfterMove >= 0) return false;

  const support = getVceilSupportPlatform(o);
  if (!support) return false;
  if (player.x + player.w <= support.x || player.x >= support.x + support.w) return false;

  const supportBottom = support.y + support.h;
  if (playerTopBeforeMove < supportBottom - VCEIL_BREAK_TOLERANCE || playerTopAfterMove > supportBottom) return false;

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
    player.vy      = JUMP_FORCE * getJumpMultiplier();
    player.onGround = false;
  }

  const playerTopBeforeMove = player.y;
  player.vy += GRAVITY;
  player.x  += player.vx;
  player.y  += player.vy;
  const playerTopAfterMove = player.y;

  if (player.x < 0)                      player.x = 0;
  if (player.x + player.w > WORLD_WIDTH) player.x = WORLD_WIDTH - player.w;

  const wasOnGround = player.onGround;
  player.onGround = false;
  const playerFootX1 = player.x + 2;
  const playerFootX2 = player.x + player.w - 2;
  const overGap = isOverGroundGap(playerFootX1, playerFootX2);

  if (!overGap && player.y + player.h >= GROUND_Y) {
    player.y  = GROUND_Y - player.h;
    player.vy = 0;
    if (!wasOnGround) player.jumpCooldown = JUMP_CD;
    player.onGround = true;
  }
  if (overGap && player.y + player.h >= GROUND_Y && isOverLethalGroundGap(playerFootX1, playerFootX2)) {
    loseLife();
    return;
  }

  if (updatePlatformTraps()) return;

  for (const p of PLATFORMS) {
    if (p.enabled === false) continue;
    const landed = collidePlatform(p.x, p.y, p.w, p.h, wasOnGround);
    if (!landed) continue;
    if (p.trapRole === 'purpleFirst' && !p.purpleFirstSafe) {
      triggerPurpleFirstPlatformDeath(p);
      return;
    }
    if (p.trapRole === 'purpleSecond' && p.state !== 'falling') {
      p.state = 'falling';
      p.vy = p.fallBoost || 2.8;
    }
    if (p.trapRole === 'sendToStart' || p.trapRole === 'purpleFifth') {
      sendPlayerToStageStart(p);
      return;
    }
  }

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
      p.vy    = p.fallBoost || 0.5;
    }
  }

  updateRocketSpikes();

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
      if (tryStandOnSafeVceil(o, wasOnGround, playerTopBeforeMove)) continue;
      if (tryBreakVceilFromBelow(o, playerTopBeforeMove, playerTopAfterMove, player.vy)) continue;
      if (rectOverlap(player.x, player.y, player.w, player.h, o.x, o.y, o.w, o.h)) {
        loseLife();
        return;
      }
    }
  }

  if (player.invincible === 0) {
    for (const s of SPIKES) {
      if (s.enabled === false) continue;
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

function updatePlatformTraps() {
  for (const p of PLATFORMS) {
    if (p.enabled === false) continue;

    if (p.dropTrigger === 'underpass' && p.state !== 'falling') {
      const underPass = isRangeOverlapping(
        player.x + PLATFORM_UNDERPASS_MARGIN,
        player.x + player.w - PLATFORM_UNDERPASS_MARGIN,
        p.x + PLATFORM_UNDERPASS_MARGIN,
        p.x + p.w - PLATFORM_UNDERPASS_MARGIN
      ) && player.y > p.y + p.h - PLATFORM_UNDERPASS_MARGIN;
      if (underPass) {
        p.state = 'falling';
        p.vy = p.fallBoost || 2;
      }
    }

    if (p.state !== 'falling') continue;
    p.vy += p.fallAccel !== undefined ? p.fallAccel : BOOSTED_FAKE_FALL_ACCEL;
    p.y += p.vy;

    if (p.crushKills === true && player.invincible === 0 &&
      rectOverlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
      loseLife();
      return true;
    }

    if (p.y > H + 120) {
      if (p.resetAfterFall) {
        p.y = p.origY;
        p.vy = 0;
        p.state = 'solid';
      } else {
        p.enabled = false;
      }
    }
  }
  return false;
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
    p.vy += p.fallBoost ? BOOSTED_FAKE_FALL_ACCEL : NORMAL_FAKE_FALL_ACCEL;
    p.y  += p.vy;
    if (p.y > H + 100) { p.y = p.origY; p.vy = 0; p.state = 'solid'; }
  }
}

function updateMovingObstacles() {
  for (const o of movingObstacles) {
    if (o.type === 'goalCrusher' && !o.triggered) {
      if (
        isRangeOverlapping(player.x + 2, player.x + player.w - 2, o.x + 3, o.x + o.w - 3) &&
        player.y + player.h >= GROUND_Y - 1
      ) {
        o.triggered = true;
        o.active = true;
      }
    }
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
    } else if (o.type === 'goalCrusher') {
      if (o.y < o.targetY) {
        o.vy += GOAL_CRUSHER_ACCELERATION;
        if (o.vy > GOAL_CRUSHER_MAX_VELOCITY) o.vy = GOAL_CRUSHER_MAX_VELOCITY;
        o.y += o.vy;
        if (o.y >= o.targetY) {
          o.y = o.targetY;
          o.vy = 0;
        }
      }
    } else if (o.type === 'safeDrop') {
      if (!o.falling) { o.falling = true; o.vy = 2; }
      if (o.y < o.targetY) {
        o.vy += 0.7;
        if (o.vy > 16) o.vy = 16;
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
