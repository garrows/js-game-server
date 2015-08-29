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
      game.cam.z = 1; //Magic full zoom number
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
      game.draw();
    });
  });

  describe("creeps", function() {
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
