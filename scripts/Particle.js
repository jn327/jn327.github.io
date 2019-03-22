function Particle()
{
  this.position = new Vector2D(0,0);
  this.size = 1;
  this.velocity = new Vector2D(0,0);
  this.friction = 0.9775;

  this.addForce = function(x, y)
  {
    this.velocity.x += x;
    this.velocity.y += y;

    return this;
  }

  this.update = function()
  {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.multiply(this.friction);
  }

  this.clampPosition = function(xMin, yMin, xMax, yMax)
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
