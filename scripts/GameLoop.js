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
  if (tFrame == undefined)
  {
    tFrame = 0;
  }

  GameLoop.stopMain = window.requestAnimationFrame( main );

  GameLoop.deltaTime = (tFrame - GameLoop.currentTime)/1000;
  GameLoop.currentTime = tFrame;
  GameLoop.fps = 1 / GameLoop.deltaTime;

  update();
}

CommonElementsCreator.addLoadEvent(start);
CommonElementsCreator.addLoadEvent(main);
