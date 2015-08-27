function setupInput() {
  window.addEventListener('wheel', function(e) {
    game.cam.z += e.deltaY / 200;
  });

  var mousedown = false;
  canvas.onmouseup = canvas.onmousedown = function(e) {
    mousedown = e.type === 'mousedown';
    var x = e.layerX - canvas.offsetParent.offsetLeft,
      y = e.layerY - canvas.offsetParent.offsetTop;
  }
  canvas.onmousemove = function(e) {
    if (!mousedown) return;
    game.cam.x -= e.movementX;
    game.cam.y -= e.movementY;
    if (game.cam.x < 0) game.cam.x = 0;
    if (game.cam.y < 0) game.cam.y = 0;
  }
}

function Entity(game, x, y) {
  var t = this;
  t.type = 'Entity';
  t.color = '#e00';
  t.game = game;
  t.x = x;
  t.y = y;
}
Entity.prototype = {
  deserialize: function(data) {
    var t = this;
    t.x = data.x;
    t.y = data.y;
    t.type = data.type;
    t.color = data.color;
  },
  draw: function(ts) {
    var t = this;
    var w = canvas.width / (lCan.width * t.game.cam.z);
    c.strokeWidth = 1;
    c.fillStyle = c.strokeStyle = t.color;

    var x = t.x * w - (t.game.cam.x * w),
      y = t.y * w - (t.game.cam.y * w);

    t.drawDetails(ts, x, y, w);
  },
  drawDetails: function(ts, x, y, w) {
    c.fillRect(x, y, w, w);
    c.strokeRect(x - c.strokeWidth / 2, y - c.strokeWidth / 2, w + c.strokeWidth, w + c.strokeWidth);
  },
  toJSON: function() {
    var t = this;
    return {
      x: t.x,
      y: t.y,
      color: t.color,
      type: t.type
    }
  }

};



function Hive(game, x, y) {
  var t = this;
  t.type = 'Hive';
  t.color = '#00e';
  t.game = game;
  t.x = x;
  t.y = y;
}
Hive.prototype = new Entity;
Hive.prototype.constructor = Hive;
Hive.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 8;
  console.log('drawDetails')
  Entity.prototype.drawDetails.call(t, ts, x, y, w);

}

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
    z: 1
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
    this.counter++;
    var state = {
      counter: this.counter,
      players: this.players,
      food: this.food,
      hives: this.hives,
      creeps: this.creeps,
    };
    io && io.emit('serverUpdated', state);
    return state;
  },
  generateServerState: function(n) {
    var w = this.mapWidth;
    for (var i = 0; i < n; i++) {
      var food = new Entity(this, r(w), r(w));
      food.color = '#ff0';
      this.food.push(food);

      // var hive = {
      //   x: r(w),
      //   y: r(w),
      //   health: 100,
      //   creeps: [],
      //   update: function(ts) {
      //     log('creepCount', hive.creepCount);
      //     if (hive.creeps.length < 1) {
      //       var creep = {
      //         x: r(w),
      //         y: r(w),
      //         health: 100,
      //         update: function(ts) {}
      //       }
      //       hive.creeps.push(creep);
      //       this.creeps.push(creep);
      //     }
      //   }
      // };
      var hive = new Hive(this, r(w), r(w));
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


var s = 1;

function r(max) {
  var max = max ? max : 1;
  var x = Math.sin(s++) * 10000;
  return (x - Math.floor(x)) * max;
}

var GAME_WIDTH = 2500;
if (typeof window != 'undefined') {
  var game = new Game(GAME_WIDTH);

  log = function() {
    return console.log.apply(console, arguments);
  };
  db = function(key, val) {
    if (arguments.length === 2) {
      localStorage.setItem(key, val);
    } else {
      return localStorage.getItem(key);
    }
  };
  io = io(document.location.href);
  io.on('serverUpdated', game.serverUpdated.bind(game));
  var name = db('name') || 'Unnamed Player ' + Math.round(Math.random() * 10000);
  db('name', name);
  io.emit('register', {
    name: name
  })
  canvas = document.getElementById('c');

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  resize();
  setupInput();
  window.addEventListener('resize', resize, false);

  c = canvas.getContext('2d');
  game.generateLevel();
  game.drawLoop(0);
} else {
  var game = new Game(GAME_WIDTH);
  game.generateServerState(10);
  //Fill map
  io = require('sandbox-io');
  log('Loaded sandbox-io');
  io.on('connection', function(socket) {
    socket.on('event', function(data) {});
    socket.on('register', function(data) {
      var found = game.players.some(function(p) {
        return p.name === data.name;
      })
      if (!found) {
        var player = new Entity(game, Math.round(Math.random() * GAME_WIDTH), Math.round(Math.random() * GAME_WIDTH))
        player.name = data.name;
        game.players.push(player);
        // db('records', records);
      }
    });
    socket.on('disconnect', function() {});
  });
  setInterval(game.update.bind(game, io), 1000);
}
