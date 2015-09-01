function Game(mapWidth) {
  var t = this;
  t.counter = 0;
  t.players = [];
  t.food = [];
  t.hives = [];
  t.creeps = [];
  t.blocks = [];
  t.entityNames = ['players', 'hives', 'creeps', 'food', 'blocks'];
  t.mapWidth = mapWidth;
  t.cam = {
    x: 0,
    y: 0,
    z: .35
  }
}

Game.prototype = {
  serverUpdated: function(data) {
    var t = this;
    function updateEntities(entities, serialized) {
      if (!serialized) return;
      for (var i = 0; i < serialized.length; i++) {
        if (!entities[i]) {
          entities[i] = new window[serialized[i].type](game, 0, 0);
        }
        entities[i].deserialize(serialized[i]);
      }
    }
    t.counter = data.counter ? data.counter : t.counter;
    t.entityNames.forEach(function(name) {
      updateEntities(t[name], data[name]);
    });
  },
  update: function(io) {
    var t = this;
    t.counter++;

    var state = {
      counter: t.counter
    };

    t.entityNames.forEach(function(name) {
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
    var t = this;

    t.cam.x = t.cam.x > 0 ? t.cam.x : 0;
    t.cam.y = t.cam.y > 0 ? t.cam.y : 0;
    t.cam.z = t.cam.z > 1 ? 1 : t.cam.z;
    t.cam.z = t.cam.z < .05 ? .05 : t.cam.z;
    var dw = canvas.width,
      dh = canvas.height,
      sx = t.cam.x,
      sy = t.cam.y,
      sw = lCan.width * t.cam.z,
      sh = lCan.height * t.cam.z;
    if (sx + sw > lCan.width) {
      log('too right')
      t.cam.x -= sx + sw - lCan.width;
      return t.draw(ts);
    }
    if (sy + sh > lCan.height) {
      log('too low')
      t.cam.y -= sy + sh - lCan.height;
      return t.draw(ts);
    }



    //Non-visible area
    c.fillStyle = 'red';
    c.fillRect(0, 0, dw, dh);
    //Draw level
    c.drawImage(lCan, sx, sy, sw, sh, 0, 0, dw, dh);

    t.entityNames.forEach(function(name) {
      for (var i = 0; i < t[name].length; i++) {
        t[name][i].draw(ts);
      }
    });
  },
  drawLoop: function(dt) {
    this.draw(dt);
    requestAnimationFrame(this.drawLoop.bind(this));
  },
  click: function(x, y) {
    io.emit('new-tower', {
      x: x,
      y: y
    });
  },
};

typeof module !== 'undefined' && (module.exports = Game);


var s = 4;

function r(max) {
  var max = max ? max : 1;
  var x = Math.sin(s++) * 10000;
  return (x - Math.floor(x)) * max;
}
