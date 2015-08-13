log = function() {
  return console.log.apply(console, arguments);
};
canvas = document.getElementById('c');
c = canvas.getContext('2d');

var game = new Game();




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
      game.serverUpdate({
        counter: 2
      });
      game.counter.should.eql(2);
    });
  });

  describe("when drawing", function() {
    it("should draw the current state", function() {
      game.draw();
    });
  });

});




var runner = mocha.run();
