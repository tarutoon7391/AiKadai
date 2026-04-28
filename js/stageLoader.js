// stageLoader.js – stage registry and loading logic

var STAGES = [STAGE_01, STAGE_02, STAGE_03];

function cloneSpikes(spikes) {
  return spikes.map(function(s) {
    var c = Object.assign({}, s);
    c.teleported = false;
    return c;
  });
}

function loadStage(idx) {
  var stage = STAGES[idx];
  WORLD_WIDTH     = stage.worldWidth;
  PLATFORMS       = stage.platforms;
  SPIKES          = cloneSpikes(stage.spikes);
  spikeTeleportPending = SPIKES.some(function(s) {
    return s.teleportOnPlayerX !== undefined && s.teleportToX !== undefined;
  });
  vanishPlatforms = stage.makeVanishPlatforms();
  fakePlatforms   = stage.makeFakePlatforms();
  movingObstacles = stage.makeMovingObstacles();
  coins           = stage.makeCoins();
  TOTAL_COINS     = coins.length;
  goalX           = stage.goalX;
  stageStartX     = stage.startX;
}

function resetTraps() {
  var stage = STAGES[stageIndex];
  SPIKES          = cloneSpikes(stage.spikes);
  spikeTeleportPending = SPIKES.some(function(s) {
    return s.teleportOnPlayerX !== undefined && s.teleportToX !== undefined;
  });
  vanishPlatforms = stage.makeVanishPlatforms();
  fakePlatforms   = stage.makeFakePlatforms();
  movingObstacles = stage.makeMovingObstacles();
}
