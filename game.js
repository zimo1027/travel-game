// 故宫深度游 — 首页
var canvas = wx.createCanvas()
var ctx = canvas.getContext('2d')
var W = canvas.width
var H = canvas.height

// 基于屏幕尺寸的缩放基准（以高度 667 为参考）
var S = H / 667

// 背景
ctx.fillStyle = '#3E1F1F'
ctx.fillRect(0, 0, W, H)

// 标题
ctx.fillStyle = '#D4AF37'
ctx.font = 'bold ' + Math.round(48 * S) + 'px sans-serif'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('故宫深度游', W / 2, H * 0.35)

// 副标题
ctx.font = Math.round(20 * S) + 'px sans-serif'
ctx.fillStyle = 'rgba(255,255,255,0.5)'
ctx.fillText('沿中轴线 · 探秘六百年紫禁城', W / 2, H * 0.45)

// 开始按钮
var btnW = Math.min(300 * S, W * 0.5)
var btnH = 64 * S
var btnX = (W - btnW) / 2
var btnY = H * 0.6

ctx.fillStyle = '#D4AF37'
ctx.fillRect(btnX, btnY, btnW, btnH)

ctx.fillStyle = '#1A0A0A'
ctx.font = 'bold ' + Math.round(28 * S) + 'px sans-serif'
ctx.fillText('开 始 游 览', W / 2, btnY + btnH / 2)
