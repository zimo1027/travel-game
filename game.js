// 故宫深度游 — 走格子游戏
var canvas = wx.createCanvas()
var ctx = canvas.getContext('2d')
var W = canvas.width
var H = canvas.height

// ========== 网格参数 ==========
var ROWS = 8
var COLS = 14
var cellSize = Math.floor(Math.min(W / COLS, H / ROWS))
var gridW = COLS * cellSize
var gridH = ROWS * cellSize
var offsetX = (W - gridW) / 2
var offsetY = (H - gridH) / 2

// ========== 地图数据: 0=路 1=障碍 2=打卡点 ==========
var gridData = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

// ========== 打卡点数据 ==========
var checkpoints = [
  { row: 0, col: 2,  name: '午门',   collected: false },
  { row: 2, col: 6,  name: '太和殿', collected: false },
  { row: 3, col: 11, name: '乾清门', collected: false },
  { row: 6, col: 2,  name: '中和殿', collected: false },
  { row: 6, col: 12, name: '御花园', collected: false },
]
// 在地图上标记打卡点
for (var cp = 0; cp < checkpoints.length; cp++) {
  gridData[checkpoints[cp].row][checkpoints[cp].col] = 2
}

// ========== 玩家状态 ==========
var playerRow = 0
var playerCol = 0
var targetRow = -1
var targetCol = -1
var pathQueue = []  // BFS 路径
var moveTimer = 0
var MOVE_SPEED = 8  // 帧

// ========== BFS 寻路 ==========
function findPath(sr, sc, er, ec) {
  var visited = []
  var prev = []
  for (var r = 0; r < ROWS; r++) {
    visited[r] = []
    prev[r] = []
    for (var c = 0; c < COLS; c++) {
      visited[r][c] = false
      prev[r][c] = null
    }
  }

  var queue = [{ r: sr, c: sc }]
  visited[sr][sc] = true

  var dirs = [[-1,0],[1,0],[0,-1],[0,1]]
  while (queue.length > 0) {
    var cur = queue.shift()
    if (cur.r === er && cur.c === ec) {
      // 回溯路径
      var path = []
      var node = cur
      while (node.r !== sr || node.c !== sc) {
        path.unshift({ r: node.r, c: node.c })
        node = prev[node.r][node.c]
      }
      return path
    }
    for (var d = 0; d < 4; d++) {
      var nr = cur.r + dirs[d][0]
      var nc = cur.c + dirs[d][1]
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
          !visited[nr][nc] && gridData[nr][nc] !== 1) {
        visited[nr][nc] = true
        prev[nr][nc] = cur
        queue.push({ r: nr, c: nc })
      }
    }
  }
  return []  // 不可达
}

// ========== 触摸事件 ==========
wx.onTouchStart(function (e) {
  if (e.touches.length === 0) return
  var t = e.touches[0]
  var col = Math.floor((t.x - offsetX) / cellSize)
  var row = Math.floor((t.y - offsetY) / cellSize)

  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return
  if (gridData[row][col] === 1) return  // 障碍
  if (pathQueue.length > 0) return       // 正在行走中

  pathQueue = findPath(playerRow, playerCol, row, col)
})

// ========== 渲染 ==========
function drawGrid() {
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var x = offsetX + c * cellSize
      var y = offsetY + r * cellSize
      var pad = 2

      if (gridData[r][c] === 1) {
        // 障碍（石狮）
        ctx.fillStyle = '#666'
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)
        ctx.fillStyle = '#888'
        ctx.fillRect(x + pad + 3, y + pad + 3, cellSize - (pad + 3) * 2, cellSize - (pad + 3) * 2)
        // 狮子图标
        ctx.fillStyle = '#AAA'
        ctx.font = Math.round(cellSize * 0.45) + 'px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🦁', x + cellSize / 2, y + cellSize / 2)
      } else {
        // 地面
        var shade = (r + c) % 2 === 0 ? '#D4C4A0' : '#C8B898'
        ctx.fillStyle = shade
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)
      }
    }
  }
}

function drawCheckpoints() {
  for (var i = 0; i < checkpoints.length; i++) {
    var cp = checkpoints[i]
    var x = offsetX + cp.col * cellSize + cellSize / 2
    var y = offsetY + cp.row * cellSize + cellSize / 2
    var r = cellSize * 0.3

    if (cp.collected) {
      ctx.fillStyle = 'rgba(76,175,80,0.5)'
      ctx.beginPath()
      ctx.arc(x, y, r + 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // 旗标
    var pulse = Math.sin(Date.now() / 600 + i) * 0.2 + 0.6
    ctx.fillStyle = 'rgba(229,57,53,' + pulse + ')'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFF'
    ctx.font = 'bold ' + Math.round(cellSize * 0.25) + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(i + 1, x, y)
  }
}

function drawPlayer() {
  var x = offsetX + playerCol * cellSize + cellSize / 2
  var y = offsetY + playerRow * cellSize + cellSize / 2
  var r = cellSize * 0.35

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2)
  ctx.fill()

  // 身体
  ctx.fillStyle = '#1976D2'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  // 帽子
  ctx.fillStyle = '#E53935'
  ctx.beginPath()
  ctx.arc(x, y - r * 0.35, r * 0.8, Math.PI, 0)
  ctx.fill()

  // 脸
  ctx.fillStyle = '#FFE0B2'
  ctx.beginPath()
  ctx.arc(x, y - 2, r * 0.55, 0, Math.PI * 2)
  ctx.fill()

  // 眼睛
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - r * 0.18, y - r * 0.15, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + r * 0.18, y - r * 0.15, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

function drawHUD() {
  var collected = checkpoints.filter(function(c) { return c.collected }).length
  var total = checkpoints.length

  // 顶部栏
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.fillRect(0, 0, W, 50)

  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('故宫深度游', 20, 25)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#FFC107'
  ctx.fillText('已打卡 ' + collected + ' / ' + total, W - 20, 25)
}

// ========== 游戏循环 ==========
function gameLoop() {
  // 移动动画
  if (pathQueue.length > 0) {
    moveTimer++
    if (moveTimer >= MOVE_SPEED) {
      moveTimer = 0
      var next = pathQueue.shift()
      playerRow = next.r
      playerCol = next.c

      // 检查是否到达打卡点
      for (var i = 0; i < checkpoints.length; i++) {
        var cp = checkpoints[i]
        if (!cp.collected && cp.row === playerRow && cp.col === playerCol) {
          cp.collected = true
        }
      }
    }
  }

  // 渲染
  ctx.clearRect(0, 0, W, H)
  drawGrid()
  drawCheckpoints()
  drawPlayer()
  drawHUD()

  requestAnimationFrame(gameLoop)
}

gameLoop()
