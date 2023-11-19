function TrashItem(noise)
{
  //Call our prototype
  GameObject.call(this);

  this.velocity = new Vector2D(0,0);
  this.speedMultip = Math.scaleNormal(Math.random(), 0.9, 1);
  this.friction = Math.scaleNormal(Math.random(), 0.98, 1); //loose this percentage * 100 every second.

  this.hue = 245;
  this.saturation = 50;
  this.brightness = 5;

  this.rnd = Math.random();
  this.bobSpeed = 0.5;

  this.alpha = 0.75;
  this.minScale = 6;
  this.maxScale = 12;
  this.scale = this.minScale;

  this.timeAlive = 0;
  this.lifeTime = 0;

  this.vectorFieldForce = 0;
  this.collisionDistMultip = 2;

  this.addForce = function(x, y)
  {
    this.velocity.x += x * this.speedMultip;
    this.velocity.y += y * this.speedMultip;

    return this;
  }

  this.getScale = function()
  {
    return this.scale;
  }

  this.setup = function(position, force, lifeTime)
  {
    this.timeAlive = 0;
    this.position.x = position.x;
    this.position.y = position.y;

    this.scale = Math.scaleNormal(Math.random(), this.minScale, this.maxScale);

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.addForce(force.x, force.y);

    this.lifeTime = lifeTime;
  }

  this.update = function(player, onTrashCollidesWithPlayer)
  {
    this.timeAlive += GameLoop.deltaTime;
    if (this.timeAlive >= this.lifeTime)
    {
      return false;
    }

    var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);

    //find out if we collide with the player 
    var playerPosition = player.getPosition();
    playerPosition = GameCamera.getDrawnPosition(playerPosition.x, playerPosition.y);
    let xDist = Math.abs(playerPosition.x - drawnPos.x);
    let yDist = Math.abs(playerPosition.y - drawnPos.y);
    let collisionDist = this.scale * this.collisionDistMultip;
    if (xDist < collisionDist && yDist < collisionDist)
    {
        onTrashCollidesWithPlayer();
        return false;
    }

    let despawnDistMultip = 1;
    if (xDist > (GameCamera.drawnAreaSize.x * despawnDistMultip) || 
        yDist > (GameCamera.drawnAreaSize.y * despawnDistMultip)
    )
    {
        console.log('Despawning trash due to being too far from the player!');
        return false;
    }

    if (this.vectorFieldForce != 0)
    {
	    let vectorField = noise.getVectorField(drawnPos.x, drawnPos.y);
	    this.addForce(vectorField.x * this.vectorFieldForce, vectorField.y * this.vectorFieldForce);
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    var deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
    this.velocity.multiply(1 - deltaFriction);

    return true;
  }

  this.draw = function( ctx )
  {
    let bobN = 0.5 - (Math.cos(2 * Math.PI * this.rnd * GameLoop.currentTime * this.bobSpeed) * 0.5);
    let scaleMultip = Math.scaleNormal(bobN, 0.95, 1.05);

    var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
    var fillStyle = 'hsla('+this.hue +', '+this.saturation +'%, '+this.brightness +'%, ' +this.alpha +')';
    CanvasDrawingUtil.drawCircle( ctx, fillStyle, drawnPos.x, drawnPos.y, this.scale * scaleMultip );
  }
}
