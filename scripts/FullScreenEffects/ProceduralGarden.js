//HTML Elements
var bgCanvas, bgCtx;
var mgCanvas, mgCtx;
var fgCanvas, fgCtx;

//variables
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
var sandSampleStepSize        = 6;

var ridgeNoiseStr             = 0.45; //how rideged should our sand be
var sandCurlOffset            = 30;

var lowestSandPoint;          //used to figure out were to start the river

var riverPoints               = [];
var riverWidths               = [];
var riverWMin                 = 350;
var riverWMax                 = 500;
var riverNoiseFreq            = 0.05;
var riverOffsetMultip         = 400;
var riverColorStart           = [184, 231, 255];
var riverColorEnd             = [53, 154, 255];

var windStr;                  //-1 to 1 scale
var windNoise;                //perlin noise
var windNoiseFreq             = 0.003;
var minClouds                 = 3;
var maxClouds                 = 8;
var minCloudSize              = 0.33;
var maxCloudSize              = 1.66;
var clouds                    = [];

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes = ['Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise',
    'Utils/EasingUtil', 'Utils/BezierPathUtil', 'GameLoop', 'MouseTracker', 'CanvasScaler' ];
  for (var i = 0; i < includes.length; i++ )
  {
    var theScript = document.createElement('script');
    theScript.src = 'scripts/'+includes[i]+'.js';
    document.head.appendChild(theScript);
  }
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
    newCloud.scale = Math.getRnd( minCloudSize, maxCloudSize );

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
  riverPoints = [];
  riverWidths = [];

  var riverStartX = lowestSandPoint.x;
  var edgeOffset = 0.33;
  var riverEndX = (mgCanvas.width * edgeOffset) + (mgCanvas.width * (1-(edgeOffset * 2)));
  var riverXDelta = riverEndX - riverStartX;

  var riverStartY = lowestSandPoint.y + 6;
  var riverEndY = mgCanvas.height;
  var riverYDelta = riverEndY - riverStartY;

  var riverWidth = Math.getRnd(riverWMin, riverWMax);

  var nRiverPoints = 20;
  for (j = 0; j < nRiverPoints; j++)
  {
    var riverPointN = j / (nRiverPoints-1);
    var riverNoiseScaleN = theNoise.noise(j * riverNoiseFreq, riverNoiseFreq);
    var riverOffsetX = riverNoiseScaleN * riverOffsetMultip;
    riverOffsetX *= -(Math.cos(2 * Math.PI * riverPointN) * 0.5) + 0.5;

    var currX = (riverXDelta * riverPointN);
    var currY = (riverYDelta * riverPointN);

    var easedRiverWidth = riverWidth * EasingUtil.easeInSine(riverPointN, 0, 1, 1);

    riverPoints.push(new Vector2D(riverStartX + currX + riverOffsetX, riverStartY + currY));
    riverWidths.push(easedRiverWidth);
  }

  //the actual drawing bit
  var nRiverLayers = 6;

  mgCtx.lineJoin = 'round';
  mgCtx.lineWidth = 2;
  mgCtx.strokeStyle = "rgba(255,255,255, 0.33)";

  for ( var k = 0; k < nRiverLayers; k++ )
  {
    var widthMultip = 1 - (k/(nRiverLayers-1));
    var widthMultipMin = 0.1;
    var widthMultipEased = EasingUtil.easeInQuad(widthMultip, widthMultipMin, 1-widthMultipMin, 1);

    mgCtx.beginPath();

    var riverColor = ColorUtil.lerp(widthMultip, riverColorEnd, riverColorStart);
    mgCtx.fillStyle = ColorUtil.rgbToHex(riverColor);

    var thePath = new Path2D();

    var riverPointsUp = [];
    var riverPointsDown = [];
    for (var p = 0; p < riverPoints.length; p++)
    {
      var thePoint = riverPoints[p];
      var theWidth = riverWidths[p] * widthMultipEased;

      riverPointsUp.push(new Vector2D(thePoint.x - theWidth, thePoint.y));
      riverPointsDown.unshift(new Vector2D(thePoint.x + theWidth, thePoint.y));
    }

    var riverEdgeRoundness = 0.5;
    thePath = BezierPathUtil.createCurve(riverPointsUp, thePath, riverEdgeRoundness);
    thePath = BezierPathUtil.createCurve(riverPointsDown, thePath, riverEdgeRoundness);

    mgCtx.fill(thePath);

    if (k == 0)
    {
      mgCtx.stroke(thePath);
    }
  }
}

