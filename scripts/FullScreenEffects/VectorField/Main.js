//HTML Elements
var bgCanvas, bgCtx;
var activeCanvas, activeCtx;

//noise
var strNoiseScale = 0.002;
var dirNoiseScale = 0.004;

var vectorField;
var vectorFieldMinStr     = 0.25;
var vectorFieldMaxStr     = 1;
var vectorFieldStrMultip  = 1.5;

var pixelSizeX = 6;
var pixelSizeY = 6;
var lastPixelX;
var lastPixelY;

var nParticles    = 900;
var particleSize  = 3;
var particles;

var particleMouseAvoidanceDist  = 100;
var particleMouseAvoidanceStr   = 1;

var currHue;
var minHue                = 160;
var maxHue                = 360;
var hueVariance           = 40;
var hueChangeSpeed        = 50;
var hueChangeCurve;

var theSaturation         = 60; //0-100 (percent)
var backgroundBrightness  = 25;

var changeFrequency   = 12;
var changeTimer       = 0;
var bgUpdateFreq      = 0.2;
var bgUpdateTimer     = 0;
var renderFrequency   = 0.033;
var renderTimer       = 0;

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
  activeCanvas = CommonElementsCreator.createCanvas();
  activeCtx    = activeCanvas.getContext('2d');

  bgCanvas  = CommonElementsCreator.createCanvas();
  bgCtx     = bgCanvas.getContext('2d', { alpha: false });

  validateCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  return CanvasScaler.updateCanvasSize( [bgCanvas, activeCanvas] );
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
  var vectorStr;
  var vectorDir;
  var hueValue;
  var theVector;

  vectorField = [];

  for ( var x = 0; x < bgCanvas.width; x += pixelSizeX )
  {
    lastPixelX = x;
    vectorField[x] = [];

    for ( var y = 0; y < bgCanvas.height; y+= pixelSizeY )
    {
      lastPixelY = y;

      vectorStr = (simplexNoise.noise(x * strNoiseScale, y * strNoiseScale) + 1) * 0.5; //0-1
      vectorStr = Math.scaleNormal(vectorStr, vectorFieldMinStr, vectorFieldMaxStr);

      vectorDir = (simplexNoise.noise(x * dirNoiseScale, y * dirNoiseScale) + 1) * Math.PI;

      theVector = new Vector2D(Math.cos(vectorDir), Math.sin(vectorDir));
      theVector.multiply(vectorStr * vectorFieldStrMultip);
      vectorField[x][y] = theVector;
    }
  }
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
  theParticle.position.x = Math.random() * lastPixelX;
  theParticle.position.y = Math.random() * lastPixelY;
  theParticle.scale = particleSize;

  // add some random force...
  addRandomForceToParticle(theParticle);

  return theParticle;
}

function addRandomForceToParticle(theParticle)
{
  var randForce = vectorFieldStrMultip * 3;
  theParticle.addForce(Math.getRnd(-1,1) * randForce, Math.getRnd(-1,1) * randForce);
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

  renderTimer += GameLoop.deltaTime;
  var bDraw = false;
  if (renderTimer > renderFrequency)
  {
    renderTimer = 0;
    bDraw = true;
  }

  updateAndDrawParticles( bDraw );
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

function updateAndDrawParticles( bDraw )
{
  if (bDraw)
  {
    activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
    activeCtx.fillStyle = 'rgba(255, 255, 255, 0.33)';
  }

  var particle;
  var xPos;
  var yPos;
  var l = particles.length;
  var velocityVector;

  var mousePos;
  var mouseDist;
  var bAvoidMouse = /*MouseTracker.bMouseDown &&*/ MouseTracker.mousePos != undefined;
  if (bAvoidMouse)
  {
    mousePos = new Vector2D(MouseTracker.mousePos.x * activeCanvas.width, MouseTracker.mousePos.y * activeCanvas.height);
  }

  for ( var n = 0; n < l; n++ )
  {
    particle = particles[n];

    //Guard against null ref!
    xPos = Math.roundMultip(particle.position.x, pixelSizeX);
    yPos = Math.roundMultip(particle.position.y, pixelSizeY);

    if (xPos >= 0 && yPos >= 0
      && xPos <= lastPixelX && yPos <= lastPixelY)
    {
      //avoid the mouse!!!
      if (bAvoidMouse)
      {
        mouseDist = particle.position.distance( mousePos );
        if (mouseDist < particleMouseAvoidanceDist)
        {
          var mouseStr = (particleMouseAvoidanceDist-mouseDist)/particleMouseAvoidanceDist;
          var mouseDir = particle.position.direction( mousePos );

          mouseDir.multiply( mouseStr * particleMouseAvoidanceStr * GameLoop.deltaTime );
          particle.addForce( mouseDir.x, mouseDir.y );
        }
      }

      // accelerate the particle
      velocityVector = vectorField[xPos][yPos];
      particle.addForce( velocityVector.x * GameLoop.deltaTime, velocityVector.y * GameLoop.deltaTime );
    }

    // move the particle
    particle.update();
    particle.wrapPosition(0,0, activeCanvas.width, activeCanvas.height);

    //draw the particles
    if (bDraw)
    {
      activeCtx.fillRect(xPos, yPos, particle.scale, particle.scale);
    }
  }

}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
