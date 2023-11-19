function Sky(noise) {
    this.cloudColor = '255, 255, 255';
    this.shadowColor = '0, 0, 0';
    this.cloudThreshold = 0.75;
  
    this.cloudDotScale = 1.2;
    this.cloudAlpha = 1;
    this.cloudShadowScale = 0.9;
    this.cloudShadowAlpha = 0.25;
  
    this.update = function () {
    }

    this.getHeight = function (x, y) {
        var drawnPos = GameCamera.getDrawnPosition(x, y, false);
        var simplexVal = noise.getScaledNoise(drawnPos.x, drawnPos.y);
        return simplexVal;
    }
  
    this.draw = function (ctx, bgCtx, screenWidth, screenHeight) {
      let step = 14;
      for (var x = 0; x < screenWidth; x += step) {
        for (var y = 0; y < screenHeight; y += step) {
          var simplexVal = this.getHeight(x, y);
          if (simplexVal > this.cloudThreshold) {
            let radiusMultip = Math.clamp(Math.minMaxNormal(simplexVal, this.cloudThreshold, 1), 0, 1);
            let fillStyle = 'rgba(' + this.cloudColor + ', ' + this.cloudAlpha + ')';
  
            let radius = step * radiusMultip;
            CanvasDrawingUtil.drawCircle(ctx, fillStyle, x, y, radius * this.cloudDotScale);

            let shadowOffsetX = 20;
            let shadowOffsetY = 20;
            fillStyle = 'rgba(' + this.shadowColor + ', ' + this.cloudShadowAlpha + ')';
            CanvasDrawingUtil.drawCircle(bgCtx, fillStyle, x+shadowOffsetX, y+shadowOffsetY, radius * this.cloudShadowScale);
          }
        }
      }
    }
  }
  