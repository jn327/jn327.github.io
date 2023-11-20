function Vector2D(x, y)
{
  this.x = x;
  this.y = y;

  this.magnitude = function()
  {
    return Math.sqrt(this.dot(this));
  }

  this.normalize = function()
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

  this.sumScalar = function(n)
  {
    this.x += n;
    this.y += n;
    return this;
  }

  this.sum = function(that)
  {
    this.x += that.x;
    this.y += that.y;
    return this;
  }

  this.rotate = function(angle)
  {
    angle = Math.degreesToRad(angle);
    this.x = x * Math.cos(angle) - y * Math.sin(angle)
    this.y = x * Math.sin(angle) + y * Math.cos(angle)
    return this;
  }

  this.dot = function(that)
  {
    return (this.x * that.x) + (this.y * that.y);
  }

  this.cross = function(that)
  {
    return (this.x * that.y) - (this.y * that.x);
  }

  //returns radians
  this.angleBetween = function(that)
  {
    //return Math.acos(this.dot(that) / (this.magnitude() * that.magnitude()));
    //return Math.atan2(this.y - that.y, this.x - that.x);
    return Math.atan2(that.y, that.x) - Math.atan2(this.y, this.x);
  }

  //returns radians
  this.signedangleBetween = function(that)
  {
    return Math.atan2(this.cross(that), this.dot(that));
  }

  //returns radians
  this.angle = function()
  {
    return Math.atan2(this.y, this.x);
  }

  this.distance = function(that)
  {
	   var dist = Math.sqrt(((that.x-this.x)*(that.x-this.x))+((that.y-this.y)*(that.y-this.y)));
     return dist;
  }

  this.getPerpendicular = function()
  {
    return new Vector2D(-this.y, this.x);
  }

  this.getMultiplied = function(n)
  {
    return new Vector2D(this.x * n, this.y * n);
  }

  this.getDifference = function(that)
  {
    return new Vector2D(this.x - that.x, this.y - that.y);
  }

  this.getSum = function(that)
  {
    return new Vector2D(this.x + that.x, this.y + that.y);
  }
}
