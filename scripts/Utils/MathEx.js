Math.roundMultip = function(x, multip)
{
  return Math.round(x / multip) * multip;
};

Math.getRnd = function(min, max)
{
  return (Math.random() * (max - min)) + min;
}

Math.clamp = function(val, min, max)
{
 return Math.min(Math.max(min, val), max);
}

//min-max normalization function, returns a value between 0 and 1 mapped in between min and max
// for example minMaxNormal(20, 20, 50) would return 0 and minMaxNormal(30, 20, 40) would return 0.5
Math.minMaxNormal = function(val, min, max)
{
 return (val-min)/(max-min);
}

//Given a normalized value 0-1, will return between min and max
// so scaleNormal(0.5, 20, 60) would return 40 and scaleNormal(1, 20, 60) would return 60
Math.scaleNormal = function(val, min, max)
{
  return min + (val * (max - min));
}

//same as above but expecting a value from -1 to 1
Math.scaleNormalSigned = function(val, min, max)
{
  var scaledVal = Math.scaleNormal(Math.abs(val), min, max);
  if (val < 0) { scaledVal = -scaledVal; }

  return scaledVal;
}

Math.angleBetweenPoints = function(x1, y1, x2, y2)
{
  return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}
