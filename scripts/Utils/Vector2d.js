function Vector2D(x, y)
{
  this.x = x;
  this.y = y;

  this.magnitude = function()
  {
    return Math.sqrt( this.x * this.x + this.y * this.y);
  }

  this.normalize = function(other)
  {
  	return this.divide(this.magnitude());
  }

  this.divide = function(n)
  {
    this.x /= n;
    this.y /= n;
    return this;
  }

  this.multiply = function(n)
  {
    this.x *= n;
    this.y *= n;
    return this;
  }

  this.direction = function(that)
  {
    return new Vector2D(this.x - that.x, this.y - that.y);
  }

  this.distance = function(that)
  {
	   var dist = Math.sqrt(((that.x-this.x)*(that.x-this.x))+((that.y-this.y)*(that.y-this.y)));
     return dist;
  }
}
