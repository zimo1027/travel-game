// 地图绘制模块 — 故宫主题
var CHECKPOINT_RADIUS = 28

function Map(level) {
  this.level = level
  this.width = level.width
  this.height = level.height
  this.offsetX = 0
  this.offsetY = 0
  // 预生成装饰物位置（固定随机种子）
  this._decor = []
  for (var i = 0; i < 40; i++) {
    this._decor.push({
      x: 30 + (i * 173 + 47) % (level.width - 60),
      y: 30 + (i * 211 + 83) % (level.height - 60),
      r: 4 + (i % 6),
      type: i % 4, // 0:小花 1:草丛 2:灌木 3:落叶
      rot: (i * 137 + 59) % 360 * Math.PI / 180, // 固定旋转角
    })
  }
}

Map.prototype.updateOffset = function (canvasW, canvasH) {
  this.offsetX = (canvasW - this.width) / 2
  this.offsetY = Math.max(0, (canvasH - this.height) / 2)
}

Map.prototype.collides = function (x, y, radius) {
  var obs = this.level.obstacles
  for (var i = 0; i < obs.length; i++) {
    var o = obs[i]
    var cx = Math.max(o.x, Math.min(x, o.x + o.w))
    var cy = Math.max(o.y, Math.min(y, o.y + o.h))
    var dx = x - cx
    var dy = y - cy
    if (dx * dx + dy * dy < (radius + 4) * (radius + 4)) {
      return true
    }
  }
  return false
}

