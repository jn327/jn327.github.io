function Player(water)
{
  //Call our prototype
  GameObject.call(this);
  
  this.pressedKeys = {};

  this.accelerationSpeed = 2;
  this.rotationSpeed = 1;

  this.velocity = new Vector2D(0,0);
  this.speedMultip = 1;
  this.friction = 1; //loose this percentage * 100 every second.
  this.size = 20;
  this.rotation = 0;

  window.addEventListener("keydown", (event) => {
	this.pressedKeys[event.key] = true;
  });
  window.addEventListener("keyup", (event) => {
	this.pressedKeys[event.key] = false;
  });

  this.addForce = function(x, y)
  {
    this.velocity.x += x * this.speedMultip;
    this.velocity.y += y * this.speedMultip;

	let collisionForce = new Vector2D(this.velocity.x, this.velocity.y).multiply(Math.scaleNormal(Math.random(), 0.5, 1));
	water.createCollisionParticles(this.position, collisionForce);

    return this;
  }

  this.getForwardDirection = function()
  {
    var tipPoint = new Vector2D(
		this.position.x + Math.sin(this.rotation),
		this.position.y + Math.cos(this.rotation),
	);
	return new Vector2D(this.position.x - tipPoint.x, this.position.y - tipPoint.y); //vector from centre to tip
  }

  this.update = function(deltaTime)
  {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    var deltaFriction = Math.clamp(this.friction * deltaTime, 0, 1);
    this.velocity.multiply(1 - deltaFriction);

	if (this.pressedKeys['ArrowDown'])
	{
		let forwardDir = this.getForwardDirection();
		forwardDir.multiply(deltaTime * this.accelerationSpeed);
		this.addForce(forwardDir.x, forwardDir.y);
	}
	if (this.pressedKeys['ArrowUp'])
	{
		let forwardDir = this.getForwardDirection();
		forwardDir.multiply(deltaTime * this.accelerationSpeed * -1);
		this.addForce(forwardDir.x, forwardDir.y);
	}
	if (this.pressedKeys['ArrowLeft'])
	{
		this.rotation -= 1 * deltaTime * this.rotationSpeed;
	}
	if (this.pressedKeys['ArrowRight'])
	{
		this.rotation += 1 * deltaTime * this.rotationSpeed;
	}
  }

  this.draw = function(ctx, cameraOffset) 
  {	 
	  var drawnPos = new Vector2D(this.position.x - cameraOffset.x, this.position.y - cameraOffset.y);

	  //draw the collision area for the player
	  //CanvasDrawingUtil.drawCircle(ctx, "#00ff0044", drawnPos.x, drawnPos.y, this.size);

	  var tipDist = this.size;
	  var frontSideDist = this.size * 0.7;
	  var rearSideDist = this.size * 0.4;
	  var bowDist = this.size * 0.7;
	  var rearPointDist = this.size * 0.8;

	  var tipPoint = new Vector2D(
		drawnPos.x + (tipDist * Math.sin(this.rotation)),
		drawnPos.y + (tipDist * Math.cos(this.rotation)),
	  );

	  var bowStartPoint = new Vector2D(
		drawnPos.x + (bowDist * Math.sin(this.rotation)),
		drawnPos.y + (bowDist * Math.cos(this.rotation)),
	  );

	  var forwardDir = new Vector2D(tipPoint.x - drawnPos.x,tipPoint.y-drawnPos.y); //vector from centre to tip
	  var sideDir = new Vector2D(-forwardDir.y, forwardDir.x); //get the perpendicular vector of that one
	  var sideNormal = sideDir.normalize(); //normalized

	  var leftPoint = new Vector2D(
		bowStartPoint.x+(sideNormal.x*frontSideDist), 
		bowStartPoint.y+(sideNormal.y*frontSideDist)
	  );
	  var rightPoint = new Vector2D(
		bowStartPoint.x-(sideNormal.x*frontSideDist), 
		bowStartPoint.y-(sideNormal.y*frontSideDist)
	  );

	  var rearPoint = new Vector2D(
		drawnPos.x - (rearPointDist * Math.sin(this.rotation)),
		drawnPos.y - (rearPointDist * Math.cos(this.rotation)),
	  );

	  var rearLeftPoint = new Vector2D(
		rearPoint.x+(sideNormal.x*rearSideDist), 
		rearPoint.y+(sideNormal.y*rearSideDist)
	  );
	  var rearRightPoint = new Vector2D(
		rearPoint.x-(sideNormal.x*rearSideDist), 
		rearPoint.y-(sideNormal.y*rearSideDist)
	  );

	  //CanvasDrawingUtil.drawCircle(ctx, "#ff0000", tipPoint.x, tipPoint.y, 2);
	  //CanvasDrawingUtil.drawCircle(ctx, "#ff0000", leftPoint.x, leftPoint.y, 2);
	  //CanvasDrawingUtil.drawCircle(ctx, "#ff0000", rightPoint.x, rightPoint.y, 2);
	  //CanvasDrawingUtil.drawCircle(ctx, "#ff0000", rearLeftPoint.x, rearLeftPoint.y, 2);
	  //CanvasDrawingUtil.drawCircle(ctx, "#ff0000", rearRightPoint.x, rearRightPoint.y, 2);
	  
	  const path = new Path2D()
	  path.moveTo(tipPoint.x, tipPoint.y);
	  path.quadraticCurveTo(leftPoint.x, leftPoint.y, rearLeftPoint.x, rearLeftPoint.y);
	  path.lineTo(rearRightPoint.x, rearRightPoint.y);
	  path.quadraticCurveTo(rightPoint.x, rightPoint.y, tipPoint.x, tipPoint.y);
	  path.closePath();
	  ctx.fillStyle="#FFFFFF";
	  ctx.fill(path);
	}
}
