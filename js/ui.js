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
  var ph = Math.min(420, canvasH * 0.55)
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
  ctx.fillText('🎉', canvasW / 2, py + 64)

  // 标题
  ctx.fillStyle = '#333'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText('恭喜通关！', canvasW / 2, py + 140)

  // 下一站
  if (nextLevel) {
    ctx.fillStyle = '#666'
    ctx.font = '24px sans-serif'
    ctx.fillText('下一站', canvasW / 2, py + 196)
    ctx.fillStyle = '#FF9800'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(nextLevel.name + ' · ' + nextLevel.subtitle, canvasW / 2, py + 236)
  } else {
    ctx.fillStyle = '#666'
    ctx.font = '24px sans-serif'
    ctx.fillText('你已经完成了全部旅程！', canvasW / 2, py + 216)
  }

  // 按钮
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
  ctx.fillText(nextLevel ? '出发！' : '再玩一次', canvasW / 2, btnY + btnH / 2)
}

function wrapText(ctx, text, maxWidth) {
  var lines = []
  var current = ''
  for (var i = 0; i < text.length; i++) {
    var test = current + text[i]
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current)
      current = text[i]
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

module.exports = {
  showPopup: showPopup,
  isPopupOpen: isPopupOpen,
  handlePopupClick: handlePopupClick,
  drawHUD: drawHUD,
  drawPopup: drawPopup,
  drawLevelComplete: drawLevelComplete,
}
