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

    socket.on('new-tower', function(d) {
      console.log('tower',d);
      game.blocks.push(new Block(game, d.x, d.y));
    });

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
