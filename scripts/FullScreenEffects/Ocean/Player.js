function Player(water, terrain) {
	//Call our prototype
	GameObject.call(this);

	this.pressedKeys = {};

	this.accelerationSpeed = 2;
	this.rotationSpeed = 1;

	this.velocity = new Vector2D(0, 0);
	this.speedMultip = 2;
	this.friction = 0.9; //loose this percentage * 100 every second.
	this.size = 25;
	this.rotation = 0;

	window.addEventListener("keydown", (event) => {
		this.pressedKeys[event.key] = true;
	});
	window.addEventListener("keyup", (event) => {
		this.pressedKeys[event.key] = false;
	});

	this.addForce = function (x, y) {
		this.velocity.x += x * this.speedMultip;
		this.velocity.y += y * this.speedMultip;

		let collisionForce = new Vector2D(this.velocity.x, this.velocity.y).multiply(Math.scaleNormal(Math.random(), 0.5, 1));
		water.createCollisionParticles(this.position, collisionForce);

		return this;
	}

	this.getForwardDirection = function () {
		var tipPoint = new Vector2D(
			this.position.x + Math.sin(this.rotation),
			this.position.y + Math.cos(this.rotation),
		);
		return new Vector2D(this.position.x - tipPoint.x, this.position.y - tipPoint.y); //vector from centre to tip
	}

	this.update = function (deltaTime, cameraOffset, onDie) {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		var deltaFriction = Math.clamp(this.friction * deltaTime, 0, 1);
		this.velocity.multiply(1 - deltaFriction);

		if (this.pressedKeys['ArrowDown']) {
			let forwardDir = this.getForwardDirection();
			forwardDir.multiply(deltaTime * this.accelerationSpeed);
			this.addForce(forwardDir.x, forwardDir.y);
		}
		if (this.pressedKeys['ArrowUp']) {
			let forwardDir = this.getForwardDirection();
			forwardDir.multiply(deltaTime * this.accelerationSpeed * -1);
			this.addForce(forwardDir.x, forwardDir.y);
		}
		if (this.pressedKeys['ArrowLeft']) {
			this.rotation -= 1 * deltaTime * this.rotationSpeed;
		}
		if (this.pressedKeys['ArrowRight']) {
			this.rotation += 1 * deltaTime * this.rotationSpeed;
		}

		this.onPointCollides(cameraOffset, (x,y,step) => {
			if (terrain.isLand(x,y, cameraOffset))
			{
				onDie();
			}
		});
	}

	this.getVertices = function(x, y) {

		var tipDist = this.size;
		var frontSideDist = this.size * 0.5;
		var rearSideDist = this.size * 0.4;
		var bowDist = this.size * 0.4;
		var rearPointDist = this.size * 0.9;

		var tipPoint = new Vector2D(
			x + (tipDist * Math.sin(this.rotation)),
			y + (tipDist * Math.cos(this.rotation)),
		);

		var bowStartPoint = new Vector2D(
			x + (bowDist * Math.sin(this.rotation)),
			y + (bowDist * Math.cos(this.rotation)),
		);

		var forwardDir = new Vector2D(tipPoint.x - x, tipPoint.y - y); //vector from centre to tip
		var sideDir = new Vector2D(-forwardDir.y, forwardDir.x); //get the perpendicular vector of that one
		var sideNormal = sideDir.normalize(); //normalized

		var leftPoint = new Vector2D(
			bowStartPoint.x + (sideNormal.x * frontSideDist),
			bowStartPoint.y + (sideNormal.y * frontSideDist)
		);
		var rightPoint = new Vector2D(
			bowStartPoint.x - (sideNormal.x * frontSideDist),
			bowStartPoint.y - (sideNormal.y * frontSideDist)
		);

		var rearPoint = new Vector2D(
			x - (rearPointDist * Math.sin(this.rotation)),
			y - (rearPointDist * Math.cos(this.rotation)),
		);

		var rearLeftPoint = new Vector2D(
			rearPoint.x + (sideNormal.x * rearSideDist),
			rearPoint.y + (sideNormal.y * rearSideDist)
		);
		var rearRightPoint = new Vector2D(
			rearPoint.x - (sideNormal.x * rearSideDist),
			rearPoint.y - (sideNormal.y * rearSideDist)
		);

		return [tipPoint, leftPoint, rearLeftPoint, rearRightPoint, rightPoint];
	}

	this.onPointCollides = function(cameraOffset, callback)
	{
		var drawnPos = new Vector2D(this.position.x - cameraOffset.x, this.position.y - cameraOffset.y);
		let vertices = this.getVertices(drawnPos.x, drawnPos.y);

		let step = 2;
		for (var x = drawnPos.x - this.size; x < drawnPos.x + this.size; x += step) {
			for (var y =  drawnPos.y - this.size; y < drawnPos.y + this.size; y += step) {
				if (CollisionUtil.pointInPolygon(new Vector2D(x,y), vertices))
				{
					callback(x, y, step);
				}
			}
		}
	}

	this.draw = function (ctx, cameraOffset) {

		var drawnPos = new Vector2D(this.position.x - cameraOffset.x, this.position.y - cameraOffset.y);
		let vertices = this.getVertices(drawnPos.x, drawnPos.y);

		const path = new Path2D()
		path.moveTo(vertices[0].x, vertices[0].y);
	 	path.quadraticCurveTo(vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y);
	  	path.lineTo(vertices[3].x, vertices[3].y);
	  	path.quadraticCurveTo(vertices[4].x, vertices[4].y, vertices[0].x, vertices[0].y);
		path.closePath();
		ctx.fillStyle="#FFFFFF";
		ctx.fill(path);
	}
}
