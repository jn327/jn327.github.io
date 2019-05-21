function CurlNoise( noiseFunction, noiseScale, derivativeSampleDist )
{
  if (derivativeSampleDist == undefined)
  {
    derivativeSampleDist = 1;
  }

  var noiseFunc = noiseFunction;
  var scale     = noiseScale;
  var eps       = derivativeSampleDist;

  function getNoise(x, y)
  {
    return noiseFunc(x * scale, y * scale);
  }

  this.noise = function(x, y)
  {
    //approximate via finite difference.
    // rate of change x and y
    var x1 = getNoise(x + eps, y);
    var x2 = getNoise(x - eps, y);
    var y1 = getNoise(x, y + eps);
    var y2 = getNoise(x, y - eps);

    // average
    var a = (x1 - x2)/(2 * eps);
    var b = (y1 - y2)/(2 * eps);

    //the curl
    return new Vector2D(b, -a);
  }
}
