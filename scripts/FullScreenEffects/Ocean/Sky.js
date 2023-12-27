function Sky(noise) {
    this.cloudColor = '255, 255, 255';
    this.shadowColor = '0, 0, 0';
    this.cloudThreshold = 0.8;

    this.cloudDotScale = 1.2;
    this.cloudAlpha = 1;
    this.cloudShadowScale = 0.9;
    this.cloudShadowAlpha = 0.25;

    const birdCreationRate = 1;
    let birdCreationTimer = 0;
    const birdLifetime = 1000;
    const birdVelocity = 10;

    let birdParticles = new ParticleGenerator(
        10,
        (particle, position, force, lifeTime) => { particle.setup(position, force, lifeTime); },
        () => { return new Bird(noise); }
    );

    this.update = function (player) {

        birdCreationTimer += GameLoop.deltaTime;
        if (birdCreationTimer > birdCreationRate)
        {
            birdCreationTimer = 0;

            const spawnRndW = GameCamera.drawnAreaSize.x * 0.75;
            const spawnRndH = GameCamera.drawnAreaSize.y * 0.75;
            var randomPos = new Vector2D(
                GameCamera.position.x + Math.getRnd(-spawnRndW, spawnRndW), 
                GameCamera.position.y + Math.getRnd(-spawnRndH, spawnRndH)
            );

            birdParticles.createParticles(1, randomPos, 1, randomPos, birdVelocity, birdLifetime);
        }

        birdParticles.update((particle) =>
        {
            return particle.update(player);
        });
    }

    this.getHeight = function (x, y) {
        const drawnPos = GameCamera.getDrawnPosition(x, y, false);
        const simplexVal = noise.getScaledNoise(drawnPos.x, drawnPos.y);
        return simplexVal;
    }

    let cloudsPath = new Path2D();
    let cloudShadowsPath = new Path2D();
    this.updatePathsForLocation = function(x, y, step)
    {
        let simplexVal = this.getHeight(x, y);
        if (simplexVal > this.cloudThreshold) {
            let radiusMultip = Math.clamp(Math.minMaxNormal(simplexVal, this.cloudThreshold, 1), 0, 1);
            let radius = step * radiusMultip;
            
            cloudsPath.addPath(CanvasDrawingUtil.getCirclePath(x, y, radius * this.cloudDotScale));

            let shadowOffsetX = 20;
            let shadowOffsetY = 20;
            cloudShadowsPath.addPath(CanvasDrawingUtil.getCirclePath(x + shadowOffsetX, y + shadowOffsetY, radius * this.cloudShadowScale));
        }
    }

    this.draw = function (ctx, bgCtx, screenWidth, screenHeight) {
        
        ctx.fillStyle = 'rgba(' + this.cloudColor + ', ' + this.cloudAlpha + ')';
        ctx.fill(cloudsPath);
        cloudsPath = new Path2D();
    
        bgCtx.fillStyle = 'rgba(' + this.shadowColor + ', ' + this.cloudShadowAlpha + ')';
        bgCtx.fill(cloudShadowsPath);
        cloudShadowsPath = new Path2D();

        birdParticles.draw((particle) =>
        {
            particle.draw(ctx, bgCtx);
        });
    }
}
