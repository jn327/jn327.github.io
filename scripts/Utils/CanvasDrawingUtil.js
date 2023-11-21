var CanvasDrawingUtil = {};

CanvasDrawingUtil.getCirclePath = function(x, y, size)
{
    var path = new Path2D();
    path.arc(x, y, size, 0, 2 * Math.PI);
    return path;
}

CanvasDrawingUtil.drawCircle = function( ctx, fillStyle, x, y, size)
{
    ctx.fillStyle = fillStyle;
    ctx.fill(CanvasDrawingUtil.getCirclePath(x, y, size));
}

CanvasDrawingUtil.drawRect = function( ctx, fillStyle, x, y, xSize, ySize)
{
    ctx.fillStyle = fillStyle;
    ctx.fillRect(Math.round(x - (xSize * 0.5)), Math.round(y - (ySize * 0.5)), xSize, ySize);
}