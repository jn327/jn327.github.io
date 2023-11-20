function Sky(noise) {
    this.cloudColor = '255, 255, 255';
    this.shadowColor = '0, 0, 0';
    this.cloudThreshold = 0.8;

    this.cloudDotScale = 1.2;
    this.cloudAlpha = 1;
    this.cloudShadowScale = 0.9;
    this.cloudShadowAlpha = 0.25;

    var birdCreationRate = 1;
    var birdCreationTimer = 0;
    var birdLifetime = 1000;
    var birdVelocity = 10;

    var drawStep = 18;

    var birdParticles = new ParticleGenerator(
        5,
        (particle, position, force, lifeTime) => { particle.setup(position, force, lifeTime); },
        () => { return new Bird(noise); }
    );

    this.update = function (player) {

        birdCreationTimer += GameLoop.deltaTime;
        if (birdCreationTimer > birdCreationRate)
        {
            birdCreationTimer = 0;

            let spawnRndW = GameCamera.drawnAreaSize.x * 0.75;
            let spawnRndH = GameCamera.drawnAreaSize.y * 0.75;
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
        var drawnPos = GameCamera.getDrawnPosition(x, y, false);
        var simplexVal = noise.getScaledNoise(drawnPos.x, drawnPos.y);
        return simplexVal;
    }

    this.draw = function (ctx, bgCtx, screenWidth, screenHeight) {
        for (var x = 0; x < screenWidth; x += drawStep) {
            for (var y = 0; y < screenHeight; y += drawStep) {
                var simplexVal = this.getHeight(x, y);
                if (simplexVal > this.cloudThreshold) {
                    let radiusMultip = Math.clamp(Math.minMaxNormal(simplexVal, this.cloudThreshold, 1), 0, 1);
                    let fillStyle = 'rgba(' + this.cloudColor + ', ' + this.cloudAlpha + ')';

                    let radius = drawStep * radiusMultip;
                    CanvasDrawingUtil.drawCircle(ctx, fillStyle, x, y, radius * this.cloudDotScale);

                    let shadowOffsetX = 20;
                    let shadowOffsetY = 20;
                    fillStyle = 'rgba(' + this.shadowColor + ', ' + this.cloudShadowAlpha + ')';
                    CanvasDrawingUtil.drawCircle(bgCtx, fillStyle, x + shadowOffsetX, y + shadowOffsetY, radius * this.cloudShadowScale);
                }
            }
        }

        birdParticles.draw((particle) =>
        {
            particle.draw(ctx, bgCtx);
        });
    }
}
