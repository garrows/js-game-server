function Game(mapWidth) {
  var t = this;
  t.counter = 0;
  t.players = [];
  t.hives = [];
  t.creepers = [];
  t.mapWidth = mapWidth;
  t.cam = {
    x: 0,
    y: 0,
    z: 1
  }
}

Game.prototype = {
  serverUpdated: function(data) {
    this.counter = data.counter;
    this.players = data.players;
    this.hives = data.hives;
    this.creepers = data.creepers;
  },
  update: function(io) {
    this.counter++;
    var state = {
      counter: this.counter,
      players: this.players,
      hives: this.hives,
      creepers: this.creepers,
    };
    io && io.emit('serverUpdated', state);
    return state;
  },
  generateLevel: function(ts) {
    var nCan = document.createElement('canvas');
    lCan = document.createElement('canvas');
    nCan.width = nCan.height = this.mapWidth / 30;
    lCan.width = lCan.height = this.mapWidth;
    var nC = nCan.getContext('2d');
    var lC = lCan.getContext('2d');

    //Generate map noise
    nC.fillStyle = '#232';
    //Make some rocks
    for (var i = 0; i < 200; i++) {
      var x = r(nCan.width * 2) - nCan.width / 2,
        y = r(nCan.height * 2) - nCan.height / 2;
      nC.beginPath();
      //Make a rock with a few points
      for (var j = 0; j < r(7); j++) {
        nC.quadraticCurveTo(
          x + (r() - .5) * nCan.width / 5,
          y + (r() - .5) * nCan.width / 5,
          x + (r() - .5) * nCan.width / 5,
          y + (r() - .5) * nCan.width / 5
        );
      }
      nC.fill();
    }

    lC.fillStyle = '#353';
    lC.fillRect(0, 0, lCan.width, lCan.height);
    lC.mozImageSmoothingEnabled = lC.msImageSmoothingEnabled = lC.imageSmoothingEnabled = false;
    lC.drawImage(nCan, 0, 0, nCan.width, nCan.height, 0, 0, lCan.width, lCan.height);

  },
  draw: function(ts) {
    var dw = canvas.width,
      dh = canvas.height,
      sx = this.cam.x,
      sy = this.cam.y,
      sw = dw * this.cam.z,
      sh = dh * this.cam.z;
    //Zoom limits
    if (game.cam.z < .2) {
      game.cam.z = .2;
      return this.draw(ts);
    }
    if (sw / lCan.width > 1) {
      sw *= (2 - sw / lCan.width);
      this.cam.z = sw / dw;
      return this.draw(ts);
    }
    if (sh / lCan.height > 1) {
      sh *= (2 - sh / lCan.height);
      this.cam.z = sh / dh;
      return this.draw(ts);

    }
    c.fillStyle = 'red';
    c.fillRect(0, 0, dw, dh);
    c.drawImage(lCan, sx, sy, sw, sh, 0, 0, dw, dh);

    c.fillStyle = '#0e0';
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i],
        x = p.x / this.mapWidth * canvas.width,
        y = p.y / this.mapWidth * canvas.height;
      c.fillRect(x, y, 10, 10);
    }
  },
  drawLoop: function(dt) {
    this.draw(dt);
    requestAnimationFrame(this.drawLoop.bind(this));
  },
};

typeof module !== 'undefined' && (module.exports = Game);


var s = 1;

function r(max) {
  var max = max ? max : 1;
  var x = Math.sin(s++) * 10000;
  return (x - Math.floor(x)) * max;
}
