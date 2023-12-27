function TrashItem(noise, terrain)
{
  //Call our prototype
  GameObject.call(this);

  this.velocity = new Vector2D(0,0);
  this.speedMultip = Math.scaleNormal(Math.random(), 0.9, 1);
  this.friction = Math.scaleNormal(Math.random(), 0.98, 1); //loose this percentage * 100 every second.

  this.hue = 68;
  this.saturation = 22;
  this.brightness = 50;

  this.rnd = Math.random();
  this.bobSpeed = 200;

  this.alpha = 0.75;
  this.minScale = 12;
  this.maxScale = 16;
  this.scale = this.minScale;

  var terrainCheckFreq      = 2;
  var terrainCheckTimer     = 0;

  this.timeAlive = 0;
  this.lifeTime = 0;

  this.vectorFieldForce = 0;
  this.collisionDistMultip = 2;

  this.spawnFadeInTime = 2;

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

    //destroy if we collide with the terrain
    terrainCheckTimer += GameLoop.deltaTime;
    if (terrainCheckTimer > terrainCheckFreq)
    {
        if (terrain.isNearLand(drawnPos.x, drawnPos.y))
        {
            return false;
        }
    }

    //find out if we collide with the player 
    let playerPosition = player.getPosition();
    let xDist = Math.abs(playerPosition.x - this.position.x);
    let yDist = Math.abs(playerPosition.y - this.position.y);
    let collisionDist = this.scale * this.collisionDistMultip;
    if (xDist < collisionDist && yDist < collisionDist)
    {
        onTrashCollidesWithPlayer();
        return false;
    }

    const despawnDistMultip = 2;
    if (xDist > (GameCamera.drawnAreaSize.x * despawnDistMultip) ||
        yDist > (GameCamera.drawnAreaSize.y * despawnDistMultip)
    ) {
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
    let alphaMultip = 1;
    if (this.timeAlive < this.spawnFadeInTime)
    {
        alphaMultip = this.timeAlive/this.spawnFadeInTime;
    }

    let bobN = 0.5 - (Math.cos(2 * Math.PI * this.rnd * GameLoop.currentTime * this.bobSpeed) * 0.5);
    let scaleMultip = Math.scaleNormal(bobN, 0.9, 1.1);

    var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);

    let scale = this.scale * scaleMultip;
    //var grd = ctx.createRadialGradient(drawnPos.x, drawnPos.y, 0, drawnPos.x, drawnPos.y,  );
    //grd.addColorStop(0, 'hsla('+this.hue +', '+this.saturation +'%, '+this.brightness +'%, ' +this.alpha * alphaMultip +')');
    //grd.addColorStop(1, 'hsla('+this.hue +', '+this.saturation +'%, '+this.brightness +'%, 0)');
    //var fillStyle = grd;
    var fillStyle = 'hsla('+this.hue +', '+this.saturation +'%, '+this.brightness +'%, ' +this.alpha * alphaMultip +')';
    CanvasDrawingUtil.drawCircle( ctx, fillStyle, drawnPos.x, drawnPos.y, scale );
  }
}
