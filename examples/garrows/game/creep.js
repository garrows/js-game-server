function Creep(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Creep';
  t.color = '#000';
  t.hiveX = x;
  t.hiveY = y;
  t.eating = false;
  t.energy = 0;
  t.d = r(2 * Math.PI);
  t.props.push('hiveX', 'hiveY', 'eating', 'energy', 'd');
}
Creep.prototype = new Entity;
Creep.prototype.constructor = Creep;
Creep.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 4;

  Entity.prototype.drawDetails.call(t, ts, x, y, w);
  // c.beginPath();
  // c.moveTo(x, y);
  // c.arc(x, y, 100, t.d - Math.PI / 2, t.d - Math.PI / 2 + 2 * Math.PI);
  // c.stroke();
}
Creep.prototype.update = function(counter) {
  var t = this;
  if (!t.eating && t.energy < 5) {
    t.eating = t.game.food.some(function(f) {
      var dist = Math.sqrt(Math.pow(t.x - f.x, 2) + Math.pow(t.y - f.y, 2));
      if (dist < 100 && dist > 1) {
        t.color = '#0f0';
        t.d = Math.atan2((f.x - t.x), (t.y - f.y));
        if (Number.isNaN(t.d)) t.d = 0;
      } else if (dist <= 1) {
        return true;
      } else {
        t.color = '#000';
      }
      return false;
    });
    t.x += Math.sin(t.d);
    t.y -= Math.cos(t.d);
  } else {
    if (t.eating) t.energy++;
    if (t.energy > 5) {
      t.color = '#9f5';
      t.eating = false;
      var dist = Math.sqrt(Math.pow(t.x - t.hiveX, 2) + Math.pow(t.y - t.hiveY, 2));
      if (dist <= 1) {
        t.energy = 0;
        t.d = t.d + Math.PI;
      } else {
        t.d = Math.atan2((t.hiveX - t.x), (t.y - t.hiveY));
        t.x += Math.sin(t.d);
        t.y -= Math.cos(t.d);
      }
    }
  }

  Entity.prototype.update.call(t, counter);

}
