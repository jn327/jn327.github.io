//HTML Elements
var bgCanvas, bgCtx;
var mgCanvas, mgCtx;
var mgCanvas2, mgCtx2;
var fgCanvas, fgCtx;

var skyUpdateFreq             = 0.05;
var skyUpdateTimer            = 0;

var mg2UpdateFreq             = 0.033;
var mg2UpdateTimer            = 0;

var fgUpdateFreq              = 0.1;
var fgUpdateTimer             = 0;

var dayDur                    = 45;
var dayTimer                  = dayDur * 0.5;
var tod                       = 0; //0-1
var skyBlueMin                = 0.075;
var skyBlueMax                = 0.925;
var skyColorDay               = [183, 231, 255];
var skyColorNight             = [28, 19, 25];

var moon;
var sun;

var skyGradientMin            = 0.2;
var skyGradientMax            = 0.8;
var skyGradientHMultip        = 1;

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

  moon    = new Moon();
  sun     = new Sun();
  river   = new River();

  wind     = new Wind();

  CloudsManager.initClouds( bgCanvas.width, bgCanvas.height );
  StarsManager.initStars( dayDur, bgCanvas.width, bgCanvas.height );
  drawTerrain();
}

function initCanvas()
{
  fgCanvas  = CommonElementsCreator.createCanvas();
  fgCtx     = fgCanvas.getContext('2d');

  mgCanvas2 = CommonElementsCreator.createCanvas();
  mgCtx2    = mgCanvas2.getContext('2d');

  mgCanvas  = CommonElementsCreator.createCanvas();
  mgCtx     = mgCanvas.getContext('2d');

  bgCanvas  = CommonElementsCreator.createCanvas();
  bgCtx     = bgCanvas.getContext('2d');

  validateCanvasSize();
}

//TODO: a terrain drawer class to handle this!
function drawTerrain()
{
  mgCtx.clearRect(0, 0, mgCanvas.width, mgCanvas.height);

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
    mgCtx.fillStyle = theColor;

    var noiseScaleEased = EasingUtil.easeOutQuad(layerN, 0, 1, 1);
    var noiseScale = Math.scaleNormal(noiseScaleEased, sandNoiseFreqFar, sandNoiseFreqNear);

    var noiseScaleN = EasingUtil.easeOutQuart(layerN, 0, 1, 1);
    var scaleMultip = Math.scaleNormal(noiseScaleN, sandScaleMultipFar, sandScaleMultipNear);

    //draw the land
    mgCtx.beginPath();
    mgCtx.lineTo(0, mgCanvas.height);

    var thePoint = new Vector2D(0,0);
    var sandBottomY = (1-sandHeightMax) * mgCanvas.height;
    var sandTopY = (1-sandHeightMin) * mgCanvas.height;
    var sandHeightDelta = sandBottomY - sandTopY;

    for (var x = -sandCurlOffset; x < mgCanvas.width + sandSampleStepSize; x += sandSampleStepSize)
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
        && thePoint.x > 0 && thePoint.x < mgCanvas.width)
      {
        riverStartPoint.x = thePoint.x;
        riverStartPoint.y = thePoint.y;
      }

      mgCtx.lineTo(thePoint.x, thePoint.y);
    }

    mgCtx.lineTo(mgCanvas.width, mgCanvas.height);
    mgCtx.fill();
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
  var riverEndX   = (mgCanvas.width * edgeOffset) + (mgCanvas.width * (1-(edgeOffset * 2)));
  var riverXDelta = riverEndX - riverStartX;

  var riverStartY = riverStartPoint.y;
  var riverEndY   = mgCanvas.height + ySampleSize;

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
        if (xCounter == 0 && x > 0 && x < fgCanvas.width)
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

    mgCtx.beginPath();

    var color = ColorUtil.lerp(loopN, colorStart, colorEnd);

    //gradient the color as we go up/down in y!
    var grd = mgCtx.createLinearGradient(0, startY, 0, endY);
    var grdOpacity = EasingUtil.easeOutQuad(opacity, 0, 1, 1);
    grd.addColorStop(0.1, 'rgba('+grdColor[0]+','+grdColor[1]+','+grdColor[2]+', '+grdOpacity+')');
    grd.addColorStop(0.66, 'rgba('+color[0]+','+color[1]+','+color[2]+', '+opacity+')');

    mgCtx.fillStyle = grd;

    var thePath = new Path2D();
    thePath = PathUtil.createPath(midUp, thePath, edgeUp, loopN);
    thePath = PathUtil.createPath(midDown, thePath, edgeDown, loopN);
    mgCtx.fill(thePath);
  }
}

