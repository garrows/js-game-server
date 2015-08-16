window.addEventListener('wheel', function(e) {
  //TODO: scroll limits & offset to mouse position
  game.cam.z += e.deltaY / 20;
});

function mouseEvents(e) {
  mousedown = e.type == "mousedown";
  var x = e.layerX - canvas.offsetParent.offsetLeft;
  var y = e.layerY - canvas.offsetParent.offsetTop;
}
canvas.onmousedown = mouseEvents;
canvas.onmouseup = mouseEvents;
// canvas.onmousemove = mouseMove;
