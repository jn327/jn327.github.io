// http://paulirish.com/2011/requestanimationframe-for-smart-animating
window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / _frameRate); //1000/fps
};

var _frameRate = 10;
var _bMouseDown = false;
var _mousePos = new Vector2D(0,0);

window.onload = function ()
{
    start();
    animFrame();
};

function animFrame()
{
  update();

  // Just so that I dont have to remember to call requestAnimFrame() at the end of update.
  requestAnimFrame(animFrame);
}

window.addEventListener("mousedown", function(e)
{
	e.preventDefault();

	_bMouseDown = true;
  onMouseDown();

}, false);

window.addEventListener("mouseup", function(e)
{
	e.preventDefault();

	_bMouseDown = false;

}, false);

window.addEventListener("mousemove", function(e)
{
	e.preventDefault();

  //TODO: this will be wrong if the click is in a canvas that is offset...
	_mousePos = new Vector2D(e.pageX, e.pageY);

}, false);


window.addEventListener("touchstart", function(e)
{
	//prevent default behaviour so the screen doesn't scroll or zoom...
	e.preventDefault();

	_bMouseDown = true;
  _mousePos = new Vector2D(e.touches[0].pageX, e.touches[0].pageY);

	onMouseDown();

}, false);

window.addEventListener("touchend", function(e)
{
	e.preventDefault();

	_bMouseDown = false;

}, false);

window.addEventListener("touchmove", function(e)
{
	e.preventDefault();

	_mousePos = new Vector2D(e.touches[0].pageX, e.touches[0].pageY);

}, false);
