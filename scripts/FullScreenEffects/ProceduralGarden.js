//HTML Elements
var bgCanvas, bgCtx;
var mgCanvas, mgCtx;
var fgCanvas, fgCtx;

//variables
var dayDur                  = 45;
var dayTimer                = dayDur*0.5;
var tod                     = 0; //0-1
var skyBlueMin              = 0.075;
var skyBlueMax              = 0.925;
var sunRiseTime             = 0.1;
var sunSetTime              = 0.9;

var skyUpdateFreq           = 0.05;
var skyUpdateTimer          = 0;

var skyColorDay             = [183, 231, 255]; // [163, 225, 255];
var skyColorNight           = [28, 19, 25];

var sunSizeMin              = 80;
var sunSizeMax              = 320;
var sunColorMid             = [255, 252, 214]; // [255, 236, 94];
var sunColorEdges           = [239, 11, 31]; // [255, 110, 94];

var moonSizeMax             = 60;
var moonSizeMin             = 30;
var moonRiseTime            = 0.9;
var moonSetTime             = 0.1;
var moonColorMid            = [255, 254, 244];
var moonColorEdges          = [255, 246, 244];

var starsHideTime           = 0.2;
var starsShowTime           = 0.8;
var stars                   = [];
var minStars                = 1000;
var maxStars                = 1500;
var minStarSize             = 0.1;
var maxStarSize             = 1.2;
var starNoise;
var starNoiseScale          = 0.003;
var starTwinkleMultip       = 0.25;
var starAlphaOffsetMultip   = 25;

var shootingStarFreqMin     = 0.005;
var shootingStarFreqMax     = 0.05;
var shootingStarWaitDur     = shootingStarFreqMin;
var currShootingStar;

var skyGradientMin          = 0.2;
var skyGradientMax          = 0.8;
var skyGradientHMultip      = 1;

var sandColorFar            = [252, 194, 121]; // [255, 215, 178];
var sandColorNear           = [255, 236, 212]; // [255, 247, 137];
var sandHeightMin           = 0.3;
var sandHeightMax           = 0.5;
var sandScaleMultipNear     = 0.1;
var sandScaleMultipFar      = 1;
var sandNoiseFreqNear       = 0.0003;
var sandNoiseFreqFar        = 0.003;
var nSandLayersMax          = 8;
var nSandLayersMin          = 6;
var sandSampleStepSize      = 8;

var interLayerSandNoiseFreq = 0.0002; //theres some noise in between the layers used to modify the sand noise scale change.
var interLayerNoiseStr      = 0.66; //multiplier for the above noise

var ridgeNoiseStr           = 0.5; //how rideged should our sand be
var sandCurlOffset          = 25;

var riverPointsUp = [];
var riverPointsDown = [];
var riverWMin = 300;
var riverWMax = 400;
var valleyWMin = 300;
var valleyWMax = 400;
var riverMaxHeight = 0.33;
var interLayerRiverNoiseFreq = 0.05;
var riverLayerNoiseStr = 1;
var riverOffsetXMin = -300;
var riverOffsetXMax = 300;

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes = ['Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise',
    'Utils/EasingUtil', 'GameLoop', 'MouseTracker', 'CanvasScaler' ];
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
  initStars();
  drawSand();
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

function drawSand()
{
  var sandNoise = new SimplexNoise();
  var interLayerNoise = new SimplexNoise();
  var riverXOffsetNoise = new SimplexNoise();

  mgCtx.clearRect(0, 0, mgCanvas.width, mgCanvas.height);

  riverPointsUp = [];
  riverPointsDown = [];
  //TODO: we should vary these 3 with noise functions as we move thru layers.
  var riverMidX = Math.getRnd(0.25, 0.75) * mgCanvas.width;
  var riverWidth = Math.getRnd(riverWMin, riverWMax);
  var valleyW = Math.getRnd(valleyWMin, valleyWMax);

  var nSandLayers = Math.getRnd(nSandLayersMin, nSandLayersMax);
  for (var i = 0; i < nSandLayers; i++)
  {
    var layerN = i/nSandLayers;
    var theColor = ColorUtil.lerp(layerN, sandColorFar, sandColorNear);
    theColor = ColorUtil.rgbToHex(theColor);
    mgCtx.fillStyle = theColor;

    var noiseScale = Math.scaleNormal(layerN, sandNoiseFreqFar, sandNoiseFreqNear);

    var noiseScaleN = (interLayerNoise.noise(i * interLayerSandNoiseFreq, interLayerSandNoiseFreq) + 1) * 0.5;
    noiseScaleN = (layerN * (1-interLayerNoiseStr)) + (interLayerNoiseStr * noiseScaleN);
    var scaleMultip = Math.scaleNormal(noiseScaleN, sandScaleMultipFar, sandScaleMultipNear);

    var riverNoiseScaleN = (riverXOffsetNoise.noise(i * interLayerRiverNoiseFreq, interLayerRiverNoiseFreq) + 1) * 0.5;
    riverNoiseScaleN = (layerN * (1-riverLayerNoiseStr)) + (riverLayerNoiseStr * riverNoiseScaleN);
    var riverOffsetX = riverMidX + Math.scaleNormal(riverNoiseScaleN, riverOffsetXMin, riverOffsetXMax);

    //draw the sand
    mgCtx.beginPath();
    mgCtx.lineTo(0, mgCanvas.height);

    for (var x = -sandCurlOffset; x < mgCanvas.width; x += sandSampleStepSize)
    {
      goToSandPos(x, sandNoise, noiseScale, sandHeightMin, sandHeightMax, scaleMultip, riverOffsetX, riverWidth, valleyW, layerN);
    }

    goToSandPos(mgCanvas.width, sandNoise, noiseScale, sandHeightMin, sandHeightMax, scaleMultip, riverOffsetX, riverWidth, valleyW, layerN);

    mgCtx.lineTo(mgCanvas.width, mgCanvas.height);
    mgCtx.fill();
  }

  //draw the river
  mgCtx.fillStyle = 'rgba(184, 231, 255, 0.8)';
  mgCtx.beginPath();
  var halfRiverW = (riverWidth + valleyW) * 0.5;
  mgCtx.lineTo(riverMidX - halfRiverW, mgCanvas.height);

  var thePoint;
  for (var u = 0; u < riverPointsUp.length; u++)
  {
    var inverseIndex = (riverPointsUp.length - 1) - u;
    thePoint = riverPointsUp[inverseIndex];
    mgCtx.lineTo(thePoint.x, thePoint.y);
  }

  for (var d = 0; d < riverPointsDown.length; d++)
  {
    thePoint = riverPointsDown[d];
    mgCtx.lineTo(thePoint.x, thePoint.y);
  }

  mgCtx.lineTo(riverMidX + halfRiverW, mgCanvas.height);
  mgCtx.fill();

}

