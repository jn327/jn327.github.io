function Bird(noise) {
    //Call our prototype
    GameObject.call(this);

    this.velocity = new Vector2D(0, 0);
    this.speedMultip = Math.scaleNormal(Math.random(), 0.9, 1);
    this.friction = Math.scaleNormal(Math.random(), 0.98, 1); //loose this percentage * 100 every second.

    this.minScale = 2;
    this.maxScale = 4;
    this.scale = this.minScale;

    this.timeAlive = 0;
    this.lifeTime = 0;

    this.rnd = Math.random();
    this.flapSpeed = 0.5;

    this.vectorFieldForce = 6;

    this.spawnFadeInTime = 1;

    this.addForce = function (x, y) {
        this.velocity.x += x * this.speedMultip;
        this.velocity.y += y * this.speedMultip;

        return this;
    }

    this.getScale = function () {
        return this.scale;
    }

    this.setup = function (position, force, lifeTime) {
        this.timeAlive = 0;
        this.position.x = position.x;
        this.position.y = position.y;

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

        var cameraPosition = new Vector2D(GameCamera.position.x, GameCamera.position.y);
        let xDist = Math.abs(cameraPosition.x - this.position.x);
        let yDist = Math.abs(cameraPosition.y - this.position.y);

        let despawnDistMultip = 1;
        if (xDist > (GameCamera.drawnAreaSize.x * despawnDistMultip) ||
            yDist > (GameCamera.drawnAreaSize.y * despawnDistMultip)
        ) {
            return false;
        }

        if (this.vectorFieldForce != 0) {
            var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
            let vectorField = noise.getVectorField(drawnPos.x, drawnPos.y);
            this.addForce(vectorField.x * this.vectorFieldForce, vectorField.y * this.vectorFieldForce);
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        var deltaFriction = Math.clamp(this.friction * GameLoop.deltaTime, 0, 1);
        this.velocity.multiply(1 - deltaFriction);

        return true;
    }

    this.draw = function (ctx, bgCtx) {
        let alphaMultip = 1;
        if (this.timeAlive < this.spawnFadeInTime) {
            alphaMultip = this.timeAlive / this.spawnFadeInTime;
        }

        let flapN = 0.5 - (Math.cos(2 * Math.PI * this.rnd * GameLoop.deltaTime * GameLoop.currentTime * this.flapSpeed) * 0.5);
        let flapMultip = Math.scaleNormal(flapN, 0.5, 1);

        let dir = new Vector2D(this.velocity.x, this.velocity.y).normalize();

        var drawnPos = GameCamera.getDrawnPosition(this.position.x, this.position.y);
        var tipDist = this.scale;
        var frontSideDist = this.scale * 5.5 * flapMultip;
        var rearSideDist = this.scale * 0.4;
        var bowDist = this.scale * 0.2;
        var rearPointDist = this.scale * 0.9;

        var tipPoint = new Vector2D(
            drawnPos.x + (tipDist * dir.x),
            drawnPos.y + (tipDist * dir.y),
        );

        var bowStartPoint = new Vector2D(
            drawnPos.x + (bowDist * dir.x),
            drawnPos.y + (bowDist * dir.y),
        );

        var forwardDir = new Vector2D(tipPoint.x - drawnPos.x, tipPoint.y - drawnPos.y); //vector from centre to tip
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
            drawnPos.x - (rearPointDist * dir.x),
            drawnPos.y - (rearPointDist * dir.y),
        );

        var rearLeftPoint = new Vector2D(
            rearPoint.x + (sideNormal.x * rearSideDist),
            rearPoint.y + (sideNormal.y * rearSideDist)
        );
        var rearRightPoint = new Vector2D(
            rearPoint.x - (sideNormal.x * rearSideDist),
            rearPoint.y - (sideNormal.y * rearSideDist)
        );

        var vertices = [tipPoint, leftPoint, rearLeftPoint, rearRightPoint, rightPoint];

        const path = new Path2D();
        path.moveTo(vertices[0].x, vertices[0].y);
        path.quadraticCurveTo(vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y);
        path.lineTo(vertices[3].x, vertices[3].y);
        path.quadraticCurveTo(vertices[4].x, vertices[4].y, vertices[0].x, vertices[0].y);
        path.closePath();
        ctx.fillStyle = "rgba(255, 255, 255, " + alphaMultip + ")";
        ctx.fill(path);

        var shadowOffsetX = 20;
        var shadowOffsetY = 20;

        const shadowPath = new Path2D();
        shadowPath.moveTo(vertices[0].x + shadowOffsetX, vertices[0].y + shadowOffsetY);
        shadowPath.quadraticCurveTo(vertices[1].x + shadowOffsetX, vertices[1].y + shadowOffsetY, vertices[2].x + shadowOffsetX, vertices[2].y + shadowOffsetY);
        shadowPath.lineTo(vertices[3].x + shadowOffsetX, vertices[3].y + shadowOffsetY);
        shadowPath.quadraticCurveTo(vertices[4].x + shadowOffsetX, vertices[4].y + shadowOffsetY, vertices[0].x + shadowOffsetX, vertices[0].y + shadowOffsetY);
        shadowPath.closePath();
        bgCtx.fillStyle = "rgba(0, 0, 0, " + 0.25 * alphaMultip + ")";
        bgCtx.fill(shadowPath);
    }
}
