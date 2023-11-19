var GameCamera = {};

GameCamera.position = undefined;
GameCamera.drawnAreaSize = undefined;

GameCamera.getDrawnPosition = function( x, y, bNegative = true )
{
    let cameraOffset = new Vector2D(
        GameCamera.position.x - GameCamera.drawnAreaSize.x * 0.5, 
        GameCamera.position.y - GameCamera.drawnAreaSize.y * 0.5
    );

    return bNegative ? new Vector2D(x - cameraOffset.x, y - cameraOffset.y) :
        new Vector2D(x + cameraOffset.x, y + cameraOffset.y);
}