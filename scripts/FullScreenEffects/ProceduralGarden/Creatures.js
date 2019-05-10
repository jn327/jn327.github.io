//----------------------------------------
//               ABSTRACT
//----------------------------------------
function Creature()
{
  //Call our prototype
  GameObject.call(this);

  this.color      = [255, 0, 255];
  this.colorDay   = [103, 104, 96];
  this.colorNight = [215, 244, 66];

  this.size = 4;
  this.scaleMultip = 1;

  this.lifeTime           = 0;
  this.ageSpeed           = 0.5;
  this.prevUpdateT        = 0;
  this.minLifeTimeScale   = 0.1;

  this.velocity = new Vector2D(0,0);
  this.moveSpeed = 0.1;
  this.speedMultip = 1;
}

Creature.prototype.init = function( scale, pos )
{
  this.scale      = scale;
  this.position   = pos;
  this.lifeTime   = Math.random();
}

Creature.prototype.update = function( t, windStr )
{
  if (this.lifeTime >= 1) { return; }

  var tDelta = (t < this.prevUpdateT) ? (t + (1 - this.prevUpdateT)) : t - this.prevUpdateT;
  this.prevUpdateT = t;

  this.lifeTime += tDelta * this.ageSpeed;
  if (this.lifeTime > 1)
  {
    this.lifeTime = 1;
  }
}

Creature.prototype.draw = function( ctx, skyBrightness )
{
}

//----------------------------------------
//               CONCRETE
//----------------------------------------
function Firefly()
{
  //Call our prototype
  Creature.call(this);

  this.minY = 0.15;

  this.friction = 1; //loose this percentage * 100 every second.
  //this.velocityNoise = new SimplexNoise(); // TODO: for velocity changes...

  this.sizeChangeCurve = new AnimationCurve();
  this.sizeChangeCurve.addKeyFrame(0, 1);
  this.sizeChangeCurve.addKeyFrame(1, 0);
  this.sizeChangeMin = 0.5;
  this.sizeChangeMax = 1;

  this.init = function( theCanvas, terrain )
  {
    var scale = Math.getRnd(0.5, 1);
    var pos = this.getRandPos( theCanvas, terrain );

    this.velocity = new Vector2D(0,0);

    Creature.prototype.init.call( this, scale, pos );
  }

  this.getRandPos = function( theCanvas, terrain )
  {
    var xPos    = Math.random() * theCanvas.width;

    var yRand   = EasingUtil.easeNone(Math.random(), this.minY, 1-this.minY, 1);
    var yPos    = Math.scaleNormal(yRand, terrain.riverStartPoint.y, theCanvas.height);

    return new Vector2D( xPos, yPos );
  }

  this.update = function( theCanvas, t, windStr, terrain )
  {
    Creature.prototype.update.call( this, t, windStr );

    /*if (this.lifeTime >= 1)
    {
      var pos = this.getRandPos( theCanvas, terrain );
      this.velocity = new Vector2D(0,0);
      this.position = pos;
      this.lifeTime = 0;
    }*/

    //figure out how far away it is...
    var hightestP = terrain.riverStartPoint.y + ((theCanvas.height - terrain.riverStartPoint.y) * this.minY);
    var lowestP = theCanvas.height;
    var distanceN = 1 - Math.minMaxNormal( this.position.y, lowestP, hightestP );

    //stuff thats further away is smaller & moves slower.
    var minScaleMultip = 0.2;
    this.scaleMultip = EasingUtil.easeOutSine(distanceN, minScaleMultip, 1-minScaleMultip, 1);
    var minSpeedMultip = 0.2;
    this.speedMultip = EasingUtil.easeOutSine(distanceN, minSpeedMultip, 1-minSpeedMultip, 1);

    //TODO: update position... use noise rather than totally random
    this.velocity.x += Math.getRnd(-1, 1) * this.moveSpeed * this.speedMultip;
    this.velocity.y += Math.getRnd(-1, 1) * this.moveSpeed * this.speedMultip;

    //limit velocity!
    var deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
    this.velocity.multiply(1 - deltaFriction);

    //update the position
    this.position = this.position.sum(this.velocity);

    //TODO:Clamp position... this should be more velocity based. (add velocity in dir opposite to edges.
    if (this.position.y < hightestP)
    {
      this.position.y = hightestP;
      this.velocity.y = -this.velocity.y;
    }
    if (this.position.y > lowestP)
    {
      this.position.y = lowestP;
      this.velocity.y = -this.velocity.y;
    }

    //TODO: maybe x clamp should be based on the river width at this y?
    //TODO: cache in an array in the terrain and then have a 'getValleyEdgeForY(this.position.y)'
    var valleyEdgesForY = terrain.getValleyEdgesForY(this.position.y);
    if (this.position.x < valleyEdgesForY[0])
    {
      this.position.x = valleyEdgesForY[0];
      this.velocity.x = -this.velocity.x;
    }
    if (this.position.x > valleyEdgesForY[1])
    {
      this.position.x = valleyEdgesForY[1];
      this.velocity.x = -this.velocity.x;
    }
  }

  this.draw = function( ctx, skyBrightness )
  {
    this.color = ColorUtil.lerp(skyBrightness, this.colorNight, this.colorDay);

    var brightnessScaleMultip = this.sizeChangeCurve.evaluate(skyBrightness);
    brightnessScaleMultip = Math.scaleNormal(brightnessScaleMultip, this.sizeChangeMin, this.sizeChangeMax);

    Creature.prototype.draw.call( this, ctx );

    ctx.fillStyle = "rgba( "+this.color[0] +", "+this.color[1] +", "+this.color[2] +", 0.66)";

    var sizeMultip = this.scale * this.scaleMultip * brightnessScaleMultip;
    var theSize = sizeMultip * this.size;
    var halfSize = theSize * 0.5;

    ctx.beginPath();
    if (sizeMultip > 0.75)
    {
      ctx.arc(this.position.x, this.position.y, halfSize, 0, 2 * Math.PI);
    }
    else
    {
      ctx.rect(this.position.x - halfSize, this.position.y - halfSize, theSize, theSize);
    }
    ctx.fill();

    //console.log("drawing creature!!±");
  }

}
