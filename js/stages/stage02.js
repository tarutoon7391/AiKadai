// Stage 02 – 溶岩地獄（orange/red lava theme, more spikes & traps）
// GROUND_Y = 340, GROUND_Y-20 = 320
var STAGE_02 = {
  worldWidth: 3000,
  startX: 60,
  goalX: 2988,

  platforms: [
    {x:  160, y: 280, w:  90, h: 20, color: '#8a4400'},
    {x:  340, y: 250, w:  80, h: 20, color: '#8a4400'},
    {x:  490, y: 222, w:  85, h: 20, color: '#aa5500'},
    {x:  790, y: 235, w:  80, h: 20, color: '#aa5500'},
    {x:  940, y: 262, w:  80, h: 20, color: '#cc6600'},
    {x: 1080, y: 238, w:  80, h: 20, color: '#cc6600'},
    {x: 1380, y: 250, w:  80, h: 20, color: '#dd7700'},
    {x: 1530, y: 225, w:  80, h: 20, color: '#dd7700'},
    {x: 1680, y: 258, w:  80, h: 20, color: '#dd7700'},
    {x: 1980, y: 230, w:  80, h: 20, color: '#ee6600'},
    {x: 2120, y: 260, w:  80, h: 20, color: '#ee6600'},
    {x: 2260, y: 238, w:  80, h: 20, color: '#ee6600'},
    {x: 2550, y: 232, w:  80, h: 20, color: '#ff5500'},
    {x: 2700, y: 258, w:  80, h: 20, color: '#ff5500'},
    {x: 2850, y: 270, w:  80, h: 20, color: '#ff4400'},
    {x: 2960, y: 275, w:  80, h: 60, color: '#cc3300'},
  ],

  spikes: [
    // Ground spikes – many more than stage01
    {x:  265, y: 320, w:  60, h: 20, dir: 'up'},
    {x:  435, y: 320, w:  45, h: 20, dir: 'up'},
    {x:  590, y: 320, w:  85, h: 20, dir: 'up'},
    {x:  740, y: 320, w:  40, h: 20, dir: 'up'},
    {x:  880, y: 320, w:  50, h: 20, dir: 'up'},
    {x: 1020, y: 320, w:  50, h: 20, dir: 'up'},
    {x: 1185, y: 320, w:  75, h: 20, dir: 'up'},
    {x: 1470, y: 320, w:  50, h: 20, dir: 'up'},
    {x: 1620, y: 320, w:  50, h: 20, dir: 'up'},
    {x: 1780, y: 320, w:  70, h: 20, dir: 'up'},
    {x: 1900, y: 320, w:  70, h: 20, dir: 'up'},
    {x: 2060, y: 320, w:  50, h: 20, dir: 'up'},
    {x: 2210, y: 320, w:  40, h: 20, dir: 'up'},
    {x: 2380, y: 320, w:  70, h: 20, dir: 'up'},
    {x: 2495, y: 320, w:  45, h: 20, dir: 'up'},
    {x: 2640, y: 320, w:  50, h: 20, dir: 'up'},
    {x: 2790, y: 320, w:  50, h: 20, dir: 'up'},
    // Platform-top spike (land on left or right side only)
    {x: 1540, y: 205, w:  40, h: 20, dir: 'up'},
  ],

  makeVanishPlatforms: function() {
    return [
      {x:  640, y: 260, w: 75, h: 20, color: '#aa5500', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 1230, y: 258, w: 75, h: 20, color: '#cc6600', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 1830, y: 244, w: 80, h: 20, color: '#dd7700', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 2400, y: 255, w: 75, h: 20, color: '#ff5500', state: 'solid', timer: 0, restoreTimer: 0},
    ];
  },

  makeFakePlatforms: function() {
    return [
      {x:  870, y: 252, w: 60, h: 20, color: '#aa5500', state: 'solid', vy: 0, origY: 252},
      {x: 1970, y: 248, w: 75, h: 20, color: '#ee6600', state: 'solid', vy: 0, origY: 248},
      {x: 2695, y: 254, w: 75, h: 20, color: '#ff5500', state: 'solid', vy: 0, origY: 254},
    ];
  },

  makeMovingObstacles: function() {
    return [
      {
        type: 'hwall',
        x: 820, y: 172, w: 30, h: 158,
        origX: 820, targetX: 680,
        vx: 0, active: false, triggered: false,
        triggerX: 640, retractTimer: undefined, color: '#aa1100'
      },
      {
        type: 'vceil',
        x: 2120, y: -70, w: 80, h: 55,
        origY: -70, targetY: 222,
        vy: 0, active: false, triggered: false,
        triggerX: 2080, falling: false, retractTimer: 0, color: '#aa1100'
      },
      {
        type: 'hwall',
        x: 2520, y: 172, w: 30, h: 158,
        origX: 2520, targetX: 2380,
        vx: 0, active: false, triggered: false,
        triggerX: 2320, retractTimer: undefined, color: '#aa1100'
      },
    ];
  },

  makeCoins: function() {
    return [
      {x:  185, y: 260, r: 8, collected: false},
      {x:  210, y: 260, r: 8, collected: false},
      {x:  365, y: 230, r: 8, collected: false},
      {x:  510, y: 202, r: 8, collected: false},
      {x:  655, y: 240, r: 8, collected: false},
      {x:  810, y: 215, r: 8, collected: false},
      {x:  960, y: 242, r: 8, collected: false},
      {x: 1100, y: 218, r: 8, collected: false},
      {x: 1248, y: 238, r: 8, collected: false},
      {x: 1398, y: 230, r: 8, collected: false},
      {x: 1575, y: 205, r: 8, collected: false},
      {x: 1700, y: 238, r: 8, collected: false},
      {x: 1848, y: 224, r: 8, collected: false},
      {x: 2000, y: 210, r: 8, collected: false},
      {x: 2140, y: 240, r: 8, collected: false},
      {x: 2280, y: 218, r: 8, collected: false},
      {x: 2418, y: 235, r: 8, collected: false},
      {x: 2570, y: 212, r: 8, collected: false},
      {x: 2720, y: 238, r: 8, collected: false},
      {x: 2870, y: 250, r: 8, collected: false},
    ];
  },
};
