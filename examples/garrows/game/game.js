function Game(mapWidth) {
  var t = this;
  t.counter = 0;
  t.players = [];
  t.food = [];
  t.hives = [];
  t.creeps = [];
  t.mapWidth = mapWidth;
  t.cam = {
    x: 0,
    y: 0,
    z: .35
  }
}

Game.prototype = {
  serverUpdated: function(data) {
    function updateEntities(entities, serialized) {
      if (!serialized) return;
      for (var i = 0; i < serialized.length; i++) {
        if (!entities[i]) {
          entities[i] = new window[serialized[i].type](game, 0, 0);
        }
        entities[i].deserialize(serialized[i]);
      }
    }
    this.counter = data.counter ? data.counter : this.counter;
    updateEntities(this.players, data.players)
    updateEntities(this.food, data.food)
    updateEntities(this.hives, data.hives)
    updateEntities(this.creeps, data.creeps)
  },
  update: function(io) {
    var t = this;
    t.counter++;
    var updatables = ['players', 'hives', 'creeps', 'food'];
    var state = {
      counter: t.counter
    };

    updatables.forEach(function(name) {
      for (var i = 0; i < t[name].length; i++) {
        t[name][i].update(t.counter);
      }
      state[name] = t[name];
    });

    io && io.emit('serverUpdated', state);
    return state;
  },
  generateServerState: function(n) {
    var w = this.mapWidth;
    for (var i = 0; i < n; i++) {
      this.food.push(new Food(this, r(w), r(w)));
      this.food.push(new Food(this, r(w), r(w)));
      var hive = new Hive(this, r(w), r(w));
      this.food.push(new Food(this, r(w), r(w)));
      this.hives.push(hive);
    }
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
    this.cam.x = this.cam.x > 0 ? this.cam.x : 0;
    this.cam.y = this.cam.y > 0 ? this.cam.y : 0;
    this.cam.z = this.cam.z > 1 ? 1 : this.cam.z;
    this.cam.z = this.cam.z < .1 ? .1 : this.cam.z;
    var dw = canvas.width,
      dh = canvas.height,
      sx = this.cam.x,
      sy = this.cam.y,
      sw = lCan.width * this.cam.z,
      sh = lCan.height * this.cam.z;
    if (sx + sw > lCan.width) {
      log('too right')
      this.cam.x -= sx + sw - lCan.width;
      return this.draw(ts);
    }
    if (sy + sh > lCan.height) {
      log('too low')
      this.cam.y -= sy + sh - lCan.height;
      return this.draw(ts);
    }



    //Non-visible area
    c.fillStyle = 'red';
    c.fillRect(0, 0, dw, dh);
    //Draw level
    c.drawImage(lCan, sx, sy, sw, sh, 0, 0, dw, dh);

    var w = dw / (lCan.width * this.cam.z);
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].draw(ts);
    }
    for (var i = 0; i < this.hives.length; i++) {
      this.hives[i].draw(ts);
    }
    for (var i = 0; i < this.food.length; i++) {
      this.food[i].draw(ts);
    }
    for (var i = 0; i < this.creeps.length; i++) {
      this.creeps[i].draw(ts);
    }
  },
  drawLoop: function(dt) {
    this.draw(dt);
    requestAnimationFrame(this.drawLoop.bind(this));
  },
};

typeof module !== 'undefined' && (module.exports = Game);


var s = 4;

function r(max) {
  var max = max ? max : 1;
  var x = Math.sin(s++) * 10000;
  return (x - Math.floor(x)) * max;
}
