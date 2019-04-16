//HTML Elements
var bgCanvas, bgCtx;
var mgCanvas, mgCtx;
var mgCanvas2, mgCtx2;
var fgCanvas, fgCtx;

//variables... TODO: maybe encapsulate/namespace these??
var dayDur                    = 45;
var dayTimer                  = dayDur*0.5;
var tod                       = 0; //0-1
var skyBlueMin                = 0.075;
var skyBlueMax                = 0.925;
var sunRiseTime               = 0.1;
var sunSetTime                = 0.9;

var skyUpdateFreq             = 0.05;
var skyUpdateTimer            = 0;

var skyColorDay               = [183, 231, 255]; // [163, 225, 255];
var skyColorNight             = [28, 19, 25];

var sunSizeMin                = 80;
var sunSizeMax                = 320;
var sunColorMid               = [255, 252, 214]; // [255, 236, 94];
var sunColorEdges             = [239, 11, 31]; // [255, 110, 94];

var moon;
var moonSizeMax               = 60;
var moonSizeMin               = 30;
var moonRiseTime              = 0.9;
var moonSetTime               = 0.1;
var moonColorMid              = [255, 254, 244];
var moonColorEdges            = [255, 246, 244];

var starsHideTime             = 0.2;
var starsShowTime             = 0.8;
var stars                     = [];
var minStars                  = 1000;
var maxStars                  = 1500;
var minStarSize               = 0.1;
var maxStarSize               = 1.2;
var starNoise;
var starNoiseScale            = 0.003;
var starTwinkleMultip         = 0.25;
var starAlphaOffsetMultip     = 25;

var shootingStarFreqMin       = 0.005;
var shootingStarFreqMax       = 0.05;
var shootingStarWaitDur       = shootingStarFreqMin;
var currShootingStar;

var skyGradientMin            = 0.2;
var skyGradientMax            = 0.8;
var skyGradientHMultip        = 1;

var sandColorFar              = [252, 194, 121]; // [255, 215, 178];
var sandColorNear             = [255, 236, 212]; // [255, 247, 137];
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

var lowestSandPoint;          //used to figure out were to start the river

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

var windStr;                  //-1 to 1 scale
var windNoise;                //perlin noise
var windNoiseFreq             = 0.0005;
var minClouds                 = 3;
var maxClouds                 = 8;
var clouds                    = [];

var mg2UpdateFreq             = 0.033;
var mg2UpdateTimer            = 0;

var fgUpdateFreq              = 0.1;
var fgUpdateTimer             = 0;

var plants                    = [];

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes = ['Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise',
    'Utils/EasingUtil', 'Utils/PathUtil', 'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject',
    'FullScreenEffects/ProceduralGarden/Moon', 'FullScreenEffects/ProceduralGarden/Cloud',
    'FullScreenEffects/ProceduralGarden/Plants', 'FullScreenEffects/ProceduralGarden/Stars' ];
  CommonElementsCreator.appendScipts(includes);
}

function start()
{
  initCanvas();

  moon = new Moon();

  initWindAndClouds();
  initStars();
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

function initWindAndClouds()
{
  windNoise = new SimplexNoise();

  var nClouds = Math.getRnd(minClouds, maxClouds);
  for (var i = 0; i < nClouds; i++)
  {
    var newCloud = new Cloud();
    setRandomCloudPos(newCloud);
    newCloud.init();

    clouds[i] = newCloud;
  }
}

function initStars()
{
  starNoise = new SimplexNoise();

  currShootingStar = new ShootingStar();

  var nStars = Math.getRnd(minStars, maxStars);
  for (var i = 0; i < nStars; i++)
  {
    var newStar = new Star();
    setRandomStarPos(newStar);
    var starSize = (starNoise.noise(newStar.position.x * starNoiseScale, newStar.position.y * starNoiseScale) + 1) * 0.5;
    newStar.size = Math.scaleNormal(starSize, minStarSize, maxStarSize);
    newStar.alphaOffset = Math.random() * starAlphaOffsetMultip;
    newStar.alphaTimeMultip = (Math.random() * starTwinkleMultip) / dayDur;

    stars[i] = newStar;
  }
}

function setRandomStarPos(theStar)
{
  theStar.position.x = Math.random() * bgCanvas.width;
  var starsEnd = 0.75;
  theStar.position.y = EasingUtil.easeInQuad(Math.random(), 0, starsEnd, 1) * bgCanvas.height;
}

function setRandomCloudPos(theCloud)
{
  theCloud.position.x = Math.random() * bgCanvas.width;
  var cloudsEnd = 0.25;
  theCloud.position.y = EasingUtil.easeInQuad(Math.random(), 0, cloudsEnd, 1) * bgCanvas.height;
}

function drawTerrain()
{
  mgCtx.clearRect(0, 0, mgCanvas.width, mgCanvas.height);

  var terrainNoise = new SimplexNoise();

  drawSand( terrainNoise );
  drawRivers( terrainNoise );
}

function drawSand( theNoise )
{
  lowestSandPoint = new Vector2D(0,0);

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

      if ( i >= (nSandLayers-1) && thePoint.y > lowestSandPoint.y
        && thePoint.x > 0 && thePoint.x < mgCanvas.width)
      {
        lowestSandPoint.x = thePoint.x;
        lowestSandPoint.y = thePoint.y;
      }

      mgCtx.lineTo(thePoint.x, thePoint.y);
    }

    mgCtx.lineTo(mgCanvas.width, mgCanvas.height);
    mgCtx.fill();
  }
}

