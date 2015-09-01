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

    t.drawDetails(ts, x, y, w);
  },
  drawDetails: function(ts, x, y, w) {
    x -= w / 2;
    y -= w / 2;
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
  t.collisionFreq = 0;
  t.props.push('hiveX', 'hiveY', 'eating', 'energy', 'd', 'collisionFreq');
}
Creep.prototype = new Entity;
Creep.prototype.constructor = Creep;
Creep.prototype.drawDetails = function(ts, x, y, w) {
  var t = this;
  c.strokeWidth = 4;
  Entity.prototype.drawDetails.call(t, ts, x, y, w);
  c.beginPath();
  c.moveTo(x, y);
  c.arc(x, y, 100, t.d - Math.PI / 2, t.d - Math.PI / 2 + 2 * Math.PI);
  c.stroke();
}
Creep.prototype.update = function(counter) {
  var t = this;
  if (t.findNewPath-- > 0) {
    t.x += Math.sin(t.d);
    t.y -= Math.cos(t.d);
  } else if (!t.eating && t.energy < 5) {
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

  t.checkCollisions(counter);

  Entity.prototype.update.call(t, counter);

}

Creep.prototype.checkCollisions = function(counter) {
  var t = this;
  var collides = t.game.blocks.some(function(f) {
    var dist = Math.sqrt(Math.pow(t.x - f.x, 2) + Math.pow(t.y - f.y, 2));
    if (dist < 1) {
      return true;
    }
    return false;
  });
  if (collides) {
    //Undo last move
    t.x += Math.sin(t.d + Math.PI);
    t.y -= Math.cos(t.d + Math.PI);
    t.d = r(Math.PI * 2);
    t.collisionFreq += 1;
    console.log('collided', t.collisionFreq);
    t.findNewPath = t.collisionFreq;
    this.update();
  } else {
    t.collisionFreq = t.collisionFreq > 0.1 ? t.collisionFreq - 0.1 : 0;
  }
}

function Food(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Food';
  t.color = '#ff0';
}
Food.prototype = new Entity;
Food.prototype.constructor = Food;

function Block(game, x, y) {
  var t = this;
  Entity.prototype.constructor.call(t, game, x, y);
  t.type = 'Block';
  t.color = '#4f1111';
  t.blocking = true;
}
Block.prototype = new Entity;
Block.prototype.constructor = Block;

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
          type: 'Entity',
          x: GAME_WIDTH / 16,
          y: GAME_WIDTH / 16
        }]
      });
      game.counter.should.eql(2);
    });
  });

  describe("when generating level", function() {
    it("should genrate level with creeps, hives & food", function() {
      var COUNT = 10;
      game.generateServerState(COUNT);
      game.food.length.should.eql(COUNT * 3);
      game.hives.length.should.eql(COUNT);
      game.creeps.length.should.eql(0);
    });
  });

  describe("when drawing", function() {
    it("should genrate level and draw it", function() {
      game.generateLevel();
      game.cam.z = 1;
      game.draw();
      var debugLevelCanvas = document.getElementById('levelCanvas');
      var debugLevelCtx = debugLevelCanvas.getContext('2d');
      debugLevelCtx.drawImage(lCan, 0, 0, lCan.width, lCan.height, 0, 0, debugLevelCanvas.width, debugLevelCanvas.height);
    });
    it("should draw zoomed level", function() {
      var canvas = document.getElementById('canvasZoomed');
      c = canvas.getContext('2d');
      game.cam.z = 1 / 8;
      game.cam.x += game.mapWidth / 32;
      game.cam.y += game.mapWidth / 32;
      game.draw();
    });
  });

  describe("creeps", function() {

    describe("directions", function() {
      it("should be eating when on top of food", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 10, 10));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(true);
        // game.creeps[0].d.should.eql(0);
      });
      it("should be eating when next to food", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 11, 10));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(true);
        // game.creeps[0].d.should.eql(0);
      });

      it("should be straight up", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 10, 0));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(false);
        game.creeps[0].d.should.eql(0);
      });

      it("should be 45deg", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 15, 5));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(false);
        game.creeps[0].d.should.eql(45 * Math.PI / 180);
      });

      it("should be 90deg", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 20, 10));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(false);
        game.creeps[0].d.should.eql(90 * Math.PI / 180);
      });

      it("should be 180deg", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 10, 20));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(false);
        game.creeps[0].d.should.eql(180 * Math.PI / 180);
      });

      it("should be 270deg", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 0, 10));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(false);
        game.creeps[0].d.should.eql(-90 * Math.PI / 180);
      });

      it("should be 315deg", function() {
        var game = new Game(40);
        game.food.push(new Food(game, 0, 0));
        game.creeps.push(new Creep(game, 10, 10));
        game.update();
        game.creeps[0].eating.should.eql(false);
        game.creeps[0].d.should.eql(-45 * Math.PI / 180);
      });
    });

    describe("pathfinding", function() {

      var LOOP_TIME = 50;
      var game;

      this.timeout(LOOP_TIME * 1000);
      this.slow(LOOP_TIME * 100);

      before(function(_done) {
        canvas = document.getElementById('towersCanvas');
        c = canvas.getContext('2d');
        game = new Game(20);
        game.generateLevel();
        game.food.push(new Food(game, 5, 10));
        game.hives.push(new Hive(game, 15, 10));
        game.blocks.push(new Block(game, 10, 10));
        game.cam.z = 1;
        return _done();
      });

      it("should not collide with towers", function(done) {
        game.creeps.length.should.eql(0);
        var i = 0;
        var loop = function() {
          i++;
          game.update();
          game.draw();
          game.creeps.length.should.eql(1);
          if (i === 5) {
            game.creeps[0].y.should.not.eql(10);
            game.creeps[0].eating.should.eql(false);
            game.creeps[0].energy.should.eql(0);
            return done();
          } else {
            game.creeps[0].y.should.eql(10);
          }
          setTimeout(loop, LOOP_TIME);
        };
        setTimeout(loop, 0);
      });

      it("should find food within 10ish updates", function(done) {
        var i = 0;
        var loop = function() {
          i++;
          game.update();
          game.draw();
          if (game.creeps[0].eating) {
            return done();
          }
          i.should.be.lessThan(20);
          setTimeout(loop, LOOP_TIME);
        };
        setTimeout(loop, 0);
      });

      it("should its way home through complex route", function(done) {
        var i = 0;
        for (var x = 0; x < 20; x++) {
          game.blocks.push(new Block(game, 0.5, x));
          game.blocks.push(new Block(game, 19.5, x));
          game.blocks.push(new Block(game, x, 0.5));
          game.blocks.push(new Block(game, x, 19.5));
        }
        game.blocks.push(new Block(game, 6, 7));
        game.blocks.push(new Block(game, 7, 7));
        game.blocks.push(new Block(game, 8, 7));
        game.blocks.push(new Block(game, 9, 7));
        game.blocks.push(new Block(game, 10, 7));
        game.blocks.push(new Block(game, 10, 8));
        game.blocks.push(new Block(game, 10, 9));
        game.blocks.push(new Block(game, 10, 11));
        game.blocks.push(new Block(game, 10, 12));
        game.blocks.push(new Block(game, 10, 13));
        var loop = function() {
          i++;
          game.update();
          game.draw();
          if (game.creeps[0].energy == 0) {
            return done();
          }
          i.should.be.lessThan(200);
          setTimeout(loop, LOOP_TIME);
        };
        setTimeout(loop, 0);
      });
    });

  });


});




var runner = mocha.run();
