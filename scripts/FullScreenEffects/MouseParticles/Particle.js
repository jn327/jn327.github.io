function Particle( thePool )
{
  //Call our prototype
  GameObject.call(this);

  var active        = false;
  var objectPool    = thePool;

  var velocity        = new Vector2D(0,0);
  var speedMultip     = Math.scaleNormal(Math.random(), 20, 25);
  var ageSpeedMultip  = 1;
  var friction        = Math.scaleNormal(Math.random(), 0.99, 1);

  this.scale = Math.scaleNormal(Math.random(), 1, 3);

  this.random = function()
  {
    return 1;
  }

  var noise         = new SimplexNoise( this );
  var noiseScale    = 0.008;
  function getNoise(x,y) { return noise.scaledNoise(x,y) };
  var curl          = new CurlNoise( getNoise, noiseScale, 0.2 );

  var hueNoiseScale   = 0.0005;
  var hue;
  var saturation      = 90;
  var brightness      = 60;
  var alpha           = 1;
  var ageAlphaMultip  = 1;


  var lifeTime      = 0;
  var maxLifeTime   = Math.scaleNormal(Math.random(), 1, 1.5);

  this.spawn = function(x, y, velX, velY, lifeTimeN)
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

    hue = Math.scaleNormal(noise.scaledNoise(x * hueNoiseScale, y * hueNoiseScale), 40, 340);

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

  this.draw = function( ctx )
  {
    ageAlphaMultip = EasingUtil.easeNone(lifeTime, 1, -1, maxLifeTime);

    ctx.fillStyle = 'hsla('+hue +', '+saturation +'%, '+brightness +'%, ' +(alpha * ageAlphaMultip) +')';
    ctx.fillRect(this.position.x, this.position.y, this.scale, this.scale);
  }
}
