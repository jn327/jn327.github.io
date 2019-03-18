function Particle()
{
  this.position = new Vector2D(0,0);
  this.size = new Vector2D(1,1);
  this.velocity = new Vector2D(0,0);
  this.maxVel = 1;

  this.lifetime = 0;
  this.colorChangeMultip = 0.1;

  this.accelerate = function(x, y)
  {
    this.velocity.x += x;
    this.velocity.y += y;

    //limit the velocity if it goes over a certain terminal velocity...
    var velocityMag = this.velocity.magnitude();
    if (velocityMag > this.maxVel)
    {
      //get the normalized velocity
      this.velocity.divide(velocityMag);
      //multiply it by the max
      this.velocity.multiply(this.maxVel);
    }

    return this;
  }

  this.draw = function(theContext)
  {
    //TODO: sort this out, like use math.sin or something
    this.lifetime += ((_frameRate/1000) * this.colorChangeMultip);

    var theHue = (5 + Math.cos(this.lifetime))/10;
    var theColor = 'hsla('+(theHue*255)+',100%,50%,0.0025)';

    theContext.fillStyle = theColor;
    theContext.fillRect(this.position.x,this.position.y,this.size.x,this.size.y);
  }
}
