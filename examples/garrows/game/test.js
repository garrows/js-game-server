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
