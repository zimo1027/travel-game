// 旅游闯关小游戏 — 主入口
var Player = require('./player')
var mapMod = require('./map')
var Input = require('./input')
var LEVELS = require('./levels')
var ui = require('./ui')

var canvas = wx.createCanvas()
var ctx = canvas.getContext('2d')
var input = new Input(canvas)

var W = canvas.width
var H = canvas.height

// ========== 游戏状态 ==========
var state = 'playing'  // playing | level_complete
var levelIndex = 0
var level = null
var gameMap = null
var player = null
var collected = []  // boolean[]
var nextLevelData = null

// ========== 初始化关卡 ==========
function loadLevel(idx) {
  if (idx >= LEVELS.length) {
    // 全部通关
    levelIndex = 0
    idx = 0
  }

  levelIndex = idx
  level = LEVELS[idx]
  gameMap = new mapMod.Map(level)
  gameMap.updateOffset(W, H)

  player = new Player(level.playerStart.x, level.playerStart.y)
  collected = new Array(level.checkpoints.length).fill(false)
  state = 'playing'
  nextLevelData = null
}

// ========== 检查打卡点碰撞 ==========
function checkCheckpoints() {
  var cps = level.checkpoints
  for (var i = 0; i < cps.length; i++) {
    if (collected[i]) continue
    var cp = cps[i]
    var dx = player.x - cp.x
    var dy = player.y - cp.y
    var dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < mapMod.CHECKPOINT_RADIUS + player.radius) {
      collected[i] = true
      // 弹出景点介绍
      ui.showPopup(cp.name, cp.desc, '继续探索', function () {
        // 检查是否全部收集
        if (collected.every(function (c) { return c })) {
          var nextIdx = levelIndex + 1
          nextLevelData = nextIdx < LEVELS.length ? LEVELS[nextIdx] : null
          state = 'level_complete'
        }
      })
      return
    }
  }
}

// ========== 点击处理 ==========
function handleClicks() {
  var clicks = input.flushClicks()
  for (var i = 0; i < clicks.length; i++) {
    var c = clicks[i]

    // 如果弹窗打开，先处理弹窗点击
    if (ui.isPopupOpen()) {
      ui.handlePopupClick(c.x, c.y, W, H)
      continue
    }

    // 通关画面点击
    if (state === 'level_complete') {
      handleLevelCompleteClick(c.x, c.y)
      continue
    }

    // 游戏中的点击：设置玩家目标
    var world = gameMap.screenToWorld(c.x, c.y)
    var nearest = gameMap.findWalkableNear(world.x, world.y, player.radius)
    if (nearest.ok) {
      player.setTarget(nearest.x, nearest.y)
    }
  }
}

function handleLevelCompleteClick(x, y) {
  var pw = Math.min(500, W * 0.85)
  var ph = Math.min(420, H * 0.55)
  var py = (H - ph) / 2
  var btnW = pw * 0.5
  var btnH = 64
  var btnX = (W - btnW) / 2
  var btnY = py + ph - 100

  if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
    if (nextLevelData) {
      loadLevel(levelIndex + 1)
    } else {
      loadLevel(0)
    }
  }
}

// ========== 主循环 ==========
function gameLoop() {
  handleClicks()

  // 只在游戏中更新角色
  if (state === 'playing') {
    player.update()
    checkCheckpoints()
  }

  // ===== 绘制 =====
  ctx.clearRect(0, 0, W, H)

  // 地图
  gameMap.draw(ctx)
  gameMap.drawCheckpoints(ctx, collected)

  // 玩家
  player.draw(ctx, gameMap.offsetX, gameMap.offsetY)

  // UI
  ui.drawHUD(ctx, level, collected.filter(function (c) { return c }).length, level.checkpoints.length, W)
  ui.drawPopup(ctx, W, H)

  if (state === 'level_complete') {
    ui.drawLevelComplete(ctx, nextLevelData, W, H)
  }

  requestAnimationFrame(gameLoop)
}

// ========== 启动 ==========
loadLevel(0)
gameLoop()
