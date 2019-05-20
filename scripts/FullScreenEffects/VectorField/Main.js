//HTML Elements
var bgCanvas, bgCtx;
var mgCanvas, mgCtx;
var activeCanvas, activeCtx;

//noise
var strNoiseScale = 0.002;
var dirNoiseScale = 0.00125;
var curlEps       = 0.5;

var vectorField;
var vectorFieldMinStr     = 0.5;
var vectorFieldMaxStr     = 1;
var vectorFieldStrMultip  = 250;
var randomiseForceStr     = 10;

var linesAlpha      = 0.01;
var particlesAlpha  = 0.33;

var pixelSizeX = 6;
var pixelSizeY = 6;

var nParticles    = 900;
var particleSize  = 3;
var particles;

var particleMouseAvoidanceDist  = 100;
var particleMouseAvoidanceStr   = 1;

var currHue;
var minHue                = 160;
var maxHue                = 360;
var hueVariance           = 40;
var hueChangeSpeed        = 50000;
var hueChangeCurve;

var theSaturation         = 60; //0-100 (percent)
var backgroundBrightness  = 25;

var changeFrequency   = 30;
var changeTimer       = 0;
var bgUpdateFreq      = 0.4;
var bgUpdateTimer     = 0;
var renderFrequency   = 0.02;
var renderTimer       = 0;
var renderIndex       = 0;

var particlesUpdateStagger = 4; //update 1/particlesUpdateStagger of the particles every frame, so like half or a third every frame.
var particlesDrawStagger = 2;

//------------------------------------------------
//                Initialization
//------------------------------------------------
init();
function init()
{
  var includes = [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/SimplexNoise', 'Utils/EasingUtil', 'Utils/AnimationCurve', 'Utils/TimingUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject', 'FullScreenEffects/VectorField/Particle'
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  hueChangeCurve = new AnimationCurve();
  hueChangeCurve.addKeyFrame(0, 0);
  hueChangeCurve.addKeyFrame(0.5, 1);
  hueChangeCurve.addKeyFrame(1, 0);

  initCanvas();

  initVectorField();
  initParticles();

  updateBgCanvas();
}

function initCanvas()
{
  activeCanvas = [];
  activeCtx = [];
  var theCanvas;
  for (var i = 0; i < particlesDrawStagger; i++)
  {
    theCanvas       = CommonElementsCreator.createCanvas();
    activeCanvas[i] = theCanvas;
    activeCtx[i]    = theCanvas.getContext('2d');
  }

  mgCanvas  = CommonElementsCreator.createCanvas();
  mgCtx     = mgCanvas.getContext('2d');

  bgCanvas  = CommonElementsCreator.createCanvas();
  bgCtx     = bgCanvas.getContext('2d', { alpha: false });

  validateCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  var canvases = [bgCanvas, mgCanvas];
  for (var i = 0; i < activeCanvas.length; i++)
  {
    canvases.push(activeCanvas[i]);
  }
  return CanvasScaler.updateCanvasSize( canvases );
}

function onWindowResize()
{
  if (validateCanvasSize() == true)
  {
    changeTimer = 0;
    bgUpdateTimer = 0;

    initVectorField();
    resetParticles();

    updateBgCanvas();
  }
}

function initVectorField()
{
  var simplexNoise = new SimplexNoise();
  var hueValue;
  var vectorStr;
  var vectorDir;

  vectorField = [];

  var theWidth = roundUpToNearestMultip(bgCanvas.width, pixelSizeX);
  var theHeight = roundUpToNearestMultip(bgCanvas.height, pixelSizeY);

  for ( var x = 0; x <= theWidth; x += pixelSizeX )
  {
    vectorField[x] = [];

    for ( var y = 0; y <= theHeight; y+= pixelSizeY )
    {
      vectorStr = (simplexNoise.noise(x * strNoiseScale, y * strNoiseScale) + 1) * 0.5; //0-1
      vectorStr = Math.scaleNormal(vectorStr, vectorFieldMinStr, vectorFieldMaxStr);

      vectorDir = getCurledVectorFieldDir(curlEps, simplexNoise, x, y);
      //vectorDir = getVectorFieldDir(simplexNoise, x, y);

      vectorDir.multiply(vectorStr * vectorFieldStrMultip);
      vectorField[x][y] = vectorDir;
    }
  }
}

function getVectorFieldDir(theNoise, x, y)
{
  var vectorDir = getDirNoise(theNoise, x, y);
  return new Vector2D(Math.cos(vectorDir), Math.sin(vectorDir));
}

function getDirNoise(theNoise, x, y)
{
  return (theNoise.noise(x * dirNoiseScale, y * dirNoiseScale) + 1) * Math.PI;
}

function getCurledVectorFieldDir(eps, theNoise, x, y)
{
  //rate of change x
  var n1 = getDirNoise(theNoise, x + eps, y);
  var n2 = getDirNoise(theNoise, x - eps, y);

  //average to approx derivative
  var a = (n1 - n2)/(2 * eps);

  //rate of change y
  var n3 = getDirNoise(theNoise, x, y + eps);
  var n4 = getDirNoise(theNoise, x, y - eps);

  //average to approx derivative
  var b = (n3 - n4)/(2 * eps);

  //Curl
  return new Vector2D(b, -a);
}

function roundUpToNearestMultip( value, multip )
{
  var result = value;
  if ((result % multip) != 0)
  {
    result = Math.roundMultip(result, multip);

    //if it rounded down and we're still smaller than the width;
    if (result < value)
    {
      result += multip;
    }
  }
  return result;
}

function initParticles()
{
  particles = [];

  var particle;
  for ( var n = 0; n < nParticles; n++ )
  {
    particle = new Particle();
    setupParticle(particle);
    particles[n] = particle;
  }
}

function setupParticle(theParticle)
{
  theParticle.randomizePosition( 0, 0, mgCanvas.width, mgCanvas.height );
  theParticle.scale = particleSize;
  theParticle.alpha = particlesAlpha;
  theParticle.trailAlpha = linesAlpha;

  // add some random force...
  addRandomForceToParticle(theParticle);

  return theParticle;
}

function addRandomForceToParticle(theParticle)
{
  theParticle.addForce(Math.getRnd(-1,1) * randomiseForceStr, Math.getRnd(-1,1) * randomiseForceStr);
}

function resetParticles()
{
  var l = particles.length;
  for ( var n = 0; n < l; n++ )
  {
    setupParticle(particles[n]);
  }
}

//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
  changeTimer += GameLoop.deltaTime;
  if (changeTimer > changeFrequency)
  {
    changeTimer   = 0;

    mgCtx.clearRect(0, 0, mgCanvas.width, mgCanvas.height);

    initVectorField();
    var l = particles.length;
    for ( var n = 0; n < l; n++ )
    {
      addRandomForceToParticle(particles[n]);
    }
  }

  bgUpdateTimer += GameLoop.deltaTime;
  if (bgUpdateTimer > bgUpdateFreq)
  {
    bgUpdateTimer = 0;
    updateBgCanvas();
  }

  updateParticles();
  renderTimer += GameLoop.deltaTime;
  if (renderTimer > renderFrequency)
  {
    renderTimer = 0;
    drawParticles();
  }

}

