// 故宫飞行棋
var canvas = wx.createCanvas()
var ctx = canvas.getContext('2d')
var W = canvas.width
var H = canvas.height

// ========== 缩放基准 ==========
var S = H / 667

// ========== 棋盘路径生成（外围一圈，顺时针） ==========
var G = 9  // 9x9 网格
var cellSize = Math.floor(H * 0.78 / G)
var boardX = 20 * S
var boardY = (H - cellSize * G) / 2

var path = []  // [{row, col, type, label, data}]
// 顶边: 左→右
for (var c = 0; c < G; c++) { path.push({ row: 0, col: c }) }
// 右边: 上→下
for (var r = 1; r < G; r++) { path.push({ row: r, col: G - 1 }) }
// 底边: 右→左
for (var c = G - 2; c >= 0; c--) { path.push({ row: G - 1, col: c }) }
// 左边: 下→上
for (var r = G - 2; r >= 1; r--) { path.push({ row: r, col: 0 }) }

// 路径上每个格子的类型
function setTile(i, type, label, data) {
  path[i].type = type
  path[i].label = label
  path[i].data = data || {}
}
// 默认普通格
for (var i = 0; i < path.length; i++) { path[i].type = 'normal' }

var TOTAL = path.length  // 32 格

// 打卡点（4个）
setTile(4,  'checkpoint', '太和门', { cpIndex: 0 })
setTile(12, 'checkpoint', '太和殿', { cpIndex: 1 })
setTile(20, 'checkpoint', '乾清宫', { cpIndex: 2 })
setTile(28, 'checkpoint', '御花园', { cpIndex: 3 })

// 起点 = 终点（神武门/午门）
// 玩家从 index 0 出发，收集完所有打卡点后到达这里即通关
setTile(0, 'start_end', '午门·神武门')

// 特殊格子
setTile(6,  'forward',  '疾行 +3',  { steps: 3 })
setTile(10, 'backward', '迷路 -2',  { steps: 2 })
setTile(15, 'skip',     '休息一回合', {})
setTile(18, 'teleport', '穿越！',   { toTile: 26 })
setTile(22, 'backward', '绕路 -3',  { steps: 3 })
setTile(24, 'forward',  '捷径 +4',  { steps: 4 })
setTile(30, 'question', '答题格',   {})

// ========== 游戏状态 ==========
var playerPos = 0
var collected = [false, false, false, false]
var diceValue = 1
var diceRolling = false
var diceAngle = 0
var phase = 'roll'      // roll | move | done
var moveSteps = 0       // 剩余步数
var moveProgress = 0    // 0~1 当前步动画进度
var MOVE_SPEED = 0.08
var skipNext = false
var message = '点击骰子开始'
var messageTimer = 0

// ========== 掷骰子 ==========
function rollDice() {
  if (phase !== 'roll') return
  diceValue = Math.floor(Math.random() * 6) + 1
  diceRolling = true
  diceAngle = 0
  phase = 'rolling'
  message = '🎲 ' + diceValue + ' 点！'
  messageTimer = 60
}

// ========== 移动 ==========
function startMove() {
  moveSteps = diceValue
  moveProgress = 0
  phase = 'move'
}

// ========== 处理落脚格子 ==========
function handleLanding(tileIndex) {
  var tile = path[tileIndex]

  if (tile.type === 'checkpoint') {
    var ci = tile.data.cpIndex
    if (!collected[ci]) {
      collected[ci] = true
      message = '📍 打卡：' + tile.label
      messageTimer = 80
    }
  } else if (tile.type === 'forward') {
    var extra = tile.data.steps
    message = '⚡ 疾行 +' + extra + ' 步！'
    messageTimer = 60
    var newPos = (playerPos + extra) % TOTAL
    playerPos = newPos
    handleLanding(newPos)  // 递归处理连续触发
  } else if (tile.type === 'backward') {
    var back = tile.data.steps
    message = '🐢 后退 ' + back + ' 步…'
    messageTimer = 60
    var newPos2 = (playerPos - back + TOTAL) % TOTAL
    playerPos = newPos2
    handleLanding(newPos2)
  } else if (tile.type === 'skip') {
    message = '😴 休息一回合'
    messageTimer = 60
    skipNext = true
  } else if (tile.type === 'teleport') {
    var to = tile.data.toTile
    message = '🌀 传送到 ' + path[to].label + '！'
    messageTimer = 60
    playerPos = to
    handleLanding(to)
  } else if (tile.type === 'question') {
    message = '❓ 答题功能开发中…'
    messageTimer = 60
  } else if (tile.type === 'start_end') {
    // 检查是否全部打卡
    var allDone = collected.every(function (c) { return c })
    if (allDone) {
      message = '🏆 恭喜通关！'
      messageTimer = 999
      phase = 'done'
      return
    }
  }
}

