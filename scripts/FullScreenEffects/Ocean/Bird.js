function Bird(noise) {
    //Call our prototype
    GameObject.call(this);

    this.velocity = new Vector2D(0, 0);
    this.speedMultip = Math.scaleNormal(Math.random(), 0.9, 1);
    this.friction = Math.scaleNormal(Math.random(), 0.9, 1); //loose this percentage * 100 every second.

    this.minScale = 4;
    this.maxScale = 8;
    this.scale = this.minScale;

	this.rotation = 0;
    this.rotationSpeed = 200;

    this.isResting = false;
    this.timeSinceRest = 0;
    this.playerDistStopResting = 100;
    this.playerEscapeVelocity = 2;

    this.timeAlive = 0;
    this.lifeTime = 0;

    this.rnd = Math.random();
    this.flapSpeed = 0.5;

    this.vectorFieldForce = 3;

    this.spawnFadeInTime = 1;

    this.addForce = function (x, y) {
        this.velocity.x += x * this.speedMultip;
        this.velocity.y += y * this.speedMultip;

        return this;
    }

    this.getScale = function () {
        return this.scale;
    }

    this.setup = function (position, force, lifeTime, isResting) {
        this.timeAlive = 0;
        this.position.x = position.x;
        this.position.y = position.y;

        this.isResting = isResting;
        this.timeSinceRest = 0;

        this.rotation = Math.random() * 360;

        this.scale = Math.scaleNormal(Math.random(), this.minScale, this.maxScale);

        this.velocity.x = 0;
        this.velocity.y = 0;
        this.addForce(force.x, force.y);

        this.lifeTime = lifeTime;
    }

    this.update = function (player) {
        this.timeAlive += GameLoop.deltaTime;
        if (this.timeAlive >= this.lifeTime) {
            return false;
        }

        const despawnDistMultip = 2;
        const despawnDist = Math.max(GameCamera.drawnAreaSize.x, GameCamera.drawnAreaSize.y) * despawnDistMultip;
        let cameraDist = this.position.distance(GameCamera.position);
        if (cameraDist > despawnDist) {
            return false;
        }

        if (this.isResting)
        {
            //check distance from player, if < a certain amount, then stop resting & add velocity away from player.
            let playerDist = this.position.distance(player.position);
            if (playerDist < this.playerDistStopResting)
            {
                this.isResting = false;
                const escForce = this.position.getDifference(player.position).normalize().multiply(this.playerEscapeVelocity);
                this.addForce(escForce.x, escForce.y);
            }
        }
        else    
        {
            this.timeSinceRest += GameLoop.deltaTime;

            if (this.vectorFieldForce != 0) {
                const drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
                const vectorField = noise.getVectorField(drawnPos.x, drawnPos.y);
                this.addForce(vectorField.x * this.vectorFieldForce, vectorField.y * this.vectorFieldForce);
            }
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        const deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
        this.velocity.multiply(1 - deltaFriction);

        let forwardDir = this.getForwardDirection();
	    let angle = forwardDir.signedangleBetween(this.velocity);
		this.rotation += angle * this.rotationSpeed * GameLoop.deltaTime;

        return true;
    }

    this.getForwardDirection = function()
	{
		return new Vector2D(1,0).rotate(this.rotation).normalize();
	}
    
    this.getVertices = function(flapN, dir, drawnPos, scaleMultip = 1) {

        const scale = this.scale * scaleMultip;
        const sideDir = new Vector2D(-dir.y, dir.x).normalize();

        const tipDist = scale * scaleMultip;
        const tipPoint = new Vector2D(drawnPos.x + (tipDist * dir.x), drawnPos.y + (tipDist * dir.y) );

        const beakDist = scale * 0.8;
        const beakWidth = scale * 0.15;
        const beakPoint = new Vector2D(drawnPos.x + (beakDist * dir.x), drawnPos.y + (beakDist * dir.y) );
        const beakSideLeft = new Vector2D(beakPoint.x + (beakWidth * sideDir.x), beakPoint.y + (beakWidth * sideDir.y) );
        const beakSideRight = new Vector2D(beakPoint.x - (beakWidth * sideDir.x), beakPoint.y - (beakWidth * sideDir.y) );

        const frontSideDist = scale * 0.5;
        const frontSideWidth = scale * 0.25;
        const frontSidePoint = new Vector2D(drawnPos.x + (frontSideDist * dir.x), drawnPos.y + (frontSideDist * dir.y) );
        const frontSideLeft = new Vector2D(frontSidePoint.x + (frontSideWidth * sideDir.x), frontSidePoint.y + (frontSideWidth * sideDir.y) );
        const frontSideRight = new Vector2D(frontSidePoint.x - (frontSideWidth * sideDir.x), frontSidePoint.y - (frontSideWidth * sideDir.y) );
        
        const wingDist = scale * 0.05;
        const wingFrontDist = scale * 0.6;
        const wingRearDist = scale * 0.05;
        const wingWidth = scale * 2.5 * flapN;
        const wingMidWidth = scale * 1.25 * flapN;

        const wingFrontPoint = new Vector2D(drawnPos.x + (wingFrontDist * dir.x), drawnPos.y + (wingFrontDist * dir.y) );
        const wingFrontLeft = new Vector2D(wingFrontPoint.x + (wingMidWidth * sideDir.x), wingFrontPoint.y + (wingMidWidth * sideDir.y) );
        const wingFrontRight = new Vector2D(wingFrontPoint.x - (wingMidWidth * sideDir.x), wingFrontPoint.y - (wingMidWidth * sideDir.y) );
        
        const wingPoint = new Vector2D(drawnPos.x + (wingDist * dir.x), drawnPos.y + (wingDist * dir.y) );
        const wingLeft = new Vector2D(wingPoint.x + (wingWidth * sideDir.x), wingPoint.y + (wingWidth * sideDir.y) );
        const wingRight = new Vector2D(wingPoint.x - (wingWidth * sideDir.x), wingPoint.y - (wingWidth * sideDir.y) );
        
        const wingRearPoint = new Vector2D(drawnPos.x - (wingRearDist * dir.x), drawnPos.y - (wingRearDist * dir.y) );
        const wingRearLeft = new Vector2D(wingRearPoint.x + (wingMidWidth * sideDir.x), wingRearPoint.y + (wingMidWidth * sideDir.y) );
        const wingRearRight = new Vector2D(wingRearPoint.x - (wingMidWidth * sideDir.x), wingRearPoint.y - (wingMidWidth * sideDir.y) );
    
        const tailBaseDist = scale * 0.4;
        const tailBaseWidth = scale * 0.2;
        const tailBasePoint = new Vector2D(drawnPos.x - (tailBaseDist * dir.x), drawnPos.y - (tailBaseDist * dir.y) );
        const tailBaseLeft = new Vector2D(tailBasePoint.x + (tailBaseWidth * sideDir.x), tailBasePoint.y + (tailBaseWidth * sideDir.y) );
        const tailBaseRight = new Vector2D(tailBasePoint.x - (tailBaseWidth * sideDir.x), tailBasePoint.y - (tailBaseWidth * sideDir.y) );
    
        const tailDist = scale;
        const tailWidth = scale * 0.3;
        const tailPoint = new Vector2D(drawnPos.x - (tailDist * dir.x), drawnPos.y - (tailDist * dir.y) );
        const tailLeft = new Vector2D(tailPoint.x + (tailWidth * sideDir.x), tailPoint.y + (tailWidth * sideDir.y) );
        const tailRight = new Vector2D(tailPoint.x - (tailWidth * sideDir.x), tailPoint.y - (tailWidth * sideDir.y) );
    
        return [
            tipPoint, 
            beakSideLeft, frontSideLeft, //left side of head
            wingFrontLeft, wingLeft, wingRearLeft, //left wing
            tailBaseLeft, tailLeft, tailRight, tailBaseRight, //tail
            wingRearRight, wingRight, wingFrontRight, //right wing
            frontSideRight, beakSideRight  //right side of head
        ];
    }

    this.draw = function (ctx, bgCtx) {
        const alphaMultip = this.timeAlive < this.spawnFadeInTime ? this.timeAlive / this.spawnFadeInTime : 1;
        
        const restRecoveryTime = 1;
        const restRecoveryTimeN = Math.min(this.timeSinceRest, restRecoveryTime)/restRecoveryTime;

        let flapN = 0.5 - (Math.cos(2 * Math.PI * this.rnd * GameLoop.currentTime * this.flapSpeed) * 0.5);
        let flapMultip = this.isResting ? 0.1 : Math.scaleNormal(flapN, 0.5, 1) * restRecoveryTimeN;

        let dir = this.getForwardDirection();
        const drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);

        if (!this.isResting) {
            const shadowDist = restRecoveryTimeN * 20;
            const shadowPos = new Vector2D(drawnPos.x + shadowDist, drawnPos.y + shadowDist);
            const shadowVertices = this.getVertices(flapMultip, dir, shadowPos);
            this.drawBird(ctx, shadowVertices, "rgba(0, 0, 0, " + 0.25 * alphaMultip + ")");
        }

        const vertices = this.getVertices(flapMultip, dir, drawnPos);
        this.drawBird(ctx, vertices, "rgba(255, 255, 255, " + alphaMultip + ")");
    
        // Draw beak
        let beakEnd = vertices[0];
        let beakLeft = vertices[1];
        let beakRight = vertices[vertices.length-1];
        ctx.beginPath();
        ctx.moveTo(beakEnd.x, beakEnd.y);
        ctx.lineTo(beakLeft.x, beakLeft.y);
        ctx.lineTo(beakRight.x, beakRight.y);
        ctx.lineTo(beakEnd.x, beakEnd.y);
        ctx.closePath();
        ctx.fillStyle =  "rgba(235, 204, 52, " + alphaMultip + ")";
        ctx.fill();

        // TODO: black tips on wings.
    }

    this.drawBird = function(ctx, vertices, fillStyle)
	{
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        ctx.closePath();
    
        // Fill and stroke the seagull shape
        ctx.fillStyle =  fillStyle;
        ctx.fill();
    }
}
