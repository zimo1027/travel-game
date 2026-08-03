// 触摸输入模块

function Input(canvas) {
  this.canvas = canvas
  this._clicks = []
  this._onTouch = this._onTouch.bind(this)
  canvas.addEventListener('touchstart', this._onTouch)
}

Input.prototype._onTouch = function (e) {
  if (!e.touches || e.touches.length === 0) return
  var t = e.touches[0]
  var rect = this.canvas.getBoundingClientRect()
  var scaleX = this.canvas.width / rect.width
  var scaleY = this.canvas.height / rect.height
  this._clicks.push({
    x: (t.clientX - rect.left) * scaleX,
    y: (t.clientY - rect.top) * scaleY,
  })
}

// 返回并清空累积的点击
Input.prototype.flushClicks = function () {
  var clicks = this._clicks
  this._clicks = []
  return clicks
}

Input.prototype.destroy = function () {
  this.canvas.removeEventListener('touchstart', this._onTouch)
}

module.exports = Input
