function Particle()
{
  //Call our prototype
  GameObject.call(this);

  this.velocity = new Vector2D(0,0);
  this.friction = 1; //loose this percentage * 100 every second.

  this.addForce = function(x, y)
  {
    this.velocity.x += x;
    this.velocity.y += y;

    return this;
  }

  this.update = function()
  {
    this.position = this.position.sum(this.velocity);

    var deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
    this.velocity.multiply(1 - deltaFriction);
  }

  this.wrapPosition = function(xMin, yMin, xMax, yMax)
  {
      if (this.position.x < xMin)
      {
        this.position.x = xMax;
      }
      else if (this.position.x > xMax)
      {
        this.position.x = xMin;
      }

      if (this.position.y < yMin)
      {
        this.position.y = yMax;
      }
      else if (this.position.y > yMax)
      {
        this.position.y = yMin;
      }
  }
}
