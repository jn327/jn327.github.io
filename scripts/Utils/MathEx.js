Math.TWOPI = 2 * Math.PI;

//Given a value, will round it to the nearest multiple of multip.
// so (1, 4) will return 0 and (3, 4) will return 4...
Math.roundMultip = function(val, multip)
{
  return Math.round(val / multip) * multip;
}

Math.roundUpMultip = function( val, multip )
{
  var result = val;
  if ((result % val) != 0)
  {
    result = Math.roundMultip(result, multip);
    //if it rounded down and we're still smaller
    if (result < val)
    {
      result += multip;
    }
  }
  return result;
}

//returns a random number between min and max.
Math.getRnd = function(min, max)
{
  return (Math.random() * (max - min)) + min;
}

//clamps a value (val) between min and max, so (2, 0, 1) will return 1 and (-1, 0, 1) will return 0
Math.clamp = function(val, min, max)
{
 return Math.min(Math.max(min, val), max);
}

//Wraping value between min and max, so wrap(1.1, 0, 1) would return 0.1 and wrap(-0.2, 0, 0.5) would return 0.3
Math.wrap = function(val, min, max)
{
  return (((val - min) % (max - min)) + (max - min)) % (max - min) + min;
}

//min-max normalization function, returns a value between 0 and 1 mapped in between min and max
// for example minMaxNormal(20, 20, 50) would return 0 and minMaxNormal(30, 20, 40) would return 0.5
// values below range, like (10, 20, 50) would return negatives like -0.33, values over range would return over 1.
// so maybe make sure to clamp
Math.minMaxNormal = function(val, min, max)
{
 return (val-min)/(max-min);
}

//Given a normalized value 0-1, will return between min and max
// so scaleNormal(0.5, 20, 60) would return 40 and scaleNormal(1, 20, 60) would return 60, scaleNormal(0.5, 5, -5) would return 0
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

//given 2 vectors (x1, y1) and (x2, y2) will return the angle (in degrees) between.
Math.angleBetweenPoints = function(x1, y1, x2, y2)
{
  return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}

//converts degrees to radians
Math.degreesToRad = function( degrees )
{
  return degrees * (Math.PI / 180);
}

Math.radToDegrees = function( radians )
{
  return (radians * 180) / Math.PI;
}
