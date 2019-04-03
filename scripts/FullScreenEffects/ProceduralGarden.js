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
var shootingStarFreqMax     = 0.02;
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
var nSandLayersMin          = 5;
var sandSampleStepSize      = 8;

var interLayerSandNoiseFreq = 0.0002; //theres some noise in between the layers used to modify the sand noise scale change.
var interLayerNoiseStr      = 0.66; //yeah not the best name....

var ridgeNoiseStr           = 0.66; //how rideged should our sand be
var sandCurlOffset          = 25;

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

  mgCtx.clearRect(0, 0, mgCanvas.width, mgCanvas.height);

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

    mgCtx.beginPath();
    mgCtx.lineTo(0, mgCanvas.height);

    for (var x = 0; x < mgCanvas.width; x += sandSampleStepSize)
    {
      goToSandPos(x, sandNoise, noiseScale, sandHeightMin, sandHeightMax, scaleMultip, x != 0);
    }

    goToSandPos(mgCanvas.width, sandNoise, noiseScale, sandHeightMin, sandHeightMax, scaleMultip, true);

    mgCtx.lineTo(mgCanvas.width, mgCanvas.height);
    mgCtx.fill();

  }
}

function goToSandPos(x, noise, noiseFreq, heightMin, heightMax, scaleMultip, bCurled)
{
  var thePoint = new Vector2D(0, 0);
  thePoint.x = x;

  //make it more ridged
  // as per https://www.redblobgames.com/maps/terrain-from-noise/
  var yNoise = (noise.noise(x * noiseFreq, noiseFreq) + 1) * 0.5;
  var ridgedYNoise = 2 * (0.5 - Math.abs(0.5 - yNoise));
  thePoint.y = (yNoise*(1-ridgeNoiseStr)) + (ridgedYNoise*ridgeNoiseStr);

  //curl the noise a bit.
  if (bCurled)
  {
    //we're offsetting x based on the value of y, its a bit hacky, but it looks nicer than anything else I've tried.
    var curlVal = (1 - Math.cos(2 * Math.PI * thePoint.y)) * 0.5;
    thePoint.x += curlVal * sandCurlOffset;
  }

  thePoint.y = Math.scaleNormal(thePoint.y, heightMin, heightMax);
  thePoint.y = mgCanvas.height - (thePoint.y * scaleMultip * mgCanvas.height);

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
      currProgress = (tod + (1 - currShootingStar.startTime)) / shootingStarWaitDur;
    }
    else
    {
      currProgress = (tod - currShootingStar.startTime) / shootingStarWaitDur;
    }

    // if we're not having to wait anymore, then update the star!
    if (currProgress >= shootingStarWaitDur)
    {
      var bStarAlive = currShootingStar.checkLifetime( bgCanvas.width, bgCanvas.height, tod );
      if (bStarAlive)
      {
        currShootingStar.draw(bgCtx);
      }
      else
      {
        shootingStarWaitDur = currShootingStar.duration + shootingStarFreqMin + (Math.random() * shootingStarFreqMax);
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
  this.size = 1;
  this.startTime = 0;
  this.minDur = 0.075;
  this.maxDur = 0.1;
  this.duration = 0;
  this.direction = new Vector2D(0,0);

  this.bSetup = false;
  this.maxSpawnPosY = 0.3;
  this.minTravelDist = 0.4;
  this.maxTravelDist = 0.8;

  this.checkLifetime = function( canvasWidth, canvasHeight, timeOfDay )
  {
    if (!this.bSetup)
    {
      this.startTime = timeOfDay;

      this.startPosition.x = canvasWidth;
      this.startPosition.y = Math.random() * canvasHeight * this.maxSpawnPosY;

      this.duration = this.minDur + (Math.random() * this.maxDur);

      //TODO: What if its the same or really close??
      var centerDirX = this.startPosition.x - (canvasWidth * 0.5);
      var centerDirY = this.startPosition.y - (canvasHeight * 0.5);
      var centerDir = new Vector2D(centerDirX, centerDirY);
      centerDir = centerDir.normalize();

      var moveDistX = (this.minTravelDist + (Math.random() * this.maxTravelDist)) * canvasWidth;
      var moveDistY = (this.minTravelDist + (Math.random() * this.maxTravelDist)) * canvasHeight;

      this.endPosition.x = this.startPosition.x + (centerDir.x * moveDistX);
      this.endPosition.y = this.startPosition.y + (centerDir.y * moveDistY);

      this.bSetup = true;
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
    if (currProgress >= this.duration)
    {
      this.bSetup = false;
      return false;
    }

    this.position.x = EasingUtil.easeNone(currProgress, this.startPosition.x, this.startPosition.x-this.endPosition.x, this.duration);
    this.position.y = EasingUtil.easeNone(currProgress, this.startPosition.y, this.startPosition.y-this.endPosition.y, this.duration);

    return true;
  }

  this.draw = function(theCanvas)
  {
    theCanvas.fillStyle = 'rgba(255,255,255,1)';
    theCanvas.beginPath();
    theCanvas.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    theCanvas.fill();

    //TODO: maybe make this limited in length....
    theCanvas.strokeStyle = 'rgba(255,255,255,0.1)';
    theCanvas.lineWidth   = 0.5;
    theCanvas.beginPath();
    theCanvas.lineTo(this.startPosition.x, this.startPosition.y);
    theCanvas.lineTo(this.position.x, this.position.y);
    theCanvas.stroke();

  }
}
