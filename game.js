// 故宫飞行棋 — 盘面
var canvas = wx.createCanvas()
var ctx = canvas.getContext('2d')

var W = canvas.width
var H = canvas.height

// ========== 11x11 棋盘 ==========
var SIZE = 11
var cellSize = Math.floor(Math.min(W, H) * 0.78 / SIZE)
var boardPx = SIZE * cellSize
var boardX = (W - boardPx) / 2
var boardY = (H - boardPx) / 2

function cx(col) { return boardX + col * cellSize }
function cy(row) { return boardY + row * cellSize }

// ========== 路径定义 ==========
// 外围一圈顺时针 + 从左边中间拐入中心
var path = []

// 顶边: (0,0)→(0,10) 左到右
for (var c = 0; c < SIZE; c++) { path.push({ row: 0, col: c }) }
// 右边: (1,10)→(10,10) 上到下
for (var r = 1; r < SIZE; r++) { path.push({ row: r, col: SIZE - 1 }) }
// 底边: (10,9)→(10,0) 右到左
for (var c = SIZE - 2; c >= 0; c--) { path.push({ row: SIZE - 1, col: c }) }
// 左边: (9,0)→(5,0) 下到上，到中间位置拐弯
for (var r = SIZE - 2; r >= 5; r--) { path.push({ row: r, col: 0 }) }

// 拐入中心：(5,1)→(5,2)→(5,3)→(5,4)→(5,5)
for (var c2 = 1; c2 <= 5; c2++) { path.push({ row: 5, col: c2 }) }

// 中心点就是终点索引
var TURN_IDX = path.length - 6  // 拐弯处的前一个格子索引（左边缘最后一个）

// ========== 格子类型 ==========
for (var i = 0; i < path.length; i++) { path[i].type = 'normal' }
function set(i, type, label) { path[i].type = type; path[i].label = label }

// 起点
set(0, 'start', '午门')

// 外圈打卡点
set(8,  'checkpoint', '太和门')
set(18, 'checkpoint', '太和殿')
set(28, 'checkpoint', '乾清宫')

// 外圈特殊格
set(5,  'forward',  '+3')
set(13, 'backward', '-2')
set(16, 'skip',     '休')
set(22, 'teleport', '穿')
set(25, 'forward',  '+4')
set(32, 'backward', '-2')

// 内圈（拐入中心轴线）
set(37, 'checkpoint', '御花园')
set(38, 'forward',  '+2')
set(39, 'skip',     '休')
set(path.length - 1, 'end', '神武门')

// ========== 渲染 ==========
function draw() {
  // 背景
  ctx.fillStyle = '#1A0A0A'
  ctx.fillRect(0, 0, W, H)

  // 棋盘底板（方形）
  ctx.fillStyle = '#F5E6D3'
  ctx.fillRect(boardX - 6, boardY - 6, boardPx + 12, boardPx + 12)

  // 木框
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 8
  ctx.strokeRect(boardX - 6, boardY - 6, boardPx + 12, boardPx + 12)

  // 内框（分隔外圈和内部）
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 3
  ctx.strokeRect(boardX + cellSize, boardY + cellSize,
                 cellSize * (SIZE - 2), cellSize * (SIZE - 2))

  // 内部十字装饰线
  var midX = boardX + cellSize * SIZE / 2
  var midY = boardY + cellSize * SIZE / 2
  ctx.strokeStyle = 'rgba(139,69,19,0.3)'
  ctx.lineWidth = 1
  // 竖线
  ctx.beginPath()
  ctx.moveTo(midX, boardY + cellSize)
  ctx.lineTo(midX, boardY + cellSize * (SIZE - 1))
  ctx.stroke()
  // 横线
  ctx.beginPath()
  ctx.moveTo(boardX + cellSize, midY)
  ctx.lineTo(boardX + cellSize * (SIZE - 1), midY)
  ctx.stroke()

  // 内部故宫字样
  ctx.fillStyle = 'rgba(212,175,55,0.15)'
  var big = Math.round(cellSize * 1.2) + 'px sans-serif'
  ctx.font = big
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('紫禁城', midX, midY)

  // 画格子
  for (var i = 0; i < path.length; i++) {
    var p = path[i]
    var x = cx(p.col)
    var y = cy(p.row)
    var pad = 3

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

    ctx.strokeStyle = '#C8B898'
    ctx.lineWidth = 1
    ctx.strokeRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)

    // 序号
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.font = Math.round(cellSize * 0.16) + 'px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(i + 1, x + pad + 2, y + pad + 1)

    // 标签
    if (p.label) {
      var fs = Math.round(cellSize * 0.18)
      ctx.fillStyle = '#333'
      ctx.font = 'bold ' + fs + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.label, x + cellSize / 2, y + cellSize / 2)
    }
  }

  // 进入内圈的红色拐弯箭头
  var turnCell = path[TURN_IDX]
  var innerCell = path[TURN_IDX + 1]
  var tax = cx(turnCell.col) + cellSize / 2
  var tay = cy(turnCell.row) + cellSize / 2
  var tbx = cx(innerCell.col) + cellSize / 2
  var tby = cy(innerCell.row) + cellSize / 2

  ctx.strokeStyle = '#C23B2A'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(tax, tay)
  ctx.lineTo(tbx, tby)
  ctx.stroke()
  ctx.fillStyle = '#C23B2A'
  ctx.beginPath()
  ctx.arc((tax + tbx) / 2, (tay + tby) / 2, 4, 0, Math.PI * 2)
  ctx.fill()
}

draw()