Map.prototype.draw = function (ctx) {
  var lv = this.level
  var ox = this.offsetX
  var oy = this.offsetY
  var w = lv.width
  var h = lv.height
  var isLandscape = w > h

  // === 1. 基础底色 ===
  ctx.fillStyle = lv.bgColor
  ctx.fillRect(ox, oy, w, h)

  // === 2. 地面纹理网格 ===
  ctx.fillStyle = lv.grassColor
  for (var ty = 0; ty < h; ty += 40) {
    for (var tx = 0; tx < w; tx += 40) {
      if ((tx / 40 + ty / 40) % 2 === 0) {
        ctx.fillRect(ox + tx, oy + ty, 40, 40)
      }
    }
  }

  // === 3. 中轴线大道（水平：从左到右） ===
  var roadW = 80
  var roadY = h / 2 - roadW / 2
  var roadGrad = ctx.createLinearGradient(ox, 0, ox + w, 0)
  roadGrad.addColorStop(0, '#F5EDE0')
  roadGrad.addColorStop(0.5, '#ECE0CC')
  roadGrad.addColorStop(1, '#F5EDE0')
  ctx.fillStyle = roadGrad
  ctx.fillRect(ox, oy + roadY, w, roadW)

  // 纵向通道
  ctx.fillStyle = '#ECE0CC'
  ctx.fillRect(ox + w / 2 - 24, oy, 48, h)
  if (w > 1000) {
    ctx.fillRect(ox + w * 0.33 - 20, oy, 40, h)
    ctx.fillRect(ox + w * 0.66 - 20, oy, 40, h)
  }

  // === 4. 中轴线装饰（石板纹路） ===
  ctx.strokeStyle = 'rgba(180,160,140,0.3)'
  ctx.lineWidth = 1
  for (var sx = ox; sx < ox + w; sx += 30) {
    ctx.beginPath()
    ctx.moveTo(sx, oy + roadY)
    ctx.lineTo(sx, oy + roadY + roadW)
    ctx.stroke()
  }

  // === 5. 宫墙（上下红墙） ===
  var wallW = 18
  // 上墙
  var wallGradT = ctx.createLinearGradient(0, oy, 0, oy + wallW)
  wallGradT.addColorStop(0, '#C23B2A')
  wallGradT.addColorStop(0.3, '#D44538')
  wallGradT.addColorStop(0.7, '#B83528')
  wallGradT.addColorStop(1, '#A02A1E')
  ctx.fillStyle = wallGradT
  ctx.fillRect(ox, oy, w, wallW)
  ctx.fillStyle = '#F5D54A'
  ctx.fillRect(ox, oy, w, 6)

  // 下墙
  var wallGradB = ctx.createLinearGradient(0, oy + h - wallW, 0, oy + h)
  wallGradB.addColorStop(0, '#A02A1E')
  wallGradB.addColorStop(0.3, '#B83528')
  wallGradB.addColorStop(0.7, '#D44538')
  wallGradB.addColorStop(1, '#C23B2A')
  ctx.fillStyle = wallGradB
  ctx.fillRect(ox, oy + h - wallW, w, wallW)
  ctx.fillStyle = '#F5D54A'
  ctx.fillRect(ox, oy + h - wallW, w, 6)

  // 墙柱
  for (var px = ox + 30; px < ox + w; px += 100) {
    ctx.fillStyle = '#C23B2A'
    ctx.fillRect(px, oy + 2, 20, wallW - 4)
    ctx.fillRect(px, oy + h - wallW + 2, 20, wallW - 4)
    ctx.fillStyle = '#F5D54A'
    ctx.fillRect(px, oy + 1, 20, 4)
    ctx.fillRect(px, oy + h - wallW + 1, 20, 4)
  }

  // === 6. 装饰物 ===
  var decor = this._decor
  for (var d = 0; d < decor.length; d++) {
    var dc = decor[d]
    var dx = ox + dc.x
    var dy = oy + dc.y
    // 避开水平中轴道路
    if (Math.abs(dc.y - h / 2) < roadW / 2 + 10 && Math.abs(dc.x - w / 2) < 30) continue
    if (w > 1000 && Math.abs(dc.x - w * 0.33) < 25) continue
    if (w > 1000 && Math.abs(dc.x - w * 0.66) < 25) continue

    if (dc.type === 0) {
      ctx.fillStyle = '#E91E63'
      ctx.beginPath(); ctx.arc(dx, dy, dc.r, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#FFEB3B'
      ctx.beginPath(); ctx.arc(dx, dy, dc.r * 0.4, 0, Math.PI * 2); ctx.fill()
    } else if (dc.type === 1) {
      ctx.fillStyle = '#6B8E23'
      ctx.beginPath(); ctx.arc(dx, dy, dc.r + 2, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#7BA428'
      ctx.beginPath(); ctx.arc(dx - 2, dy - 2, dc.r, 0, Math.PI * 2); ctx.fill()
    } else if (dc.type === 2) {
      ctx.fillStyle = '#4A7C3F'
      ctx.beginPath(); ctx.arc(dx, dy, dc.r + 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#5C9A50'
      ctx.beginPath(); ctx.arc(dx + 1, dy - 1, dc.r + 1, 0, Math.PI * 2); ctx.fill()
    } else {
      ctx.fillStyle = '#C8A052'
      ctx.beginPath()
      ctx.ellipse(dx, dy, dc.r, dc.r * 0.5, dc.rot, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // === 7. 灯笼装饰（沿水平中轴线） ===
  for (var lx = ox + 60; lx < ox + w; lx += 120) {
    for (var ly = oy + roadY - 24; ly <= oy + roadY + roadW + 24; ly += roadW + 48) {
      ctx.fillStyle = '#5D4037'
      ctx.fillRect(lx - 1, ly - 18, 2, 24)
      ctx.fillStyle = '#E53935'
      ctx.beginPath()
      ctx.ellipse(lx, ly - 18, 6, 9, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.beginPath()
      ctx.arc(lx - 1, ly - 21, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // === 8. 障碍物（石狮 + 铜缸） ===
  var obs = lv.obstacles
  for (var j = 0; j < obs.length; j++) {
    var o = obs[j]
    var cx = ox + o.x + o.w / 2
    var cy = oy + o.y + o.h / 2

    ctx.fillStyle = '#9E9E9E'
    ctx.beginPath()
    ctx.roundRect(cx - o.w / 2 - 4, cy - o.h / 2 - 4, o.w + 8, o.h + 8, 4)
    ctx.fill()

    if (j % 2 === 0) {
      ctx.fillStyle = '#BDBDBD'
      ctx.beginPath()
      ctx.arc(cx, cy - 4, o.w / 2 + 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#E0E0E0'
      ctx.beginPath()
      ctx.arc(cx - 2, cy - 8, o.w / 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#333'
      ctx.beginPath(); ctx.arc(cx - 3, cy - 12, 2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 5, cy - 12, 2, 0, Math.PI * 2); ctx.fill()
    } else {
      ctx.fillStyle = '#B8860B'
      ctx.beginPath()
      ctx.arc(cx, cy, o.w / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#DAA520'
      ctx.beginPath()
      ctx.ellipse(cx, cy - o.w / 4, o.w / 2 - 2, o.w / 4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }
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
      // 已收集：暗色对勾
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.arc(cx, cy, CHECKPOINT_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#4CAF50'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✓', cx, cy)
    } else {
      // 红色标记旗（故宫风格）
      // 旗杆
      ctx.strokeStyle = '#5D4037'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(cx, cy + 4)
      ctx.lineTo(cx, cy - 18)
      ctx.stroke()

      // 三角旗
      ctx.fillStyle = '#E53935'
      ctx.beginPath()
      ctx.moveTo(cx, cy - 22)
      ctx.lineTo(cx + 16, cy - 14)
      ctx.lineTo(cx, cy - 8)
      ctx.fill()

      // 底座光圈
      var pulse = Math.sin(Date.now() / 600 + i) * 0.25 + 0.65
      ctx.fillStyle = 'rgba(229, 57, 53, ' + pulse + ')'
      ctx.beginPath()
      ctx.arc(cx, cy + 4, CHECKPOINT_RADIUS - 6, 0, Math.PI * 2)
      ctx.fill()

      // 数字
      ctx.fillStyle = '#FFF'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(i + 1, cx, cy + 4)
    }
  }
}

Map.prototype.screenToWorld = function (sx, sy) {
  return { x: sx - this.offsetX, y: sy - this.offsetY }
}

Map.prototype.isWalkable = function (x, y) {
  if (x < 10 || x > this.width - 10 || y < 22 || y > this.height - 22) return false
  return !this.collides(x, y, 10)
}

Map.prototype.findWalkableNear = function (tx, ty, playerR) {
  if (this.isWalkable(tx, ty)) return { x: tx, y: ty, ok: true }
  for (var r = 10; r < 120; r += 10) {
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      var nx = tx + Math.cos(a) * r
      var ny = ty + Math.sin(a) * r
      if (this.isWalkable(nx, ny)) return { x: nx, y: ny, ok: true }
    }
  }
  return { x: tx, y: ty, ok: false }
}

module.exports = { Map: Map, CHECKPOINT_RADIUS: CHECKPOINT_RADIUS }
