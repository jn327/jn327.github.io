function Player(water, terrain, noise) {
	//Call our prototype
	GameObject.call(this);

	this.pressedKeys = {};
	this.rotation = 0;

	this.keyAcceleration = 3;
	this.mouseAcceleration = 3;

	this.rotationSpeed = 150;
	this.mouseRotationSpeed = 250;

	this.velocity = new Vector2D(0, 0);
	this.speedMultip = 2;
	this.friction = 0.85; //loose this percentage * 100 every second.
	this.size = 25;
	this.vectorFieldForce = 0.4;

	window.addEventListener("keydown", (event) => {
		this.pressedKeys[event.key] = true;
	});
	window.addEventListener("keyup", (event) => {
		this.pressedKeys[event.key] = false;
	});

	//------------------------------------------------
	//------------------------------------------------
	this.getSpeed = function()
	{
		return this.velocity.magnitude();
	}

	this.getForwardDirection = function()
	{
		return new Vector2D(1,0).rotate(this.rotation).normalize();
	}

	this.addForce = function (x, y) {
		this.velocity.x += x * this.speedMultip;
		this.velocity.y += y * this.speedMultip;

		let collisionForce = new Vector2D(this.velocity.x, this.velocity.y).multiply(Math.scaleNormal(Math.random(), 0.1, 1));
        water.createCollisionParticles(this.position, collisionForce);

		return this;
	}

	this.update = function (canvasW, canvasH, onDie) {
		//add a bit of velocity based on the vector field.
		var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
		let vectorField = noise.getVectorField(drawnPos.x, drawnPos.y);
		this.addForce(vectorField.x * this.vectorFieldForce, vectorField.y * this.vectorFieldForce);

		//handle inputs
		if ( MouseTracker.bMouseDown && MouseTracker.mousePos != undefined )
		{
			let mousePos  = new Vector2D(MouseTracker.mousePos.x * canvasW, MouseTracker.mousePos.y * canvasH);
			let drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
			let clickDist = drawnPos.distance(mousePos);
			if (clickDist != 0)
			{
				//add acceleration to the player in the direction vector between thispos and playerpos
				const clickDir = new Vector2D(mousePos.x - drawnPos.x, mousePos.y - drawnPos.y).normalize();
				let forwardDir = this.getForwardDirection();

				const angle = forwardDir.signedangleBetween(clickDir);
				this.rotation += angle * this.mouseRotationSpeed * GameLoop.deltaTime;

				forwardDir.multiply(this.mouseAcceleration * GameLoop.deltaTime);
				this.addForce(forwardDir.x, forwardDir.y);
			}
		}

		var moveDir = undefined;
		if (this.pressedKeys['ArrowDown'] || this.pressedKeys['s']) { moveDir = new Vector2D(0,1); }
		if (this.pressedKeys['ArrowUp'] || this.pressedKeys['w']) { moveDir = new Vector2D(0,-1); }
		if (this.pressedKeys['ArrowLeft'] || this.pressedKeys['a']) { moveDir = new Vector2D(-1,0); }
		if (this.pressedKeys['ArrowRight'] || this.pressedKeys['d']) { moveDir = new Vector2D(1,0); }
		if (moveDir != undefined)
		{
			let forwardDir = this.getForwardDirection();
			let angle = forwardDir.signedangleBetween(moveDir);
			this.rotation += angle * this.mouseRotationSpeed * GameLoop.deltaTime;
			forwardDir.multiply(this.mouseAcceleration * GameLoop.deltaTime);
			this.addForce(forwardDir.x, forwardDir.y);
		}

		//update position
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		//apply friction
		const deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
		this.velocity.multiply(1 - deltaFriction);

		//check collisions
		this.onPointCollides((x,y,step) => {
			if (terrain.isLand(x,y))
			{
				onDie();
			}
		});
	}

	this.getVertices = function(x, y, scaleMultip) {
		const scale = this.size * scaleMultip;
		const tipDist = scale;
		const frontSideDist = scale * 0.5;
		const rearSideDist = scale * 0.4;
		const bowDist = scale * 0.4;
		const rearPointDist = scale * 0.9;

		const dir = this.getForwardDirection();

		const tipPoint = new Vector2D(x + (tipDist * dir.x), y + (tipDist * dir.y));
		const bowStartPoint = new Vector2D(x + (bowDist * dir.x), y + (bowDist * dir.y));

		const forwardDir = new Vector2D(tipPoint.x - x, tipPoint.y - y); //vector from centre to tip
		const sideDir = new Vector2D(-forwardDir.y, forwardDir.x); //get the perpendicular vector of that one
		const sideNormal = sideDir.normalize(); //normalized

		const leftPoint = new Vector2D(
			bowStartPoint.x + (sideNormal.x * frontSideDist),
			bowStartPoint.y + (sideNormal.y * frontSideDist)
		);
		const rightPoint = new Vector2D(
			bowStartPoint.x - (sideNormal.x * frontSideDist),
			bowStartPoint.y - (sideNormal.y * frontSideDist)
		);

		const rearPoint = new Vector2D(x - (rearPointDist * dir.x), y - (rearPointDist * dir.y));

		const rearLeftPoint = new Vector2D(
			rearPoint.x + (sideNormal.x * rearSideDist),
			rearPoint.y + (sideNormal.y * rearSideDist)
		);
		const rearRightPoint = new Vector2D(
			rearPoint.x - (sideNormal.x * rearSideDist),
			rearPoint.y - (sideNormal.y * rearSideDist)
		);

		return [tipPoint, leftPoint, rearLeftPoint, rearRightPoint, rightPoint];
	}

	this.onPointCollides = function(callback)
	{
		var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
		let vertices = this.getVertices(drawnPos.x, drawnPos.y, 1);

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

		//draw the shadow
		const depth = 1-terrain.getHeight(drawnPos.x, drawnPos.y);
		const shadowPosX = drawnPos.x + (depth * 4);
		const shadowPosY = drawnPos.y + (depth * 10);
		const shadowScale = 1 + (depth*0.25);
		const shadowVertices = this.getVertices(shadowPosX, shadowPosY, shadowScale);
		this.drawBoat(ctx, shadowVertices, "rgba(0, 0, 0, "+(1-depth)+")");

		// draw the content
		const vertices = this.getVertices(drawnPos.x, drawnPos.y, 1);
		this.drawBoat(ctx, vertices, "#FFFFFF");
	}

	this.drawBoat = function(ctx, vertices, fillStyle)
	{
		const path = new Path2D();
		path.moveTo(vertices[0].x, vertices[0].y);
	 	path.quadraticCurveTo(vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y);
	  	path.lineTo(vertices[3].x, vertices[3].y);
	  	path.quadraticCurveTo(vertices[4].x, vertices[4].y, vertices[0].x, vertices[0].y);
		path.closePath();
		ctx.fillStyle = fillStyle;
		ctx.fill(path);
	}
}
