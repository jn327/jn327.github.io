//HTML Elements
var bgCanvas, bgCtx;
var activeCanvas, activeCtx;

//noise
var strNoiseScale = 0.002;
var dirNoiseScale = 0.00125;
var curlEps       = 0.5;

var vectorField;
var vectorFieldMinStr     = 0.5;
var vectorFieldMaxStr     = 1;
var vectorFieldStrMultip  = 250;
var randomiseForceStr     = 5;

var particlesAlpha  = 0.5;

var bgSaturation  = 60; //0-100 (percent)
var bgBrightness  = 20;

var particleSaturation  = 100; //0-100 (percent)
var particleBrightness  = 100;

var pixelSizeX = 12;
var pixelSizeY = 12;

var nParticles    = 1300;
var particleSize  = 3;
var particles;

var particleMouseAvoidanceDist  = 100;
var particleMouseAvoidanceStr   = 1;

var hueValue;
var minHue                = 180;
var maxHue                = 360;
var hueVariance           = 40;
var hueChangeSpeed        = 50000;
var hueOffset             = Math.random() * hueChangeSpeed;
var hueChangeCurve;

var changeFrequency   = 60;
var changeTimer       = 0;
var bgUpdateFreq      = 0.4;
var bgUpdateTimer     = 0;
var renderFrequency   = 0.02;
var renderTimer       = 0;
var renderIndex       = 0;

var particlesUpdateStagger = 4; //update 1/particlesUpdateStagger of the particles every frame, so like half or a third every frame.
var particlesDrawStagger   = 2;

var speedMultip            = 1;

//------------------------------------------------
//                Initialization
//------------------------------------------------
init();
function init()
{
  var includes = [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/SimplexNoise', 'Utils/EasingUtil', 'Utils/AnimationCurve',
    'Utils/TimingUtil', 'Utils/CurlNoise', 'Utils/BezierUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject',
    'Components/Canvas', 'Components/Slider',
    'FullScreenEffects/VectorField/Particle'
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  createSpeedSlider();

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
    theCanvas       = new Canvas().element;
    activeCanvas[i] = theCanvas;
    activeCtx[i]    = theCanvas.getContext('2d');
  }

  bgCanvas  = new Canvas().element;
  bgCtx     = bgCanvas.getContext('2d', { alpha: false });

  validateCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  var canvases = [bgCanvas];
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
  var simplexNoise  = new SimplexNoise();
  function getNoise(x,y) { return simplexNoise.scaledNoise(x,y) };
  var curl          = new CurlNoise( getNoise, dirNoiseScale, curlEps );
  var vectorStr;
  var dirArr;
  var vectorDir;

  vectorField = [];

  var theWidth = roundUpToNearestMultip(bgCanvas.width, pixelSizeX);
  var theHeight = roundUpToNearestMultip(bgCanvas.height, pixelSizeY);

  for ( var x = 0; x <= theWidth; x += pixelSizeX )
  {
    vectorField[x] = [];

    for ( var y = 0; y <= theHeight; y+= pixelSizeY )
    {
      vectorStr = simplexNoise.scaledNoise(x * strNoiseScale, y * strNoiseScale); //0-1
      vectorStr = Math.scaleNormal(vectorStr, vectorFieldMinStr, vectorFieldMaxStr);

      dirArr = curl.noise(x, y);

      vectorDir = new Vector2D(dirArr[0], dirArr[1]);
      vectorDir.multiply(vectorStr * vectorFieldStrMultip);
      vectorField[x][y] = vectorDir;
    }
  }
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
  theParticle.randomizePosition( 0, 0, activeCanvas[0].width, activeCanvas[0].height );
  theParticle.scale = particleSize;
  theParticle.alpha = particlesAlpha;

  theParticle.saturation = particleSaturation;
  theParticle.brightness = particleBrightness;

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
  hueValue = ((GameLoop.currentTime+hueOffset) % hueChangeSpeed) / hueChangeSpeed;
  hueValue = hueChangeCurve.evaluate( hueValue );
  var scaledHueValue = Math.scaleNormal(hueValue, minHue + hueVariance, maxHue - hueVariance);

  var wScale = 1.25 * bgCanvas.width;
  var hScale = 1 * bgCanvas.height;
  var hOffset = (hScale - bgCanvas.height) * 0.5;
  var wOffset = (wScale - bgCanvas.width) * 0.5;
  var grd = bgCtx.createLinearGradient(wOffset, hOffset, wScale, hScale);

  grd.addColorStop(0, 'hsla('+(scaledHueValue-hueVariance)+','+bgSaturation+'%,' +bgBrightness +'%,1)');
  grd.addColorStop(0.5, 'hsla('+scaledHueValue+','+bgSaturation+'%,' +bgBrightness +'%,1)');
  grd.addColorStop(1, 'hsla('+(scaledHueValue+hueVariance)+','+bgSaturation+'%,' +bgBrightness +'%,1)');

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

  var canvasW = activeCanvas[0].width;
  var canvasH = activeCanvas[0].height;

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
          var mouseDir = particle.position.getDifference( mousePos );

          mouseDir.multiply( mouseStr * particleMouseAvoidanceStr * deltaTimeMulitp );
          particle.addForce( mouseDir.x, mouseDir.y );
        }
      }

      // accelerate the particle
      velocityVector = vectorField[xPos][yPos];
      particle.addForce( velocityVector.x * deltaTimeMulitp * speedMultip, velocityVector.y * deltaTimeMulitp * speedMultip );
    }

    // move the particle
    particle.update( deltaTimeMulitp );
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
    particle.draw( theCtx/*, pixelSizeX, pixelSizeY*/ );
  }
}

//------------------------------------------------
//                   sliders
//------------------------------------------------
function createSpeedSlider()
{
  //Create a slider!
  speedSliderInput = new Slider(document.body, 0);
  speedSliderInput.element.style.position = "absolute";
  speedSliderInput.element.style.bottom   = "10px";
  speedSliderInput.element.style.right    = "10px";

  speedSliderInput.element.addEventListener('input', onSpeedSliderChange);
}

function onSpeedSliderChange()
{
  speedMultip = speedSliderInput.element.value;
}
