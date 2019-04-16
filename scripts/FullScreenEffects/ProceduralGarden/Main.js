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
    'Utils/EasingUtil', 'Utils/PathUtil', 'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject' ];
  CommonElementsCreator.appendScipts(includes);
}

function start()
{
  initCanvas();

  initWindAndClouds();
  initStars();
  drawTerrain();
}

function initCanvas()
{
  fgCanvas = document.createElement("canvas");
  fgCanvas.className = "fullFixed";
  document.body.insertBefore(fgCanvas, document.body.firstChild);
  fgCtx    = fgCanvas.getContext('2d');

  mgCanvas2 = document.createElement("canvas");
  mgCanvas2.className = "fullFixed";
  document.body.insertBefore(mgCanvas2, document.body.firstChild);
  mgCtx2    = mgCanvas2.getContext('2d');

  mgCanvas = document.createElement("canvas");
  mgCanvas.className = "fullFixed";
  document.body.insertBefore(mgCanvas, document.body.firstChild);
  mgCtx    = mgCanvas.getContext('2d');

  bgCanvas = document.createElement("canvas");
  bgCanvas.className = "fullFixed";
  document.body.insertBefore(bgCanvas, document.body.firstChild);
  bgCtx = bgCanvas.getContext('2d');

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
  var bTrue = false;

  var maxScale = 1800;
  var minScaleV = 1800;
  var minScaleH = 400;
  if(CanvasScaler.updateCanvasSize( bgCanvas, maxScale, minScaleV, minScaleH ))
  {
    bTrue = true;
  }
  if(CanvasScaler.updateCanvasSize( mgCanvas, maxScale, minScaleV, minScaleH ))
  {
    bTrue = true;
  }
  if(CanvasScaler.updateCanvasSize( mgCanvas2, maxScale, minScaleV, minScaleH ))
  {
    bTrue = true;
  }
  if(CanvasScaler.updateCanvasSize( fgCanvas, maxScale, minScaleV, minScaleH ))
  {
    bTrue = true;
  }

  return bTrue;
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

    var moonSize = Math.scaleNormal(moonTimeLerp, moonSizeMin, moonSizeMax);
    //var sunX = (dayTimeNormal * (bgCanvas.width + (2 * sunSize))) - sunSize;
    var moonX = moonTimeNormal * bgCanvas.width;
    var heightOffsetTop = 0.1;
    var heightOffsetBottom = 0.2;
    var moonY = (heightOffsetTop*bgCanvas.height) + moonSize + (moonTimeLerp * ((1-heightOffsetBottom)*bgCanvas.height));

    //draw the moon.
    //TODO: this should be in its own class function really 'moon.draw()'...
    bgCtx.fillStyle = 'rgba('+moonColor[0]+', '+moonColor[1]+','+moonColor[2]+', 0.025)';
    bgCtx.beginPath();
    bgCtx.arc(moonX-1, moonY+2, moonSize*2, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba('+moonColor[0]+', '+moonColor[1]+','+moonColor[2]+', 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX-2, moonY-1, moonSize*1.4, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.strokeStyle = 'rgba('+moonColor[0]+', '+moonColor[1]+','+moonColor[2]+', 0.05)';
    bgCtx.lineWidth   = 2;
    bgCtx.beginPath();
    bgCtx.arc(moonX, moonY, moonSize*1.8, 0, 2 * Math.PI);
    bgCtx.stroke();

    bgCtx.fillStyle = 'rgba('+moonColor[0]+', '+moonColor[1]+','+moonColor[2]+', 1)';
    bgCtx.beginPath();
    bgCtx.arc(moonX, moonY, moonSize, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX+2, moonY+5, moonSize-5, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX+(moonSize*0.1), moonY+(moonSize*0.3), moonSize*0.2, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX+(moonSize*0.6), moonY+(moonSize*0.1), moonSize*0.15, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX-(moonSize*0.4), moonY+(moonSize*0.025), moonSize*0.1, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX-(moonSize*0.6), moonY-(moonSize*0.1), moonSize*0.2, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX-(moonSize*0.3), moonY-(moonSize*0.6), moonSize*0.1, 0, 2 * Math.PI);
    bgCtx.fill();

    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    bgCtx.beginPath();
    bgCtx.arc(moonX+(moonSize*0.6), moonY-(moonSize*0.4), moonSize*0.15, 0, 2 * Math.PI);
    bgCtx.fill();

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

//------------------------------------------------
//                    STARS
//------------------------------------------------
function Star()
{
  this.position = new Vector2D(0,0);
  this.size = 1;
  this.alphaOffset = 0;
  this.alphaTimeMultip = 1;

  this.draw = function(theCanvas, alphaMultip)
  {
    var theAlpha = 0.5 + (0.5*Math.cos(this.alphaTimeMultip * (this.alphaOffset+GameLoop.currentTime)));
    theAlpha *= alphaMultip;

    theCanvas.fillStyle = 'rgba(255,255,255,'+theAlpha+')';
    theCanvas.beginPath();
    theCanvas.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    theCanvas.fill();

  }
}

function ShootingStar()
{
  this.startPosition = new Vector2D(0,0);
  this.position = new Vector2D(0,0);
  this.endPosition = new Vector2D(0,0);
  this.size = 0.5;
  this.startTime = 0;
  this.minDur = 0.002;
  this.maxDur = 0.01;
  this.duration = 0;
  this.direction = new Vector2D(0,0);

  this.bSetup = false;
  this.maxSpawnPosY = 0.33;
  this.minSpawnPosX = 0.9;
  this.minTravelDist = 0.4;
  this.maxTravelDist = 0.8;

  this.updateLifeTime = function( theCanvas, canvasWidth, canvasHeight, timeOfDay, alphaModif, performSetup )
  {
    if (!this.bSetup && performSetup)
    {
      this.startTime = timeOfDay;

      this.startPosition.x = (this.minSpawnPosX + (Math.random() * (1-this.minSpawnPosX))) * canvasWidth;
      this.startPosition.y = Math.random() * canvasHeight * this.maxSpawnPosY;

      this.duration = Math.getRnd(this.minDur, this.maxDur);

      var centerDirX = this.startPosition.x - (canvasWidth * 0.5);
      var centerDirY = this.startPosition.y - (canvasHeight * 0.5);
      var centerDir = new Vector2D(centerDirX, centerDirY);
      centerDir = centerDir.normalize();

      var moveDistX = Math.getRnd(this.minTravelDist, this.maxTravelDist) * canvasWidth;
      var moveDistY = Math.getRnd(this.minTravelDist, this.maxTravelDist) * canvasHeight;

      this.endPosition.x = this.startPosition.x - (centerDir.x * moveDistX);
      this.endPosition.y = this.startPosition.y - (centerDir.y * moveDistY);

      this.bSetup = true;
    }

    if (!this.bSetup)
    {
      return false;
    }

    //what if the startTime was 1 and we're now at 0, well check if current time < startTime
    var currProgress = 0;
    if (timeOfDay < this.startTime)
    {
      currProgress = (timeOfDay + (1 - this.startTime)) / this.duration;
    }
    else
    {
      currProgress = (timeOfDay - this.startTime) / this.duration;
    }

    // if we're at the end of our progress, then return.
    if (currProgress > 1)
    {
      return false;
    }

    this.position.x = EasingUtil.easeOutCubic(currProgress, this.startPosition.x, this.endPosition.x - this.startPosition.x, 1);
    this.position.y = EasingUtil.easeOutCubic(currProgress, this.startPosition.y, this.endPosition.y - this.startPosition.y, 1);

    var alphaMultip = (1 - currProgress) * alphaModif;

    theCanvas.fillStyle = 'rgba(255,255,255,'+alphaMultip+')';
    theCanvas.beginPath();
    theCanvas.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    theCanvas.fill();

    //line behind it!
    var startDirX = this.position.x - this.startPosition.x;
    var startDirY = this.position.y - this.startPosition.y;
    var startDir = new Vector2D(startDirX, startDirY);

    theCanvas.strokeStyle = 'rgba(255,255,255,'+(0.5*alphaMultip)+')';
    theCanvas.lineWidth   = 0.4;
    theCanvas.beginPath();

    var startDirLength = startDir.magnitude();
    var maxLength = canvasWidth * 0.5;
    if (startDirLength <= maxLength)
    {
      theCanvas.lineTo(this.startPosition.x, this.startPosition.y);
    }
    else
    {
      startDir = startDir.normalize();
      startDir = startDir.multiply(maxLength);

      theCanvas.lineTo(this.position.x - startDir.x, this.position.y - startDir.y);
    }

    theCanvas.lineTo(this.position.x, this.position.y);
    theCanvas.stroke();

    return true;
  }
}

//------------------------------------------------
//                    PLANTS
//------------------------------------------------
//TODO: we can definately share a lot of code here!!!!
//TODO: level of detail!!!
function Palm()
{

}

function Reed()
{
  //Call our prototype
  GameObject.call(this);

  this.color;

  this.maxW = 3;
  this.maxH = 44;

  this.lifeTime = 0;

  this.colorOne  = [103, 165, 96];
  this.colorZero = [57, 114, 56];

  this.ageSpeed = 0.2;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function( scale, pos )
  {
    this.points = [];

    this.color = ColorUtil.lerp(Math.random(), this.colorOne, this.colorZero);

    this.scale      = scale;
    this.position   = pos;
    this.lifeTime   = Math.random();

    var nPoints = 9;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var x	=	angleN * this.scale;
      var y	=	Math.sin(t) * this.scale;

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function()
  {
      var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
      this.prevUpdateTod = tod;

      this.lifeTime += todDelta * this.ageSpeed;
      if (this.lifeTime > 1)
      {
        this.lifeTime = 1;
      }
  }

  this.draw = function( theCanvas )
  {
    var bendMultip = 50;

    theCanvas.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    theCanvas.beginPath();

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];

      var theX = thePoint.x * this.maxW * this.lifeTime;
      theX -= EasingUtil.easeInCubic(thePoint.y, 0, bendMultip * windStr, 1);

      var theY = thePoint.y * this.maxH * this.lifeTime;

      theCanvas.lineTo(this.position.x + theX, this.position.y - theY);
    }

    theCanvas.fill();
  }
}

function Grass()
{
  //Call our prototype
  GameObject.call(this);

  this.color;

  this.maxW = 50;
  this.maxH = 100;

  this.lifeTime = 0;

  this.colorOne  = [103, 165, 96];
  this.colorZero = [57, 114, 56];

  this.ageSpeed = 0.2;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function( scale, pos )
  {
    this.points = [];
    var nPoints = Math.getRnd(14, 18);

    this.color = ColorUtil.lerp(Math.random(), this.colorOne, this.colorZero);

    var noise = new SimplexNoise();
    var spikeFreq = nPoints;

    this.scale      = scale;
    this.position   = pos;
    this.lifeTime   = Math.random();

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var sizeScale = Math.scaleNormal(0.5 + (-Math.cos(spikeFreq*t) * 0.5), 0.2, 1);
      sizeScale = EasingUtil.easeOutSine(sizeScale, 0, 1, 1);

      var xCos = Math.cos(t);
      var ySin = Math.sin(t);

      var x	=	sizeScale * xCos * this.scale;
      var y	=	sizeScale * ySin * this.scale;

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function()
  {
      var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
      this.prevUpdateTod = tod;

      this.lifeTime += todDelta * this.ageSpeed;
      if (this.lifeTime > 1)
      {
        this.lifeTime = 1;
      }
  }

  this.draw = function( theCanvas )
  {
    var bendMultip = 75;

    theCanvas.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    theCanvas.beginPath();

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];

      var theX = thePoint.x * this.maxW * this.lifeTime;
      theX -= EasingUtil.easeInQuart(thePoint.y, 0, bendMultip * windStr, 1);

      var theY = thePoint.y * this.maxH * this.lifeTime;

      theCanvas.lineTo(this.position.x + theX, this.position.y - theY);
    }

    theCanvas.fill();
  }
}

function Shrub()
{
  //Call our prototype
  GameObject.call(this);

  this.color;

  this.maxW = 50;
  this.maxH = 100;

  this.lifeTime = 0;

  this.colorOne  = [103, 165, 96];
  this.colorZero = [57, 114, 56];

  this.ageSpeed = 0.2;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function( scale, pos )
  {
    this.points = [];
    var nPoints = Math.getRnd(25, 30);

    this.color = ColorUtil.lerp(Math.random(), this.colorOne, this.colorZero);

    var noise = new SimplexNoise();
    var spikeFreq = nPoints * 0.2;

    this.scale      = scale;
    this.position   = pos;
    this.lifeTime   = Math.random();

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var sizeScale = Math.scaleNormal(0.5 + (-Math.cos(spikeFreq*t) * 0.5), 0.2, 1);
      sizeScale = EasingUtil.easeOutSine(sizeScale, 0, 1, 1);

      var xCos = Math.cos(t);
      var ySin = Math.sin(t);

      var x	=	sizeScale * xCos * this.scale;
      var y	=	sizeScale * ySin * this.scale;

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function()
  {
      var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
      this.prevUpdateTod = tod;

      this.lifeTime += todDelta * this.ageSpeed;
      if (this.lifeTime > 1)
      {
        this.lifeTime = 1;
      }
  }

  this.draw = function( theCanvas )
  {
    var bendMultip = 75;

    theCanvas.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    theCanvas.beginPath();

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];

      var curvedX = thePoint.x * EasingUtil.easeNone(thePoint.y, 0, 2, 1);
      var theX = curvedX * this.maxW * this.lifeTime;
      theX -= EasingUtil.easeInQuart(thePoint.y, 0, bendMultip * windStr, 1);

      var theY = thePoint.y * this.maxH * this.lifeTime;

      theCanvas.lineTo(this.position.x + theX, this.position.y - theY);
    }

    theCanvas.fill();
  }
}

