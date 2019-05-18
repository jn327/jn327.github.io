//Handles spawning stars!
var StarsManager = {};

StarsManager.starsHideTime             = 0.2;
StarsManager.starsShowTime             = 0.8;
StarsManager.stars                     = [];
StarsManager.minStars                  = 1000;
StarsManager.maxStars                  = 1200;
StarsManager.minStarSize               = 0.1;
StarsManager.maxStarSize               = 1.2;
StarsManager.spawnNoiseScale           = 0.003;
StarsManager.spawnNoise;

StarsManager.twinkleMultip            = 0.015;
StarsManager.twinkleSpeed;

StarsManager.shootingStarFreqMin       = 0.005;
StarsManager.shootingStarFreqMax       = 0.05;
StarsManager.shootingStarWaitDur       = 0;
StarsManager.currShootingStar;

StarsManager.startY                   = 0; //from top to bottom
StarsManager.endY                     = 0.75;

StarsManager.alphaChangeCurve;

StarsManager.initStars = function( twinkleSpeedDivider, theWidth, theHeight )
{
  this.stars = [];
  this.currShootingStar = new ShootingStar();

  this.alphaChangeCurve = new AnimationCurve()
  this.alphaChangeCurve.addKeyFrame(0, 0);
  this.alphaChangeCurve.addKeyFrame(0.5, 1, EasingUtil.easeOutCubic);
  this.alphaChangeCurve.addKeyFrame(1, 0, EasingUtil.easeInCubic);

  this.twinkleSpeed = this.twinkleMultip / twinkleSpeedDivider;

  this.spawnNoise = new SimplexNoise();

  var nStars = Math.getRnd(this.minStars, this.maxStars);
  for (var i = 0; i < nStars; i++)
  {
    var newStar = new Star();
    this.setRandomStarPos(newStar, theWidth, theHeight);
    this.setStarSize(newStar);

    this.stars[i] = newStar;
  }
}

StarsManager.setStarSize = function(theStar)
{
  var starSize = (this.spawnNoise.noise(theStar.position.x * this.spawnNoiseScale
    ,theStar.position.y * this.spawnNoiseScale) + 1) * 0.5;

  theStar.size = Math.scaleNormal(starSize, this.minStarSize, this.maxStarSize);
}

StarsManager.setRandomStarPos = function(theStar, theWidth, theHeight )
{
  theStar.position.x = Math.random() * theWidth;
  theStar.position.y = EasingUtil.easeInQuad(Math.random(), this.startY, this.endY - this.startY, 1) * theHeight;
}

StarsManager.randomizeStars = function( theWidth, theHeight )
{
  this.spawnNoise = new SimplexNoise();

  var l = this.stars.length;
  var theStar;
  for (var i = 0; i < l; i++)
  {
    theStar = this.stars[i];
    this.setRandomStarPos(theStar, theWidth, theHeight );
    this.setStarSize(theStar);
  }
}

StarsManager.drawNebula = function( ctx, canvas, theWidth, theHeight )
{
  canvas.style.opacity = 0;

  var xStep = 2;
  var yStep = 2;
  for (var x = 0; x < theWidth; x += xStep)
  {
    for (var y = 0; y < theHeight; y += yStep)
    {
      var noiseVal = (this.spawnNoise.noise(x * this.spawnNoiseScale, y * this.spawnNoiseScale) + 1) * 0.5;
      var whiteness = 255 * noiseVal;
      ctx.fillStyle = "rgba( "+whiteness +", "+whiteness +", "+whiteness +", 0.1)";
      ctx.fillRect(x, y, xStep, yStep);
    }
  }
}

StarsManager.drawStars = function( ctxs, cavases, theWidth, theHeight )
{
  var cL = ctxs.length;
  var ctx;
  var theCanvas;
  for (var j = 0; j < cL; j++)
  {
    ctx = ctxs[j];
    theCanvas = cavases[j];
    theCanvas.style.opacity = 0;
    ctx.clearRect(0, 0, theWidth, theHeight);
  }

  //draw some stars!!!
  var ctxIndex = 0;
  var l = this.stars.length;
  for (var i = 0; i < l; i++)
  {
    ctxIndex = Math.round(Math.random() * (ctxs.length -1));
    ctx = ctxs[ctxIndex];

    this.stars[i].draw(ctx);
  }
}

StarsManager.update = function( t, cavases, shootingStarCtx, nebulaCanvas, theWidth, theHeight )
{
  if (t < this.starsHideTime || t > this.starsShowTime)
  {
    var totalStarsTime  = this.starsHideTime + (1-this.starsShowTime);
    var starsTime       = (t < this.starsHideTime) ? this.starsHideTime - t : t - this.starsShowTime;
    var nightTimeNormal = (starsTime / totalStarsTime);

    var nightTimeLerp = this.alphaChangeCurve.evaluate(nightTimeNormal);

    nebulaCanvas.style.opacity = nightTimeLerp;

    //stars
    var l = cavases.length;
    var starCanvas;
    for (var i = 0; i < l; i++)
    {
      var iNormal = ((i / (l-1)) / this.twinkleSpeed);

      var theAlpha = 0.5 + (0.5*Math.cos( this.twinkleSpeed * 2 * Math.PI * (iNormal+GameLoop.currentFrame)));

      starCanvas = cavases[i];
      starCanvas.style.opacity = nightTimeLerp * theAlpha;
    }

    //Shooting stars
    var currProgress = 0;
    if (t < this.currShootingStar.startTime)
    {
      currProgress = (t + ((1 - this.currShootingStar.startTime)+this.currShootingStar.duration)) / this.shootingStarWaitDur;
    }
    else
    {
      currProgress = (t - (this.currShootingStar.startTime+this.currShootingStar.duration)) / this.shootingStarWaitDur;
    }

    var bStarAlive = this.currShootingStar.updateLifeTime( shootingStarCtx, theWidth, theHeight, t, nightTimeLerp, currProgress >= 1 );
    if (!bStarAlive && this.currShootingStar.bSetup)
    {
      this.currShootingStar.bSetup = false;
      this.shootingStarWaitDur = Math.getRnd(this.shootingStarFreqMin, this.shootingStarFreqMax);

      var stopTime = t + this.shootingStarWaitDur;
      if (stopTime > 1)
      {
        stopTime = stopTime - 1;
      }
    }
  }
}
