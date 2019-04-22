//HTML Elements
//TODO: rename these to be more descriptive
var skyCanvas, skyCtx;
var terrainCanvas, terrainCtx;
var effectsCanvas, effectsCtx;
var plantsCanvas, plantsCtx;

var skyUpdateFreq            = 0.05;
var skyUpdateTimer           = 0;
var effectsUpdateFreq        = 0.033;
var effectsUpdateTimer       = 0;
var plantsUpdateFreq         = 0.1;
var plantsUpdateTimer        = 0;

var dayDur                   = 45;
var dayTimer                 = dayDur * 0.5;
var tod                      = 0; //0-1

var sky;

//TODO: terrain stuff can go into own manager
var sandColorFar              = [252, 194, 121];
var sandColorNear             = [255, 236, 212];
var sandHeightMin             = 0.25;
var sandHeightMax             = 0.5;
var sandScaleMultipNear       = 0.5;
var sandScaleMultipFar        = 1;
var sandNoiseFreqNear         = 0.0015;
var sandNoiseFreqFar          = 0.003;
var nSandLayersMax            = 5;
var nSandLayersMin            = 5;
var sandSampleStepSize        = 8;

var ridgeNoiseStr             = 0.45; //how rideged should our sand be
var sandCurlOffset            = 30;

var riverStartPoint;          //used to figure out were to start the river

var river;
var riverMidPointsUp          = [];
var riverMidPointsDown        = [];
var riverEdgePointsUp         = [];
var riverEdgePointsDown       = [];
var valleyEdgePointsUp        = [];
var valleyEdgePointsDown      = [];
var riverOpacity              = 0.5;
var riverWMin                 = 350;
var riverWMax                 = 500;
var riverEndW                 = 2;
var riverNoiseFreq            = 0.01;
var riverOffsetMultip         = 200;
var riverColorStart           = [184, 231, 255];
var riverColorEnd             = [53, 154, 255];

var valleyOpacity             = 0.33;
var valleyWMin                = 500;
var valleyWMax                = 750;
var valleyEndW                = 2;
var valleyColorStart          = [73, 153, 103];
var valleyColorEnd            = [153, 117, 73];

var wind;

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes =
  [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise',
    'Utils/EasingUtil', 'Utils/PathUtil', 'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject',
    'FullScreenEffects/ProceduralGarden/Sun', 'FullScreenEffects/ProceduralGarden/Moon',
    'FullScreenEffects/ProceduralGarden/Sky', 'FullScreenEffects/ProceduralGarden/TerrainManager',
    'FullScreenEffects/ProceduralGarden/Cloud', 'FullScreenEffects/ProceduralGarden/CloudsManager',
    'FullScreenEffects/ProceduralGarden/Plants', 'FullScreenEffects/ProceduralGarden/PlantsManager',
    'FullScreenEffects/ProceduralGarden/Stars', 'FullScreenEffects/ProceduralGarden/StarsManager',
    'FullScreenEffects/ProceduralGarden/River', 'FullScreenEffects/ProceduralGarden/Wind'
  ];
  CommonElementsCreator.appendScipts(includes);
}

function start()
{
  initCanvas();

  sky     = new Sky();
  sky.init( dayDur, skyCanvas );

  river   = new River();
  wind    = new Wind();

  drawTerrain();
}

function initCanvas()
{
  plantsCanvas   = CommonElementsCreator.createCanvas();
  plantsCtx      = plantsCanvas.getContext('2d');

  effectsCanvas  = CommonElementsCreator.createCanvas();
  effectsCtx     = effectsCanvas.getContext('2d');

  terrainCanvas  = CommonElementsCreator.createCanvas();
  terrainCtx     = terrainCanvas.getContext('2d');

  skyCanvas      = CommonElementsCreator.createCanvas();
  skyCtx         = skyCanvas.getContext('2d');

  validateCanvasSize();
}

//TODO: a terrain drawer class to handle this!
function drawTerrain()
{
  terrainCtx.clearRect(0, 0, terrainCanvas.width, terrainCanvas.height);

  var terrainNoise = new SimplexNoise();

  drawSand( terrainNoise );
  drawRivers( terrainNoise );
}