//------------------------------------------------
//                     CLOUDS
//------------------------------------------------
function Cloud()
{
  //Call our prototype
  GameObject.call(this);

  this.minScale = 0.33;
  this.maxScale = 1.66;
  this.moveSpeed;
  this.moveSpeedMax = 2200;
  this.moveSpeedMin = 1600;

  this.width = 150;
  this.height = 40;

  this.minNoiseScaleX = 0.33;
  this.minNoiseScaleY = 0.33;

  this.simpleNoise;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function ()
  {
    this.points = [];
    this.moveSpeed = Math.getRnd(this.moveSpeedMin, this.moveSpeedMax);

    var nPoints = Math.getRnd(80, 90);

    this.simpleNoise = new SimplexNoise();
    var nScale = 0.66;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints-1);
      var noiseN = -(Math.cos(2 * Math.PI * angleN) * 0.5) + 0.5;
      var t = angleN * 2 * Math.PI;

      var sizeScale = (this.simpleNoise.noise(t * noiseN * nScale, nScale) + 1) * 0.5;
      sizeScale = EasingUtil.easeOutQuad(sizeScale, 0, 1, 1);

      var x	=	Math.scaleNormal(sizeScale, this.minNoiseScaleX, 1) * Math.cos(t);
      var y	=	Math.scaleNormal(sizeScale, this.minNoiseScaleY, 1) * Math.sin(t);

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function()
  {
    var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
    this.prevUpdateTod = tod;

    this.position.x += windStr * todDelta * this.moveSpeed;

    if (this.position.x < -this.width)
    {
      this.init();
      this.position.x = bgCanvas.width + this.width;
    }
    else if (this.position.x > bgCanvas.width + this.width)
    {
      this.init();
      this.position.x = -this.width;
    }

    // change the scale on a noise function
    var scaleChangeFreq = 0.00001;
    var sizeScale = (this.simpleNoise.noise(GameLoop.currentTime * scaleChangeFreq, 0) + 1) * 0.5;
    sizeScale = EasingUtil.easeOutQuad(sizeScale, 0, 1, 1);
    sizeScale = Math.scaleNormal(sizeScale, this.minScale, this.maxScale);
    this.scale = sizeScale;
  }

  this.draw = function( theCanvas, brightness )
  {
    var colorV = 255 * brightness;

    theCanvas.fillStyle = 'rgba('+colorV+','+colorV+','+colorV+',0.8)';
    theCanvas.beginPath();

    var l = this.points.length;
    var thePoint;
    for (var p = 0; p < l; p++)
    {
      thePoint = this.points[p];

      theCanvas.lineTo( this.position.x + (thePoint.x * this.scale * this.width),
        this.position.y + (thePoint.y * this.scale * this.height) );
    }
    theCanvas.fill();
  }
}
