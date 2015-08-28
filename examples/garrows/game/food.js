function Food(game, x, y) {
  var t = this;
  t.type = 'Food';
  t.color = '#ff0';
  t.game = game;
  t.x = x;
  t.y = y;
}
Food.prototype = new Entity;
Food.prototype.constructor = Food;
