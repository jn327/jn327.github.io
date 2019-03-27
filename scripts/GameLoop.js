var GameLoop = {};
GameLoop.stopMain = undefined;
GameLoop.deltaTime = 0;
GameLoop.currentTime = 0;
GameLoop.fps = 0;
GameLoop.stopMainLoop = function()
{
  window.cancelAnimationFrame( this.stopMain );
}

function main( tFrame )
{
  GameLoop.stopMain = window.requestAnimationFrame( main );

  GameLoop.deltaTime = (tFrame - GameLoop.currentTime)/1000;
  GameLoop.currentTime = tFrame;
  GameLoop.fps = 1 / GameLoop.deltaTime;

  update();
}

window.onload = function ()
{
  start(); // call our start function
  main(0); // Start the cycle
}
