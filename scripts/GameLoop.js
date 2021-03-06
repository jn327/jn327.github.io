var GameLoop = {};
GameLoop.stopMain = undefined;
GameLoop.deltaTime = 0;
GameLoop.currentFrame = 0;
GameLoop.currentTime = 0;
GameLoop.fps = 0;
GameLoop.stopMainLoop = function()
{
  window.cancelAnimationFrame( this.stopMain );
}

GameLoop.main = function( tFrame )
{
  if (tFrame == undefined)
  {
    tFrame = 0;
  }

  GameLoop.stopMain = window.requestAnimationFrame( GameLoop.main );

  GameLoop.deltaTime = (tFrame - GameLoop.currentTime)/1000;
  GameLoop.currentTime = tFrame;
  GameLoop.currentFrame ++;
  GameLoop.fps = 1 / GameLoop.deltaTime;

  update();
}

CommonElementsCreator.addLoadEvent(start);
CommonElementsCreator.addLoadEvent(GameLoop.main);
