function Player(water, terrain, noise) {
	//Call our prototype
	GameObject.call(this);

	this.pressedKeys = {};

	this.accelerationSpeed = 2;
	this.rotationSpeed = 2;

	this.velocity = new Vector2D(0, 0);
	this.speedMultip = 2;
	this.friction = 0.9; //loose this percentage * 100 every second.
	this.size = 25;
	this.vectorFieldForce = 0.5;
	this.rotation = 0.5;

	window.addEventListener("keydown", (event) => {
		this.pressedKeys[event.key] = true;
	});
	window.addEventListener("keyup", (event) => {
		this.pressedKeys[event.key] = false;
	});

	this.getSpeed = function()
	{
		return this.velocity.magnitude();
	}

	this.addForce = function (x, y) {
		this.velocity.x += x * this.speedMultip;
		this.velocity.y += y * this.speedMultip;

		let collisionForce = new Vector2D(this.velocity.x, this.velocity.y).multiply(Math.scaleNormal(Math.random(), 0.1, 1));
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

	this.update = function (onDie) {
		//add a bit of velocity based on the vector field.
		var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
		let vectorField = noise.getVectorField(drawnPos.x, drawnPos.y);
		this.addForce(vectorField.x * this.vectorFieldForce, vectorField.y * this.vectorFieldForce);

		//handle inputs
		if (this.pressedKeys['ArrowDown']) {
			let forwardDir = this.getForwardDirection();
			forwardDir.multiply(GameLoop.deltaTime * this.accelerationSpeed);
			this.addForce(forwardDir.x, forwardDir.y);
		}
		if (this.pressedKeys['ArrowUp']) {
			let forwardDir = this.getForwardDirection();
			forwardDir.multiply(GameLoop.deltaTime * this.accelerationSpeed * -1);
			this.addForce(forwardDir.x, forwardDir.y);
		}
		if (this.pressedKeys['ArrowLeft']) {
			this.rotation -= 1 * GameLoop.deltaTime * this.rotationSpeed;
		}
		if (this.pressedKeys['ArrowRight']) {
			this.rotation += 1 * GameLoop.deltaTime * this.rotationSpeed;
		}

		//update position
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		//apply friction
		var deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
		this.velocity.multiply(1 - deltaFriction);

		//check collisions
		this.onPointCollides((x,y,step) => {
			if (terrain.isLand(x,y))
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

	this.onPointCollides = function(callback)
	{
		var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
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

	this.draw = function (ctx) {

		var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
		let vertices = this.getVertices(drawnPos.x, drawnPos.y);

		//draw the shadow
		let depth = terrain.getHeight(drawnPos.x, drawnPos.y);
		depth = 1-depth;

		let shadowOffsetX = depth * 4;
		let shadowOffsetY = depth * 10;
		const shadowPath = new Path2D();
		shadowPath.moveTo(vertices[0].x+shadowOffsetX, vertices[0].y+shadowOffsetY);
		shadowPath.quadraticCurveTo(vertices[1].x+shadowOffsetX, vertices[1].y+shadowOffsetY, vertices[2].x+shadowOffsetX, vertices[2].y+shadowOffsetY);
		shadowPath.lineTo(vertices[3].x+shadowOffsetX, vertices[3].y+shadowOffsetY);
		shadowPath.quadraticCurveTo(vertices[4].x+shadowOffsetX, vertices[4].y+shadowOffsetY, vertices[0].x+shadowOffsetX, vertices[0].y+shadowOffsetY);
		shadowPath.closePath();
		ctx.fillStyle="rgba(0, 0, 0, "+(1-depth)+")";
		ctx.fill(shadowPath);

		// draw the content
		const path = new Path2D();
		path.moveTo(vertices[0].x, vertices[0].y);
	 	path.quadraticCurveTo(vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y);
	  	path.lineTo(vertices[3].x, vertices[3].y);
	  	path.quadraticCurveTo(vertices[4].x, vertices[4].y, vertices[0].x, vertices[0].y);
		path.closePath();
		ctx.fillStyle="#FFFFFF";
		ctx.fill(path);
	}
}
