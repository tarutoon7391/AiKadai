// main.js – canvas setup, constants, game state, input, and main loop

// ─── Canvas ──────────────────────────────────────────────────────────────────
var canvas = document.getElementById('gameCanvas');
var ctx    = canvas.getContext('2d');

// roundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    var rad = Math.min(r, w / 2, h / 2);
    this.moveTo(x + rad, y);
    this.lineTo(x + w - rad, y);   this.arcTo(x + w, y,   x + w, y + rad,   rad);
    this.lineTo(x + w, y + h - rad); this.arcTo(x + w, y + h, x + w - rad, y + h, rad);
    this.lineTo(x + rad, y + h);   this.arcTo(x, y + h,   x, y + h - rad,   rad);
    this.lineTo(x, y + rad);       this.arcTo(x, y,       x + rad, y,       rad);
    this.closePath();
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────
var W            = 680;
var H            = 400;
var GRAVITY      = 0.45;
var JUMP_FORCE   = -10;
var PLAYER_SPEED = 2.8;
var ACCEL        = 0.45;
var FRICTION     = 0.78;
var GROUND_Y     = 340;
var JUMP_CD      = 18;

// ─── Stage data globals (populated by stageLoader) ───────────────────────────
var WORLD_WIDTH;
var PLATFORMS;
var SPIKES;
var vanishPlatforms;
var fakePlatforms;
var movingObstacles;
var coins;
var TOTAL_COINS;
var goalX;
var stageStartX;
var spikeTeleportPending;

// ─── Mutable game state ──────────────────────────────────────────────────────
var gameState;
var lives;
var deathCount;
var cameraX;
var animTick;
var deathFlash;
var stageIndex;
var goalReached;
var stageClearTimer;
var player;

// ─── Key input ───────────────────────────────────────────────────────────────
var keys = {};
document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW'].indexOf(e.code) !== -1)
    e.preventDefault();

  if (gameState === 'gameover' && e.code === 'Space') {
    restartGame();
  } else if (gameState === 'stageclear' && e.code === 'Space') {
    advanceStage();
  } else if (gameState === 'ending' && e.code === 'Space') {
    restartGame();
  }
});
document.addEventListener('keyup', function(e) { keys[e.code] = false; });

// ─── Stage management ────────────────────────────────────────────────────────
function initStage(idx) {
  stageIndex      = idx;
  loadStage(idx);
  goalReached     = false;
  cameraX         = 0;
  player          = makePlayer();
  gameState       = 'playing';
  stageClearTimer = 0;
}

function advanceStage() {
  if (stageIndex + 1 < STAGES.length) {
    initStage(stageIndex + 1);
  } else {
    gameState = 'ending';
  }
}

function restartGame() {
  lives      = 5;
  deathCount = 0;
  animTick   = 0;
  deathFlash = 0;
  initStage(0);
}

// ─── Main loop ───────────────────────────────────────────────────────────────
function gameLoop() {
  animTick++;
  ctx.clearRect(0, 0, W, H);

  // Auto-advance after stage clear
  if (gameState === 'stageclear') {
    stageClearTimer--;
    if (stageClearTimer <= 0) advanceStage();
  }

  if (gameState === 'playing') {
    updatePlayer();
    updateVanishPlatforms();
    updateFakePlatforms();
    updateMovingObstacles();
    updateCoins();
    checkGoal();
    updateCamera();
  }

  drawBackground();
  drawPlatforms();
  drawVanishPlatforms();
  drawFakePlatforms();
  drawSpikes();
  drawMovingObstacles();
  drawCoins();
  drawGoal();
  drawPlayer();
  drawUI();

  if (gameState === 'gameover')   drawGameOver();
  if (gameState === 'stageclear') drawStageClear();
  if (gameState === 'ending')     drawEnding();

  requestAnimationFrame(gameLoop);
}

// ─── Start ───────────────────────────────────────────────────────────────────
lives      = 5;
deathCount = 0;
animTick   = 0;
deathFlash = 0;
initStage(0);
gameLoop();
