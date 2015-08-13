function Game(mapWidth) {
  var t = this;
  t.counter = 0;
  t.players = [];
  t.map = Array(mapWidth * mapWidth);
  t.map.get = function(x, y) {
    if (x >= mapWidth || x < 0) throw new Error('X out of bounds in map.get');
    if (y >= mapWidth || y < 0) throw new Error('Y out of bounds in map.get');
    return t.map[y * mapWidth + x];
  };
  t.map.set = function(x, y, v) {
    if (x >= mapWidth || x < 0) throw new Error('X out of bounds in map.set');
    if (y >= mapWidth || y < 0) throw new Error('Y out of bounds in map.set');
    t.map[y * mapWidth + x] = v;
  };
  t.map.width = mapWidth;

}

Game.prototype = {
  serverUpdated: function(data) {
    this.counter = data.counter;
    this.players = data.players;
  },
  update: function(io) {
    this.counter++;
    var state = {
      counter: this.counter,
      players: this.players
    };
    io && io.emit('serverUpdated', state);
    return state;
  },
  draw: function(ts) {
    c.fillStyle = '#eee';
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'black';
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i],
        x = p.x / this.map.width * canvas.width,
        y = p.y / this.map.width * canvas.height;
      c.fillRect(x, y, 10, 10);
    }
    requestAnimationFrame(this.draw.bind(this));
  },
};

typeof module !== 'undefined' && (module.exports = Game);
