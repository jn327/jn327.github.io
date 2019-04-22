function Cloud()
{
  //Call our prototype
  GameObject.call(this);

  this.minScale = 0.33;
  this.maxScale = 1.66;
  this.moveSpeed;
  this.moveSpeedMax = 2200;
  this.moveSpeedMin = 1600;

  this.width = 150;
  this.height = 40;

  this.minNoiseScaleX = 0.33;
  this.minNoiseScaleY = 0.33;

  this.simpleNoise;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function ()
  {
    this.points = [];
    this.moveSpeed = Math.getRnd(this.moveSpeedMin, this.moveSpeedMax);

    var nPoints = Math.getRnd(80, 90);

    this.simpleNoise = new SimplexNoise();
    var nScale = 0.66;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints-1);
      var noiseN = -(Math.cos(2 * Math.PI * angleN) * 0.5) + 0.5;
      var t = angleN * 2 * Math.PI;

      var sizeScale = (this.simpleNoise.noise(t * noiseN * nScale, nScale) + 1) * 0.5;
      sizeScale = EasingUtil.easeOutQuad(sizeScale, 0, 1, 1);

      var x	=	Math.scaleNormal(sizeScale, this.minNoiseScaleX, 1) * Math.cos(t);
      var y	=	Math.scaleNormal(sizeScale, this.minNoiseScaleY, 1) * Math.sin(t);

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function( windStr )
  {
    var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
    this.prevUpdateTod = tod;

    this.position.x += windStr * todDelta * this.moveSpeed;

    if (this.position.x < -this.width)
    {
      this.init();
      this.position.x = bgCanvas.width + this.width;
    }
    else if (this.position.x > bgCanvas.width + this.width)
    {
      this.init();
      this.position.x = -this.width;
    }

    // change the scale on a noise function
    var scaleChangeFreq = 0.00001;
    var sizeScale = (this.simpleNoise.noise(GameLoop.currentTime * scaleChangeFreq, 0) + 1) * 0.5;
    sizeScale = EasingUtil.easeOutQuad(sizeScale, 0, 1, 1);
    sizeScale = Math.scaleNormal(sizeScale, this.minScale, this.maxScale);
    this.scale = sizeScale;
  }

  this.draw = function( ctx, brightness )
  {
    var darkenAmount = 0.95;
    var brightnessMultip = ((1-darkenAmount) + (brightness*darkenAmount));

    var colorV = 255 * brightnessMultip;

    ctx.fillStyle = 'rgba('+colorV+','+colorV+','+colorV+',0.8)';
    ctx.beginPath();

    var l = this.points.length;
    var thePoint;
    for (var p = 0; p < l; p++)
    {
      thePoint = this.points[p];

      ctx.lineTo( this.position.x + (thePoint.x * this.scale * this.width),
        this.position.y + (thePoint.y * this.scale * this.height) );
    }
    ctx.fill();
  }
}
