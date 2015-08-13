
if (typeof log === 'undefined') {
  //browser
  var game = new Game();

  log = function() {
    return console.log.apply(console, arguments);
  };
  io = io(document.location.href);
  io.on('serverUpdate', game.serverUpdate.bind(game));
  canvas = document.getElementById('c');
  c = canvas.getContext('2d');
  requestAnimationFrame(game.draw.bind(game));
} else {
  var Game = require(__dirname + '/game.js');
  var game = new Game();
  // var game = new Game();
  io = require('sandbox-io');
  log('Loaded sandbox-io');
  io.on('connection', function(socket) {
    socket.on('event', function(data) {});
    socket.on('disconnect', function() {});
  });
  setInterval(game.update.bind(game, io), 1000);
}
