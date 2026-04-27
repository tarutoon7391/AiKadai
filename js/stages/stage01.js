// Stage 01 – original stage (ported as-is)
// GROUND_Y = 340, so GROUND_Y-20 = 320, GROUND_Y-36 = 304
var STAGE_01 = {
  worldWidth: 3000,
  startX: 60,
  goalX: 2995,

  platforms: [
    {x:  180, y: 280, w: 100, h: 20, color: '#4a9e4a'},
    {x:  350, y: 240, w:  80, h: 20, color: '#4a9e4a'},
    {x:  580, y: 210, w: 100, h: 20, color: '#4a9e4a'},
    {x:  750, y: 260, w:  80, h: 20, color: '#5a8a3a'},
    {x:  890, y: 230, w:  90, h: 20, color: '#5a8a3a'},
    {x: 1130, y: 265, w: 100, h: 20, color: '#5a8a3a'},
    {x: 1310, y: 240, w:  80, h: 20, color: '#5a8a3a'},
    {x: 1600, y: 225, w:  90, h: 20, color: '#8a5a3a'},
    {x: 1760, y: 265, w:  90, h: 20, color: '#8a5a3a'},
    {x: 1920, y: 230, w: 100, h: 20, color: '#8a5a3a'},
    {x: 2140, y: 270, w: 110, h: 20, color: '#8a5a3a'},
    {x: 2310, y: 240, w:  80, h: 20, color: '#8a4a8a'},
    {x: 2470, y: 205, w:  90, h: 20, color: '#8a4a8a'},
    {x: 2640, y: 250, w:  80, h: 20, color: '#8a4a8a'},
    {x: 2810, y: 270, w: 100, h: 20, color: '#aa7700'},
    {x: 2960, y: 280, w:  80, h: 60, color: '#aa7700'},
  ],

  spikes: [
    {x:  450, y: 320, w:  80, h: 20, dir: 'up'},
    {x:  980, y: 320, w: 100, h: 20, dir: 'up'},
    {x: 1420, y: 320, w:  80, h: 20, dir: 'up'},
    {x: 1690, y: 320, w:  60, h: 20, dir: 'up'},
    {x: 1930, y: 210, w:  40, h: 20, dir: 'up'},
    {x: 2200, y: 320, w:  80, h: 20, dir: 'up'},
    {x: 2820, y: 250, w:  30, h: 20, dir: 'up'},
  ],

  makeVanishPlatforms: function() {
    return [
      {x:  970, y: 240, w: 90, h: 20, color: '#4a9e4a', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 1840, y: 255, w: 80, h: 20, color: '#8a5a3a', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 2390, y: 195, w: 70, h: 20, color: '#8a4a8a', state: 'solid', timer: 0, restoreTimer: 0},
    ];
  },

  makeFakePlatforms: function() {
    return [
      {x: 1410, y: 260, w: 100, h: 20, color: '#4a9e4a', state: 'solid', vy: 0, origY: 260},
      {x: 2540, y: 215, w:  80, h: 20, color: '#8a4a8a', state: 'solid', vy: 0, origY: 215},
    ];
  },

  makeMovingObstacles: function() {
    return [
      {
        type: 'hwall',
        x: 800, y: 175, w: 30, h: 155,
        origX: 800, targetX: 660,
        vx: 0, active: false, triggered: false,
        triggerX: 545, retractTimer: undefined, color: '#882222'
      },
      {
        type: 'vceil',
        x: 2140, y: -70, w: 110, h: 55,
        origY: -70, targetY: 225,
        vy: 0, active: false, triggered: false,
        triggerX: 2100, falling: false, retractTimer: 0, color: '#882222'
      },
    ];
  },

  makeCoins: function() {
    return [
      {x:  200, y: 260, r: 8, collected: false},
      {x:  225, y: 260, r: 8, collected: false},
      {x:  368, y: 220, r: 8, collected: false},
      {x:  455, y: 302, r: 8, collected: false},
      {x:  478, y: 302, r: 8, collected: false},
      {x:  595, y: 190, r: 8, collected: false},
      {x:  618, y: 190, r: 8, collected: false},
      {x:  765, y: 240, r: 8, collected: false},
      {x:  904, y: 210, r: 8, collected: false},
      {x: 1000, y: 220, r: 8, collected: false},
      {x: 1020, y: 220, r: 8, collected: false},
      {x: 1145, y: 245, r: 8, collected: false},
      {x: 1325, y: 218, r: 8, collected: false},
      {x: 1445, y: 238, r: 8, collected: false},
      {x: 1615, y: 205, r: 8, collected: false},
      {x: 1775, y: 245, r: 8, collected: false},
      {x: 1942, y: 208, r: 8, collected: false},
      {x: 2155, y: 250, r: 8, collected: false},
      {x: 2325, y: 218, r: 8, collected: false},
      {x: 2485, y: 183, r: 8, collected: false},
      {x: 2655, y: 228, r: 8, collected: false},
      {x: 2826, y: 248, r: 8, collected: false},
    ];
  },
};
