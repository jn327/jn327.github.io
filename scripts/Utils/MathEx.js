Math.roundMultip = function(x, multip)
{
  return Math.round(x / multip) * multip;
};

Math.getRnd = function(min, max)
{
  return (Math.random() * (max - min + 1) ) + min;
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
// so scaleNormal(0.5, 20, 60) would return 40 and scaleNormal(60, 20, 60) would return 1
Math.scaleNormal = function(val, min, max)
{
  return min + (val * (max - min));
}
