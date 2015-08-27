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
  update: function(counter) {
    var t = this;
    if (t.x < 0) t.x = t.game.mapWidth-1;
    if (t.y < 0) t.y = t.game.mapWidth-1;
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
  t.creepCount = 0;
}
Hive.prototype = new Entity;
Hive.prototype.constructor = Hive;
Hive.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 8;
  Entity.prototype.drawDetails.call(t, ts, x, y, w);
}
Hive.prototype.update = function(counter) {
  var t = this;
  if (t.creepCount < 1) {
    t.creepCount++;
    var creep = new Creep(game, t.x, t.y);
    t.game.creeps.push(creep);
  }
  Entity.prototype.update.call(t, counter);
}



function Creep(game, x, y) {
  var t = this;
  t.type = 'Creep';
  t.color = '#000';
  t.game = game;
  t.x = x;
  t.y = y;
}
Creep.prototype = new Entity;
Creep.prototype.constructor = Creep;
Creep.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 4;
  Entity.prototype.drawDetails.call(t, ts, x, y, w);
}
Creep.prototype.update = function(counter) {
  var t = this;
  t.x += 1;
  // log('creepCount', hive.creepCount);
  // if (hive.creepCount < 1) {
  //   var creep = new Creep(game, t.x, t.y);
  //   t.game.creeps.push(creep);
  // }
  Entity.prototype.update.call(t, counter);

}
