window.addEventListener('wheel', function(e) {
  game.cam.z += e.deltaY / 200;
});

var mousedown = false;
canvas.onmouseup = canvas.onmousedown = function(e) {
  mousedown = e.type === 'mousedown';
  var x = e.layerX - canvas.offsetParent.offsetLeft,
   y = e.layerY - canvas.offsetParent.offsetTop;
}
canvas.onmousemove = function(e) {
  if (!mousedown) return;
  game.cam.x -= e.movementX;
  game.cam.y -= e.movementY;
  if (game.cam.x < 0) game.cam.x = 0;
  if (game.cam.y < 0) game.cam.y = 0;
}
