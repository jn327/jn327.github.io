function Particle( thePool, noiseSeed )
{
  var rndSeed = noiseSeed;
  this.random = function()
  {
    return noiseSeed;
  }

  //Call our prototype
  GameObject.call(this);

  var active        = false;
  var objectPool    = thePool;

  var velocity        = new Vector2D(0,0);
  var speedMultip     = Math.scaleNormal(Math.random(), 150, 200);
  var ageSpeedMultip  = 1;
  var friction        = Math.scaleNormal(Math.random(), 0.98, 1);

  var scaleNoise      = new SimplexNoise();
  var minScale        = 20;
  var maxScale        = 40;
  var scaleNoiseScale = 4;
  var ageScaleMultip  = 1;

  var noise         = new SimplexNoise( this );
  var noiseScale    = 0.005;
  function getNoise(x,y) { return noise.scaledNoise(x,y) };
  var curl          = new CurlNoise( getNoise, noiseScale, 0.2 );

  //var hueNoiseScale   = 0.0005;
  var hue;
  var saturation      = 90;
  var brightness      = 70;
  var alpha           = 1;
  var ageAlphaMultip  = 1;

  var lifeTime      = 0;
  var maxLifeTime   = Math.scaleNormal(Math.random(), 1, 1.25);

  var twoPI         = 2 * Math.PI;

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

    velocity.x = velX;
    velocity.y = velY;

    lifeTime = maxLifeTime * lifeTimeN;
    active = true;
  }

  this.update = function( deltaTime, xMin, yMin, xMax, yMax )
  {
    lifeTime += deltaTime;

    //decrease speed linearly from 100% to 0% as we age.
    ageSpeedMultip = (1 - (lifeTime / maxLifeTime)) * speedMultip;

    var theVel = curl.noise( this.position.x, this.position.y );

    velocity.x += theVel[0] * ageSpeedMultip;
    velocity.y += theVel[1] * ageSpeedMultip;

    this.position.x += velocity.x;
    this.position.y += velocity.y;

    //apply friction
    var tFriction = friction * deltaTime;
    if (tFriction > 1)
    {
      tFriction = 1;
    }
    velocity.multiply(1 - tFriction);

    //despawn if we've been around too long or if we're out of the screen.
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

  this.draw = function( ctx )
  {
    //ageAlphaMultip = EasingUtil.easeNone(lifeTime, 1, -1, maxLifeTime);
    //ageScaleMultip = EasingUtil.easeNone(lifeTime, 1, -1, maxLifeTime);

    this.scale = scaleNoise.scaledNoise(lifeTime * scaleNoiseScale, 0);
    this.scale = Math.scaleNormal( this.scale, minScale, maxScale ) * ageScaleMultip;

    var theAlpha = (alpha * ageAlphaMultip);

    var grd = ctx.createRadialGradient(this.position.x, this.position.y, 0, this.position.x, this.position.y, this.scale);
    grd.addColorStop(0, 'hsla('+hue +', '+saturation +'%, '+brightness +'%, ' +theAlpha +')');
    grd.addColorStop(1, 'hsla('+hue +', '+saturation +'%, '+brightness +'%, 0)');
    ctx.fillStyle = grd;

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.scale, 0, twoPI);
    ctx.fill();
  }
}
