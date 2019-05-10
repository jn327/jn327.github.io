//Handles spawning stars!
var StarsManager = {};

StarsManager.starsHideTime             = 0.2;
StarsManager.starsShowTime             = 0.8;
StarsManager.stars                     = [];
StarsManager.minStars                  = 1000;
StarsManager.maxStars                  = 1500;
StarsManager.minStarSize               = 0.1;
StarsManager.maxStarSize               = 1.2;
StarsManager.spawnNoiseScale           = 0.003;

StarsManager.twinkleMultip            = 0.25;
StarsManager.alphaOffsetMultip        = 25;

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

  var spawnNoise = new SimplexNoise();

  var nStars = Math.getRnd(this.minStars, this.maxStars);
  for (var i = 0; i < nStars; i++)
  {
    var newStar = new Star();
    this.setRandomStarPos(newStar, theWidth, theHeight);
    var starSize = (spawnNoise.noise(newStar.position.x * this.spawnNoiseScale
      ,newStar.position.y * this.spawnNoiseScale) + 1) * 0.5;

    newStar.size            = Math.scaleNormal(starSize, this.minStarSize, this.maxStarSize);
    newStar.alphaOffset     = Math.random() * this.alphaOffsetMultip;
    newStar.alphaTimeMultip = (Math.random() * this.twinkleMultip) / twinkleSpeedDivider;

    this.stars[i] = newStar;
  }
}

StarsManager.setRandomStarPos = function(theStar, theWidth, theHeight )
{
  theStar.position.x = Math.random() * theWidth;
  theStar.position.y = EasingUtil.easeInQuad(Math.random(), this.startY, this.endY - this.startY, 1) * theHeight;
}

StarsManager.randomizeStars = function( theWidth, theHeight )
{
  var l = this.stars.length;
  for (var i = 0; i < l; i++)
  {
    this.setRandomStarPos(this.stars[i], theWidth, theHeight );
  }
}

StarsManager.drawStars = function( t, ctx, theWidth, theHeight )
{
  if (t < this.starsHideTime || t > this.starsShowTime)
  {
    var totalStarsTime  = this.starsHideTime + (1-this.starsShowTime);
    var starsTime       = (t < this.starsHideTime) ? this.starsHideTime - t : t - this.starsShowTime;
    var nightTimeNormal = (starsTime / totalStarsTime);

    var nightTimeLerp = this.alphaChangeCurve.evaluate(nightTimeNormal);

    //draw some stars!!!
    var l = this.stars.length;
    for (var i = 0; i < l; i++)
    {
      this.stars[i].draw(ctx, nightTimeLerp);
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

    var bStarAlive = this.currShootingStar.updateLifeTime( ctx, theWidth, theHeight, t, nightTimeLerp, currProgress >= 1 );
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
