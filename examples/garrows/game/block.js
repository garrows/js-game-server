function Block(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Block';
  t.color = '#4f1111';
  t.blocking = true;
}
Block.prototype = new Entity;
Block.prototype.constructor = Block;
