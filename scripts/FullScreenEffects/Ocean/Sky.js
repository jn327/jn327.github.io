function Sky(noise) {
    this.cloudColor = '255, 255, 255';
    this.shadowColor = '0, 0, 0';
    this.cloudThreshold = 0.8;

    this.cloudDotScale = 1.2;
    this.cloudAlpha = 1;
    this.cloudShadowScale = 0.9;
    this.cloudShadowAlpha = 0.25;

    const birdCreationRate = 1;
    const birdLifetime = 1000;
    const birdVelocity = 10;

    let birdCreationTimer = 0;
    const birdParticles = new ParticleGenerator(
        10,
        (particle, position, force, lifeTime) => { particle.setup(position, force, lifeTime, false); },
        () => { return new Bird(noise); }
    );

    let restingBirdCreationTimer = 0;
    let restingBirdSpawnAngle    = 20;
    let restingBirdSpawnRadius   = 20;
    let nRestingBirdsMin = 6;
    let nRestingBirdsMax = 10;
    const restingBirdParticles = new ParticleGenerator(
        30,
        (particle, position, force, lifeTime) => { particle.setup(position, force, lifeTime, true); },
        () => { return new Bird(noise); }
    );

    this.update = function (player) {

        birdCreationTimer += GameLoop.deltaTime;
        if (birdCreationTimer > birdCreationRate)
        {
            birdCreationTimer = 0;

            const spawnDist = Math.max(GameCamera.drawnAreaSize.x, GameCamera.drawnAreaSize.y);
            const spawnDir = new Vector2D(Math.getRnd(-1, 1), Math.getRnd(-1, 1)).normalize();
            const randomPos = new Vector2D(
                GameCamera.position.x + (spawnDir.x * spawnDist), 
                GameCamera.position.y + (spawnDir.y * spawnDist)
            );

            const playerPos = player.getPosition();
            const playerDir = new Vector2D(playerPos.x - randomPos.x, playerPos.y - randomPos.y);
            const forcePos = new Vector2D(randomPos.x - playerDir.x, randomPos.y - playerDir.y);

            birdParticles.createParticles(1, randomPos, 1, forcePos, birdVelocity, birdLifetime);
        }

        restingBirdCreationTimer += GameLoop.deltaTime;
        if (restingBirdCreationTimer > birdCreationRate)
        {
            restingBirdCreationTimer = 0;

            let playerMoveDir = new Vector2D(player.velocity.x, player.velocity.y);
            playerMoveDir.x = playerMoveDir.x == 0 ? playerMoveDir.x : 0.05;
            playerMoveDir.y = playerMoveDir.y == 0 ? playerMoveDir.y : 0.05;

            playerMoveDir.rotate(Math.getRnd(-restingBirdSpawnAngle, restingBirdSpawnAngle));
            playerMoveDir.normalize();

            const spawnDist = Math.max(GameCamera.drawnAreaSize.x, GameCamera.drawnAreaSize.y);
            const randomPos = new Vector2D(
                GameCamera.position.x + (playerMoveDir.x * spawnDist), 
                GameCamera.position.y + (playerMoveDir.y * spawnDist)
            );

            const nParticles = Math.getRnd(nRestingBirdsMin, nRestingBirdsMax);
            restingBirdParticles.createParticles(nParticles, randomPos, restingBirdSpawnRadius, randomPos, 0.00001, birdLifetime);
        }

        birdParticles.update((particle) =>
        {
            return particle.update(player);
        });

        restingBirdParticles.update((particle) =>
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
        
        bgCtx.fillStyle = 'rgba(' + this.shadowColor + ', ' + this.cloudShadowAlpha + ')';
        bgCtx.fill(cloudShadowsPath);
        cloudShadowsPath = new Path2D();

        restingBirdParticles.draw((particle) =>
        {
            particle.draw(ctx, bgCtx);
        });

        birdParticles.draw((particle) =>
        {
            particle.draw(ctx, bgCtx);
        });
        
        ctx.fillStyle = 'rgba(' + this.cloudColor + ', ' + this.cloudAlpha + ')';
        ctx.fill(cloudsPath);
        cloudsPath = new Path2D();

    }
}