function updateBgCanvas()
{
  hueValue = (GameLoop.currentTime % hueChangeSpeed) / hueChangeSpeed;
  hueValue = hueChangeCurve.evaluate( hueValue );
  var scaledHueValue = Math.scaleNormal(hueValue, minHue + hueVariance, maxHue - hueVariance);

  var wScale = 1.25 * bgCanvas.width;
  var hScale = 1 * bgCanvas.height;
  var hOffset = (hScale - bgCanvas.height) * 0.5;
  var wOffset = (wScale - bgCanvas.width) * 0.5;
  var grd = bgCtx.createLinearGradient(wOffset, hOffset, wScale, hScale);

  grd.addColorStop(0, 'hsla('+(scaledHueValue-hueVariance)+','+theSaturation+'%,' +backgroundBrightness +'%,1)');
  grd.addColorStop(0.5, 'hsla('+scaledHueValue+','+theSaturation+'%,' +backgroundBrightness +'%,1)');
  grd.addColorStop(1, 'hsla('+(scaledHueValue+hueVariance)+','+theSaturation+'%,' +backgroundBrightness +'%,1)');

  bgCtx.fillStyle = grd;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

function updateParticles()
{
  var l = particles.length;
  var particle;
  var xPos;
  var yPos;
  var xMax = vectorField.length;
  var yMax = vectorField[0].length;

  var canvasW = mgCanvas.width;
  var canvasH = mgCanvas.height;

  var velocityVector;

  var mousePos;
  var mouseDist;
  var bAvoidMouse = /*MouseTracker.bMouseDown &&*/ MouseTracker.mousePos != undefined;
  if (bAvoidMouse)
  {
    mousePos = new Vector2D(MouseTracker.mousePos.x * canvasW, MouseTracker.mousePos.y * canvasH);
  }

  var deltaTimeMulitp = GameLoop.deltaTime * particlesUpdateStagger;
  var initialOffset = GameLoop.currentFrame % particlesUpdateStagger;

  for ( var n = initialOffset; n < l; n += particlesUpdateStagger )
  {
    particle = particles[n];

    xPos = Math.roundMultip(particle.position.x, pixelSizeX);
    yPos = Math.roundMultip(particle.position.y, pixelSizeY);

    if (xPos >= 0 && yPos >= 0 && xPos <= xMax && yPos <= yMax)
    {
      //avoid the mouse!!!
      if (bAvoidMouse)
      {
        mouseDist = particle.position.distance( mousePos );
        if (mouseDist < particleMouseAvoidanceDist)
        {
          var mouseStr = (particleMouseAvoidanceDist-mouseDist)/particleMouseAvoidanceDist;
          var mouseDir = particle.position.direction( mousePos );

          mouseDir.multiply( mouseStr * particleMouseAvoidanceStr * deltaTimeMulitp );
          particle.addForce( mouseDir.x, mouseDir.y );
        }
      }

      // accelerate the particle
      velocityVector = vectorField[xPos][yPos];
      particle.addForce( velocityVector.x * deltaTimeMulitp, velocityVector.y * deltaTimeMulitp );
    }

    // move the particle
    particle.update( deltaTimeMulitp/*, pixelSizeX, pixelSizeY*/ );
    particle.wrapPosition(0,0, canvasW, canvasH);
  }
}

function drawParticles()
{
  renderIndex ++;
  var canvasIndex = renderIndex % particlesDrawStagger;

  var theCanvas = activeCanvas[canvasIndex];
  var theCtx = activeCtx[canvasIndex];

  theCtx.clearRect(0, 0, theCanvas.width, theCanvas.height);

  var l = particles.length;
  var particle;
  for ( var n = canvasIndex; n < l; n += particlesDrawStagger )
  {
    particle = particles[n];
    particle.draw( theCtx, mgCtx );
  }
}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