// ========== 触摸事件 ==========
canvas.addEventListener('touchstart', function (e) {
  if (!e.touches || e.touches.length === 0) return
  var t = e.touches[0]
  var rect = canvas.getBoundingClientRect()
  var scaleX = canvas.width / rect.width
  var scaleY = canvas.height / rect.height
  var tx = (t.clientX - rect.left) * scaleX
  var ty = (t.clientY - rect.top) * scaleY

  // 骰子区域（屏幕右下）
  var diceX = boardX + cellSize * G + 60 * S
  var diceY = H / 2
  var diceSize = Math.min(160 * S, W - diceX - 20 * S)
  if (tx >= diceX && tx <= diceX + diceSize &&
      ty >= diceY - diceSize / 2 && ty <= diceY + diceSize / 2) {
    if (phase === 'roll') {
      rollDice()
    } else if (phase === 'done') {
      // 重置游戏
      playerPos = 0
      collected = [false, false, false, false]
      phase = 'roll'
      message = '点击骰子开始'
      messageTimer = 0
    }
  }
})

// ========== 渲染 ==========
function getPathXY(index) {
  var p = path[index]
  return {
    x: boardX + p.col * cellSize,
    y: boardY + p.row * cellSize,
  }
}

function drawBoard() {
  // 底色
  ctx.fillStyle = '#F5E6D3'
  ctx.fillRect(boardX, boardY, cellSize * G, cellSize * G)

  // 内部区域（紫禁城装饰）
  var innerX = boardX + cellSize
  var innerY = boardY + cellSize
  var innerW = cellSize * (G - 2)
  var innerH = cellSize * (G - 2)
  ctx.fillStyle = '#3E1F1F'
  ctx.fillRect(innerX, innerY, innerW, innerH)

  // 内部装饰文字
  ctx.fillStyle = '#D4AF37'
  var innerFont = Math.round(cellSize * 0.5) + 'px sans-serif'
  ctx.font = innerFont
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('故', innerX + innerW / 2 - cellSize * 1.2, innerY + innerH / 2)
  ctx.fillText('宫', innerX + innerW / 2 + cellSize * 1.2, innerY + innerH / 2)
  ctx.fillStyle = 'rgba(212,175,55,0.3)'
  ctx.font = Math.round(cellSize * 0.28) + 'px sans-serif'
  ctx.fillText('紫 禁 城', innerX + innerW / 2, innerY + innerH / 2 + cellSize * 0.8)

  // 路径格子
  for (var i = 0; i < path.length; i++) {
    var p = path[i]
    var x = boardX + p.col * cellSize
    var y = boardY + p.row * cellSize
    var pad = 3

    var fillColor = '#E8D5B7'
    if (p.type === 'checkpoint') fillColor = '#FF9800'
    else if (p.type === 'forward') fillColor = '#81C784'
    else if (p.type === 'backward') fillColor = '#EF9A9A'
    else if (p.type === 'skip') fillColor = '#B0BEC5'
    else if (p.type === 'teleport') fillColor = '#CE93D8'
    else if (p.type === 'question') fillColor = '#64B5F6'
    else if (p.type === 'start_end') fillColor = '#D4AF37'

    ctx.fillStyle = fillColor
    ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)

    // 边框
    ctx.strokeStyle = '#C8B898'
    ctx.lineWidth = 1
    ctx.strokeRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)

    // 文字标签
    if (p.label) {
      var fs = Math.round(cellSize * 0.22)
      if (p.type === 'start_end') fs = Math.round(cellSize * 0.2)
      ctx.fillStyle = '#333'
      ctx.font = 'bold ' + fs + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.label, x + cellSize / 2, y + cellSize / 2)
    }

    // 打卡标记
    if (p.type === 'checkpoint') {
      var ci = p.data.cpIndex
      if (collected[ci]) {
        ctx.fillStyle = 'rgba(76,175,80,0.7)'
        ctx.beginPath()
        ctx.arc(x + cellSize - pad - 8, y + pad + 8, cellSize * 0.22, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold ' + Math.round(cellSize * 0.22) + 'px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('✓', x + cellSize - pad - 8, y + pad + 8)
      }
    }
  }
}

function drawPlayer() {
  var pos = getPathXY(playerPos)
  var x = pos.x + cellSize / 2
  var y = pos.y + cellSize / 2
  var r = cellSize * 0.32

  // 走路弹跳
  var bounce = 0
  if (phase === 'move') {
    bounce = Math.sin(moveProgress * Math.PI) * cellSize * 0.15
  }

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.arc(x + 2, y + 2 + r * 0.5, r * 0.7, 0, Math.PI * 2)
  ctx.fill()

  // 身体
  ctx.fillStyle = '#1976D2'
  ctx.beginPath()
  ctx.arc(x, y - bounce, r, 0, Math.PI * 2)
  ctx.fill()

  // 红帽
  ctx.fillStyle = '#E53935'
  ctx.beginPath()
  ctx.arc(x, y - bounce - r * 0.35, r * 0.75, Math.PI, 0)
  ctx.fill()

  // 脸
  ctx.fillStyle = '#FFE0B2'
  ctx.beginPath()
  ctx.arc(x, y - bounce - 2, r * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // 眼睛
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - r * 0.18, y - bounce - r * 0.12, r * 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + r * 0.18, y - bounce - r * 0.12, r * 0.1, 0, Math.PI * 2)
  ctx.fill()
}

