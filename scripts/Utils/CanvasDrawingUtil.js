var CanvasDrawingUtil = {};

CanvasDrawingUtil.drawCircle = function( ctx, fillStyle, x, y, size)
{
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
}

CanvasDrawingUtil.drawRect = function( ctx, fillStyle, x, y, xSize, ySize)
{
    ctx.fillStyle = fillStyle;
    ctx.fillRect(Math.round(x - (xSize * 0.5)), Math.round(y - (ySize * 0.5)), xSize, ySize);
}