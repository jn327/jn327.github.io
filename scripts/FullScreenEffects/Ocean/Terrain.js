function Terrain(noise, centrePos) {
  this.sandColor = '255, 217, 163';
  this.deepColor = '43, 63, 92';
  this.vegetationColor = '57, 129, 59';
  this.reefThresholdMin = 0.6;
  this.reefThreshold = this.reefThresholdMin;
  this.landThreshold = 0.75;
  this.vegetationThreshold = 0.825;
  this.vegetationDeepThreshold = 0.95;
  this.deepThreshold = 0.3;
  this.showDeepWater = true;

  this.trashThreshold = 0.5;

  this.landDotScale = 0.75;
  this.deepDotScale = 0.5;
  this.deepDotAlphaMultip = 0.65;
  this.landObsureChangeRate = 0; //0.05;

  var vectorFieldParticleCreationRate      = 0.1;
  var vectorFieldParticleCreationTimer     = 0;
  var vectorFieldParticleLifetime          = 0.75;
  var vectorFieldParticles = new ParticleGenerator(
    25,
    (particle, position, force, lifeTime) => { particle.setup(position, force, lifeTime); },
    () => { return new OceanParticle(noise); }
  );

  var trashCreationRate      = 1;
  var trashCreationTimer     = 0;
  var trashLifetime          = 2000;
  var nTrashMin              = 5;
  var nTrashMax              = 10;
  let trashSpawnAngle       = 20;
  let trashSpawnRadius      = 40;
  let trashSpawnDist        = 800;

  var trashParticles = new ParticleGenerator(
    30,
    (particle, position, force, lifeTime) => { particle.setup(position, force, lifeTime); },
    () => { return new TrashItem(noise, this); }
  );

  this.update = function (player, onTrashCollidesWithPlayer) {
    if(this.landObsureChangeRate != 0){
      let waveScale = (Math.sin(GameLoop.currentTime * GameLoop.deltaTime * this.landObsureChangeRate) + 1) * 0.25;
      this.reefThreshold = Math.scaleNormal(waveScale, this.reefThresholdMin, this.landThreshold);
    }

    vectorFieldParticleCreationTimer += GameLoop.deltaTime;
    if (vectorFieldParticleCreationTimer > vectorFieldParticleCreationRate)
    {
      vectorFieldParticleCreationTimer = 0;

      let spawnRndW = GameCamera.drawnAreaSize.x * 0.5;
      let spawnRndH = GameCamera.drawnAreaSize.y * 0.5;
      var randomPos = new Vector2D(
        GameCamera.position.x + Math.getRnd(-spawnRndW, spawnRndW), 
        GameCamera.position.y + Math.getRnd(-spawnRndH, spawnRndH)
      );

      let drawnPos = GameCamera.getDrawnPosition(randomPos.x, randomPos.y);
      if (!this.isLand(drawnPos.x, drawnPos.y))
      {
        vectorFieldParticles.createParticles(1, randomPos, 0.001, randomPos, 0.00001, vectorFieldParticleLifetime);
      }
    }

    trashCreationTimer += GameLoop.deltaTime;
    if (trashCreationTimer > trashCreationRate)
    {
      trashCreationTimer = 0;

      let playerMoveDir = new Vector2D(player.velocity.x, player.velocity.y);
      if (playerMoveDir.x != 0 || playerMoveDir.y != 0)
      {
        playerMoveDir.rotate(Math.getRnd(-trashSpawnAngle, trashSpawnAngle));
        playerMoveDir.normalize();

        var randomPos = new Vector2D(
          GameCamera.position.x + (playerMoveDir.x * trashSpawnDist), 
          GameCamera.position.y + (playerMoveDir.y * trashSpawnDist)
        );

        var drawnPosPos = GameCamera.getDrawnPosition(randomPos.x, randomPos.y);
        if (this.getHeight(drawnPosPos.x, drawnPosPos.y) <= this.trashThreshold)
        {
          var nParticles = Math.getRnd(nTrashMin, nTrashMax);
          trashParticles.createParticles(nParticles, randomPos, trashSpawnRadius, randomPos, 0.00001, trashLifetime);
        }
      }
    }

    vectorFieldParticles.update((particle) =>
    {
        return particle.update();
    });

    trashParticles.update((particle) =>
    {
      return particle.update(player, onTrashCollidesWithPlayer);
    });
  }

  this.getHeight = function (x, y) {
    var drawnPos = GameCamera.getDrawnPosition(x, y, false);
    var simplexVal = noise.getScaledNoise(drawnPos.x, drawnPos.y);
    var centreDist = 250;
    if (drawnPos.x > centrePos.x - centreDist && drawnPos.x < centrePos.x + centreDist
      && drawnPos.y > centrePos.y - centreDist && drawnPos.y < centrePos.y + centreDist) {
      let dist = new Vector2D(centrePos.x, centrePos.y).distance(new Vector2D(drawnPos.x, drawnPos.y));
      let distN = Math.clamp(Math.minMaxNormal(dist, 0, centreDist * 0.5) * 0.5, 0, 1);
      return simplexVal * distN;
    }

    return simplexVal;
  }

  this.isLand = function (x, y) {
    return this.getHeight(x, y) > this.landThreshold;
  }

  this.isNearLand = function (x, y) {
    return this.getHeight(x, y) > this.reefThreshold;
  }

  var deepWaterPath = new Path2D();
  var sandPath = new Path2D();
  var vegetationPath = new Path2D();
  this.updatePathsForLocation = function(x, y, step)
  {
    var simplexVal = this.getHeight(x, y);

    if (this.showDeepWater && simplexVal < this.deepThreshold) {
      let scaleMultip = (1-Math.minMaxNormal(simplexVal, 0, this.deepThreshold));
      let radius = step * scaleMultip;
      deepWaterPath.addPath(CanvasDrawingUtil.getCirclePath(x, y, radius * this.deepDotScale));
    }
    else if (simplexVal > this.reefThreshold) {
      let scaleMultip = Math.clamp(Math.minMaxNormal(simplexVal, this.reefThreshold, this.landThreshold), 0, 1);
      let radius = step * scaleMultip;
      sandPath.addPath(CanvasDrawingUtil.getCirclePath(x, y, radius * this.landDotScale));

      if (simplexVal > this.vegetationThreshold) {
        scaleMultip = Math.clamp(Math.minMaxNormal(simplexVal, this.vegetationThreshold,  this.vegetationDeepThreshold), 0, 1);
        radius = step * scaleMultip;
        vegetationPath.addPath(CanvasDrawingUtil.getCirclePath(x, y, radius * this.landDotScale));
      }
    }
  }

  this.draw = function (ctx, screenWidth, screenHeight) {
    
    ctx.fillStyle = 'rgba(' + this.deepColor + ', ' + this.deepDotAlphaMultip + ')';
    ctx.fill(deepWaterPath);
    deepWaterPath = new Path2D();
    
    ctx.fillStyle = 'rgba(' + this.sandColor + ', 1)';
    ctx.fill(sandPath);
    sandPath = new Path2D();

    ctx.fillStyle = 'rgba('+this.vegetationColor+', 0.5)';
    ctx.fill(vegetationPath);
    vegetationPath = new Path2D();

    vectorFieldParticles.draw((particle) =>
    {
        particle.draw(ctx);
    });

    trashParticles.draw((particle) =>
    {
        particle.draw(ctx);
    });
  }
}