function drawDice(x, y, size) {
  // 骰子背景
  ctx.fillStyle = '#FFF'
  ctx.fillRect(x, y - size / 2, size, size)

  // 边框
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 3
  ctx.strokeRect(x, y - size / 2, size, size)

  // 点数
  var dots = {
    1: [[0.5, 0.5]],
    2: [[0.25, 0.25], [0.75, 0.75]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
  }
  var set = dots[diceValue]
  var dotR = size * 0.08
  for (var d = 0; d < set.length; d++) {
    var dx = x + set[d][0] * size
    var dy = y - size / 2 + set[d][1] * size
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(dx, dy, dotR, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawHUD() {
  // 顶部栏
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(0, 0, W, 44 * S)

  // 打卡进度
  var totalCollected = collected.filter(function (c) { return c }).length
  ctx.fillStyle = '#FFC107'
  ctx.font = 'bold ' + Math.round(20 * S) + 'px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('故宫飞行棋', 16 * S, 22 * S)

  // 打卡点状态
  var ckNames = ['太和门', '太和殿', '乾清宫', '御花园']
  var ckStr = ''
  for (var k = 0; k < 4; k++) {
    ckStr += (collected[k] ? '✅' : '⬜') + ckNames[k] + ' '
  }
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = Math.round(14 * S) + 'px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(ckStr, W - 16 * S, 22 * S)
}

function drawInfoPanel() {
  var px = boardX + cellSize * G + 30 * S
  var py = 60 * S
  var pw = W - px - 16 * S
  var ph = H - py - 60 * S

  if (pw < 100 * S) return

  // 面板背景
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(px, py, pw, ph)

  // 骰子标签
  ctx.fillStyle = '#FFF'
  ctx.font = 'bold ' + Math.round(18 * S) + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('🎲 点击掷骰子', px + pw / 2, py + 16 * S)

  // 骰子
  var diceSize = Math.min(130 * S, pw - 40 * S)
  var diceX = px + (pw - diceSize) / 2
  var diceY = py + 80 * S
  drawDice(diceX, diceY, diceSize)

  // 消息
  if (messageTimer > 0) {
    ctx.fillStyle = '#FFC107'
    ctx.font = 'bold ' + Math.round(16 * S) + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(message, px + pw / 2, diceY + diceSize / 2 + 30 * S)
  }

  // 图例
  var legendY = py + ph - 120 * S
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = Math.round(13 * S) + 'px sans-serif'
  ctx.textAlign = 'left'
  var legends = [
    { color: '#FF9800', text: '橙=打卡点' },
    { color: '#81C784', text: '绿=前进' },
    { color: '#EF9A9A', text: '红=后退' },
    { color: '#B0BEC5', text: '灰=休息' },
    { color: '#CE93D8', text: '紫=传送' },
    { color: '#64B5F6', text: '蓝=答题' },
    { color: '#D4AF37', text: '金=终点' },
  ]
  for (var l = 0; l < legends.length; l++) {
    var ly = legendY + l * 16 * S
    ctx.fillStyle = legends[l].color
    ctx.fillRect(px + 12, ly + 2, 10, 10)
    ctx.fillStyle = '#FFF'
    ctx.fillText(legends[l].text, px + 28, ly + 8)
  }
}

// ========== 主循环 ==========
function gameLoop() {
  // 状态机
  if (phase === 'rolling') {
    diceAngle += 0.3
    if (diceAngle > 2.5) {
      diceAngle = 0
      diceRolling = false
      if (skipNext) {
        skipNext = false
        message = '😴 跳过本回合'
        messageTimer = 60
        phase = 'roll'
      } else {
        startMove()
      }
    }
  }

  if (phase === 'move') {
    moveProgress += MOVE_SPEED
    if (moveProgress >= 1) {
      moveProgress = 0
      moveSteps--
      playerPos = (playerPos + 1) % TOTAL
      if (moveSteps <= 0) {
        handleLanding(playerPos)
        if (phase !== 'done') {
          phase = 'roll'
        }
      }
    }
  }

  if (messageTimer > 0) messageTimer--

  // 渲染
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#2D1515'
  ctx.fillRect(0, 0, W, H)

  drawBoard()
  drawPlayer()
  drawHUD()
  drawInfoPanel()

  requestAnimationFrame(gameLoop)
}

gameLoop()
