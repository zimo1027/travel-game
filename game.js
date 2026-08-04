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
var tileSize = Math.floor(H * 0.78 / (ROWS * 1.35))
var gapY = tileSize * 0.35
var boardW = COLS * tileSize
var boardH = ROWS * tileSize + (ROWS - 1) * gapY
var boardX = (W - boardW) / 2
var boardY = (H - boardH) / 2

// 计算格子在棋盘上的像素坐标
function tileX(col) { return boardX + col * tileSize }
function tileY(row) { return boardY + row * (tileSize + gapY) }

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

  // 行间背景线（分隔各行）
  for (var r = 0; r < ROWS; r++) {
    var rowTop = tileY(r)
    ctx.fillStyle = r % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.08)'
    ctx.fillRect(boardX, rowTop, boardW, tileSize)
  }

  // 路径格子
  for (var i = 0; i < path.length; i++) {
    var p = path[i]
    var x = tileX(p.col)
    var y = tileY(p.row)
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
    ctx.fillRect(x + pad, y + pad, tileSize - pad * 2, tileSize - pad * 2)

    // 圆角感：四角小圆弧
    ctx.strokeStyle = '#C8B898'
    ctx.lineWidth = 1
    ctx.strokeRect(x + pad, y + pad, tileSize - pad * 2, tileSize - pad * 2)

    // 格子标签
    if (p.label) {
      var fs = Math.round(tileSize * 0.22)
      ctx.fillStyle = '#333'
      ctx.font = 'bold ' + fs + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.label, x + tileSize / 2, y + tileSize / 2)
    }
  }

  // 行内连接线（水平相邻）
  for (var j = 0; j < path.length - 1; j++) {
    var a = path[j]
    var b = path[j + 1]
    if (a.row !== b.row) continue  // 跨行连接单独处理

    var ax = tileX(a.col) + tileSize
    var ay = tileY(a.row) + tileSize / 2
    var bx = tileX(b.col)
    var by = tileY(b.row) + tileSize / 2

    ctx.strokeStyle = '#8B5E3C'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.stroke()

    // 箭头标记
    var arrowX = (ax + bx) / 2
    var arrowY = ay
    ctx.fillStyle = '#8B5E3C'
    ctx.beginPath()
    ctx.arc(arrowX, arrowY, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // 跨行连接线（垂直/对角，蛇形拐弯处）
  for (var k = 0; k < path.length - 1; k++) {
    var c = path[k]
    var d = path[k + 1]
    if (c.row === d.row) continue

    var cx = tileX(c.col) + tileSize / 2
    var cy = tileY(c.row) + tileSize
    var dx = tileX(d.col) + tileSize / 2
    var dy = tileY(d.row)

    ctx.strokeStyle = '#8B5E3C'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(dx, dy)
    ctx.stroke()

    var turnX = cx
    var turnY = (cy + dy) / 2
    ctx.fillStyle = '#8B5E3C'
    ctx.beginPath()
    ctx.arc(turnX, turnY, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

draw()