function drawSand( theNoise )
{
  riverStartPoint = new Vector2D(0,0);

  var interLayerNoise = new SimplexNoise();

  var nSandLayers = Math.getRnd(nSandLayersMin, nSandLayersMax);
  for (var i = 0; i < nSandLayers; i++)
  {
    var layerN = i/(nSandLayers-1);
    var theColor = ColorUtil.lerp(layerN, sandColorFar, sandColorNear);
    theColor = ColorUtil.rgbToHex(theColor);
    terrainCtx.fillStyle = theColor;

    var noiseScaleEased = EasingUtil.easeOutQuad(layerN, 0, 1, 1);
    var noiseScale = Math.scaleNormal(noiseScaleEased, sandNoiseFreqFar, sandNoiseFreqNear);

    var noiseScaleN = EasingUtil.easeOutQuart(layerN, 0, 1, 1);
    var scaleMultip = Math.scaleNormal(noiseScaleN, sandScaleMultipFar, sandScaleMultipNear);

    //draw the land
    terrainCtx.beginPath();
    terrainCtx.lineTo(0, terrainCanvas.height);

    var thePoint = new Vector2D(0,0);
    var sandBottomY = (1-sandHeightMax) * terrainCanvas.height;
    var sandTopY = (1-sandHeightMin) * terrainCanvas.height;
    var sandHeightDelta = sandBottomY - sandTopY;

    for (var x = -sandCurlOffset; x < terrainCanvas.width + sandSampleStepSize; x += sandSampleStepSize)
    {
      thePoint.x = x;

      //make it more ridged
      // as per https://www.redblobgames.com/maps/terrain-from-noise/
      var yNoise = (theNoise.noise(x * noiseScale, noiseScale) + 1) * 0.5;
      var ridgedYNoise = 2 * (0.5 - Math.abs(0.5 - yNoise));
      thePoint.y = (yNoise*(1-ridgeNoiseStr)) + (ridgedYNoise*ridgeNoiseStr);

      //curl the noise a bit.
      //we're offsetting x based on the value of y, it's a bit hacky, but it looks nicer than anything else I've tried.
      var curlVal = (1 - Math.cos(2 * Math.PI * thePoint.y)) * 0.5;
      thePoint.x += curlVal * sandCurlOffset;

      thePoint.y = sandTopY + (sandHeightDelta * scaleMultip * thePoint.y);

      if ( i >= (nSandLayers-1) && thePoint.y > riverStartPoint.y
        && thePoint.x > 0 && thePoint.x < terrainCanvas.width)
      {
        riverStartPoint.x = thePoint.x;
        riverStartPoint.y = thePoint.y;
      }

      terrainCtx.lineTo(thePoint.x, thePoint.y);
    }

    terrainCtx.lineTo(terrainCanvas.width, terrainCanvas.height);
    terrainCtx.fill();
  }
}

function drawRivers( theNoise )
{
  river.reset();

  valleyEdgePointsUp    = [];
  valleyEdgePointsDown  = [];
  PlantsManager.reset();

  //draw the river and valley pixel by pixel...
  var xSampleSize = 4;
  var ySampleSize = 4;

  //TODO: maybe should scale the freq distances as we go.
  // at the moment it seems like we get most of the stuff down near close!
  var plantFreqX = 10;
  var xCounter = 0;
  var plantFreqY = 2;
  var yCounter = 0;

  var riverStartX = riverStartPoint.x;
  var edgeOffset  = 0.33;
  var riverEndX   = (terrainCanvas.width * edgeOffset) + (terrainCanvas.width * (1-(edgeOffset * 2)));
  var riverXDelta = riverEndX - riverStartX;

  var riverStartY = riverStartPoint.y;
  var riverEndY   = terrainCanvas.height + ySampleSize;

  var riverStartW   = Math.getRnd(riverWMin, riverWMax);
  var valleyStartW  = Math.getRnd(valleyWMin, valleyWMax);

  for (var y = riverStartY; y <= riverEndY; y += ySampleSize)
  {
    var yNormal = Math.minMaxNormal(y, riverStartY, riverEndY);

    var offestNoise = theNoise.noise(y * riverNoiseFreq, riverNoiseFreq);
    var offsetX = offestNoise * riverOffsetMultip;
    offsetX *= -(Math.cos(2 * Math.PI * yNormal) * 0.5) + 0.5;
    offsetX += (riverXDelta * yNormal); //move towards the center.

    //get the river and valley widths
    var easedRiverW = riverEndW + ((riverStartW - riverEndW) * EasingUtil.easeInSine(yNormal, 0, 1, 1));
    var easedValleyW = valleyEndW + ((valleyStartW - valleyEndW) * EasingUtil.easeInSine(yNormal, 0, 1, 1));

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
    river.addPoints(pointMid, pointLeft, pointRight);

    valleyEdgePointsUp.push(new Vector2D(-valleyW, 0));
    valleyEdgePointsDown.unshift(new Vector2D(valleyW, 0));

    if (yNormal >= 0.1 && yCounter == 0)
    {
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

          if (valleyDistN != undefined)
          {
            //TODO: vary randomness based on dist...
            if (Math.random() > 0.5)
            {
              var shrub = new Shrub();
              thePlants.push(shrub);
            }
          }

          if (valleyDistN != undefined)
          {
            //TODO: vary randomness based on dist...
            if (Math.random() > 0.5)
            {
              var grass = new Grass();
              thePlants.push(grass);
            }
          }

          if ((riverDistN <= 0.66 && riverDistN != undefined) ||
           (valleyDistN <= 0.25 && valleyDistN != undefined))
          {
            //TODO: vary randomness based on dist...
            if (Math.random() >= 0.1)
            {
              var reed = new Reed();
              thePlants.push(reed);
            }
          }

          PlantsManager.addPlants(thePlants, yNormal, new Vector2D(x, y));
        }

        xCounter ++;
        if (xCounter >= plantFreqX) { xCounter = 0; }
      }
    }

    yCounter ++;
    if (yCounter >= plantFreqY) { yCounter = 0; }
  }

  // build a path and draw the valley & river!
  fillLayeredShape( 4, valleyColorStart, valleyColorEnd, valleyOpacity, river.midPointsUp, river.midPointsDown, valleyEdgePointsUp, valleyEdgePointsDown, riverStartY, riverEndY, valleyColorStart );
  fillLayeredShape( 4, riverColorEnd, riverColorStart, riverOpacity, river.midPointsUp, river.midPointsDown, river.edgePointsUp, river.edgePointsDown, riverStartY, riverEndY, riverColorEnd );
}