function validateCanvasSize()
{
  var maxScale = 1800;
  var minScaleV = 1800;
  var minScaleH = 400;

  return CanvasScaler.updateCanvasSize( [bgCanvas, mgCanvas, mgCanvas2, fgCanvas],
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
    mg2UpdateTimer = mg2UpdateFreq;
    fgUpdateTimer = fgUpdateFreq;

    CloudsManager.randomizeClouds( bgCanvas.width, bgCanvas.height );
    StarsManager.randomizeStars( bgCanvas.width, bgCanvas.height );

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
    updateSkyVisuals();
  }

  //update the river
  mg2UpdateTimer += GameLoop.deltaTime;
  if (mg2UpdateTimer > mg2UpdateFreq)
  {
    mg2UpdateTimer = 0;

    mgCtx2.clearRect(0, 0, mgCanvas2.width, mgCanvas2.height);
    river.drawWaves( tod, mgCtx2, riverStartPoint.y, mgCanvas.height );
  }

  //update the plants
  fgUpdateTimer += GameLoop.deltaTime;
  if (fgUpdateTimer > fgUpdateFreq)
  {
    fgUpdateTimer = 0;

    fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    PlantsManager.updateAndDrawPlants( fgCtx, wind.str );
  }
}

function updateSkyVisuals()
{
  var skyBrightness = getSkyBrightness();

  drawSkyColor(skyBrightness);

  //darken the terrain and other bits
  tintMidground(skyBrightness);

  //stars
  StarsManager.drawStars(tod, bgCtx, bgCanvas.width, bgCanvas.height);

  //sun and sky gradient
  sun.update( tod, bgCanvas.width, bgCanvas.height );
  drawSkyGradient();
  sun.draw(bgCtx);

  //moon
  moon.update( tod, bgCanvas.width, bgCanvas.height );
  moon.draw( bgCtx );

  //clouds
  CloudsManager.updateAndDrawClouds( bgCtx, wind.str, skyBrightness );
}

function getSkyBrightness()
{
  var skyLerp = 0;
  if (tod > skyBlueMin && tod < skyBlueMax)
  {
    var skyChangeNormal = Math.minMaxNormal(tod, skyBlueMin, skyBlueMax);
    var skyMid = Math.scaleNormal(0.5, skyBlueMin, skyBlueMax);
    skyLerp = skyChangeNormal <= skyMid ? EasingUtil.easeOutCubic(skyChangeNormal, 0, 1, 0.5)
      : EasingUtil.easeInCubic(skyChangeNormal-0.5, 1, -1, 0.5);
  }
  return skyLerp;
}

function drawSkyColor (brightness)
{
  var skyColor = ColorUtil.rgbToHex(ColorUtil.lerp(brightness, skyColorNight, skyColorDay));
  bgCtx.fillStyle = skyColor;
  bgCtx.fillRect(0,0,bgCanvas.width,bgCanvas.height);
}

function tintMidground( brightness )
{
  //TODO: wanna be able to tint it a bit with the sky gradient too!!!
  var darkenAmount = 85;
  var theFilter = 'brightness('+((100-darkenAmount) + (brightness*darkenAmount))+'%)';

  mgCanvas.style.filter = theFilter;
  mgCanvas2.style.filter = theFilter;
  fgCanvas.style.filter = theFilter;
}

function drawSkyGradient()
{
  //This wants to be a M shape, peaking around skyGradientMin and skyGradientMax...
  var gradientTimeNormal = 0;
  var gradientTimeMid = 0.5;

  if (tod > skyGradientMin && tod < skyGradientMax)
  {
    //from 0 to 1.
    gradientTimeNormal = Math.minMaxNormal(tod, skyGradientMin, skyGradientMax);
    gradientTimeMid = Math.scaleNormal(0.5, skyGradientMin, skyGradientMax);
  }
  else
  {
    //from 1 back down to 0.
    var totalRemaining = skyGradientMin + (1-skyGradientMax);
    var gradientTime = (tod < skyGradientMin) ? skyGradientMin - tod : tod - skyGradientMax;
    gradientTimeNormal = 1 - (gradientTime / totalRemaining);
  }

  var gradientHeightLerp = gradientTimeNormal <= gradientTimeMid ? EasingUtil.easeNone(gradientTimeNormal, 1, -1, 0.5)
    : EasingUtil.easeNone(gradientTimeNormal-0.5, 0, 1, 0.5);

  var gradientAlphaLerp = gradientTimeNormal <= gradientTimeMid ? EasingUtil.easeNone(gradientTimeNormal, 1, -1, 0.5)
    : EasingUtil.easeNone(gradientTimeNormal-0.5, 0, 1, 0.5);

  var gradientHeight = gradientHeightLerp * bgCanvas.height * skyGradientHMultip;

  var grd = bgCtx.createLinearGradient(0, bgCanvas.height-gradientHeight, 0, bgCanvas.height);
  grd.addColorStop(0, 'rgba('+sun.color[0]+', '+sun.color[1]+','+sun.color[2]+', 0)');
  grd.addColorStop(1, 'rgba('+sun.color[0]+', '+sun.color[1]+','+sun.color[2]+', '+gradientAlphaLerp+')');
  bgCtx.fillStyle = grd;
  bgCtx.fillRect(0,0,bgCanvas.width,bgCanvas.height);
}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
