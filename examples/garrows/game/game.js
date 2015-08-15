function Game(mapWidth) {
  var t = this;
  t.counter = 0;
  t.players = [];
  t.map = {
    d: Array(mapWidth * mapWidth),
    get: function(x, y) {
      if (x >= mapWidth || x < 0) throw new Error('X out of bounds in map.get');
      if (y >= mapWidth || y < 0) throw new Error('Y out of bounds in map.get');
      return t.map.d[y * mapWidth + x];
    },
    set: function(x, y, v) {
      if (x >= mapWidth || x < 0) throw new Error('X out of bounds in map.set');
      if (y >= mapWidth || y < 0) throw new Error('Y out of bounds in map.set');
      t.map.d[y * mapWidth + x] = v;
    },
    width: mapWidth
  }
  t.cam = {
    x: mapWidth / 2,
    y: mapWidth / 2,
    z: .5
  }
}

Game.prototype = {
  serverUpdated: function(data) {
    this.counter = data.counter;
    this.players = data.players;
    // this.map.d = data.mapd;
    this.map.width = data.mapWidth;
  },
  update: function(io) {
    this.counter++;
    var state = {
      counter: this.counter,
      players: this.players,
      // mapd: this.map.d,
      mapWidth: this.map.width,
    };
    io && io.emit('serverUpdated', state);
    return state;
  },
  generateLevel: function(ts) {
    var nCan = document.createElement('canvas');
    lCan = document.createElement('canvas');
    nCan.width = nCan.height = this.map.width / 30;
    lCan.width = lCan.height = this.map.width;
    var nC = nCan.getContext('2d');
    var lC = lCan.getContext('2d');

    //Generate map noise
    nC.fillStyle = '#353';
    nC.beginPath();
    nC.moveTo(r() * nCan.width, r() * nCan.height);
    for (var i = 0; i < 30; i++) {
      nC.lineTo(r() * nCan.width * 3 - nCan.width, r() * nCan.height * 3 - nCan.height);
    }
    nC.fill();

    lC.fillStyle = '#232';
    lC.fillRect(0, 0, lCan.width, lCan.height);
    lC.mozImageSmoothingEnabled = lC.msImageSmoothingEnabled = lC.imageSmoothingEnabled = false;
    lC.drawImage(nCan, 0, 0, nCan.width, nCan.height, 0, 0, lCan.width, lCan.height);

  },
  draw: function(ts) {
    var w = lCan.width;
    var h = lCan.height;
    // c.drawImage(lCan, this.cam.x-w/2, this.cam.y-h/2, w/2, h/2, 0, 0, w, h);
    c.drawImage(lCan, this.cam.x-w/2*this.cam.z, this.cam.y-h/2*this.cam.z, w/2*this.cam.z, h/2*this.cam.z, 0, 0, w, h);

    c.fillStyle = '#0e0';
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i],
        x = p.x / this.map.width * canvas.width,
        y = p.y / this.map.width * canvas.height;
      c.fillRect(x, y, 10, 10);
    }
  },
  drawLoop: function(dt) {
    this.draw(dt);
    requestAnimationFrame(this.drawLoop.bind(this));
  },
};

typeof module !== 'undefined' && (module.exports = Game);


var s = 5;

function r() {
  var x = Math.sin(s++) * 10000;
  return x - Math.floor(x);
}
