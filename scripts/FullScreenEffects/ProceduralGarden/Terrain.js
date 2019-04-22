function Terrain()
{
  this.ctx;
  this.canvas;
  this.plantsCtx;

  this.sandColorFar             = [252, 194, 121];
  this.sandColorNear            = [255, 236, 212];
  this.sandHeightMin            = 0.25;
  this.sandHeightMax            = 0.5;
  this.sandScaleMultipNear      = 0.5;
  this.sandScaleMultipFar       = 1;
  this.sandNoiseFreqNear        = 0.0015;
  this.sandNoiseFreqFar         = 0.003;
  this.nSandLayersMax           = 5;
  this.nSandLayersMin           = 5;
  this.sandSampleStepSize       = 8;
  this.ridgeNoiseStr            = 0.45; //how rideged should our sand be
  this.sandCurlOffset           = 30;

  this.river                    = new River();
  this.riverStartPoint;         //used to figure out were to start the river
  this.riverOpacity             = 0.5;
  this.riverWMin                = 350;
  this.riverWMax                = 500;
  this.riverEndW                = 2;
  this.riverNoiseFreq           = 0.01;
  this.riverOffsetMultip        = 200;
  this.riverColorStart          = [184, 231, 255];
  this.riverColorEnd            = [53, 154, 255];

  this.valleyEdgePointsUp       = [];
  this.valleyEdgePointsDown     = [];
  this.valleyOpacity            = 0.33;
  this.valleyWMin               = 500;
  this.valleyWMax               = 750;
  this.valleyEndW               = 2;
  this.valleyColorStart         = [73, 153, 103];
  this.valleyColorEnd           = [153, 117, 73];

  this.init = function( theCtx, theCanvas, plantsCtx )
  {
    this.ctx          = theCtx;
    this.canvas       = theCanvas;
    this.plantsCtx    = plantsCtx;

    this.buildAndDraw();
  }

  this.reset = function()
  {
    this.buildAndDraw();
  }

  this.buildAndDraw = function()
  {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var terrainNoise = new SimplexNoise();

    this.drawSand( terrainNoise );
    this.drawRivers( terrainNoise );
  }

  this.drawSand = function( theNoise )
  {
    this.riverStartPoint = new Vector2D(0,0);

    var interLayerNoise = new SimplexNoise();

    var nSandLayers = Math.getRnd(this.nSandLayersMin, this.nSandLayersMax);
    for (var i = 0; i < nSandLayers; i++)
    {
      var layerN = i/(nSandLayers-1);
      var theColor = ColorUtil.lerp(layerN, this.sandColorFar, this.sandColorNear);
      theColor = ColorUtil.rgbToHex(theColor);
      this.ctx.fillStyle = theColor;

      var noiseScaleEased = EasingUtil.easeOutQuad(layerN, 0, 1, 1);
      var noiseScale = Math.scaleNormal(noiseScaleEased, this.sandNoiseFreqFar, this.sandNoiseFreqNear);

      var noiseScaleN = EasingUtil.easeOutQuart(layerN, 0, 1, 1);
      var scaleMultip = Math.scaleNormal(noiseScaleN, this.sandScaleMultipFar, this.sandScaleMultipNear);

      //draw the land
      this.ctx.beginPath();
      this.ctx.lineTo(0, this.canvas.height);

      var thePoint = new Vector2D(0,0);
      var sandBottomY = (1-this.sandHeightMax) * this.canvas.height;
      var sandTopY = (1-this.sandHeightMin) * this.canvas.height;
      var sandHeightDelta = sandBottomY - sandTopY;

      for (var x = -this.sandCurlOffset; x < this.canvas.width + this.sandSampleStepSize; x += this.sandSampleStepSize)
      {
        thePoint.x = x;

        //make it more ridged
        // as per https://www.redblobgames.com/maps/terrain-from-noise/
        var yNoise = (theNoise.noise(x * noiseScale, noiseScale) + 1) * 0.5;
        var ridgedYNoise = 2 * (0.5 - Math.abs(0.5 - yNoise));
        thePoint.y = (yNoise*(1-this.ridgeNoiseStr)) + (ridgedYNoise*this.ridgeNoiseStr);

        //curl the noise a bit.
        //we're offsetting x based on the value of y, it's a bit hacky, but it looks nicer than anything else I've tried.
        var curlVal = (1 - Math.cos(2 * Math.PI * thePoint.y)) * 0.5;
        thePoint.x += curlVal * this.sandCurlOffset;

        thePoint.y = sandTopY + (sandHeightDelta * scaleMultip * thePoint.y);

        if ( i >= (nSandLayers-1) && thePoint.y > this.riverStartPoint.y
          && thePoint.x > 0 && thePoint.x < this.canvas.width)
        {
          this.riverStartPoint.x = thePoint.x;
          this.riverStartPoint.y = thePoint.y;
        }

        this.ctx.lineTo(thePoint.x, thePoint.y);
      }

      this.ctx.lineTo(this.canvas.width, this.canvas.height);
      this.ctx.fill();
    }
  }

  this.drawRivers = function( theNoise )
  {
    this.river.reset();

    this.valleyEdgePointsUp    = [];
    this.valleyEdgePointsDown  = [];
    PlantsManager.reset();

    //draw the river and valley pixel by pixel...
    var xSampleSize = 1;
    var ySampleSize = 1;

    //TODO: points sample size?

    //TODO: maybe should scale the freq distances as we go.
    // at the moment it seems like we get most of the stuff down near close!
    // to do so would have to get rid of the counters ... and find some other way of doing this.
    // modulo, worried about missing if the freq and sample size are not multipliers? or ...
    var plantFreqX = 3;
    var xCounter = 0;
    var plantFreqY = 1;
    var yCounter = 0;

    var riverStartX = this.riverStartPoint.x;
    var edgeOffset  = 0.33;
    var riverEndX   = (this.canvas.width * edgeOffset) + (this.canvas.width * (1-(edgeOffset * 2)));
    var riverXDelta = riverEndX - riverStartX;

    var riverStartY = this.riverStartPoint.y;
    var riverEndY   = this.canvas.height + ySampleSize;

    var riverStartW   = Math.getRnd(this.riverWMin, this.riverWMax);
    var valleyStartW  = Math.getRnd(this.valleyWMin, this.valleyWMax);

    for (var y = riverStartY; y <= riverEndY; y += ySampleSize)
    {
      var yNormal = Math.minMaxNormal(y, riverStartY, riverEndY);

      var offestNoise = theNoise.noise(y * this.riverNoiseFreq, this.riverNoiseFreq);
      var offsetX = offestNoise * this.riverOffsetMultip;
      offsetX *= -(Math.cos(2 * Math.PI * yNormal) * 0.5) + 0.5;
      offsetX += (riverXDelta * yNormal); //move towards the center.

      //get the river and valley widths
      var easedRiverW = this.riverEndW + ((riverStartW - this.riverEndW) * EasingUtil.easeInSine(yNormal, 0, 1, 1));
      var easedValleyW = this.valleyEndW + ((valleyStartW - this.valleyEndW) * EasingUtil.easeInSine(yNormal, 0, 1, 1));

      //push the middle points
      var midX  = riverStartX + offsetX;
      var valleyW = easedRiverW + easedValleyW;

      var leftX         = midX - valleyW;
      var rightX        = midX + valleyW;
      var riverLeftX    = midX - easedRiverW;
      var riverRightX   = midX + easedRiverW;

      var pointMid = new Vector2D(midX, y);
      var pointLeft = new Vector2D(-easedRiverW, 0);
      var pointRight = new Vector2D(easedRiverW, 0);
      this.river.addPoints(pointMid, pointLeft, pointRight);

      this.valleyEdgePointsUp.push(new Vector2D(-valleyW, 0));
      this.valleyEdgePointsDown.unshift(new Vector2D(valleyW, 0));

      if (yNormal >= 0 && yCounter == 0)
      {
        var minPlantScale = 0.01;
        var scaleN = EasingUtil.easeInQuad(yNormal, minPlantScale, 1-minPlantScale, 1);

        for (var x = leftX; x <= rightX; x += xSampleSize)
        {
          if (xCounter == 0 && x > 0 && x < plantsCanvas.width)
          {
            var riverDistN = undefined; // how close we are to the edge of the river, 0 being the center
            var valleyDistN = undefined; // how close we are to the edge of the valley, 0 being river edge
            if ( x <= midX )
            {
              if (x >= riverLeftX) { riverDistN = (x - riverLeftX)/easedRiverW; }
              if (x <= riverLeftX) { valleyDistN = 1 - ((x - leftX)/easedValleyW); }
            }
            else
            {
              if (x <= riverRightX) { riverDistN = 1 - ((x - midX)/easedRiverW); }
              if (x >= riverRightX) { valleyDistN = (x - riverRightX)/easedValleyW; }
            }

            var thePlants = [];
            var thesholdMax = 0.996;
            var thresholdScaled = EasingUtil.easeOutSine(yNormal, 0, thesholdMax, 1);
            thresholdScaled = EasingUtil.easeOutSine(thresholdScaled, 0, thesholdMax, 1);

            if (Math.random() >= thresholdScaled)
            {
              if ( thePlants.length <= 0 && valleyDistN != undefined )
              {
                var shrub = new Shrub();
                thePlants.push(shrub);
              }

              if ( thePlants.length <= 0 && valleyDistN != undefined )
              {
                var grass = new Grass();
                thePlants.push(grass);
              }

              if ( thePlants.length <= 0 && (riverDistN != undefined || valleyDistN != undefined) )
              {
                var reed = new Reed();
                thePlants.push(reed);
              }

              if (thePlants.length > 0)
              {
                var staticChanceMin = 0;
                var staticChanceMax = 1;
                var staticChance = EasingUtil.easeInQuart(yNormal, staticChanceMin, staticChanceMax-staticChanceMin, 1);

                PlantsManager.addPlants(thePlants, scaleN, staticChance, new Vector2D(x, y));
              }
            }
          }

          xCounter ++;
          if (xCounter >= plantFreqX) { xCounter = 0; }
        }
      }

      yCounter ++;
      if (yCounter >= plantFreqY) { yCounter = 0; }
    }

    // build a path and draw the valley & river!
    this.fillLayeredShape( 4, this.valleyColorStart, this.valleyColorEnd, this.valleyOpacity, this.river.midPointsUp, this.river.midPointsDown, this.valleyEdgePointsUp, this.valleyEdgePointsDown, riverStartY, riverEndY, this.valleyColorStart );
    this.fillLayeredShape( 4, this.riverColorEnd, this.riverColorStart, this.riverOpacity, this.river.midPointsUp, this.river.midPointsDown, this.river.edgePointsUp, this.river.edgePointsDown, riverStartY, riverEndY, this.riverColorEnd );

    PlantsManager.drawStaticPlants(this.plantsCtx);
  }

  this.fillLayeredShape = function( nLoops, colorStart, colorEnd, opacity, midUp, midDown, edgeUp, edgeDown, startY, endY, grdColor )
  {
    for (var i = 0; i < nLoops; i++)
    {
      var loopN = 1 - (i / (nLoops - 1));
      loopN = EasingUtil.easeOutSine( loopN, 0, 1, 1 );

      this.ctx.beginPath();

      var color = ColorUtil.lerp(loopN, colorStart, colorEnd);

      //gradient the color as we go up/down in y!
      var grd = this.ctx.createLinearGradient(0, startY, 0, endY);
      var grdOpacity = EasingUtil.easeOutQuad(opacity, 0, 1, 1);
      grd.addColorStop(0.1, 'rgba('+grdColor[0]+','+grdColor[1]+','+grdColor[2]+', '+grdOpacity+')');
      grd.addColorStop(0.66, 'rgba('+color[0]+','+color[1]+','+color[2]+', '+opacity+')');

      this.ctx.fillStyle = grd;

      var thePath = new Path2D();
      thePath = PathUtil.createPath(midUp, thePath, edgeUp, loopN);
      thePath = PathUtil.createPath(midDown, thePath, edgeDown, loopN);
      this.ctx.fill(thePath);
    }
  }

  this.updateAndDrawEffects = function( t, ctx, canvas )
  {
    this.river.drawWaves( t, ctx, this.riverStartPoint.y, canvas.height );
  }
}
