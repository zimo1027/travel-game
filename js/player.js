// 玩家角色 — 旅行者
function Player(startX, startY) {
  this.x = startX
  this.y = startY
  this.radius = 20
  this.speed = 3.5
  this.targetX = startX
  this.targetY = startY
  this.moving = false
  this.facingRight = true
  this.animTime = 0
}

Player.prototype.setTarget = function (tx, ty) {
  this.targetX = tx
  this.targetY = ty
  this.moving = true
}

Player.prototype.update = function () {
  if (!this.moving) {
    this.animTime = 0
    return
  }

  var dx = this.targetX - this.x
  var dy = this.targetY - this.y
  var dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < 3) {
    this.x = this.targetX
    this.y = this.targetY
    this.moving = false
    this.animTime = 0
    return
  }

  var step = Math.min(this.speed, dist)
  this.x += (dx / dist) * step
  this.y += (dy / dist) * step

  if (dx > 0) this.facingRight = true
  else if (dx < 0) this.facingRight = false

  this.animTime += 0.15
}

Player.prototype.draw = function (ctx) {
  var x = this.x
  var y = this.y
  var t = this.animTime
  var bounce = this.moving ? Math.abs(Math.sin(t)) * 3 : 0

  // === 阴影 ===
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(x, y + 22, 14 + bounce * 0.5, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // === 背包（画在身后） ===
  ctx.fillStyle = '#D2691E'
  ctx.beginPath()
  ctx.roundRect(x - 10, y - 6, 6, 18, 3)
  ctx.fill()
  // 背包口袋
  ctx.fillStyle = '#A0522D'
  ctx.fillRect(x - 8, y - 2, 3, 6)

  // === 双腿 ===
  ctx.strokeStyle = '#4A3728'
  ctx.lineWidth = 4.5
  ctx.lineCap = 'round'
  var legSwing = this.moving ? Math.sin(t) * 5 : 0
  // 左腿
  ctx.beginPath()
  ctx.moveTo(x - 5, y + 12)
  ctx.lineTo(x - 6 + legSwing, y + 24)
  ctx.stroke()
  // 右腿
  ctx.beginPath()
  ctx.moveTo(x + 5, y + 12)
  ctx.lineTo(x + 6 - legSwing, y + 24)
  ctx.stroke()

  // === 鞋子 ===
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.roundRect(x - 10 + legSwing, y + 22, 10, 6, 3)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x + 1 - legSwing, y + 22, 10, 6, 3)
  ctx.fill()

  // === 身体（T恤 + 外套） ===
  // 外套主体
  ctx.fillStyle = '#1976D2'
  ctx.beginPath()
  ctx.roundRect(x - 12, y - 2, 24, 20, 6)
  ctx.fill()
  // T恤内搭
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.arc(x, y - 2, 8, 0, Math.PI)
  ctx.fill()
  // 外套拉链
  ctx.strokeStyle = '#E0E0E0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y - 6)
  ctx.lineTo(x, y + 14)
  ctx.stroke()

  // === 手臂 ===
  ctx.strokeStyle = '#FFE0B2'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  var armSwing = this.moving ? Math.sin(t) * 4 : 0
  // 左臂
  ctx.beginPath()
  ctx.moveTo(x - 10, y)
  ctx.lineTo(x - 14 - armSwing, y + 12)
  ctx.stroke()
  // 右手（拿手机/相机）
  ctx.beginPath()
  ctx.moveTo(x + 10, y)
  ctx.lineTo(x + 14 + armSwing, y + 8)
  ctx.stroke()

  // === 相机 ===
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.roundRect(x + 10 + armSwing, y + 5, 8, 6, 2)
  ctx.fill()
  ctx.fillStyle = '#555'
  ctx.beginPath()
  ctx.arc(x + 14 + armSwing, y + 8, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // === 头部 ===
  ctx.fillStyle = '#FFE0B2'
  ctx.beginPath()
  ctx.arc(x, y - 14, 12, 0, Math.PI * 2)
  ctx.fill()

  // === 头发 ===
  ctx.fillStyle = '#3E2723'
  ctx.beginPath()
  ctx.arc(x, y - 22, 11, Math.PI, 0)
  ctx.fill()

  // === 太阳镜 ===
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.roundRect(x - 8, y - 19, 7, 6, 3)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x + 1, y - 19, 7, 6, 3)
  ctx.fill()
  // 镜片反光
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.arc(x - 4, y - 18, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 5, y - 18, 2, 0, Math.PI * 2)
  ctx.fill()

  // === 棒球帽 ===
  ctx.fillStyle = '#E53935'
  ctx.beginPath()
  ctx.arc(x, y - 20, 13, Math.PI, 0)
  ctx.fill()
  // 帽檐
  ctx.fillStyle = '#C62828'
  ctx.beginPath()
  ctx.roundRect(x + 2, y - 24, 12, 5, 3)
  ctx.fill()
  // 帽顶圆球
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.arc(x, y - 30, 3, 0, Math.PI * 2)
  ctx.fill()
}

module.exports = Player
