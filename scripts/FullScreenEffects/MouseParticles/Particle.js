function Particle( thePool )
{
  this.random = function()
  {
    return 1;
  }

  //Call our prototype
  GameObject.call(this);

  var active        = false;
  var objectPool    = thePool;

  var velocity        = new Vector2D(0,0);
  var speedMultip     = Math.scaleNormal(Math.random(), 30, 35);
  var ageSpeedMultip  = 1;
  var friction        = Math.scaleNormal(Math.random(), 0.98, 1);

  var scaleNoise      = new SimplexNoise();
  var minScale        = 1;
  var maxScale        = 8;
  var scaleNoiseScale = 4;
  var ageScaleMultip  = 1;

  var noise         = new SimplexNoise( this );
  var noiseScale    = 0.01;
  function getNoise(x,y) { return noise.scaledNoise(x,y) };
  var curl          = new CurlNoise( getNoise, noiseScale, 0.2 );

  //var hueNoiseScale   = 0.0005;
  var hue;
  var saturation      = 90;
  var brightness      = 60;
  var alpha           = 1;
  var ageAlphaMultip  = 1;
  var bgSaturation    = 90;
  var bgBrightness    = 50;

  var lifeTime      = 0;
  var maxLifeTime   = Math.scaleNormal(Math.random(), 1, 1.25);

  this.spawn = function(x, y, velX, velY, lifeTimeN, theColor)
  {
    if (lifeTimeN == undefined)
    {
      lifeTimeN = 0;
    }
    if (velX == undefined)
    {
      velX = 0;
    }
    if (velY == undefined)
    {
      velY = 0;
    }

    this.position.x = x;
    this.position.y = y;

    //hue = Math.scaleNormal(noise.scaledNoise(x * hueNoiseScale, y * hueNoiseScale), 40, 340);
    hue           = theColor[0];
    saturation    = theColor[1];
    bgSaturation  = saturation;

    velocity.x = velX;
    velocity.y = velY;

    lifeTime = maxLifeTime * lifeTimeN;
    active = true;
  }

  this.update = function( deltaTime, xMin, yMin, xMax, yMax )
  {
    lifeTime += deltaTime;

    ageSpeedMultip = EasingUtil.easeNone(lifeTime, 1, -1, maxLifeTime);

    var theVel = curl.noise( this.position.x, this.position.y );

    velocity.x += theVel.x * speedMultip * ageSpeedMultip;
    velocity.y += theVel.y * speedMultip * ageSpeedMultip;

    this.position.x += velocity.x;
    this.position.y += velocity.y;

    var deltaFriction = Math.clamp(friction * deltaTime, 0, 1);
    velocity.multiply(1 - deltaFriction);

    if ( lifeTime >= maxLifeTime
      || this.position.x < xMin || this.position.x > xMax
      || this.position.y < yMin || this.position.y > yMax )
    {
      this.despawn();
    }
  }

  this.isActive = function()
  {
    return active;
  }

  this.despawn = function()
  {
    active = false;
    objectPool.addToPool(this);
  }

  this.draw = function( ctx, bgCtx )
  {
    //ageAlphaMultip = EasingUtil.easeNone(lifeTime, 1, -1, maxLifeTime);

    //ageScaleMultip = EasingUtil.easeNone(lifeTime, 1, -1, maxLifeTime);
    this.scale = scaleNoise.scaledNoise(lifeTime * scaleNoiseScale, 0);
    this.scale = Math.scaleNormal( this.scale, minScale, maxScale ) * ageScaleMultip;

    var theAlpha = (alpha * ageAlphaMultip);

    ctx.fillStyle = 'hsla('+hue +', '+saturation +'%, '+brightness +'%, ' +theAlpha +')';
    bgCtx.fillStyle = 'hsla('+hue +', '+bgSaturation +'%, '+bgBrightness +'%, ' +theAlpha +')';

    if (this.scale < 2)
    {
      ctx.fillRect(this.position.x, this.position.y, this.scale, this.scale);
      bgCtx.fillRect(this.position.x, this.position.y, this.scale, this.scale);
    }
    else
    {
      var radius = this.scale * 0.5;

      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      bgCtx.beginPath();
      bgCtx.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI);
      bgCtx.fill();
    }
  }
}
