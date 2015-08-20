log = function() {
  return console.log.apply(console, arguments);
};
canvas = document.getElementById('c');
c = canvas.getContext('2d');

var GAME_WIDTH = 5000;
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
          x: GAME_WIDTH/2,
          y: GAME_WIDTH/2
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
