function Hive(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Hive';
  t.color = '#00e';
  t.creepCount = 0;
  t.props.push('creepCount');
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
