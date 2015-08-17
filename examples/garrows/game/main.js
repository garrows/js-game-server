var GAME_WIDTH = 5000;
if (typeof log === 'undefined') {
  //browser
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
  window.addEventListener('resize', resize, false);

  c = canvas.getContext('2d');
  game.generateLevel();
  game.drawLoop(0);
} else {
  var Game = require(__dirname + '/game.js');
  var game = new Game(GAME_WIDTH);
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
        game.players.push({
          name: data.name,
          x: Math.round(Math.random() * GAME_WIDTH),
          y: Math.round(Math.random() * GAME_WIDTH)
        });
        // db('records', records);
      }
    });
    socket.on('disconnect', function() {});
  });
  setInterval(game.update.bind(game, io), 1000);
}
