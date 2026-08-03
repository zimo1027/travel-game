// 玩家角色模块

function Player(startX, startY) {
  this.x = startX
  this.y = startY
  this.radius = 22
  this.speed = 3  // 每帧移动像素
  this.targetX = startX
  this.targetY = startY
  this.moving = false
  this.facingRight = true
}

Player.prototype.setTarget = function (tx, ty) {
  this.targetX = tx
  this.targetY = ty
  this.moving = true
}

Player.prototype.update = function () {
  if (!this.moving) return

  var dx = this.targetX - this.x
  var dy = this.targetY - this.y
  var dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < 3) {
    this.x = this.targetX
    this.y = this.targetY
    this.moving = false
    return
  }

  var step = Math.min(this.speed, dist)
  this.x += (dx / dist) * step
  this.y += (dy / dist) * step

  if (dx > 0) this.facingRight = true
  else if (dx < 0) this.facingRight = false
}

Player.prototype.draw = function (ctx) {
  var x = this.x
  var y = this.y

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.ellipse(x, y + 18, 16, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // 身体
  ctx.fillStyle = '#FF6B6B'
  ctx.beginPath()
  ctx.arc(x, y - 2, this.radius, 0, Math.PI * 2)
  ctx.fill()

  // 头部
  ctx.fillStyle = '#FFE0B2'
  ctx.beginPath()
  ctx.arc(x, y - 28, 14, 0, Math.PI * 2)
  ctx.fill()

  // 帽子
  ctx.fillStyle = '#5C6BC0'
  ctx.beginPath()
  ctx.arc(x, y - 34, 12, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(x - 14, y - 34, 28, 4)

  // 眼睛
  ctx.fillStyle = '#333'
  var eyeX = this.facingRight ? x + 4 : x - 4
  ctx.beginPath()
  ctx.arc(eyeX, y - 30, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // 双腿（走路动画仅在不移动时站立）
  ctx.strokeStyle = '#5D4037'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  var legOffset = this.moving ? Math.sin(Date.now() / 100) * 4 : 0
  ctx.beginPath()
  ctx.moveTo(x - 6, y + 14)
  ctx.lineTo(x - 8 - legOffset, y + 28)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 6, y + 14)
  ctx.lineTo(x + 8 + legOffset, y + 28)
  ctx.stroke()
}

module.exports = Player