function drawRivers( theNoise )
{
  riverMidPointsUp      = [];
  riverMidPointsDown    = [];
  riverEdgePointsUp     = [];
  riverEdgePointsDown   = [];
  valleyEdgePointsUp    = [];
  valleyEdgePointsDown  = [];
  plants                = [];

  //draw the river and valley pixel by pixel...
  var xSampleSize = 4;
  var ySampleSize = 4;

  //TODO: maybe should scale the freq distances as we go.
  // at the moment it seems like we get most of the stuff down near close!
  var plantFreqX = 10;
  var xCounter = 0;
  var plantFreqY = 2;
  var yCounter = 0;

  var riverStartX = lowestSandPoint.x;
  var edgeOffset  = 0.33;
  var riverEndX   = (mgCanvas.width * edgeOffset) + (mgCanvas.width * (1-(edgeOffset * 2)));
  var riverXDelta = riverEndX - riverStartX;

  var riverStartY = lowestSandPoint.y;
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

    var thePoint = new Vector2D(midX, y);
    riverMidPointsUp.push(thePoint);
    riverMidPointsDown.unshift(thePoint);

    riverEdgePointsUp.push(new Vector2D(-easedRiverW, 0));
    riverEdgePointsDown.unshift(new Vector2D(easedRiverW, 0));

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
            //TODO: vary based on dist...
            if (Math.random() > 0.5)
            {
              var shrub = new Shrub();
              thePlants.push(shrub);
            }
          }

          if (valleyDistN != undefined)
          {
            //TODO: vary based on dist...
            if (Math.random() > 0.5)
            {
              var grass = new Grass();
              thePlants.push(grass);
            }
          }

          if ((riverDistN <= 0.66 && riverDistN != undefined) ||
           (valleyDistN <= 0.25 && valleyDistN != undefined))
          {
            //TODO: vary based on dist...
            if (Math.random() >= 0.1)
            {
              var reed = new Reed();
              thePlants.push(reed);
            }
          }

          var nPlants = thePlants.length;
          if (nPlants > 0)
          {
            var thePlant;
            for (var p = 0; p < nPlants; p++)
            {
              thePlant = thePlants[p];
              thePlant.init(yNormal, new Vector2D(x, y));
              plants.push(thePlant);
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
  fillLayeredShape( 4, valleyColorStart, valleyColorEnd, valleyOpacity, riverMidPointsUp, riverMidPointsDown, valleyEdgePointsUp, valleyEdgePointsDown, riverStartY, riverEndY, valleyColorStart );
  fillLayeredShape( 4, riverColorEnd, riverColorStart, riverOpacity, riverMidPointsUp, riverMidPointsDown, riverEdgePointsUp, riverEdgePointsDown, riverStartY, riverEndY, riverColorEnd );

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

    resetClouds();
    resetStars();

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

  //update the windStr
  windStr = windNoise.noise((GameLoop.currentTime / dayDur) * windNoiseFreq, windNoiseFreq);

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
    animateRiver();
  }

  //update the PLANTS
  fgUpdateTimer += GameLoop.deltaTime;
  if (fgUpdateTimer > fgUpdateFreq)
  {
    fgUpdateTimer = 0;

    fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    updatePlants();
  }
}

