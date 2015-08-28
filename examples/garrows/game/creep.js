function Creep(game, x, y) {
  var t = this;
  t.type = 'Creep';
  t.color = '#000';
  t.game = game;
  t.x = x;
  t.y = y;
  t.d = r(2*Math.PI);
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
  t.game.food.forEach(function(f) {
    var d = Math.sqrt(Math.pow(t.x - f.x, 2) + Math.pow(t.y - f.y, 2));
    if (d < 50) {
      t.color = '#0f0';
    }
  });
  t.x += Math.sin(t.d);
  t.y += Math.cos(t.d);

  Entity.prototype.update.call(t, counter);

}
