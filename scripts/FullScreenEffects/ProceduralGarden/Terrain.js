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
  this.riverOpacity             = 0.33;
  this.riverWMin                = 350;
  this.riverWMax                = 500;
  this.riverEndW                = 2;
  this.riverNoiseFreq           = 0.01;
  this.riverOffsetMultip        = 200;

  this.riverSampleSizeX         = 1;
  this.riverSampleSizeY         = 1;

  this.valleyEdgePointsUp       = [];
  this.valleyEdgePointsDown     = [];
  this.valleyOpacity            = 0.33;
  this.valleyWMin               = 800;
  this.valleyWMax               = 1000;
  this.valleyEndW               = 5;
  this.valleyColorStart         = [73, 153, 103];
  this.valleyColorEnd           = [153, 117, 73];

  this.valleyEdgesByY           = [];

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
        var yNoise = theNoise.scaledNoise(x * noiseScale, noiseScale);
        var ridgedYNoise = 2 * (0.5 - Math.abs(0.5 - yNoise));
        thePoint.y = (yNoise*(1-this.ridgeNoiseStr)) + (ridgedYNoise*this.ridgeNoiseStr);

        //curl the noise a bit.
        //we're offsetting x based on the value of y, it's a bit hacky, but it looks nicer than anything else I've tried.
        var curlVal = PeriodicFunctions.wave(thePoint.y);
        thePoint.x += curlVal * this.sandCurlOffset;

        thePoint.y = sandTopY + (sandHeightDelta * scaleMultip * thePoint.y);

        if ( i >= (nSandLayers-1) && thePoint.y > this.riverStartPoint.y
          && thePoint.x > 0 && thePoint.x < this.canvas.width)
        {
          this.riverStartPoint.x = thePoint.x;
          this.riverStartPoint.y = Math.round(thePoint.y);
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
    this.valleyEdgesByY        = [];

    PlantsManager.reset();

    //river points sample size
    var riverPointsFreq = 10;
    var riverPointsCounter = 0;

    var plantFreqX  = 3;
    var xCounter    = 0;
    var plantFreqY  = 1;
    var yCounter    = 0;

    var riverStartX = this.riverStartPoint.x;
    var edgeOffset  = -0.5;
    var riverEndX   = (this.canvas.width * edgeOffset) + (Math.random() * (this.canvas.width - (this.canvas.width * edgeOffset * 2)));
    var riverXDelta = riverEndX - riverStartX;

    var riverStartY = this.riverStartPoint.y;
    var riverEndY   = this.canvas.height + this.riverSampleSizeY;

    var riverStartW   = Math.getRnd(this.riverWMin, this.riverWMax);
    var valleyStartW  = Math.getRnd(this.valleyWMin, this.valleyWMax);

    for (var y = riverStartY; y <= riverEndY; y += this.riverSampleSizeY)
    {
      var yNormal = Math.minMaxNormal(y, riverStartY, riverEndY);

      var offestNoise = theNoise.noise(y * this.riverNoiseFreq, this.riverNoiseFreq);
      var offsetX = offestNoise * this.riverOffsetMultip;
      offsetX *= PeriodicFunctions.wave(yNormal);
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

      this.valleyEdgesByY[y] = [leftX, rightX];

      if( riverPointsCounter == 0 || (y >= this.canvas.height) )
      {
        var pointMid    = new Vector2D(midX, y);
        var pointLeft   = new Vector2D(-easedRiverW, 0);
        var pointRight  = new Vector2D(easedRiverW, 0);
        this.river.addPoints(pointMid, pointLeft, pointRight);

        this.valleyEdgePointsUp.push(new Vector2D(-valleyW, 0));
        this.valleyEdgePointsDown.unshift(new Vector2D(valleyW, 0));
      }

      riverPointsCounter ++;
      if (riverPointsCounter >= riverPointsFreq) { riverPointsCounter = 0; }

      if (yNormal >= 0 && yCounter == 0)
      {
        var minPlantScale = 0.01;
        var scaleN = EasingUtil.easeInQuad(yNormal, minPlantScale, 1-minPlantScale, 1);

        for (var x = leftX; x <= rightX; x += this.riverSampleSizeX)
        {
          if (xCounter == 0 && x > 0 && x < this.canvas.width)
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

            //make less frequent around edges, only for close ones (areas were the threshold approaches 1)
            if (valleyDistN != undefined)
            {
              var yNormMultip = Math.minMaxNormal( yNormal, 0.5, 1 ); //grab only the last bit of y normal
              yNormMultip = Math.clamp( yNormMultip, 0, 1 );
              yNormMultip = EasingUtil.easeInSine(yNormMultip, 0, 0.33, 1);

              var valleyDistMax = 1;
              var valleyDistMin = 0.1;
              var valleyDistEased = EasingUtil.easeOutSine(valleyDistN, valleyDistMin, valleyDistMax-valleyDistMin, 1); //easeOutSine , easeNone

              //var valleyDistMultip = valleyDistEased + ((1 - valleyDistEased) * yNormMultip);
              var valleyDistMultip = yNormMultip + ((1 - yNormMultip) * valleyDistEased);

              //add up the difference to 1 as we approach the edge.
              thresholdScaled += (1 - thresholdScaled) * valleyDistMultip;
            }

            //For the river, we want less frequently near the center.
            if (riverDistN != undefined)
            {
              var riverDistMax = 1;
              var riverDistMin = 0.1;
              var riverDistMultup = EasingUtil.easeNone(riverDistN, riverDistMin, riverDistMax-riverDistMin, 1);

              //add up the difference to 1 as we approach the center.
              thresholdScaled += (1 - thresholdScaled) * riverDistMultup;
            }

            if (Math.random() > thresholdScaled)
            {
              if ( thePlants.length <= 0 && valleyDistN != undefined )
              {
                if ( Math.random() > 0.5 )
                {
                  var shrub = new Shrub();
                  thePlants.push(shrub);
                }
                else
                {
                  var grass = new Grass();
                  thePlants.push(grass);
                }

                //TODO: less random, maybe use a bit of perlin???
                /*if ( Math.random() > 0.96 )
                {
                  var palm = new Palm();
                  thePlants.push(palm);
                }*/
              }

              if ( thePlants.length <= 0 && (riverDistN != undefined || valleyDistN != undefined) )
              {
                var reed = new Reed();
                thePlants.push(reed);

                if (riverDistN != undefined)
                {
                  this.river.plants.push(reed);
                }
              }

              if (thePlants.length > 0)
              {
                var staticChanceMin = 0.5;
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
    var valleyColorPlants = [57, 114, 56]; //[103, 165, 96];
    this.fillLayeredShape( 4, this.valleyColorStart, this.valleyColorEnd, this.valleyOpacity, this.river.midPointsUp, this.river.midPointsDown, this.valleyEdgePointsUp, this.valleyEdgePointsDown, riverStartY, riverEndY, valleyColorPlants );
    this.fillLayeredShape( 4, this.river.colorEnd, this.river.colorStart, this.riverOpacity, this.river.midPointsUp, this.river.midPointsDown, this.river.edgePointsUp, this.river.edgePointsDown, riverStartY, riverEndY, this.river.colorEnd );

    PlantsManager.drawStaticPlants(this.plantsCtx);
  }

  this.getValleyEdgesForY = function( yPos )
  {
    var yRounded    = Math.roundMultip( yPos, this.riverSampleSizeY );
    var valleyEdges = this.valleyEdgesByY[yRounded];
    return valleyEdges;
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
      grd.addColorStop(0.11, 'rgba('+grdColor[0]+','+grdColor[1]+','+grdColor[2]+', '+grdOpacity+')');
      grd.addColorStop(0.33, 'rgba('+color[0]+','+color[1]+','+color[2]+', '+opacity+')');

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
