function Food(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Food';
  t.color = '#ff0';
}
Food.prototype = new Entity;
Food.prototype.constructor = Food;
