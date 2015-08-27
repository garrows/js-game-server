function Entity(game, x, y) {
  var t = this;
  t.type = 'Entity';
  t.color = '#e00';
  t.game = game;
  t.x = x;
  t.y = y;
}
Entity.prototype = {
  deserialize: function(data) {
    var t = this;
    t.x = data.x;
    t.y = data.y;
    t.type = data.type;
    t.color = data.color;
  },
  draw: function(ts) {
    var t = this;
    var w = canvas.width / (lCan.width * t.game.cam.z);
    c.strokeWidth = 1;
    c.fillStyle = c.strokeStyle = t.color;

    var x = t.x * w - (t.game.cam.x * w),
      y = t.y * w - (t.game.cam.y * w);

    t.drawDetails(ts, x, y, w);
  },
  drawDetails: function(ts, x, y, w) {
    c.fillRect(x, y, w, w);
    c.strokeRect(x - c.strokeWidth / 2, y - c.strokeWidth / 2, w + c.strokeWidth, w + c.strokeWidth);
  },
  toJSON: function() {
    var t = this;
    return {
      x: t.x,
      y: t.y,
      color: t.color,
      type: t.type
    }
  }

};



function Hive(game, x, y) {
  var t = this;
  t.type = 'Hive';
  t.color = '#00e';
  t.game = game;
  t.x = x;
  t.y = y;
}
Hive.prototype = new Entity;
Hive.prototype.constructor = Hive;
Hive.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 8;
  console.log('drawDetails')
  Entity.prototype.drawDetails.call(t, ts, x, y, w);

}
