var MouseTracker = {};
MouseTracker.MouseDown = false;
MouseTracker.mousePos = undefined;

window.addEventListener("mousedown", function(e)
{
  MouseTracker.bMouseDown = true;

  onMouseDown();
}, false);

window.addEventListener("mouseup", function(e)
{
  MouseTracker.bMouseDown = false;
}, false);

window.addEventListener("mousemove", function(e)
{
  MouseTracker.mousePos = new Vector2D(e.pageX, e.pageY);
}, false);


window.addEventListener("touchstart", function(e)
{
  MouseTracker.bMouseDown = true;
  MouseTracker.mousePos = new Vector2D(e.touches[0].pageX, e.touches[0].pageY);

  onMouseDown();
}, false);

window.addEventListener("touchend", function(e)
{
  MouseTracker.bMouseDown = false;
}, false);

window.addEventListener("touchmove", function(e)
{
  MouseTracker.mousePos = new Vector2D(e.touches[0].pageX, e.touches[0].pageY);
}, false);
