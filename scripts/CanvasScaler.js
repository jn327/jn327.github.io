var CanvasScaler = {};

CanvasScaler.updateCanvasSize = function( canvases, maxScale, minScaleV, minScaleH )
{
  if (maxScale == undefined)
  {
    maxScale = 600;
  }
  if (minScaleV == undefined)
  {
    minScaleV = 600;
  }
  if (minScaleH == undefined)
  {
    minScaleH = 1;
  }

  var haveResized = false;

  var l = canvases.length;
  var theCanvas;

  var wDivider;
  var smallestAxis;
  var _minScale;
  var _maxScale = maxScale;

  for (var i = 0; i < l; i++)
  {
    theCanvas = canvases[i];

    if (theCanvas.clientWidth < theCanvas.clientHeight)
    {
      wDivider = theCanvas.clientHeight/theCanvas.clientWidth;
      smallestAxis = theCanvas.clientWidth;

      _minScale = minScaleV;
    }
    else
    {
      wDivider = theCanvas.clientHeight/theCanvas.clientWidth;
      smallestAxis = theCanvas.clientHeight;

      _minScale = minScaleH;
    }

    smallestAxis = Math.clamp(smallestAxis, _minScale, _maxScale);

    var theW = Math.floor(smallestAxis / wDivider);
    var theH = Math.floor(smallestAxis);
    if (theCanvas.width != theW || theCanvas.height != theH)
    {
        theCanvas.width = theW;
        theCanvas.height = theH;

        haveResized = true;
    }
  }

  return haveResized;
}