function goToSandPos(x, noise, noiseFreq, heightMin, heightMax, scaleMultip, riverMidX, riverW, valleyW, layerN)
{
  var thePoint = new Vector2D(0, 0);
  thePoint.x = x;

  //make it more ridged
  // as per https://www.redblobgames.com/maps/terrain-from-noise/
  var yNoise = (noise.noise(x * noiseFreq, noiseFreq) + 1) * 0.5;
  var ridgedYNoise = 2 * (0.5 - Math.abs(0.5 - yNoise));
  thePoint.y = (yNoise*(1-ridgeNoiseStr)) + (ridgedYNoise*ridgeNoiseStr);

  //curl the noise a bit.
  //we're offsetting x based on the value of y, it's a bit hacky, but it looks nicer than anything else I've tried.
  var curlVal = (1 - Math.cos(2 * Math.PI * thePoint.y)) * 0.5;
  thePoint.x += curlVal * sandCurlOffset;

  //river offests, we wanna have a bit of a valley as we approach the river
  var valleyWidth = valleyW * EasingUtil.easeInSine(layerN, 0, 1, 1);
  var riverWidth = riverW * EasingUtil.easeInQuart(layerN, 0, 1, 1);
  var bRiverPointUp = false;
  var bRiverPointDown = false;
  if (layerN >= riverMaxHeight)
  {
    var halfRiverW = riverWidth * 0.5;
    var riverLeft = riverMidX - halfRiverW;
    var riverRight = riverMidX + halfRiverW;
    var valleyLeft = riverLeft - valleyWidth;
    var valleyRight = riverRight + valleyWidth;

    bRiverPointUp = x <= riverLeft && x + sandSampleStepSize > riverLeft;
    bRiverPointDown = x <= riverRight && x + sandSampleStepSize > riverRight;

    var valleyDistN = 1;
    if (x > valleyLeft && x < riverLeft)
    {
      valleyDistN = (riverLeft - x) / valleyWidth;
      valleyDistN = EasingUtil.easeOutQuad(valleyDistN, 0, 1, 1);
    }
    else if (x > riverRight && x < valleyRight)
    {
      valleyDistN = 1 - ((valleyRight - x) / valleyWidth);
      valleyDistN = EasingUtil.easeOutQuad(valleyDistN, 0, 1, 1);
    }

    if ((x > riverLeft && x < riverRight) || bRiverPointUp || bRiverPointDown)
    {
      valleyDistN = 0;
    }

    // scale our y noise
    thePoint.y *= valleyDistN;
  }

  thePoint.y = Math.scaleNormal(thePoint.y, heightMin, heightMax);
  thePoint.y = mgCanvas.height - (thePoint.y * scaleMultip * mgCanvas.height);

  // add the river points to our lists.
  if (bRiverPointUp)
  {
    riverPointsUp.push(new Vector2D(thePoint.x, thePoint.y));
  }
  else if (bRiverPointDown)
  {
    riverPointsDown.push(new Vector2D(thePoint.x, thePoint.y));
  }

  mgCtx.lineTo(thePoint.x, thePoint.y);
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
    resetStars();

    drawSand();
  }

  //update the current time of day.
  dayTimer += GameLoop.deltaTime;
  if (dayTimer > dayDur)
  {
    dayTimer = 0;
  }
  tod = dayTimer / dayDur;

  //update the sky. If it needs it.
  skyUpdateTimer += GameLoop.deltaTime;
  if (skyUpdateTimer > skyUpdateFreq)
  {
    skyUpdateTimer = 0;
    updateSkyVisuals();
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
  mgCanvas.style.filter = 'brightness('+((100-darkenAmount) + ((1-skyLerp)*darkenAmount))+'%)';

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
}

function resetStars()
{
  for (var i = 0; i < stars.length; i++)
  {
    var newStar = stars[i];
    newStar.position.x = Math.random() * bgCanvas.width;
    newStar.position.y = Math.random() * bgCanvas.height;
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
