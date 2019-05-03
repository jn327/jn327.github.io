function Wind()
{
  this.noise  = new SimplexNoise();
  this.str    = 0; //-1 to 1 scale
  this.freq   = [0.0005, 0.002];

  this.update = function( speedDivider )
  {
    var theNoise = 0;
    var nFreq = this.freq.length;
    var nScale = 1 / nFreq;
    for (var i = 0; i < nFreq; i++)
    {
      var theFreq = this.freq[i];
      theNoise += this.noise.noise((GameLoop.currentTime / speedDivider) * theFreq, theFreq) * nScale;
    }
  }
}
