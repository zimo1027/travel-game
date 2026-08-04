// Canvas API polyfills — 微信小游戏环境不支持 roundRect / ellipse
// 必须在所有渲染代码之前加载

var ctxProto = wx.createCanvas().getContext('2d').constructor.prototype

// ============ roundRect 向下兼容 ============
// 用法: ctx.roundRect(x, y, w, h, radius)
//        ctx.roundRect(x, y, w, h, [tl, tr, br, bl])
if (!ctxProto.roundRect) {
  ctxProto.roundRect = function (x, y, w, h, radii) {
    var r = typeof radii === 'number' ? radii : 0
    if (typeof radii === 'number') {
      r = Math.min(radii, w / 2, h / 2)
    } else {
      // 数组形式（简化处理，取最大值）
      var rr = radii || 0
      if (Array.isArray(rr)) {
        r = Math.min(Math.max(rr[0] || 0, rr[1] || 0, rr[2] || 0, rr[3] || 0), w / 2, h / 2)
      } else {
        r = Math.min(rr, w / 2, h / 2)
      }
    }

    if (r <= 0) {
      this.rect(x, y, w, h)
      return
    }

    this.moveTo(x + r, y)
    this.lineTo(x + w - r, y)
    this.arcTo(x + w, y, x + w, y + r, r)
    this.lineTo(x + w, y + h - r)
    this.arcTo(x + w, y + h, x + w - r, y + h, r)
    this.lineTo(x + r, y + h)
    this.arcTo(x, y + h, x, y + h - r, r)
    this.lineTo(x, y + r)
    this.arcTo(x, y, x + r, y, r)
    this.closePath()
  }
}

// ============ ellipse 向下兼容 ============
if (!ctxProto.ellipse) {
  ctxProto.ellipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise) {
    this.save()
    this.translate(x, y)
    if (rotation) this.rotate(rotation)
    this.scale(radiusX, radiusY)
    this.arc(0, 0, 1, startAngle, endAngle, counterclockwise)
    this.restore()
  }
}
