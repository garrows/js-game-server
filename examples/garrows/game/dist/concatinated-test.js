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
  t.creepCount = 0;
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
    var creep = new Creep(game, t.x, t.y);
    t.game.creeps.push(creep);
  }
  Entity.prototype.update.call(t, counter);
}

function Creep(game, x, y) {
  var t = this;
  t.type = 'Creep';
  t.color = '#000';
  t.game = game;
  t.x = x;
  t.y = y;
  t.d = r(2*Math.PI);
}
Creep.prototype = new Entity;
Creep.prototype.constructor = Creep;
Creep.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 4;
  Entity.prototype.drawDetails.call(t, ts, x, y, w);
}
Creep.prototype.update = function(counter) {
  var t = this;
  t.game.food.forEach(function(f) {
    var d = Math.sqrt(Math.pow(t.x - f.x, 2) + Math.pow(t.y - f.y, 2));
    if (d < 50) {
      t.color = '#0f0';
    }
  });
  t.x += Math.sin(t.d);
  t.y += Math.cos(t.d);

  Entity.prototype.update.call(t, counter);

}

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
      log('name', name, t[name].length);
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


var s = 1;

function r(max) {
  var max = max ? max : 1;
  var x = Math.sin(s++) * 10000;
  return (x - Math.floor(x)) * max;
}

log = function() {
  return console.log.apply(console, arguments);
};
canvas = document.getElementById('c');
c = canvas.getContext('2d');

var GAME_WIDTH = 2500;
var game = new Game(GAME_WIDTH);




describe("GarrowsGame", function() {

  describe("when updating the server", function() {
    it("should increment counter", function() {
      var state = game.update();
      state.counter.should.eql(1);
      game.counter.should.eql(1);
    });
  });

  describe("when updating the game from the server", function() {
    it("should serialize the state", function() {
      game.serverUpdated({
        counter: 2,
        players: [{
          id: 1,
          name: 'Testing Player',
          x: GAME_WIDTH/16,
          y: GAME_WIDTH/16
        }]
      });
      game.counter.should.eql(2);
    });
  });

  describe("when generating level", function() {
    it("should genrate level with creeps, hives & food", function() {
      var COUNT = 10;
      game.generateServerState(COUNT);
      game.food.length.should.eql(COUNT);
      game.hives.length.should.eql(COUNT);
      game.creeps.length.should.eql(0);
    });
  });

  describe("when drawing", function() {
    it("should genrate level and draw it", function() {
      game.generateLevel();
      game.cam.z = 1; //Magic full zoom number
      game.draw();
      var debugLevelCanvas = document.getElementById('levelCanvas');
      var debugLevelCtx = debugLevelCanvas.getContext('2d');
      debugLevelCtx.drawImage(lCan, 0, 0, lCan.width, lCan.height, 0, 0, debugLevelCanvas.width, debugLevelCanvas.height);
    });
    it("should draw zoomed level", function() {
      var canvas = document.getElementById('canvasZoomed');
      c = canvas.getContext('2d');
      game.cam.z = 1/8;
      game.cam.x += game.mapWidth/32;
      game.draw();
    });
  });

  // describe("map", function() {
  //   it("should fill map array", function() {
  //     var game = new Game(GAME_WIDTH);
  //     var i = 0;
  //     for (var y = 0; y < game.map.width; y++) {
  //       for (var x = 0; x < game.map.width; x++) {
  //         game.map.set(x, y, i);
  //         i++;
  //       }
  //     }
  //     for (var i = 0; i < game.map.width * game.map.width; i++) {
  //       game.map.d[i].should.eql(i);
  //     }
  //     game.map.get(0, 0).should.eql(0);
  //     game.map.get(1, 0).should.eql(1);
  //     game.map.get(0, 1).should.eql(10);
  //     (function() {
  //       game.map.get(10, 0);
  //     }).should.throwError();
  //     (function() {
  //       game.map.get(0, 10);
  //     }).should.throwError();
  //     (function() {
  //       game.map.get(-1, 0);
  //     }).should.throwError();
  //     (function() {
  //       game.map.get(0, -1);
  //     }).should.throwError();
  //   });
  // });

});




var runner = mocha.run();
