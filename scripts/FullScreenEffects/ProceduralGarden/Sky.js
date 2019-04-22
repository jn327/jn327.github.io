function Sky()
{
  this.brightness          = 0;

  this.lightenTime         = 0.075;
  this.darkenTime          = 0.925;
  this.colorDay            = [183, 231, 255];
  this.colorNight          = [28, 19, 25];

  this.gradientStart       = 0.2;
  this.gradientEnd         = 0.8;
  this.gradientHMultip     = 1;

  this.moon    = new Moon();
  this.sun     = new Sun();

  this.init = function( starTwinkleSpeedDivider, theCanvas )
  {
    CloudsManager.initClouds( theCanvas.width, theCanvas.height );
    StarsManager.initStars( starTwinkleSpeedDivider, theCanvas.width, theCanvas.height );
  }

  this.reset = function( theCanvas )
  {
    CloudsManager.randomizeClouds( theCanvas.width, theCanvas.height );
    StarsManager.randomizeStars( theCanvas.width, theCanvas.height );
  }

  this.updateAndDraw = function( t, windStr, ctx, theCanvas )
  {
    this.updateBrightness( t );
    this.drawBackground( ctx, theCanvas.width, theCanvas.height );

    //stars
    StarsManager.drawStars(t, ctx, theCanvas.width, theCanvas.height);

    //sun and sky gradient
    this.sun.update( t, theCanvas.width, theCanvas.height );
    this.drawSkyGradient( ctx, this.sun.color, t, theCanvas.width, theCanvas.height );
    this.sun.draw( ctx );

    //moon
    this.moon.update( t, theCanvas.width, theCanvas.height );
    this.moon.draw( ctx );

    //clouds
    CloudsManager.updateAndDrawClouds( ctx, windStr, this.brightness, theCanvas.width );
  }

  this.updateBrightness = function( t )
  {
    var theBrightness = 0;
    if (t > this.lightenTime && t < this.darkenTime)
    {
      var skyChangeNormal = Math.minMaxNormal(t, this.lightenTime, this.darkenTime);
      var skyMid = Math.scaleNormal(0.5, this.lightenTime, this.darkenTime);
      theBrightness = skyChangeNormal <= skyMid ? EasingUtil.easeOutCubic(skyChangeNormal, 0, 1, 0.5)
        : EasingUtil.easeInCubic(skyChangeNormal-0.5, 1, -1, 0.5);
    }

    this.brightness = theBrightness;
  }

  this.drawBackground = function ( ctx, theWidth, theHeight )
  {
    var theColor = ColorUtil.rgbToHex(ColorUtil.lerp(this.brightness, this.colorNight, this.colorDay));
    ctx.fillStyle = theColor;
    ctx.fillRect(0, 0, theWidth, theHeight);
  }

  this.drawSkyGradient = function( ctx, theColor, t, theWidth, theHeight )
  {
    //This wants to be a M shape, peaking around skyGradientMin and skyGradientMax...
    var gradientTimeNormal = 0;
    var gradientTimeMid = 0.5;

    if (t > this.gradientStart && t < this.gradientEnd)
    {
      //from 0 to 1.
      gradientTimeNormal = Math.minMaxNormal(t, this.gradientStart, this.gradientEnd);
      gradientTimeMid = Math.scaleNormal(0.5, this.gradientStart, this.gradientEnd);
    }
    else
    {
      //from 1 back down to 0.
      var totalRemaining = this.gradientStart + (1-this.gradientEnd);
      var gradientTime = (t < this.gradientStart) ? this.gradientStart - t : t - this.gradientEnd;
      gradientTimeNormal = 1 - (gradientTime / totalRemaining);
    }

    var gradientHeightLerp = gradientTimeNormal <= gradientTimeMid ? EasingUtil.easeNone(gradientTimeNormal, 1, -1, 0.5)
      : EasingUtil.easeNone(gradientTimeNormal-0.5, 0, 1, 0.5);

    var gradientAlphaLerp = gradientTimeNormal <= gradientTimeMid ? EasingUtil.easeNone(gradientTimeNormal, 1, -1, 0.5)
      : EasingUtil.easeNone(gradientTimeNormal-0.5, 0, 1, 0.5);

    var gradientHeight = gradientHeightLerp * theHeight * this.gradientHMultip;

    var grd = ctx.createLinearGradient(0, theHeight-gradientHeight, 0, theHeight);
    grd.addColorStop(0, 'rgba('+theColor[0]+', '+theColor[1]+','+theColor[2]+', 0)');
    grd.addColorStop(1, 'rgba('+theColor[0]+', '+theColor[1]+','+theColor[2]+', '+gradientAlphaLerp+')');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, theWidth, theHeight);
  }
}
