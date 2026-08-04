// UI 模块 — HUD、弹窗、通关画面

// 弹窗状态
var popup = null  // { title, body, btnText, onClose }

function showPopup(title, body, btnText, onClose) {
  popup = { title: title, body: body, btnText: btnText || '确定', onClose: onClose }
}

function isPopupOpen() {
  return popup !== null
}

function getPopupSize(canvasW, canvasH) {
  var pw = Math.min(580, canvasW * 0.9)
  var ph = Math.min(500, canvasH * 0.62)
  return { pw: pw, ph: ph }
}

function handlePopupClick(x, y, canvasW, canvasH) {
  if (!popup) return false

  var s = getPopupSize(canvasW, canvasH)
  var px = (canvasW - s.pw) / 2
  var py = (canvasH - s.ph) / 2

  // 按钮区域
  var btnW = s.pw * 0.45
  var btnH = 64
  var btnX = (canvasW - btnW) / 2
  var btnY = py + s.ph - 100

  if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
    var cb = popup.onClose
    popup = null
    if (cb) cb()
    return true
  }
  return false
}

function drawHUD(ctx, level, collected, total, canvasW) {
  // 顶部栏背景
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  var barH = 90
  ctx.fillRect(0, 0, canvasW, barH)

  // 关卡名
  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 30px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(level.name + ' · ' + level.subtitle, 28, 12)

  // 打卡进度
  ctx.fillStyle = '#FFC107'
  ctx.font = '22px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('打卡 ' + collected + '/' + total, canvasW - 28, 16)

  // 进度条
  var barW = canvasW - 56
  var barY = 56
  var barH2 = 14
  var progress = total > 0 ? collected / total : 0

  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.roundRect(28, barY, barW, barH2, 7)
  ctx.fill()

  if (progress > 0) {
    var grad = ctx.createLinearGradient(28, 0, 28 + barW * progress, 0)
    grad.addColorStop(0, '#FFC107')
    grad.addColorStop(1, '#FF9800')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(28, barY, barW * progress, barH2, 7)
    ctx.fill()
  }

  // 进度圆点
  for (var i = 0; i < total; i++) {
    var dx = 28 + (barW / (total - 1 || 1)) * i
    ctx.fillStyle = i < collected ? '#FFC107' : 'rgba(255,255,255,0.4)'
    ctx.beginPath()
    ctx.arc(dx, barY + barH2 / 2, 8, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPopup(ctx, canvasW, canvasH) {
  if (!popup) return

  // 遮罩
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // 弹窗（响应式尺寸）
  var s = getPopupSize(canvasW, canvasH)
  var pw = s.pw
  var ph = s.ph
  var px = (canvasW - pw) / 2
  var py = (canvasH - ph) / 2

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath()
  ctx.roundRect(px + 6, py + 6, pw, ph, 24)
  ctx.fill()

  // 背景
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, 24)
  ctx.fill()

  // 标题
  ctx.fillStyle = '#333'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(popup.title, canvasW / 2, py + 36)

  // 图标
  ctx.font = '56px sans-serif'
  ctx.fillText('📍', canvasW / 2, py + 80)

  // 正文（自适应行数）
  ctx.fillStyle = '#666'
  ctx.font = '24px sans-serif'
  var maxW = pw - 60
  var lines = wrapText(ctx, popup.body || '', maxW)
  var lineH = 36
  var maxLines = Math.floor((ph - 260) / lineH)
  var textStartY = py + 150
  for (var i = 0; i < lines.length && i < maxLines; i++) {
    ctx.fillText(lines[i], canvasW / 2, textStartY + i * lineH)
  }

  // 按钮
  var btnW = pw * 0.45
  var btnH = 64
  var btnX = (canvasW - btnW) / 2
  var btnY = py + ph - 100
  ctx.fillStyle = '#FF9800'
  ctx.beginPath()
  ctx.roundRect(btnX, btnY, btnW, btnH, 32)
  ctx.fill()
  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 26px sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(popup.btnText, canvasW / 2, btnY + btnH / 2)
}

function drawLevelComplete(ctx, nextLevel, canvasW, canvasH) {
  // 遮罩
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // 主体（响应式）
  var pw = Math.min(500, canvasW * 0.85)
  var ph = Math.min(380, canvasH * 0.55)
  var px = (canvasW - pw) / 2
  var py = (canvasH - ph) / 2
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, 24)
  ctx.fill()

  // 庆祝图标
  ctx.font = '56px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('🎉', canvasW / 2, py + 56)

  // 标题
  ctx.fillStyle = '#333'
  ctx.font = 'bold 34px sans-serif'
  ctx.fillText('恭喜通关！', canvasW / 2, py + 130)

  // 返回菜单按钮
  var btnW = pw * 0.5
  var btnH = 64
  var btnX = (canvasW - btnW) / 2
  var btnY = py + ph - 100
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath()
  ctx.roundRect(btnX, btnY, btnW, btnH, 32)
  ctx.fill()
  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 26px sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('返回首页', canvasW / 2, btnY + btnH / 2)
}

// ============ 主菜单 ============
function drawMenu(ctx, levels, canvasW, canvasH) {
  var W = canvasW
  var H = canvasH

  // 背景
  var bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#3E1F1F')
  bgGrad.addColorStop(0.5, '#5C2A2A')
  bgGrad.addColorStop(1, '#3E1F1F')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // 装饰纹理
  ctx.fillStyle = 'rgba(212, 175, 55, 0.03)'
  for (var i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.arc(W * 0.2 + i * 37, H * 0.3 + (i % 3) * 40, 80, 0, Math.PI * 2)
    ctx.fill()
  }

  // 标题
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 52px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('故宫深度游', W / 2, H * 0.06)

  // 副标题
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '22px sans-serif'
  ctx.fillText('选择你的游览难度', W / 2, H * 0.17)

  // 三张难度卡片
  var cardW = Math.min(340, W * 0.28)
  var cardH = Math.min(420, H * 0.68)
  var gap = (W - cardW * 3) / 4
  var cardY = H * 0.26

  var configs = [
    { icon: '🚶', color: '#4CAF50', name: '浅度游玩', desc: '中轴线精华', points: '4个景点', time: '约2小时', accent: 'green' },
    { icon: '🏃', color: '#FF9800', name: '中度游玩', desc: '中轴线标准游', points: '6个景点', time: '约3小时', accent: 'orange' },
    { icon: '🧗', color: '#E53935', name: '深度游玩', desc: '中轴线+侧翼全览', points: '14个景点', time: '约6小时', accent: 'red' },
  ]

  for (var j = 0; j < 3; j++) {
    var cfg = configs[j]
    var cx = gap + j * (cardW + gap)

    // 卡片阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.roundRect(cx + 4, cardY + 4, cardW, cardH, 20)
    ctx.fill()

    // 卡片背景
    var cardGrad = ctx.createLinearGradient(cx, cardY, cx, cardY + cardH)
    cardGrad.addColorStop(0, '#2A1F1F')
    cardGrad.addColorStop(1, '#1F1515')
    ctx.fillStyle = cardGrad
    ctx.beginPath()
    ctx.roundRect(cx, cardY, cardW, cardH, 20)
    ctx.fill()

    // 顶部色条
    ctx.fillStyle = cfg.color
    ctx.beginPath()
    ctx.roundRect(cx + 10, cardY + 20, cardW - 20, 6, 3)
    ctx.fill()

    // 图标
    ctx.font = '64px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(cfg.icon, cx + cardW / 2, cardY + 50)

    // 名称
    ctx.fillStyle = '#FFF'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText(cfg.name, cx + cardW / 2, cardY + 130)

    // 描述
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '20px sans-serif'
    ctx.fillText(cfg.desc, cx + cardW / 2, cardY + 170)

    // 分隔线
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx + 30, cardY + 200)
    ctx.lineTo(cx + cardW - 30, cardY + 200)
    ctx.stroke()

    // 信息
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '22px sans-serif'
    ctx.fillText('📍 ' + cfg.points, cx + cardW / 2, cardY + 230)
    ctx.fillText('⏱ ' + cfg.time, cx + cardW / 2, cardY + 265)

    // 按钮
    var btnW2 = cardW * 0.55
    var btnH2 = 52
    var btnX2 = cx + (cardW - btnW2) / 2
    var btnY2 = cardY + cardH - 80
    ctx.fillStyle = cfg.color
    ctx.beginPath()
    ctx.roundRect(btnX2, btnY2, btnW2, btnH2, 26)
    ctx.fill()
    ctx.fillStyle = '#FFF'
    ctx.font = 'bold 24px sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('开始游览', cx + cardW / 2, btnY2 + btnH2 / 2)
  }

  // 底部文字
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('点击卡片选择难度，开始你的故宫之旅', W / 2, H * 0.96)
}

// 检测菜单点击，返回被选中的难度索引，-1表示未命中
function getMenuSelection(x, y, canvasW, canvasH) {
  var W = canvasW
  var H = canvasH
  var cardW = Math.min(340, W * 0.28)
  var cardH = Math.min(420, H * 0.68)
  var gap = (W - cardW * 3) / 4
  var cardY = H * 0.26

  for (var i = 0; i < 3; i++) {
    var cx = gap + i * (cardW + gap)
    if (x >= cx && x <= cx + cardW && y >= cardY && y <= cardY + cardH) {
      return i
    }
  }
  return -1
}

module.exports = {
  showPopup: showPopup,
  isPopupOpen: isPopupOpen,
  handlePopupClick: handlePopupClick,
  drawHUD: drawHUD,
  drawPopup: drawPopup,
  drawLevelComplete: drawLevelComplete,
  drawMenu: drawMenu,
  getMenuSelection: getMenuSelection,
}
