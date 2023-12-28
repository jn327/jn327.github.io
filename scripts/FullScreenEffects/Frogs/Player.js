function Player(terrain) {
	//Call our prototype
	GameObject.call(this);

	this.rotation = Math.random() * 360;
	this.rotationSpeed = 350;
	this.velocity = new Vector2D(0, 0);
	this.friction = 0.95; //loose this percentage * 100 every second.
	this.groundFriction = 4; //loose this percentage * 100 every second.
	this.size = 25;

    this.jumpForceMultip = 8;
    this.jumpForce = 0;
    this.jumpForceLineLengthMultip = 35;

	this.gravityForce = 9.8;
	this.jumpYForceMultip = 4;
    this.jumpYForce = 0;
	this.jumpVelocity = 0;
	this.currJumpHeight = 0;

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
		this.velocity.x += x;
		this.velocity.y += y;
	}

	this.update = function (canvasW, canvasH, onDie) {
		//handle inputs
		if ( MouseTracker.bMouseDown && MouseTracker.mousePos != undefined && this.currJumpHeight === 0)
		{
			const mousePos  = new Vector2D(MouseTracker.mousePos.x * canvasW, MouseTracker.mousePos.y * canvasH);
			const drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
			const clickDist = drawnPos.distance(mousePos);
			if (clickDist != 0)
			{
				//add acceleration to the player in the direction vector between thispos and playerpos
				const clickDir = new Vector2D(mousePos.x - drawnPos.x, mousePos.y - drawnPos.y).normalize();
				let forwardDir = this.getForwardDirection();

				const angle = forwardDir.signedangleBetween(clickDir);
				this.rotation += angle * this.rotationSpeed * GameLoop.deltaTime;

				this.jumpForce += GameLoop.deltaTime * this.jumpForceMultip;
				this.jumpYForce += GameLoop.deltaTime * this.jumpYForceMultip;
			}
		}
        else
        {
            if (this.jumpForce > 0)
            {
                const jumpForce = this.getForwardDirection().multiply(this.jumpForce);
                this.addForce(jumpForce.x, jumpForce.y);
                this.jumpForce = 0;
            }

			if (this.jumpYForce > 0)
            {
				this.jumpVelocity += this.jumpYForce;
                this.jumpYForce = 0;
            }
        }

		//update position
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		this.currJumpHeight += this.jumpVelocity;
		this.currJumpHeight = Math.max(this.currJumpHeight, 0);

		//apply friction
		const deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
		this.velocity.multiply(1 - deltaFriction);

		//if we're on the ground apply even more friction ? between floor and this.
		if (this.currJumpHeight <= 0)
		{
			const deltaFriction = Math.clamp(this.groundFriction * GameLoop.deltaTime, 0, 1);
			this.velocity.multiply(1 - deltaFriction);
			this.jumpVelocity = 0;
		}
		else
		{
			//apply gravity to the jump velocity.
			this.jumpVelocity -= this.gravityForce * GameLoop.deltaTime;
		}

		//TODO: check collisions
		/*this.onPointCollides((x,y,step) => {
			if (!terrain.isLand(x,y))
			{
				onDie();
			}
		});*/
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
		let drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
		let vertices = this.getVertices(drawnPos.x, drawnPos.y, 1);

		let step = 2;
		for (let x = drawnPos.x - this.size; x < drawnPos.x + this.size; x += step) {
			for (let y =  drawnPos.y - this.size; y < drawnPos.y + this.size; y += step) {
				if (CollisionUtil.pointInPolygon(new Vector2D(x,y), vertices))
				{
					callback(x, y, step);
				}
			}
		}
	}

	this.draw = function (ctx) {

		let drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);

		//draw the shadow
		const shadowOffset = 1 + (this.currJumpHeight * 2);
		const shadowScale = 1 + (this.currJumpHeight * 0.1);
		const shadowAlpha = 1 - Math.clamp(this.currJumpHeight * 0.25, 0, 0.8);
		const shadowPosX = drawnPos.x + shadowOffset;
		const shadowPosY = drawnPos.y + shadowOffset;
		const shadowVertices = this.getVertices(shadowPosX, shadowPosY, shadowScale);
		this.drawVertices(ctx, shadowVertices, "rgba(0, 0, 0, "+(shadowAlpha)+")");

		// draw the content
		const jumpScale = 1 + (this.currJumpHeight * 0.05);
		const vertices = this.getVertices(drawnPos.x, drawnPos.y, jumpScale);
		this.drawVertices(ctx, vertices, "#3fb83d");

        //draw jump force
        const jumpDir = this.getForwardDirection().multiply(this.jumpForce * this.jumpForceLineLengthMultip);

		ctx.beginPath();
        ctx.moveTo(drawnPos.x, drawnPos.y);
        ctx.lineTo(drawnPos.x + jumpDir.x, drawnPos.y + jumpDir.y);
        ctx.stroke();
	}

	this.drawVertices = function(ctx, vertices, fillStyle)
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
