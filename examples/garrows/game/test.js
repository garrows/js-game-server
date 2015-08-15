log = function() {
  return console.log.apply(console, arguments);
};
canvas = document.getElementById('c');
c = canvas.getContext('2d');

var MAP_WIDTH = 10;
var game = new Game(MAP_WIDTH);




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
          x: 0,
          y: 0
        }]
      });
      game.counter.should.eql(2);
    });
  });

  describe("when drawing", function() {
    it("should genrate level and draw it", function() {
      game.generateLevel();
      game.draw();
    });
  });

  describe("map", function() {
    it("should fill map array", function() {
      var game = new Game(MAP_WIDTH);
      var i = 0;
      for (var y = 0; y < game.map.width; y++) {
        for (var x = 0; x < game.map.width; x++) {
          game.map.set(x, y, i);
          i++;
        }
      }
      for (var i = 0; i < game.map.width * game.map.width; i++) {
        game.map.d[i].should.eql(i);
      }
      game.map.get(0, 0).should.eql(0);
      game.map.get(1, 0).should.eql(1);
      game.map.get(0, 1).should.eql(10);
      (function() {
        game.map.get(10, 0);
      }).should.throwError();
      (function() {
        game.map.get(0, 10);
      }).should.throwError();
      (function() {
        game.map.get(-1, 0);
      }).should.throwError();
      (function() {
        game.map.get(0, -1);
      }).should.throwError();
    });
  });

});




var runner = mocha.run();
