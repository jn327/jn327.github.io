function GameObject()
{
  this.position = new Vector2D(0,0);
  this.scale = 1;

  this.setPosition = function(pos)
  {
	  this.position = pos;
  }

  this.getPosition = function()
  {
    return this.position;
  }
}
