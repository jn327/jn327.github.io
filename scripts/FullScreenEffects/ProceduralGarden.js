
// maybe for https://www.reddit.com/r/proceduralgeneration/comments/apyz31/challenge_2019_1_procedural_garden/
// some examples:
//https://brandio.github.io/ProceduralCactus/
//https://dattasid.github.io/flowers/flowers.html

//HTML Elements
var bgCanvas, bgCtx;
var mgCanvas, mgCtx;
var fgCanvas, fgCtx;

//variables
var dayDur     = 30;
var dayTimer   = 0;
var tod        = 0; //0-1

var skyUpdateFreq   = 0.2;
var skyUpdateTimer  = 0;
var skyPixelSize    = 6;
var sunRiseTime     = 0.1;
var sunSetTime      = 0.7;
var skyColorDay     = [163, 225, 255];
var skyColorNight   = [0, 0, 0];

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes = ['Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler' ];
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

  updateSkyVisuals();
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
  var bSunVisible = tod > sunRiseTime && tod < sunSetTime;
  //if the sun is visible, how far into the daytime is it...
  if (bSunVisible)
  {
    var sunPosNormal = Math.minMaxNormal(tod, sunRiseTime, sunSetTime);
  }

  var todLerp = 0.5 + (Math.cos(tod * 2 * Math.PI) * 0.5);
  var todColor = ColorUtil.lerp(skyColorDay, skyColorNight, todLerp);
  todColor = ColorUtil.rgbToHex(todColor);

  for ( var x = 0; x < bgCanvas.width; x += skyPixelSize )
  {
    for ( var y = 0; y < bgCanvas.height; y+= skyPixelSize )
    {
      bgCtx.fillStyle = todColor;
      bgCtx.fillRect(x,y,skyPixelSize,skyPixelSize);
    }
  }
}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
