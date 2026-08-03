// 地图绘制模块

var CHECKPOINT_RADIUS = 28

function Map(level) {
  this.level = level
  this.width = level.width
  this.height = level.height
  // 偏移量，使地图居中
  this.offsetX = 0
  this.offsetY = 0
}

Map.prototype.updateOffset = function (canvasW, canvasH) {
  this.offsetX = (canvasW - this.width) / 2
  this.offsetY = Math.max(0, (canvasH - this.height) / 2)
}

// 检查点是否与障碍物碰撞
Map.prototype.collides = function (x, y, radius) {
  var obs = this.level.obstacles
  for (var i = 0; i < obs.length; i++) {
    var o = obs[i]
    // 简单矩形碰撞（玩家圆形 vs 障碍物矩形）
    var cx = Math.max(o.x, Math.min(x, o.x + o.w))
    var cy = Math.max(o.y, Math.min(y, o.y + o.h))
    var dx = x - cx
    var dy = y - cy
    if (dx * dx + dy * dy < (radius + 2) * (radius + 2)) {
      return true
    }
  }
  return false
}

Map.prototype.draw = function (ctx) {
  var lv = this.level
  var ox = this.offsetX
  var oy = this.offsetY

  // 背景
  ctx.fillStyle = lv.bgColor
  ctx.fillRect(ox, oy, lv.width, lv.height)

  // 草地装饰（随机散布的浅色点）
  ctx.fillStyle = lv.grassColor
  for (var i = 0; i < 30; i++) {
    var gx = ox + 50 + (i * 137) % lv.width
    var gy = oy + 30 + (i * 89) % lv.height
    ctx.beginPath()
    ctx.arc(gx, gy, 12 + (i % 8), 0, Math.PI * 2)
    ctx.fill()
  }

  // 道路（十字交叉）
  ctx.fillStyle = lv.roadColor
  ctx.fillRect(ox + lv.width / 2 - 30, oy, 60, lv.height)
  ctx.fillRect(ox, oy + lv.height / 2 - 30, lv.width, 60)

  // 障碍物
  var obs = lv.obstacles
  for (var j = 0; j < obs.length; j++) {
    var o = obs[j]
    // 树干
    ctx.fillStyle = '#8D6E63'
    ctx.fillRect(ox + o.x + o.w / 2 - 8, oy + o.y + o.h / 2 - 8, 16, 16)
    // 树冠
    ctx.fillStyle = '#4CAF50'
    ctx.beginPath()
    ctx.arc(ox + o.x + o.w / 2, oy + o.y + o.h / 2, o.w / 2 + 4, 0, Math.PI * 2)
    ctx.fill()
    // 石头效果
    ctx.fillStyle = '#9E9E9E'
    ctx.beginPath()
    ctx.arc(ox + o.x + o.w / 2 - 5, oy + o.y + o.h / 2 + 2, o.w / 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // 道路边线
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 12])
  ctx.beginPath()
  ctx.moveTo(ox + lv.width / 2 - 30, oy)
  ctx.lineTo(ox + lv.width / 2 - 30, oy + lv.height)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(ox + lv.width / 2 + 30, oy)
  ctx.lineTo(ox + lv.width / 2 + 30, oy + lv.height)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(ox, oy + lv.height / 2 - 30)
  ctx.lineTo(ox + lv.width, oy + lv.height / 2 - 30)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(ox, oy + lv.height / 2 + 30)
  ctx.lineTo(ox + lv.width, oy + lv.height / 2 + 30)
  ctx.stroke()
  ctx.setLineDash([])
}

Map.prototype.drawCheckpoints = function (ctx, collected) {
  var lv = this.level
  var ox = this.offsetX
  var oy = this.offsetY
  var cps = lv.checkpoints

  for (var i = 0; i < cps.length; i++) {
    var cp = cps[i]
    var cx = ox + cp.x
    var cy = oy + cp.y
    var isCollected = collected[i]

    if (isCollected) {
      // 已收集：灰色
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.arc(cx, cy, CHECKPOINT_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFF'
      ctx.font = '24px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✓', cx, cy)
    } else {
      // 未收集：金色光晕 + 标记
      ctx.fillStyle = 'rgba(255, 193, 7, 0.2)'
      ctx.beginPath()
      ctx.arc(cx, cy, CHECKPOINT_RADIUS + 8, 0, Math.PI * 2)
      ctx.fill()

      // 外圈
      ctx.strokeStyle = '#FFC107'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, CHECKPOINT_RADIUS, 0, Math.PI * 2)
      ctx.stroke()

      // 内部填充
      ctx.fillStyle = '#FFF'
      ctx.beginPath()
      ctx.arc(cx, cy, CHECKPOINT_RADIUS - 4, 0, Math.PI * 2)
      ctx.fill()

      // 数字
      ctx.fillStyle = '#FF6F00'
      ctx.font = 'bold 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(i + 1, cx, cy)

      // 脉冲动画
      var pulse = Math.sin(Date.now() / 600 + i) * 0.3 + 0.7
      ctx.strokeStyle = 'rgba(255, 193, 7, ' + pulse + ')'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, CHECKPOINT_RADIUS + 14, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

Map.prototype.screenToWorld = function (sx, sy) {
  return {
    x: sx - this.offsetX,
    y: sy - this.offsetY,
  }
}

Map.prototype.isWalkable = function (x, y) {
  if (x < 10 || x > this.width - 10 || y < 10 || y > this.height - 10) return false
  return !this.collides(x, y, 10)
}

Map.prototype.findWalkableNear = function (tx, ty, playerR) {
  // 如果目标点可行走，直接返回
  if (this.isWalkable(tx, ty)) return { x: tx, y: ty, ok: true }

  // 螺旋搜索最近可行走点
  for (var r = 10; r < 120; r += 10) {
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      var nx = tx + Math.cos(a) * r
      var ny = ty + Math.sin(a) * r
      if (this.isWalkable(nx, ny)) {
        return { x: nx, y: ny, ok: true }
      }
    }
  }
  return { x: tx, y: ty, ok: false }
}

module.exports = { Map: Map, CHECKPOINT_RADIUS: CHECKPOINT_RADIUS }
