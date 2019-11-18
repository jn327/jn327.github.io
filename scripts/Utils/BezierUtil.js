var BezierUtil = {};

BezierUtil.evaluate = function(points, t, is2d)
{
  if (is2d == undefined) { is2d = true; }

  if (points.length <= 2)
  {
    return is2d ?
      BezierUtil.linear2D(points[0], points[1], t) :
      BezierUtil.linear1D(points[0], points[1], t);
  }
  else if (points.length == 3)
  {
    return is2d ?
      BezierUtil.quadratic2D(points[0], points[1], points[2], t) :
      BezierUtil.quadratic1D(points[0], points[1], points[2], t);
  }
  else if (points.length == 4)
  {
    return is2d ?
      BezierUtil.cubic2D(points[0], points[1], points[2], points[3], t) :
      BezierUtil.cubic1D(points[0], points[1], points[2], points[3], t);
  }
  else
  {
    //Casteljau for evaluating
    var currentPoints = points;
    var itr = 0;
    while (currentPoints.length > 1 && itr < 6)
    {
      var nextPoints = [];
      var prevPoint = undefined;
      for (var i = 0; i < currentPoints.length; i++)
      {
        if (prevPoint != undefined)
        {
          nextPoints.push( is2d ?
            BezierUtil.linear2D(prevPoint, currentPoints[i], t) :
            BezierUtil.linear1D(prevPoint, currentPoints[i], t)
          );
        }
        prevPoint = currentPoints[i];
      }

      currentPoints = nextPoints;
      itr ++;
    }

    return currentPoints[0];
  }
}

//Explicit beziers
BezierUtil.linear1D = function(p1, p2, t)
{
  return ((1-t)*p1) + (t*p2);
}
BezierUtil.quadratic1D = function(p1, p2, p3, t)
{
  return (Math.pow((1-t),2)*p1) + (2*(1-t)*t*p2) + (Math.pow(t,2)*p3);
}
BezierUtil.cubic1D = function(p1, p2, p3, p4, t)
{
  return (Math.pow((1-t),3)*p1) + (3*Math.pow((1-t),2)*t*p2) + (3*(1-t)*Math.pow(t,2)*p3) + (Math.pow(t,3)*p4);
}

//Parametic beziers
BezierUtil.linear2D = function(p1, p2, t)
{
  return new Vector2D
  (
    BezierUtil.linear1D(p1.x, p2.x, t),
    BezierUtil.linear1D(p1.y, p2.y, t)
  );
}
BezierUtil.quadratic2D = function(p1, p2, p3, t)
{
  return new Vector2D
  (
    BezierUtil.quadratic1D(p1.x, p2.x, p3.x, t),
    BezierUtil.quadratic1D(p1.y, p2.y, p3.y, t)
  );
}
BezierUtil.cubic2D = function(p1, p2, p3, p4, t)
{
  return new Vector2D
  (
    BezierUtil.quadratic1D(p1.x, p2.x, p3.x, p4.x, t),
    BezierUtil.quadratic1D(p1.y, p2.y, p3.y, p4.y, t)
  );
}
