function Terrain(noise, centrePos)
{
  this.sandColor = '255, 217, 163';
  this.deepColor = '43, 63, 92';
  this.reefThresholdMin = 0.6;
  this.reefThreshold = this.reefThresholdMin;
  this.landThreshold = 0.75;
  this.deepThreshold = 0.2;
  this.showDeepWater = true;

  this.showCurlNoise = true;

  this.landDotScale = 0.75; 
  this.landObsureChangeRate = 0.05;

  this.update = function()
  {
    //let waveScale = (Math.sin(GameLoop.currentTime * GameLoop.deltaTime * this.landObsureChangeRate) + 1) * 0.25;
    //this.reefThreshold = Math.scaleNormal(waveScale, this.reefThresholdMin, this.landThreshold);
  }

  this.getHeight = function(x, y)
  {
    var drawnPos = GameCamera.getDrawnPosition(x, y, false);
    var simplexVal = noise.getScaledNoise(drawnPos.x, drawnPos.y);
    var centreDist = 250;
    if (drawnPos.x > centrePos.x-centreDist && drawnPos.x < centrePos.x+centreDist 
      && drawnPos.y > centrePos.y-centreDist && drawnPos.y < centrePos.y+centreDist)
    {
      let dist = new Vector2D(centrePos.x, centrePos.y).distance(new Vector2D(drawnPos.x, drawnPos.y));
      let distN = Math.clamp(Math.minMaxNormal(dist, 0, centreDist * 0.5) * 0.5, 0, 1);
      return simplexVal * distN;
    }

    return simplexVal;
  }

  this.isLand = function(x, y)
  {
    return this.getHeight(x, y) > this.landThreshold;
  }

  this.draw = function(ctx, screenWidth, screenHeight) 
  {
    let step = 8;
    for (var x = 0; x < screenWidth; x+=step )
    {
      for (var y = 0; y < screenHeight; y+=step )
      {
        var simplexVal = this.getHeight(x,y);
        if (this.showDeepWater && simplexVal < this.deepThreshold)
        {
          let alpha = Math.minMaxNormal(simplexVal, 0, this.deepThreshold);
          alpha = 1 - alpha;
          let fillStyle = 'rgba(' +this.deepColor+', '+alpha+')';

          let radius = step * alpha;
          CanvasDrawingUtil.drawCircle( ctx, fillStyle, x, y, radius * this.landDotScale );
        }
        else if (simplexVal > this.reefThreshold)
        {
          let alpha = Math.clamp(Math.minMaxNormal(simplexVal, this.reefThreshold, this.landThreshold), 0 ,1);
          let color = this.sandColor;
          let fillStyle = 'rgba(' +color+', '+alpha+')';
          
          let radius = step * alpha;
          CanvasDrawingUtil.drawCircle( ctx, fillStyle, x, y, radius * this.landDotScale );
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
  }
}