function validateCanvasSize()
{
  var bTrue = false;

  if(CanvasScaler.updateCanvasSize( bgCanvas ))
  {
    bTrue = true;
  }
  if(CanvasScaler.updateCanvasSize( mgCanvas ))
  {
    bTrue = true;
  }
  if(CanvasScaler.updateCanvasSize( fgCanvas ))
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

  //animate the river a little
  fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

  animateRiver();
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
    var widthMultipEased = EasingUtil.easeOutQuad(widthMultip, 0, 1, 1);
    widthMultipEased = Math.scaleNormal(widthMultipEased, 0.66, 1);

    var theAlpha = -(Math.cos((2 * Math.PI * thePos) / widthFreq) * 0.5) + 0.5;
    theAlpha = Math.scaleNormal(theAlpha, 0, 0.33);

    var lineWidth = (thePos % widthFreq) / widthFreq;
    lineWidth = Math.scaleNormal(lineWidth, 3, 9);

    fgCtx.lineJoin = 'round';
    fgCtx.lineWidth = lineWidth;
    fgCtx.strokeStyle = "rgba(255,255,255, "+theAlpha+")";

    //get on to the drawing
    fgCtx.beginPath();
    var thePath = new Path2D();

    var riverPointsUp = [];
    var riverPointsDown = [];
    for (var p = 0; p < riverPoints.length; p++)
    {
      var thePoint = riverPoints[p];
      var theWidth = riverWidths[p] * widthMultipEased;

      riverPointsUp.push(new Vector2D(thePoint.x - theWidth, thePoint.y));
      riverPointsDown.unshift(new Vector2D(thePoint.x + theWidth, thePoint.y));
    }

    var riverEdgeRoundness = 0.5;
    thePath = BezierPathUtil.createCurve(riverPointsUp, thePath, riverEdgeRoundness);
    thePath = BezierPathUtil.createCurve(riverPointsDown, thePath, riverEdgeRoundness);

    fgCtx.stroke(thePath);
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
  var darkenAmount = 96;
  var theFilter = 'brightness('+((100-darkenAmount) + ((1-skyLerp)*darkenAmount))+'%)';
  mgCanvas.style.filter = theFilter;
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
    clouds[c].draw(bgCtx, brightness);
  }
}

function resetStars()
{
  for (var i = 0; i < stars.length; i++)
  {
    var newStar = stars[i];
    setRandomStarPos(newStar);
  }
}

function resetClouds()
{
  for (var i = 0; i < clouds.length; i++)
  {
    var newCloud = clouds[i];
    setRandomCloudPos(newCloud);
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


//------------------------------------------------
//                     CLOUDS
//------------------------------------------------
function Cloud()
{
  this.position = new Vector2D(0,0);
  this.scale = 1;

  this.points = [];

  this.init = function ()
  {
    this.points = [];

    var nPoints = 150;
    var minW = 100;
    var maxW = 200;
    var minH = 20;
    var maxH = 50;

    var noise = new SimplexNoise();
    var nScale = 0.66;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints-1);
      var noiseN = -(Math.cos(2 * Math.PI * angleN) * 0.5) + 0.5;
      var t = angleN * 2 * Math.PI;

      var sizeScale = (noise.noise(t * noiseN * nScale, nScale) + 1) * 0.5;
      sizeScale = EasingUtil.easeOutQuad(sizeScale, 0, 1, 1);

      var theW = Math.scaleNormal(sizeScale, minW, maxW);
      var theH = Math.scaleNormal(sizeScale, minH, maxH);

      var x	=	theW * Math.cos(t) * this.scale;
      var y	=	theH * Math.sin(t) * this.scale;

      this.points.push(new Vector2D(x, y));
    }
  }

  this.draw = function( theCanvas, brightness )
  {
    var colorV = 255 * brightness;

    theCanvas.fillStyle = 'rgba('+colorV+','+colorV+','+colorV+',0.8)';
    theCanvas.beginPath();

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];
      theCanvas.lineTo( this.position.x + thePoint.x, this.position.y + thePoint.y );
    }

    theCanvas.fill();
  }
}
