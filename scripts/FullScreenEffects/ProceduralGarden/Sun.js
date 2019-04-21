function Sun()
{
  //Call our prototype
  GameObject.call(this);

  this.bVisible   = false;
  this.color      = [255, 255, 255];
  this.riseTime   = 0.1;
  this.setTime    = 0.9;

  this.sizeMin    = 80;
  this.sizeMax    = 320;

  this.horizonColor = [239, 11, 31];
  this.zenithColor  = [255, 252, 214];

  this.offsetBottom = 0.2;
  this.offsetTop    = 0.05;

  this.update = function( t, avblW, avblH )
  {
    this.bVisible = ( t >= this.riseTime && t <= this.setTime );

    if (this.bVisible)
    {
      var tNormal = Math.minMaxNormal(t, this.riseTime, this.setTime);
      var tMid    = Math.scaleNormal(0.5, this.riseTime, this.setTime);
      var tEased = tNormal <= tMid ? EasingUtil.easeOutCubic(tNormal, 1, -1, 0.5)
        : EasingUtil.easeInCubic(tNormal-0.5, 0, 1, 0.5);

      //change color and size nearer rise and set
      this.color = ColorUtil.lerp(tEased, this.zenithColor, this.horizonColor);
      this.size = Math.scaleNormal(tEased, this.sizeMin, this.sizeMax);

      //update the position
      this.position.x = tNormal * avblW;
      var offsetTop     = 0.05;
      var offsetBottom   = 0.1;
      this.position.y = (avblH*this.offsetTop) + this.size + (tEased * ((1-this.offsetBottom)*avblH));
    }
    else
    {
      this.color = this.horizonColor;
    }

  }

  this.draw = function(ctx)
  {
    if (this.bVisible == false)
    {
      return;
    }

    //draw the sun.
    ctx.fillStyle = ColorUtil.rgbToHex(this.color);
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    ctx.fill();

  }
}
