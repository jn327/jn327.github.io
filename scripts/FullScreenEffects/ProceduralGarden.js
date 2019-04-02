
// maybe for https://www.reddit.com/r/proceduralgeneration/comments/apyz31/challenge_2019_1_procedural_garden/
// some examples:
//https://brandio.github.io/ProceduralCactus/
//https://dattasid.github.io/flowers/flowers.html

//HTML Elements
var bgCanvas, bgCtx;
var mgCanvas, mgCtx;
var fgCanvas, fgCtx;

//variables
var dayDur                  = 40;
var dayTimer                = dayDur*0.5;
var tod                     = 0; //0-1
var skyBlueMin              = 0.1;
var skyBlueMax              = 0.9;
var sunRiseTime             = 0.15;
var sunSetTime              = 0.85;

var skyUpdateFreq           = 0.05;
var skyUpdateTimer          = 0;

var skyColorDay             = [163, 225, 255];
var skyColorNight           = [0, 0, 0];

var sunSizeMin              = 80;
var sunSizeMax              = 320;
var sunColorMid             = [255, 236, 94];
var sunColorEdges           = [255, 110, 94];

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

var skyGradientMin          = 0.3;
var skyGradientMax          = 0.7;
var skyGradientHMultip      = 1;

var sandColorFar            = [255, 215, 178];
var sandColorNear           = [255, 247, 137];
var sandHeightMin           = 0.3;
var sandHeightMax           = 0.5;
var sandScaleMultipNear     = 0.2;
var sandScaleMultipFar      = 1;
var sandNoiseScaleNear      = 0.0003;
var sandNoiseScaleFar       = 0.003;
var nSandLayersMax          = 8;
var nSandLayersMin          = 5;
var sandSampleStepSize      = 8;

var interLayerSandNoiseScale= 0.0002;
var interLayerNoiseAmount   = 0.66; //yeah not the best name....

var ridgeNoiseStr           = 0.66;
var sandCurlOffset          = 20;

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

    var noiseScale = Math.scaleNormal(layerN, sandNoiseScaleFar, sandNoiseScaleNear);

    var noiseScaleN = (layerN * (1-interLayerNoiseAmount))
      + (interLayerNoiseAmount * (interLayerNoise.noise(i * interLayerSandNoiseScale, interLayerSandNoiseScale) + 1) * 0.5);
    var scaleMultip = Math.scaleNormal(noiseScaleN, sandScaleMultipFar, sandScaleMultipNear);

    mgCtx.beginPath();
    mgCtx.lineTo(0, mgCanvas.height);

    for (var x = 0; x < mgCanvas.width; x += sandSampleStepSize)
    {
      goToSandPos(x, sandNoise, noiseScale, sandHeightMin, sandHeightMax, scaleMultip, true);
    }

    goToSandPos(mgCanvas.width, sandNoise, noiseScale, sandHeightMin, sandHeightMax, scaleMultip, false);

    mgCtx.lineTo(mgCanvas.width, mgCanvas.height);
    mgCtx.fill();

  }
}

function goToSandPos(x, noise, noiseFreq, heightScaleMin, heightScaleMax, scaleMultip, bCurled)
{
  var thePoint = new Vector2D(0, 0);
  thePoint.x = x;

  //make it more ridged
  // as per https://www.redblobgames.com/maps/terrain-from-noise/
  var yNoise = (noise.noise(x * noiseFreq, noiseFreq) + 1) * 0.5;
  var ridgedYNoise = 2 * (0.5 - Math.abs(0.5 - yNoise));
  thePoint.y = (yNoise*(1-ridgeNoiseStr)) + (ridgedYNoise*ridgeNoiseStr);

  if (bCurled)
  {
    thePoint = computeCurl(thePoint);
  }

  thePoint.y = Math.scaleNormal(thePoint.y, heightScaleMin, heightScaleMax);
  thePoint.y = mgCanvas.height - (thePoint.y * scaleMultip * mgCanvas.height);

  mgCtx.lineTo(thePoint.x, thePoint.y);
}

function computeCurl(point)
{
  //it seems like what we need to be doing is moving the x position based on how high this value is...
  //im not too keen on this, its a bit hacky!
  //point.x -= EasingUtil.easeInOutCubic(point.y, 0, 1, 1) * sandCurlOffset;

  //see https://www.florisgroen.com/creating-sandy-desert-first-try/
  var xm = 0.5;
  var s = point.y > 0 && point.y < xm ? 0 : 1;
  var part2 = 1 - Math.cos((Math.PI) * ((point.y - s) / (xm - s)));
  var theVal = (0.5 * part2) - 1;
  point.x += theVal * sandCurlOffset;

  return point;
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

  //TODO: wanna be able to tint it a bit with the sky gradient tooo!!!
  var darkenAmount = 85;
  mgCanvas.style.filter = 'brightness('+((100-darkenAmount) + ((1-skyLerp)*darkenAmount))+'%)';

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
    //var sunX = (dayTimeNormal * (bgCanvas.width + (2 * sunSize))) - sunSize;
    sunX = dayTimeNormal * bgCanvas.width;
    var heightOffset = 0.95;
    sunY = (bgCanvas.height*(1-heightOffset)) + sunSize + (dayTimeLerp * (heightOffset*bgCanvas.height));
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

  var gradientHeightLerp = gradientTimeNormal <= gradientTimeMid ? EasingUtil.easeInOutSine(gradientTimeNormal, 1, -1, 0.5)
    : EasingUtil.easeInOutSine(gradientTimeNormal-0.5, 0, 1, 0.5);

  var gradientAlphaLerp = gradientTimeNormal <= gradientTimeMid ? EasingUtil.easeInOutSine(gradientTimeNormal, 1, -1, 0.5)
    : EasingUtil.easeInOutSine(gradientTimeNormal-0.5, 0, 1, 0.5);

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

  if (tod < starsHideTime || tod > starsShowTime)
  {
    var nightTimeNormal = Math.minMaxNormal(tod, starsHideTime, starsShowTime);
    var nightTimeMid = Math.scaleNormal(0.5, starsHideTime, starsShowTime);
    var nightTimeLerp = nightTimeNormal <= nightTimeMid ? EasingUtil.easeOutCubic(nightTimeNormal, 1, -1, 0.5)
      : EasingUtil.easeInCubic(nightTimeNormal-0.5, 0, 1, 0.5);
    nightTimeLerp -= 1;

    //draw some stars!!!
    for (var i = 0; i < stars.length; i++)
    {
      stars[i].draw(bgCtx, nightTimeLerp);
    }
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
