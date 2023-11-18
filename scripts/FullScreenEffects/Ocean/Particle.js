function Particle()
{
  //Call our prototype
  GameObject.call(this);

  this.velocity = new Vector2D(0,0);
  this.speedMultip = Math.scaleNormal(Math.random(), 0.9, 1);
  this.friction = Math.scaleNormal(Math.random(), 0.98, 1); //loose this percentage * 100 every second.

  this.hue = 30;
  this.saturation = 80;
  this.brightness = 80;

  this.alpha = 1;

  this.lifeTime = 0;
  this.fadeInTime = 10;

  this.addForce = function(x, y)
  {
    this.velocity.x += x * this.speedMultip;
    this.velocity.y += y * this.speedMultip;

    return this;
  }

  this.update = function( deltaTime )
  {
    this.lifeTime += deltaTime;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    var deltaFriction = Math.clamp(this.friction * deltaTime, 0, 1);
    this.velocity.multiply(1 - deltaFriction);
  }

  this.wrapPosition = function(xMin, yMin, xMax, yMax)
  {
      if (this.position.x < xMin || this.position.x > xMax || this.position.y < yMin || this.position.y > yMax)
      {
        this.lifeTime = 0;
        this.randomizePosition(xMin, yMin, xMax, yMax);
      }
  }

  this.randomizePosition = function(xMin, yMin, xMax, yMax)
  {
    this.position.x = Math.scaleNormal(Math.random(), xMin, xMax);
    this.position.y = Math.scaleNormal(Math.random(), yMin, yMax);
  }

  this.draw = function( ctx, roundingX, roundingY )
  {
    var alphaMultip = 1;
    if (this.lifeTime < this.fadeInTime)
    {
      alphaMultip = this.lifeTime/this.fadeInTime;
    }

    var theX = this.position.x;
    var theY = this.position.y;

    if (roundingX != undefined)
    {
      theX = Math.roundMultip(theX, roundingX);
    }

    if (roundingY != undefined)
    {
      theY = Math.roundMultip(theY, roundingY);
    }

    ctx.fillStyle = 'hsla('+this.hue +', '+this.saturation +'%, '+this.brightness +'%, ' +(this.alpha * alphaMultip) +')';

    ctx.fillRect(theX, theY, this.scale, this.scale);
  }
}
