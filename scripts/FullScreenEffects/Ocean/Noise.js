function Noise(strNoiseScale = 0.002, curlEps = 0.5, vectorFieldMinStr = 0.5, vectorFieldMaxStr = 1)
{  
  this.noise = new SimplexNoise();

  this.getNoise = function(x,y)
  { 
    return this.noise.scaledNoise(Math.abs(x), Math.abs(y));
  }
  
  this.getScaledNoise = function(x,y) 
  { 
    return this.noise.scaledNoise(Math.abs(x * strNoiseScale), Math.abs(y * strNoiseScale));
  }

  this.curl = new CurlNoise( (x, y) => this.getNoise(x,y), strNoiseScale, curlEps );
  
  this.getVectorField = function(x,y)
  {
    var vectorStr = this.getScaledNoise(x, y)
    var vectorStr = Math.scaleNormal(vectorStr, vectorFieldMinStr, vectorFieldMaxStr);

    var dirArr = this.curl.noise(x, y);
    var vectorDir = new Vector2D(dirArr[0], dirArr[1]);
    vectorDir.multiply(vectorStr);
    return vectorDir;
  }
}
