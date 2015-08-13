

function mouseEvents(e) {
  mousedown = e.type == "mousedown";
  var x = e.layerX - canvas.offsetParent.offsetLeft;
  var y = e.layerY - canvas.offsetParent.offsetTop;
}
canvas.onmousedown = mouseEvents;
canvas.onmouseup = mouseEvents;
// canvas.onmousemove = mouseMove;
// $(document).keydown(keypressed);
// $(document).keyup(keypressed);
// document.addEventListener("touchstart", touchHandler, true);
// document.addEventListener("touchmove", touchHandler, true);
// document.addEventListener("touchend", touchHandler, true);
// document.addEventListener("touchcancel", touchHandler, true);