function animateRiver()
{
  //the actual drawing bit
  var nRiverLines = 3;

  for ( var k = 0; k < nRiverLines; k++ )
  {
    //sort out alpha and width
    var widthFreq = 0.1;
    var thePos = tod + ((widthFreq/nRiverLines) * k);

    var widthMultip = (thePos % widthFreq) / widthFreq;
    widthMultip = EasingUtil.easeOutQuad(widthMultip, 0, 1, 1);
    widthMultip = Math.scaleNormal(widthMultip, 0.5, 1);

    var theAlpha = -(Math.cos((2 * Math.PI * thePos) / widthFreq) * 0.5) + 0.5;
    theAlpha = Math.scaleNormal(theAlpha, 0, 0.33);

    var lineWidth = (thePos % widthFreq) / widthFreq;
    lineWidth = Math.scaleNormal(lineWidth, 3, 9);

    mgCtx2.lineJoin = 'round';
    mgCtx2.lineWidth = lineWidth;

    var grd = mgCtx2.createLinearGradient(0, riverMidPointsUp[0].y, 0, mgCanvas.height);
    grd.addColorStop(0.1, "rgba(255,255,255, 0)");
    grd.addColorStop(1, "rgba(255,255,255, "+theAlpha+")");

    mgCtx2.strokeStyle = grd;

    //get on to the drawing
    mgCtx2.beginPath();
    var thePath = new Path2D();
    thePath = PathUtil.createPath(riverMidPointsUp, thePath, riverEdgePointsUp, widthMultip);
    thePath = PathUtil.createPath(riverMidPointsDown, thePath, riverEdgePointsDown, widthMultip);

    mgCtx2.stroke(thePath);
  }
}

function updatePlants()
{
  //loop thru the plants, update and draw them
  for (var i = 0; i < plants.length; i++)
  {
    plants[i].update();
    plants[i].draw(fgCtx);
  }
}

