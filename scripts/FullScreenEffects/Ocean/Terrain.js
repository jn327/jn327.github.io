function Terrain(noise)
{
  this.sandColor = '255, 217, 163';
  //this.grassColor = '217, 198, 112';
  this.deepColor = '43, 63, 92';
  this.reefThreshold = 0.65;
  this.landThreshold = 0.75;
  //this.grassThreshold = 0.85;
  this.deepThreshold = 0.2;

  this.update = function(deltaTime)
  {
  }

  this.draw = function(ctx, cameraOffset, screenWidth, screenHeight) 
  {
    let step = 2;
    for (var x = 0; x < screenWidth; x+=step )
    {
      for (var y = 0; y < screenHeight; y+=step )
      {
        var simplexVal = noise.getScaledNoise(x + cameraOffset.x, y + cameraOffset.y);
        if (simplexVal < this.deepThreshold)
        {
          let alpha = Math.minMaxNormal(simplexVal, 0, this.deepThreshold);
          let fillStyle = 'rgba(' +this.deepColor+', '+(1-alpha)+')';
          //CanvasDrawingUtil.drawCircle( ctx, fillStyle, x, y, step * 2 );
          CanvasDrawingUtil.drawRect( ctx, fillStyle, x, y, step, step );
        }
        else if (simplexVal > this.reefThreshold)
        {
          let alpha = Math.minMaxNormal(simplexVal, this.reefThreshold, this.landThreshold);
          let fillStyle = 'rgba(' +(/*(simplexVal > this.grassThreshold) ? this.grassColor :*/ this.sandColor)+', '+alpha+')';
          //CanvasDrawingUtil.drawCircle( ctx, fillStyle, x, y, step * 2 );
          CanvasDrawingUtil.drawRect( ctx, fillStyle, x, y, step, step );
        }

        /*
          noiseVisCtx.strokeStyle   = 'hotpink';
          noiseVisCtx.lineWidth     = 1;
          noiseVisCtx.beginPath();
          var startPoint = new Vector2D(x, y);
          var endPoint = startPoint.getSum(curlVector.getMultiplied(6000));
          var arrowEdgeDist = curlVector.getMultiplied(0.75); //how far along the arrow starts
          var arrowEdgePoint = startPoint.getSum(arrowEdgeDist);
          var perpendicularVector = curlVector.getPerpendicular();
          perpendicularVector.multiply(0.25); //how wide the arrow is compared to our length
          var arrowEdgeOne = arrowEdgePoint.getDifference(perpendicularVector);
          var arrowEdgeTwo = arrowEdgePoint.getSum(perpendicularVector);

          noiseVisCtx.moveTo(startPoint.x, startPoint.y);
          noiseVisCtx.lineTo(endPoint.x, endPoint.y);
          noiseVisCtx.lineTo(arrowEdgeOne.x, arrowEdgeOne.y);
          noiseVisCtx.moveTo(endPoint.x, endPoint.y);
          noiseVisCtx.lineTo(arrowEdgeTwo.x, arrowEdgeTwo.y);
        */
      }
    }
  }

  this.isLand = function(x, y, cameraOffset)
  {
    var drawnPos = new Vector2D(x + cameraOffset.x, y + cameraOffset.y);
    return noise.getScaledNoise(drawnPos.x, drawnPos.y) > this.landThreshold;
  }
}