function fillLayeredShape( nLoops, colorStart, colorEnd, opacity, midUp, midDown, edgeUp, edgeDown, startY, endY, grdColor )
{
  for (var i = 0; i < nLoops; i++)
  {
    var loopN = 1 - (i / (nLoops - 1));
    loopN = EasingUtil.easeOutSine( loopN, 0, 1, 1 );

    terrainCtx.beginPath();

    var color = ColorUtil.lerp(loopN, colorStart, colorEnd);

    //gradient the color as we go up/down in y!
    var grd = terrainCtx.createLinearGradient(0, startY, 0, endY);
    var grdOpacity = EasingUtil.easeOutQuad(opacity, 0, 1, 1);
    grd.addColorStop(0.1, 'rgba('+grdColor[0]+','+grdColor[1]+','+grdColor[2]+', '+grdOpacity+')');
    grd.addColorStop(0.66, 'rgba('+color[0]+','+color[1]+','+color[2]+', '+opacity+')');

    terrainCtx.fillStyle = grd;

    var thePath = new Path2D();
    thePath = PathUtil.createPath(midUp, thePath, edgeUp, loopN);
    thePath = PathUtil.createPath(midDown, thePath, edgeDown, loopN);
    terrainCtx.fill(thePath);
  }
}

function validateCanvasSize()
{
  var maxScale = 1800;
  var minScaleV = 1800;
  var minScaleH = 400;

  return CanvasScaler.updateCanvasSize( [skyCanvas, terrainCanvas, effectsCanvas, plantsCanvas],
    maxScale, minScaleV, minScaleH );
}

//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
  if (validateCanvasSize())
  {
    skyUpdateTimer = skyUpdateFreq;
    effectsUpdateTimer = effectsUpdateFreq;
    plantsUpdateTimer = plantsUpdateFreq;

    sky.reset( skyCanvas );

    drawTerrain();
  }

  //update the current time of day.
  dayTimer += GameLoop.deltaTime;
  if (dayTimer > dayDur)
  {
    dayTimer = 0;
  }

  var prevTod = tod;
  tod = dayTimer / dayDur;

  //update the wind
  wind.update( dayDur );

  //update the sky. If it needs it.
  skyUpdateTimer += GameLoop.deltaTime;
  if (skyUpdateTimer > skyUpdateFreq)
  {
    skyUpdateTimer = 0;

    sky.updateAndDraw( tod, wind.str, skyCtx, skyCanvas );

    //darken the terrain and other bits
    tintMidground();
  }

  //update the river
  effectsUpdateTimer += GameLoop.deltaTime;
  if (effectsUpdateTimer > effectsUpdateFreq)
  {
    effectsUpdateTimer = 0;

    effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

    river.drawWaves( tod, effectsCtx, riverStartPoint.y, effectsCanvas.height );
  }

  //update the plants
  plantsUpdateTimer += GameLoop.deltaTime;
  if (plantsUpdateTimer > plantsUpdateFreq)
  {
    plantsUpdateTimer = 0;

    plantsCtx.clearRect(0, 0, plantsCanvas.width, plantsCanvas.height);
    PlantsManager.updateAndDrawPlants( plantsCtx, wind.str );
  }
}

function tintMidground()
{
  //TODO: wanna be able to tint it a bit with the sky gradient too!!!
  var darkenAmount = 85;
  var theFilter = 'brightness('+((100-darkenAmount) + (sky.brightness*darkenAmount))+'%)';

  terrainCanvas.style.filter = theFilter;
  effectsCanvas.style.filter = theFilter;
  plantsCanvas.style.filter = theFilter;
}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
