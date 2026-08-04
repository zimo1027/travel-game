// 故宫飞行棋 — 盘面
var canvas = wx.createCanvas()
var ctx = canvas.getContext('2d')

// ========== 屏幕尺寸（统一用系统逻辑像素） ==========
var sysInfo = wx.getSystemInfoSync()
var W = sysInfo.windowWidth
var H = sysInfo.windowHeight

// ========== 13x13 棋盘参数 ==========
var SIZE = 13
var MID = Math.floor(SIZE / 2)
var cellSize, boardPx, boardX, boardY

function recalcLayout() {
  var info = wx.getSystemInfoSync()
  W = info.windowWidth
  H = info.windowHeight
  var short = Math.min(W, H)
  cellSize = Math.floor(short * 0.92 / SIZE)
  boardPx = SIZE * cellSize
  boardX = (W - boardPx) / 2
  boardY = (H - boardPx) / 2
}

function cx(col) { return boardX + col * cellSize }
function cy(row) { return boardY + row * cellSize }

// ========== 路径 ==========
// 中轴线(下→上) → 外圈顶部(中→右) → 右侧(上→下) → 底部(右→左)
// → 左侧(下→上) → 顶部(左→回中轴附近)，每个格子唯一
var path = []

// 第1段：中轴线，从南(下)向北(上)走到顶
for (var r = SIZE - 1; r >= 1; r--) { path.push({ row: r, col: MID }) }

// 第2段：顶部中→右（包含(0,MID)这个连接点）
for (var c = MID; c < SIZE; c++) { path.push({ row: 0, col: c }) }

// 第3段：右列，上→下
for (var r = 1; r < SIZE; r++) { path.push({ row: r, col: SIZE - 1 }) }

// 第4段：底行，右→左
for (var c = SIZE - 2; c >= 0; c--) { path.push({ row: SIZE - 1, col: c }) }

// 第5段：左列，下→上
for (var r = SIZE - 2; r >= 0; r--) { path.push({ row: r, col: 0 }) }

// 第6段：顶行左→中轴附近（在(0,MID)左边停）
for (var c = 1; c < MID; c++) { path.push({ row: 0, col: c }) }

// ========== 格子类型 ==========
for (var i = 0; i < path.length; i++) { path[i].type = 'normal' }
function set(i, type, label) { path[i].type = type; path[i].label = label }

// --- 中轴线(0~11)：午门 → ... → 御花园 ---
//        r=12...r=1, col=6
set(0,  'start',      '午门')
set(2,  'checkpoint', '太和门')
set(4,  'checkpoint', '太和殿')
set(6,  'forward',    '+3')
set(7,  'checkpoint', '乾清宫')
set(9,  'skip',       '休')
set(10, 'backward',   '-2')
set(11, 'checkpoint', '御花园')

// --- 外圈(12~59)：侧翼景点 ---
// 12~18: 顶行 r=0, c=6..12
set(15, 'checkpoint', '文华殿')
// 19~30: 右列 r=1..12, c=12
set(22, 'forward',    '+3')
set(26, 'checkpoint', '九龙壁')
// 31~42: 底行 r=12, c=11..0
set(34, 'backward',   '-3')
set(38, 'checkpoint', '慈宁宫')
// 43~54: 左列 r=11..0, c=0
set(43, 'checkpoint', '珍宝馆')
set(47, 'teleport',   '穿')
set(51, 'skip',       '休')
set(53, 'forward',    '+4')
// 55~59: 顶行回到中轴旁 r=0, c=1..5

// --- 终点 ---
set(path.length - 1, 'end', '神武门')

// ========== 渲染 ==========
function draw() {
  recalcLayout()

  // 深色背景
  ctx.fillStyle = '#1A0A0A'
  ctx.fillRect(0, 0, W, H)

  // 棋盘底板
  var pad6 = Math.round(6 * Math.min(W, H) / 667)
  ctx.fillStyle = '#F5E6D3'
  ctx.fillRect(boardX - pad6, boardY - pad6, boardPx + pad6 * 2, boardPx + pad6 * 2)

  // 外木框
  var frameW = Math.round(8 * Math.min(W, H) / 667)
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = frameW
  ctx.strokeRect(boardX - pad6, boardY - pad6, boardPx + pad6 * 2, boardPx + pad6 * 2)

  // 内框线
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = Math.round(2 * Math.min(W, H) / 667)
  ctx.strokeRect(boardX + cellSize, boardY + cellSize,
                 cellSize * (SIZE - 2), cellSize * (SIZE - 2))

  // 中轴线高亮条
  var midX = cx(MID)
  ctx.fillStyle = 'rgba(212,175,55,0.12)'
  ctx.fillRect(midX, boardY + cellSize, cellSize, cellSize * (SIZE - 2))

  // 画所有格子
  for (var i = 0; i < path.length; i++) {
    var p = path[i]
    var x = cx(p.col)
    var y = cy(p.row)
    var pad = Math.round(cellSize * 0.06)
    var onAxis = (p.col === MID)

    var color = '#E8D5B7'
    if (p.type === 'checkpoint') color = '#FF9800'
    else if (p.type === 'forward')   color = '#81C784'
    else if (p.type === 'backward')  color = '#EF9A9A'
    else if (p.type === 'skip')      color = '#B0BEC5'
    else if (p.type === 'teleport')  color = '#CE93D8'
    else if (p.type === 'start')     color = '#D4AF37'
    else if (p.type === 'end')       color = '#D4AF37'

    ctx.fillStyle = color
    ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)

    // 中轴线格子加粗边框
    ctx.strokeStyle = onAxis ? '#C23B2A' : '#C8B898'
    ctx.lineWidth = onAxis ? Math.max(2, Math.round(cellSize * 0.04)) : 1
    ctx.strokeRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2)

    // 序号
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.font = Math.round(cellSize * 0.15) + 'px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(String(i + 1), x + pad + 2, y + pad + 1)

    // 标签
    if (p.label) {
      var fs = Math.round(cellSize * 0.17)
      ctx.fillStyle = '#333'
      ctx.font = 'bold ' + fs + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.label, x + cellSize / 2, y + cellSize / 2)
    }
  }
}

// ========== 启动 ==========
recalcLayout()
draw()

// 窗口变化时重绘
wx.onWindowResize(function () {
  recalcLayout()
  draw()
})
