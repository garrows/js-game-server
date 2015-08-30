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
  t.game = game;
  t.props = ['type', 'color', 'x', 'y'];
  t.type = 'Entity';
  t.color = '#e00';
  t.x = x;
  t.y = y;
}
Entity.prototype = {
  constructor: Entity,
  deserialize: function(data) {
    var t = this;
    t.props.forEach(function(p) {
      t[p] = data[p];
    });
  },
  update: function(counter) {
    var t = this;
    if (t.x < 0) t.x = t.game.mapWidth - 1;
    if (t.y < 0) t.y = t.game.mapWidth - 1;
    if (t.x >= t.game.mapWidth) t.x = 0;
    if (t.y >= t.game.mapWidth) t.y = 0;
  },
  draw: function(ts) {
    var t = this;
    var w = canvas.width / (lCan.width * t.game.cam.z);
    c.strokeWidth = 1;
    c.fillStyle = c.strokeStyle = t.color;

    var x = t.x * w - (t.game.cam.x * w),
      y = t.y * w - (t.game.cam.y * w);

    t.drawDetails(ts, x - w / 2, y - w / 2, w);
  },
  drawDetails: function(ts, x, y, w) {
    c.fillRect(x, y, w, w);
    c.strokeRect(x - c.strokeWidth / 2, y - c.strokeWidth / 2, w + c.strokeWidth, w + c.strokeWidth);
  },
  toJSON: function() {
    var t = this,
      r = {};
    t.props.forEach(function(p) {
      r[p] = t[p];
    });
    return r;
  }

};

function Hive(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Hive';
  t.color = '#00e';
  t.creepCount = 0;
  t.props.push('creepCount');
}
Hive.prototype = new Entity;
Hive.prototype.constructor = Hive;
Hive.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 8;
  Entity.prototype.drawDetails.call(t, ts, x, y, w);
}
Hive.prototype.update = function(counter) {
  var t = this;
  if (t.creepCount < 1) {
    t.creepCount++;
    var creep = new Creep(t.game, t.x, t.y);
    t.game.creeps.push(creep);
  }
  Entity.prototype.update.call(t, counter);
}

function Creep(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Creep';
  t.color = '#000';
  t.hiveX = x;
  t.hiveY = y;
  t.eating = false;
  t.energy = 0;
  t.d = r(2 * Math.PI);
  t.props.push('hiveX', 'hiveY', 'eating', 'energy', 'd');
}
Creep.prototype = new Entity;
Creep.prototype.constructor = Creep;
Creep.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 4;
  console.log('draw');
  Entity.prototype.drawDetails.call(t, ts, x, y, w);
  c.beginPath();
  c.moveTo(x, y);
  c.arc(x, y, 100, t.d - Math.PI / 2, t.d - Math.PI / 2 + 2 * Math.PI);
  c.stroke();
}
Creep.prototype.update = function(counter) {
  var t = this;
  if (!t.eating && t.energy < 5) {
    t.eating = t.game.food.some(function(f) {
      var dist = Math.sqrt(Math.pow(t.x - f.x, 2) + Math.pow(t.y - f.y, 2));
      if (dist < 100 && dist > 1) {
        t.color = '#0f0';
        t.d = Math.atan2((f.x - t.x), (t.y - f.y));
        if (Number.isNaN(t.d)) t.d = 0;
      } else if (dist <= 1) {
        return true;
      } else {
        t.color = '#000';
      }
      return false;
    });
    t.x += Math.sin(t.d);
    t.y -= Math.cos(t.d);
  } else {
    if (t.eating) t.energy++;
    if (t.energy > 5) {
      t.color = '#9f5';
      t.eating = false;
      var dist = Math.sqrt(Math.pow(t.x - t.hiveX, 2) + Math.pow(t.y - t.hiveY, 2));
      if (dist <= 1) {
        t.energy = 0;
        t.d = t.d + Math.PI;
      } else {
        t.d = Math.atan2((t.hiveX - t.x), (t.y - t.hiveY));
        t.x += Math.sin(t.d);
        t.y -= Math.cos(t.d);
      }
    }
  }

  Entity.prototype.update.call(t, counter);

}

function Food(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Food';
  t.color = '#ff0';
}
Food.prototype = new Entity;
Food.prototype.constructor = Food;

function Game(mapWidth) {
  var t = this;
  t.counter = 0;
  t.players = [];
  t.food = [];
  t.hives = [];
  t.creeps = [];
  t.entityNames = ['players', 'hives', 'creeps', 'food'];
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
    t.cam.z = t.cam.z < .1 ? .1 : t.cam.z;
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
};

typeof module !== 'undefined' && (module.exports = Game);


var s = 4;

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
  game.generateServerState(20);
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
  setInterval(game.update.bind(game, io), 50);
}
