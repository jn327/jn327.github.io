var CanvasScaler = {};

CanvasScaler.updateCanvasSize = function( theCanvas, maxScale, minScaleV, minScaleH )
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

  var wDivider;
  var smallestAxis;
  var _minScale;
  var _maxScale = maxScale;
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

      return true;
  }
  return false;
}
