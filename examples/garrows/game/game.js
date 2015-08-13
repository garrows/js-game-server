function Game() {
  this.counter = 0;
}

Game.prototype = {
  serverUpdate: function(data) {
    log('ServerUpdate', data);
    this.counter = data.counter;
  },
  update: function(io) {
    this.counter++;
    var state = {
      counter: this.counter
    };
    io && io.emit('serverUpdate', state);
    return state;
  },
  draw: function(ts) {
    c.fillRect(10, 10, this.counter, 10);
    c.strokeRect(10, 10, this.counter, 10);
    requestAnimationFrame(this.draw.bind(this));
  },
};

typeof module !== 'undefined' && (module.exports = Game);
