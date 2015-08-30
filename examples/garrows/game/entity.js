function Entity(game, x, y) {
  var t = this;
  t.game = game;
  t.props = ['type', 'color', 'x', 'y'];
  t.type = 'Entity';
  t.color = '#e00';
  t.x = x;
  t.y = y;
}
Entity.prototype = {
  constructor: Entity,
  deserialize: function(data) {
    var t = this;
    t.props.forEach(function(p) {
      t[p] = data[p];
    });
  },
  update: function(counter) {
    var t = this;
    if (t.x < 0) t.x = t.game.mapWidth - 1;
    if (t.y < 0) t.y = t.game.mapWidth - 1;
    if (t.x >= t.game.mapWidth) t.x = 0;
    if (t.y >= t.game.mapWidth) t.y = 0;
  },
  draw: function(ts) {
    var t = this;
    var w = canvas.width / (lCan.width * t.game.cam.z);
    c.strokeWidth = 1;
    c.fillStyle = c.strokeStyle = t.color;

    var x = t.x * w - (t.game.cam.x * w),
      y = t.y * w - (t.game.cam.y * w);

    t.drawDetails(ts, x - w / 2, y - w / 2, w);
  },
  drawDetails: function(ts, x, y, w) {
    c.fillRect(x, y, w, w);
    c.strokeRect(x - c.strokeWidth / 2, y - c.strokeWidth / 2, w + c.strokeWidth, w + c.strokeWidth);
  },
  toJSON: function() {
    var t = this,
      r = {};
    t.props.forEach(function(p) {
      r[p] = t[p];
    });
    return r;
  }

};
