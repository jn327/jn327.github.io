function Sky()
{
  this.ctx;
  this.canvas;

  this.brightness       = 0;
  this.skyBrightnessCurve;

  this.lightenTime      = 0.1;
  this.darkenTime       = 0.9;
  this.colorDay         = [183, 231, 255];
  this.colorNight       = [28, 19, 25];

  this.gradientStart    = 0.2;
  this.gradientEnd      = 0.8;
  this.gradientHMultip  = 1;
  this.gradientHCurve;
  this.gradientAlphaCurve;

  this.moon             = new Moon();
  this.sun              = new Sun();

  this.init = function( starTwinkleSpeedDivider, theCtx, theCanvas )
  {
    this.ctx    = theCtx;
    this.canvas = theCanvas;

    CloudsManager.initClouds( this.canvas.width, this.canvas.height );
    StarsManager.initStars( starTwinkleSpeedDivider, this.canvas.width, this.canvas.height );

    this.initCurves();
  }

  this.initCurves = function()
  {
    this.skyBrightnessCurve = new AnimationCurve();
    this.skyBrightnessCurve.addKeyFrame(0, 0);
    this.skyBrightnessCurve.addKeyFrame(0.5, 1, EasingUtil.easeOutCubic);
    this.skyBrightnessCurve.addKeyFrame(1, 0, EasingUtil.easeInCubic);

    this.gradientHCurve = new AnimationCurve();
    this.gradientHCurve.addKeyFrame(0, 1);
    this.gradientHCurve.addKeyFrame(0.5, 0, EasingUtil.easeNone);
    this.gradientHCurve.addKeyFrame(1, 1, EasingUtil.easeNone);

    this.gradientAlphaCurve = new AnimationCurve();
    this.gradientAlphaCurve.addKeyFrame(0, 1);
    this.gradientAlphaCurve.addKeyFrame(0.5, 0, EasingUtil.easeNone);
    this.gradientAlphaCurve.addKeyFrame(1, 1, EasingUtil.easeNone);
  }

  this.reset = function()
  {
    CloudsManager.randomizeClouds( this.canvas.width, this.canvas.height );
    StarsManager.randomizeStars( this.canvas.width, this.canvas.height );
  }

  this.updateAndDraw = function( t, windStr )
  {
    this.updateBrightness( t );
    this.drawBackground();

    //stars
    StarsManager.drawStars(t, this.ctx, this.canvas.width, this.canvas.height);

    //sun and sky gradient
    this.sun.update( t, this.canvas.width, this.canvas.height );
    this.drawSkyGradient( this.sun.color, t );
    this.sun.draw( this.ctx );

    //moon
    this.moon.update( t, this.canvas.width, this.canvas.height );
    this.moon.draw( this.ctx );

    //clouds
    CloudsManager.updateAndDrawClouds( this.ctx, windStr, this.brightness, this.canvas.width );
  }

  this.updateBrightness = function( t )
  {
    var theBrightness = 0;
    if (t > this.lightenTime && t < this.darkenTime)
    {
      var skyChangeNormal = Math.minMaxNormal(t, this.lightenTime, this.darkenTime);
      theBrightness = this.skyBrightnessCurve.evaluate(skyChangeNormal);
    }

    this.brightness = theBrightness;
  }

  this.drawBackground = function ()
  {
    var theColor = ColorUtil.rgbToHex(ColorUtil.lerp(this.brightness, this.colorNight, this.colorDay));
    this.ctx.fillStyle = theColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  this.drawSkyGradient = function( theColor, t )
  {
    //This wants to be a M shape, peaking around skyGradientMin and skyGradientMax...
    var gradientTimeNormal = 0;

    if (t > this.gradientStart && t < this.gradientEnd)
    {
      //from 0 to 1.
      gradientTimeNormal = Math.minMaxNormal(t, this.gradientStart, this.gradientEnd);
    }
    else
    {
      //from 1 back down to 0.
      var totalRemaining  = this.gradientStart + (1-this.gradientEnd);
      var gradientTime    = (t < this.gradientStart) ? this.gradientStart - t : t - this.gradientEnd;
      gradientTimeNormal  = 1 - (gradientTime / totalRemaining);
    }

    var gradientAlphaLerp   = this.gradientAlphaCurve.evaluate(gradientTimeNormal);
    if (gradientAlphaLerp > 0)
    {
      var gradientHeightLerp  = this.gradientHCurve.evaluate(gradientTimeNormal);

      var gradientHeight = gradientHeightLerp * this.canvas.height * this.gradientHMultip;

      var grd = this.ctx.createLinearGradient(0, this.canvas.height-gradientHeight, 0, this.canvas.height);
      grd.addColorStop(0, 'rgba('+theColor[0]+', '+theColor[1]+','+theColor[2]+', 0)');
      grd.addColorStop(1, 'rgba('+theColor[0]+', '+theColor[1]+','+theColor[2]+', '+gradientAlphaLerp+')');
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
