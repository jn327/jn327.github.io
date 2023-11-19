function WaterParticle()
{
  //Call our prototype
  GameObject.call(this);

  this.velocity = new Vector2D(0,0);
  this.speedMultip = Math.scaleNormal(Math.random(), 0.9, 1);
  this.friction = Math.scaleNormal(Math.random(), 0.98, 1); //loose this percentage * 100 every second.

  this.hue = 204;
  this.saturation = 50;
  this.brightness = 90;

  this.alpha = 1;
  this.scale = 2;

  this.timeAlive = 0;
  this.lifeTime = 0;

  this.addForce = function(x, y)
  {
    this.velocity.x += x * this.speedMultip;
    this.velocity.y += y * this.speedMultip;

    return this;
  }

  this.setup = function(position, force, lifeTime)
  {
    this.timeAlive = 0;
    this.position.x = position.x;
    this.position.y = position.y;

    this.alpha = Math.scaleNormal(Math.random(), 0.5, 1);
    //this.scale = Math.scaleNormal(Math.random(), 1, 3);

    this.addForce(force.x, force.y);

    this.lifeTime = lifeTime;
  }

  this.update = function()
  {
    this.timeAlive += GameLoop.deltaTime;
    if (this.timeAlive >= this.lifeTime)
    {
      return false;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    var deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
    this.velocity.multiply(1 - deltaFriction);

    return true;
  }

  this.draw = function( ctx )
  {
    var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
    var fillStyle = 'hsla('+this.hue +', '+this.saturation +'%, '+this.brightness +'%, ' +(this.alpha) +')';
    CanvasDrawingUtil.drawCircle( ctx, fillStyle, drawnPos.x, drawnPos.y, this.scale );
    //CanvasDrawingUtil.drawRect( ctx, fillStyle, drawnPos.x, drawnPos.y, this.scale, this.scale );
  }
}
