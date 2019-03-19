function Particle()
{
  this.position = new Vector2D(0,0);
  this.size = 1;
  this.velocity = new Vector2D(0,0);
  this.maxVel = 1;

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
}
