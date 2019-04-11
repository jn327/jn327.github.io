var BezierPathUtil = {};

BezierPathUtil.createCurve = function( points, thePath, tension, moveToStart )
{
  if (thePath == undefined) { thePath = new Path2D(); }
  if (moveToStart == undefined) { moveToStart = false; }
  if (tension == undefined) { tension = 0.5; }

  if (points.length < 2)
  {
    console.log("We can't create a curve with < 2 points.")
    return thePath;
  }

  if (moveToStart == true)
  {
    var firstPoint = points[0];
    thePath.moveTo(firstPoint.x, firstPoint.y);
  }

  var nPoints = points.length;

  //if there's only one point, just go to that!
  if (nPoints == 2)
  {
    lastPoint = points[1];
    thePath.lineTo(lastPoint.x, lastPoint.y);
  }
  else
  {
    for (var i = 0; i < nPoints; i++)
    {
      var bFirst = i == 0;
      var bLast = i == nPoints-1;

      var p1 = points[i];
      var p2 = bLast ? p1 : points[i+1];
      var p0 = bFirst ? p1 : points[i-1];

      //get the control points
      var dist01 = p1.distance(p0);
      var dist12 = p2.distance(p1);

      var fa = tension * dist01 / (dist01 + dist12);
      var fb = tension - fa;

      var dir02 = p0.direction(p2);

      var cp0 = p1.sum( dir02.getMultiplied(fa) );
      var cp2 = p1.sum( dir02.getMultiplied(fb) );

      //if last or first then use quadraticCurveTo
      if (bFirst)
      {
        thePath.quadraticCurveTo(cp2.x, cp2.y, p1.x, p1.y);
      }
      else if (bLast)
      {
        thePath.quadraticCurveTo(cp0.x, cp0.y, p1.x, p1.y);
      }
      else
      {
        thePath.bezierCurveTo(cp0.x, cp0.y, cp2.x, cp2.y, p1.x, p1.y);
      }
    }
  }

  return thePath;
}
