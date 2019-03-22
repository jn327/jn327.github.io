Math.roundMultip = function(x, multip)
{
  return Math.round(x / multip) * multip;
};

Math.getRnd = function(min, max)
{
  return (Math.random() * (max - min + 1) ) + min;
}
