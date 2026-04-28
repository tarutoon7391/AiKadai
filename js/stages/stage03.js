// Stage 03 – 深淵（purple/dark abyss theme, maximum traps, worldWidth 3200）
// GROUND_Y = 340, GROUND_Y-20 = 320
var STAGE_03 = {
  worldWidth: 3200,
  startX: 60,
  goalX: 3188,

  platforms: [
    {x:  150, y: 278, w:  80, h: 20, color: '#4a2a6a'},
    {x:  310, y: 248, w:  75, h: 20, color: '#4a2a6a'},
    {x:  455, y: 218, w:  80, h: 20, color: '#5a3a7a'},
    {x:  610, y: 252, w:  75, h: 20, color: '#5a3a7a'},
    {x:  755, y: 228, w:  80, h: 20, color: '#6a2a8a'},
    {x:  895, y: 258, w:  75, h: 20, color: '#6a2a8a'},
    {x: 1040, y: 235, w:  80, h: 20, color: '#7a1a9a'},
    {x: 1270, y: 252, w:  75, h: 20, color: '#7a1a9a'},
    {x: 1415, y: 228, w:  75, h: 20, color: '#8a0aaa'},
    {x: 1560, y: 255, w:  75, h: 20, color: '#8a0aaa'},
    {x: 1800, y: 232, w:  75, h: 20, color: '#9900bb'},
    {x: 1945, y: 258, w:  75, h: 20, color: '#9900bb'},
    {x: 2090, y: 235, w:  75, h: 20, color: '#aa00cc'},
    {x: 2320, y: 255, w:  75, h: 20, color: '#aa00cc'},
    {x: 2460, y: 228, w:  75, h: 20, color: '#bb00dd'},
    {x: 2605, y: 255, w:  75, h: 20, color: '#bb00dd'},
    {x: 2840, y: 235, w:  75, h: 20, color: '#cc00ee'},
    {x: 2985, y: 262, w:  75, h: 20, color: '#cc00ee'},
    {x: 3100, y: 272, w:  80, h: 60, color: '#880099'},
  ],

  spikes: [
    // Dense ground spikes
    {x:  240, y: 320, w:  55, h: 20, dir: 'up'},
    {x:  400, y: 320, w:  45, h: 20, dir: 'up'},
    {x:  550, y: 320, w:  50, h: 20, dir: 'up'},
    {x:  700, y: 320, w:  45, h: 20, dir: 'up'},
    {x:  850, y: 320, w:  35, h: 20, dir: 'up'},
    {x:  990, y: 320, w:  40, h: 20, dir: 'up'},
    {x: 1140, y: 320, w:  80, h: 20, dir: 'up'},
    {x: 1360, y: 320, w:  45, h: 20, dir: 'up'},
    {x: 1505, y: 320, w:  45, h: 20, dir: 'up'},
    {x: 1650, y: 320, w:  60, h: 20, dir: 'up'},
    {x: 1870, y: 320, w:  60, h: 20, dir: 'up'},
    {x: 2015, y: 320, w:  60, h: 20, dir: 'up'},
    {x: 2180, y: 320, w:  80, h: 20, dir: 'up'},
    {x: 2410, y: 320, w:  40, h: 20, dir: 'up'},
    {x: 2550, y: 320, w:  45, h: 20, dir: 'up'},
    {x: 2700, y: 320, w:  90, h: 20, dir: 'up'},
    {x: 2910, y: 320, w:  60, h: 20, dir: 'up'},
    {x: 3060, y: 320, w:  30, h: 20, dir: 'up'},
    // Platform-top spikes (two evil ones)
    {x:  760, y: 208, w:  35, h: 20, dir: 'up'},
    {x: 1420, y: 208, w:  35, h: 20, dir: 'up'},
  ],

  makeVanishPlatforms: function() {
    return [
      {x:  605, y: 250, w: 70, h: 20, color: '#5a3a7a', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 1185, y: 245, w: 70, h: 20, color: '#7a1a9a', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 1710, y: 242, w: 70, h: 20, color: '#9900bb', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 2235, y: 248, w: 70, h: 20, color: '#aa00cc', state: 'solid', timer: 0, restoreTimer: 0},
      {x: 2775, y: 242, w: 70, h: 20, color: '#cc00ee', state: 'solid', timer: 0, restoreTimer: 0},
    ];
  },

  makeFakePlatforms: function() {
    return [
      {x:  900, y: 248, w: 65, h: 20, color: '#6a2a8a', state: 'solid', vy: 0, origY: 248},
      {x: 1955, y: 248, w: 65, h: 20, color: '#9900bb', state: 'solid', vy: 0, origY: 248},
      {x: 2840, y: 225, w: 65, h: 20, color: '#cc00ee', state: 'solid', vy: 0, origY: 225},
    ];
  },

  makeMovingObstacles: function() {
    return [
      {
        type: 'hwall',
        x: 790, y: 172, w: 30, h: 158,
        origX: 790, targetX: 650,
        vx: 0, active: false, triggered: false,
        triggerX: 595, retractTimer: undefined, color: '#660077'
      },
      {
        type: 'vceil',
        x: 1040, y: -70, w: 80, h: 55,
        origY: -70, targetY: 218,
        vy: 0, active: false, triggered: false,
        triggerX: 1000, falling: false, retractTimer: 0, color: '#660077'
      },
      {
        type: 'hwall',
        x: 2110, y: 172, w: 30, h: 158,
        origX: 2110, targetX: 1960,
        vx: 0, active: false, triggered: false,
        triggerX: 1900, retractTimer: undefined, color: '#660077'
      },
      {
        type: 'vceil',
        x: 2460, y: -70, w: 75, h: 55,
        origY: -70, targetY: 173,
        vy: 0, active: false, triggered: false,
        triggerX: 2420, falling: false, retractTimer: 0, color: '#660077'
      },
    ];
  },

  makeCoins: function() {
    return [
      {x:  168, y: 258, r: 8, collected: false},
      {x:  328, y: 228, r: 8, collected: false},
      {x:  473, y: 198, r: 8, collected: false},
      {x:  628, y: 232, r: 8, collected: false},
      {x:  773, y: 208, r: 8, collected: false},
      {x:  913, y: 238, r: 8, collected: false},
      {x: 1058, y: 215, r: 8, collected: false},
      {x: 1203, y: 225, r: 8, collected: false},
      {x: 1288, y: 232, r: 8, collected: false},
      {x: 1433, y: 208, r: 8, collected: false},
      {x: 1578, y: 235, r: 8, collected: false},
      {x: 1728, y: 222, r: 8, collected: false},
      {x: 1818, y: 212, r: 8, collected: false},
      {x: 1963, y: 238, r: 8, collected: false},
      {x: 2108, y: 215, r: 8, collected: false},
      {x: 2253, y: 228, r: 8, collected: false},
      {x: 2338, y: 235, r: 8, collected: false},
      {x: 2478, y: 208, r: 8, collected: false},
      {x: 2623, y: 235, r: 8, collected: false},
      {x: 2793, y: 222, r: 8, collected: false},
      {x: 2858, y: 215, r: 8, collected: false},
      {x: 3003, y: 242, r: 8, collected: false},
    ];
  },
};
