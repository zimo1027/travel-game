// 故宫飞行棋 — 仅盘面
var canvas = wx.createCanvas()
var ctx = canvas.getContext('2d')

// ========== 屏幕适配 ==========
var W = canvas.width
var H = canvas.height
var S = H / 667

// ========== 棋盘参数 ==========
var ROWS = 7
var COLS = 9
var cellSize = Math.floor(H * 0.78 / ROWS)
var boardW = COLS * cellSize
var boardH = ROWS * cellSize
var boardX = (W - boardW) / 2
var boardY = (H - boardH) / 2

// ========== 蛇形路径 ==========
var path = []
for (var r = 0; r < ROWS; r++) {
  if (r % 2 === 0) {
    for (var c = 0; c < COLS; c++) { path.push({ row: r, col: c }) }
  } else {
    for (var c = COLS - 1; c >= 0; c--) { path.push({ row: r, col: c }) }
  }
}

// 格子类型
for (var i = 0; i < path.length; i++) { path[i].type = 'normal' }
function setTile(i, type, label) { path[i].type = type; path[i].label = label }

// 起点 + 终点
setTile(0, 'start', '午门')
setTile(path.length - 1, 'end', '神武门')

// 打卡点
setTile(12, 'checkpoint', '太和门')
setTile(26, 'checkpoint', '太和殿')
setTile(40, 'checkpoint', '乾清宫')
setTile(54, 'checkpoint', '御花园')

// 特殊格
setTile(5,  'forward',  '+3')
setTile(9,  'backward', '-2')
setTile(16, 'forward',  '+4')
setTile(18, 'skip',     '休')
setTile(23, 'teleport', '穿')
setTile(31, 'backward', '-3')
setTile(35, 'question', '答')
setTile(38, 'forward',  '+3')
setTile(44, 'skip',     '休')
setTile(48, 'backward', '-2')
setTile(50, 'teleport', '穿')
setTile(57, 'forward',  '+4')

// ========== 渲染 ==========
function draw() {
  // 背景
  ctx.fillStyle = '#2D1515'
  ctx.fillRect(0, 0, W, H)

  // 棋盘底板
  ctx.fillStyle = '#F5E6D3'
  ctx.fillRect(boardX - 4, boardY - 4, boardW + 8, boardH + 8)

  // 木框
  ctx.strokeStyle = '#8B5E3C'
  ctx.lineWidth = 8
  ctx.strokeRect(boardX - 4, boardY - 4, boardW + 8, boardH + 8)

  for (var i = 0; i < path.length; i++) {
    var p = path[i]
    var x = boardX + p.col * cellSize
    var y = boardY + p.row * cellSize
    var pad = 2

    // 底色
    var color = '#E8D5B7'
    if (p.type === 'checkpoint') color = '#FF9800'
    else if (p.type === 'forward')   color = '#81C784'
    else if (p.type === 'backward')  color = '#EF9A9A'
    else if (p.type === 'skip')      color = '#B0BEC5'
    else if (p.type === 'teleport')  color = '#CE93D8'
    else if (p.type === 'question')  color = '#64B5F6'
    else if (p.type === 'start')     color = '#D4AF37'
    else if (p.type === 'end')       color = '#D4AF37'

    ctx.fillStyle = color
    ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)

    // 边框
    ctx.strokeStyle = '#C8B898'
    ctx.lineWidth = 1
    ctx.strokeRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)

    // 格子标签
    if (p.label) {
      var fs = Math.round(cellSize * 0.22)
      ctx.fillStyle = '#333'
      ctx.font = 'bold ' + fs + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.label, x + cellSize / 2, y + cellSize / 2)
    }
  }

  // 相邻格连接点
  for (var j = 0; j < path.length - 1; j++) {
    var a = path[j]
    var b = path[j + 1]
    var mx = boardX + (a.col + b.col) * cellSize / 2 + cellSize / 2
    var my = boardY + (a.row + b.row) * cellSize / 2 + cellSize / 2
    ctx.fillStyle = 'rgba(139,94,60,0.5)'
    ctx.beginPath()
    ctx.arc(mx, my, cellSize * 0.06, 0, Math.PI * 2)
    ctx.fill()
  }
}

draw()
