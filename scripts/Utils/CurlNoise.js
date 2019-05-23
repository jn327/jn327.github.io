function CurlNoise( noiseFunction, noiseScale, derivativeSampleDist )
{
  if (derivativeSampleDist == undefined)
  {
    derivativeSampleDist = 1;
  }

  var noiseFunc = noiseFunction;
  var scale     = noiseScale;
  var eps       = derivativeSampleDist;
  var twoEps    = derivativeSampleDist * 2;

  function getNoise(x, y)
  {
    return noiseFunc(x * scale, y * scale);
  }

  this.noise = function(x, y)
  {
    //approximate via finite difference.
    // get rate of change and average
    var a = (getNoise(x + eps, y) - getNoise(x - eps, y)) / (twoEps);
    var b = (getNoise(x, y + eps) - getNoise(x, y - eps)) / (twoEps);

    //the curl
    return [b, -a];
  }
}