function updateSkyVisuals()
{
  //TODO:This megafunction needs to be split up into smaller chunks.
  //---------------
  //   SKY COLOR
  //---------------
  var todColor = skyColorNight;
  var skyLerp = 1;
  if (tod > skyBlueMin && tod < skyBlueMax)
  {
    var skyChangeNormal = Math.minMaxNormal(tod, skyBlueMin, skyBlueMax);
    var skyMid = Math.scaleNormal(0.5, skyBlueMin, skyBlueMax);
    skyLerp = skyChangeNormal <= skyMid ? EasingUtil.easeOutCubic(skyChangeNormal, 1, -1, 0.5)
      : EasingUtil.easeInCubic(skyChangeNormal-0.5, 0, 1, 0.5);

    todColor = ColorUtil.lerp(skyLerp, skyColorDay, skyColorNight);
  }
  var skyColor = ColorUtil.rgbToHex(todColor);
  bgCtx.fillStyle = skyColor;
  bgCtx.fillRect(0,0,bgCanvas.width,bgCanvas.height);

  //-----------
  //   STARS
  //-----------
  if (tod < starsHideTime || tod > starsShowTime)
  {
    var starsTimeMid = 0.5;
    var totalStarsTime = starsHideTime + (1-starsShowTime);
    var starsTime = (tod < starsHideTime) ? starsHideTime - tod : tod - starsShowTime;
    var nightTimeNormal = 1 - (starsTime / totalStarsTime);

    var nightTimeLerp = nightTimeNormal <= starsTimeMid ? EasingUtil.easeOutCubic(nightTimeNormal, 0, 1, 0.5)
      : EasingUtil.easeInCubic(nightTimeNormal-0.5, 1, -1, 0.5);

    //draw some stars!!!
    for (var i = 0; i < stars.length; i++)
    {
      stars[i].draw(bgCtx, nightTimeLerp);
    }

    //Shooting stars
    var currProgress = 0;
    if (tod < currShootingStar.startTime)
    {
      currProgress = (tod + ((1 - currShootingStar.startTime)+currShootingStar.duration)) / shootingStarWaitDur;
    }
    else
    {
      currProgress = (tod - (currShootingStar.startTime+currShootingStar.duration)) / shootingStarWaitDur;
    }

    var bStarAlive = currShootingStar.updateLifeTime( bgCtx, bgCanvas.width, bgCanvas.height, tod, nightTimeLerp, currProgress >= 1 );
    if (!bStarAlive && currShootingStar.bSetup)
    {
      currShootingStar.bSetup = false;
      shootingStarWaitDur = Math.getRnd(shootingStarFreqMin, shootingStarFreqMax);

      var stopTime = tod + shootingStarWaitDur;
      if (stopTime > 1)
      {
        stopTime = stopTime - 1;
      }
    }
  }

  //-----------------------
  //   DARKEN MIDGROUND
  //-----------------------
  //TODO: wanna be able to tint it a bit with the sky gradient tooo!!!
  var darkenAmount = 85;
  var theFilter = 'brightness('+((100-darkenAmount) + ((1-skyLerp)*darkenAmount))+'%)';
  mgCanvas.style.filter = theFilter;
  mgCanvas2.style.filter = theFilter;
  fgCanvas.style.filter = theFilter;

  //----------
  //   SUN
  //----------
  //if the sun is visible, how far into the daytime is it...
  var sunColor = sunColorEdges;
  var sunY = 0;
  var sunX = 0;
  var sunSize = 0;
  var bSunOut = tod > sunRiseTime && tod < sunSetTime;
  if (bSunOut)
  {
    var dayTimeNormal = Math.minMaxNormal(tod, sunRiseTime, sunSetTime);
    var dayTimeMid = Math.scaleNormal(0.5, sunRiseTime, sunSetTime);
    var dayTimeLerp = dayTimeNormal <= dayTimeMid ? EasingUtil.easeOutCubic(dayTimeNormal, 1, -1, 0.5)
      : EasingUtil.easeInCubic(dayTimeNormal-0.5, 0, 1, 0.5);

    //change color and size nearer rise and set
    sunColor = ColorUtil.lerp(dayTimeLerp, sunColorMid, sunColorEdges);

    sunSize = Math.scaleNormal(dayTimeLerp, sunSizeMin, sunSizeMax);
    sunX = dayTimeNormal * bgCanvas.width;
    var heightOffsetTop = 0.05;
    var heightOffsetBottom = 0.1;
    sunY = (bgCanvas.height*heightOffsetTop) + sunSize + (dayTimeLerp * ((1-heightOffsetBottom)*bgCanvas.height));
  }

  //This wants to be a M shape, peaking around skyGradientMin and skyGradientMax...
  // gradient around the sky...
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
  grd.addColorStop(0, 'rgba('+sunColor[0]+', '+sunColor[1]+','+sunColor[2]+', 0)');
  grd.addColorStop(1, 'rgba('+sunColor[0]+', '+sunColor[1]+','+sunColor[2]+', '+gradientAlphaLerp+')');
  bgCtx.fillStyle = grd;
  bgCtx.fillRect(0,0,bgCanvas.width,bgCanvas.height);

  if (bSunOut)
  {
    //draw the sun.
    bgCtx.fillStyle = ColorUtil.rgbToHex(sunColor);
    bgCtx.beginPath();
    bgCtx.arc(sunX, sunY, sunSize, 0, 2 * Math.PI);
    bgCtx.fill();
  }

  //----------
  //   MOON
  //----------
  if (tod < moonSetTime || tod > moonRiseTime)
  {
    var moonTimeMid = 0.5;
    var totalMoonTime = moonSetTime + (1-moonRiseTime);
    var moonTime = (tod < moonSetTime) ? (1-moonRiseTime) + tod : tod - moonRiseTime;
    var moonTimeNormal = moonTime / totalMoonTime;

    var moonTimeLerp = moonTimeNormal <= moonTimeMid ? EasingUtil.easeOutCubic(moonTimeNormal, 1, -1, 0.5)
      : EasingUtil.easeInCubic(moonTimeNormal-0.5, 0, 1, 0.5);

    var moonColor = ColorUtil.lerp(moonTimeLerp, moonColorMid, moonColorEdges);

    moon.size = Math.scaleNormal(moonTimeLerp, moonSizeMin, moonSizeMax);
    //var sunX = (dayTimeNormal * (bgCanvas.width + (2 * sunSize))) - sunSize;
    var moonX = moonTimeNormal * bgCanvas.width;
    var heightOffsetTop = 0.1;
    var heightOffsetBottom = 0.2;
    var moonY = (heightOffsetTop*bgCanvas.height) + moon.size + (moonTimeLerp * ((1-heightOffsetBottom)*bgCanvas.height));

    //draw the moon.
    moon.draw( bgCtx, moonX, moonY );
  }

  //-----------
  //   CLOUDS
  //-----------
  drawClouds( (1-skyLerp) );
}

function drawClouds( brightness )
{
  for (var c = 0; c < clouds.length; c++)
  {
    clouds[c].update();
    clouds[c].draw(bgCtx, brightness);
  }
}

function resetStars()
{
  for (var i = 0; i < stars.length; i++)
  {
    setRandomStarPos(stars[i]);
  }
}

function resetClouds()
{
  for (var i = 0; i < clouds.length; i++)
  {
    setRandomCloudPos(clouds[i]);
  }
}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
