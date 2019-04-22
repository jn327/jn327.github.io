function Wind()
{
  this.noise  = new SimplexNoise();
  this.str    = 0; //-1 to 1 scale
  this.freq   = 0.0005;
  
  this.update = function( speedDivider )
  {
    this.str = this.noise.noise((GameLoop.currentTime / speedDivider) * this.freq, this.freq);
  }
}
