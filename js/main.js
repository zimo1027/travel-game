// 故宫深度游 — 主入口
require('./polyfill')
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
var state = 'home'  // home | menu | playing | level_complete
var levelIndex = 0
var level = null
var gameMap = null
var player = null
var collected = []

// ========== 初始化关卡 ==========
function loadLevel(idx) {
  levelIndex = idx
  level = LEVELS[idx]
  gameMap = new mapMod.Map(level)
  gameMap.updateOffset(W, H)

  player = new Player(level.playerStart.x, level.playerStart.y)
  collected = new Array(level.checkpoints.length).fill(false)
  state = 'playing'
}

function goHome() { state = 'home' }
function goMenu() { state = 'menu' }

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
      ui.showPopup(cp.name, cp.desc, '继续探索', function () {
        if (collected.every(function (c) { return c })) {
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

    // 弹窗优先
    if (ui.isPopupOpen()) {
      ui.handlePopupClick(c.x, c.y, W, H)
      continue
    }

    // 首页
    if (state === 'home') {
      if (ui.getHomeButtonHit(c.x, c.y, W, H)) {
        goMenu()
      }
      continue
    }

    // 菜单
    if (state === 'menu') {
      if (ui.getMenuBackHit(c.x, c.y)) {
        goHome()
        continue
      }
      var sel = ui.getMenuSelection(c.x, c.y, W, H)
      if (sel >= 0) {
        loadLevel(sel)
      }
      continue
    }

    // 通关画面
    if (state === 'level_complete') {
      handleLevelCompleteClick(c.x, c.y)
      continue
    }

    // 游戏中——返回按钮（左上角）
    if (c.x < 120 && c.y < 100) {
      goMenu()
      continue
    }

    // 点击移动
    var world = gameMap.screenToWorld(c.x, c.y)
    var nearest = gameMap.findWalkableNear(world.x, world.y, player.radius)
    if (nearest.ok) {
      player.setTarget(nearest.x, nearest.y)
    }
  }
}

function handleLevelCompleteClick(x, y) {
  var pw = Math.min(500, W * 0.85)
  var ph = Math.min(380, H * 0.55)
  var py = (H - ph) / 2
  var btnW = pw * 0.5
  var btnH = 64
  var btnX = (W - btnW) / 2
  var btnY = py + ph - 100

  if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
    goMenu()
  }
}

// ========== 主循环 ==========
function gameLoop() {
  handleClicks()

  if (state === 'playing') {
    player.update()
    checkCheckpoints()
  }

  ctx.clearRect(0, 0, W, H)

  if (state === 'home') {
    ui.drawHome(ctx, W, H)
  } else if (state === 'menu') {
    ui.drawMenu(ctx, LEVELS, W, H)
  } else {
    // playing / level_complete
    gameMap.draw(ctx)
    gameMap.drawCheckpoints(ctx, collected)
    player.draw(ctx, gameMap.offsetX, gameMap.offsetY)
    ui.drawHUD(ctx, level, collected.filter(function (c) { return c }).length, level.checkpoints.length, W)

    // 返回按钮
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.roundRect(16, 16, 96, 48, 24)
    ctx.fill()
    ctx.fillStyle = '#FFF'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('← 返回', 64, 40)

    ui.drawPopup(ctx, W, H)
    if (state === 'level_complete') {
      ui.drawLevelComplete(ctx, null, W, H)
    }
  }

  requestAnimationFrame(gameLoop)
}

gameLoop()
