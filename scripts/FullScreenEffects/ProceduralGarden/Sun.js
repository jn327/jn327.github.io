function Sun()
{
  //Call our prototype
  GameObject.call(this);

  this.visible    = false;
  this.color      = [255, 255, 255];
  this.riseTime   = 0.1;
  this.setTime    = 0.9;

  this.sizeMin    = 80;
  this.sizeMax    = 320;

  this.offsetBottom = 0.2;
  this.offsetTop    = 0.05;

  var horizonColor = [239, 11, 31];
  var zenithColor  = [255, 252, 214];

  this.colorGradient = new Gradient();
    this.colorGradient.addKeyFrame(0, horizonColor);
    this.colorGradient.addKeyFrame(0.25, zenithColor);
    this.colorGradient.addKeyFrame(0.5, [254, 255, 247]);
    this.colorGradient.addKeyFrame(0.75, zenithColor);
    this.colorGradient.addKeyFrame(1, horizonColor);

  this.sizeChangeCurve = new AnimationCurve();
    this.sizeChangeCurve.addKeyFrame(0, 1);
    this.sizeChangeCurve.addKeyFrame(0.5, 0, EasingUtil.easeOutCubic);
    this.sizeChangeCurve.addKeyFrame(1, 1, EasingUtil.easeInCubic);

  this.posChangeCurve = new AnimationCurve();
    this.posChangeCurve.addKeyFrame(0, 1);
    this.posChangeCurve.addKeyFrame(0.5, 0, EasingUtil.easeOutCubic);
    this.posChangeCurve.addKeyFrame(1, 1, EasingUtil.easeInCubic);

  this.update = function( t, avblW, avblH )
  {
    this.visible = ( t >= this.riseTime && t <= this.setTime );

    if (this.visible)
    {
      var tNormal = Math.minMaxNormal(t, this.riseTime, this.setTime);

      var sizeN = this.sizeChangeCurve.evaluate(tNormal);
      var posN = this.posChangeCurve.evaluate(tNormal);

      //change color and size nearer rise and set
      this.color = this.colorGradient.evaluate(tNormal);
      this.size = Math.scaleNormal(sizeN, this.sizeMin, this.sizeMax);

      //update the position
      this.position.x = tNormal * avblW;
      var offsetTop     = 0.05;
      var offsetBottom   = 0.1;
      this.position.y = (avblH*this.offsetTop) + this.size + (posN * ((1-this.offsetBottom)*avblH));
    }

  }

  this.draw = function(ctx)
  {
    if (this.visible == false) { return; }

    //draw the sun.
    ctx.fillStyle = ColorUtil.rgbToHex(this.color);
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    ctx.fill();

  }
}
