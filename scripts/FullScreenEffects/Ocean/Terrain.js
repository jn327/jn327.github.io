function Terrain(noise, centrePos) {
  this.sandColor = '255, 217, 163';
  this.deepColor = '43, 63, 92';
  this.reefThresholdMin = 0.6;
  this.reefThreshold = this.reefThresholdMin;
  this.landThreshold = 0.75;
  this.deepThreshold = 0.2;
  this.showDeepWater = true;

  this.trashThreshold = 0.4;

  this.showCurlNoise = true;

  this.landDotScale = 0.75;
  this.landObsureChangeRate = 0.05;

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
  var trashLifetime          = Number.MAX_SAFE_INTEGER;
  var nTrashMin              = 5;
  var nTrashMax              = 10;
  var trashParticles = new ParticleGenerator(
    30,
    (particle, position, force, lifeTime) => { particle.setup(position, force, lifeTime); },
    () => { return new TrashItem(noise); }
  );

  this.update = function (player, onTrashCollidesWithPlayer) {
    //let waveScale = (Math.sin(GameLoop.currentTime * GameLoop.deltaTime * this.landObsureChangeRate) + 1) * 0.25;
    //this.reefThreshold = Math.scaleNormal(waveScale, this.reefThresholdMin, this.landThreshold);

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

      if (!this.isLand(randomPos.x, randomPos.y))
      {
        vectorFieldParticles.createParticles(1, randomPos, 0.001, randomPos, 0.00001, vectorFieldParticleLifetime);
      }
    }

    trashCreationTimer += GameLoop.deltaTime;
    if (trashCreationTimer > trashCreationRate)
    {
      trashCreationTimer = 0;

      //TODO: spawn around the edge of the map only!!!
      let playerMoveDir = new Vector2D(player.velocity.x, player.velocity.y);
      playerMoveDir.normalize();

      if (playerMoveDir.x != 0 || playerMoveDir.y != 0)
      {
        let spawnRadius = 33;
        let spawnDist = 0.75;
        let spawnRndW = GameCamera.drawnAreaSize.x * spawnDist;
        let spawnRndH = GameCamera.drawnAreaSize.y * spawnDist;

        var randomPos = new Vector2D(
          GameCamera.position.x + (playerMoveDir.x * spawnRndW), 
          GameCamera.position.y + (playerMoveDir.y * spawnRndH)
        );

        if (this.getHeight(randomPos.x, randomPos.y) < this.trashThreshold)
        {
          var nParticles = Math.getRnd(nTrashMin, nTrashMax);
          //console.log('spawning '+nParticles+' at '+randomPos.x +', '+randomPos.y);
          trashParticles.createParticles(nParticles, randomPos, spawnRadius, randomPos, 0.00001, trashLifetime);
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

  this.draw = function (ctx, screenWidth, screenHeight) {
    let step = 8;
    for (var x = 0; x < screenWidth; x += step) {
      for (var y = 0; y < screenHeight; y += step) {
        var simplexVal = this.getHeight(x, y);
        if (this.showDeepWater && simplexVal < this.deepThreshold) {
          let alpha = Math.minMaxNormal(simplexVal, 0, this.deepThreshold);
          alpha = (1 - alpha) * 0.35;
          let fillStyle = 'rgba(' + this.deepColor + ', ' + alpha + ')';

          let radius = step * alpha;
          CanvasDrawingUtil.drawCircle(ctx, fillStyle, x, y, radius * this.landDotScale);
        }
        else if (simplexVal > this.reefThreshold) {
          let alpha = Math.clamp(Math.minMaxNormal(simplexVal, this.reefThreshold, this.landThreshold), 0, 1);
          let color = this.sandColor;
          let fillStyle = 'rgba(' + color + ', ' + alpha + ')';

          let radius = step * alpha;
          CanvasDrawingUtil.drawCircle(ctx, fillStyle, x, y, radius * this.landDotScale);
        }

        /*if (this.showCurlNoise && simplexVal < this.landThreshold) {
          ctx.strokeStyle   = '#ffffff';
          ctx.lineWidth     = 2;
          ctx.beginPath();
          var startPoint = new Vector2D(x, y);
          var curlVal     = noise.getVectorField(x, y);
          //console.log('curVal at '+x +', '+y +' is '+curlVal.x+', '+curlVal.y);
          var curlVector  = new Vector2D(curlVal[0], curlVal[1]);
          var endPoint = startPoint.getSum(curlVector.getMultiplied(6000)); //6000
          var arrowEdgeDist = curlVector.getMultiplied(0.75); //how far along the arrow starts
          var arrowEdgePoint = startPoint.getSum(arrowEdgeDist);
          var perpendicularVector = curlVector.getPerpendicular();
          perpendicularVector.multiply(0.25); //how wide the arrow is compared to our length
          var arrowEdgeOne = arrowEdgePoint.getDifference(perpendicularVector);
          var arrowEdgeTwo = arrowEdgePoint.getSum(perpendicularVector);

          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.lineTo(arrowEdgeOne.x, arrowEdgeOne.y);
          ctx.moveTo(endPoint.x, endPoint.y);
          ctx.lineTo(arrowEdgeTwo.x, arrowEdgeTwo.y);
          ctx.closePath();
          ctx.stroke();
        }*/
      }
    }

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
