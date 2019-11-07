var BezierUtil = {};

BezierUtil.linear = function(p1, p2, t)
{
  //t: current time, b: beginning value, c: change in value, d: duration
  return ((1-t)*p1) + (t*p2);
}
BezierUtil.quadratic = function(p1, p2, p3, t)
{
  return (Math.pow((1-t),2)*p1) + (2*(1-t)*t*p2) + (Math.pow(t,2)*p3);
}
BezierUtil.cubic = function(p1, p2, p3, p4, t)
{
  return (Math.pow((1-t),3)*p1) + (3*Math.pow((1-t),2)*t*p2) + (3*(1-t)*Math.pow(t,2)*p3) + (Math.pow(t,3)*p4);
}
