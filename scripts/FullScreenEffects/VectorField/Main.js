//HTML Elements
var bgCanvas, bgCtx;
var activeCanvas, activeCtx;

//noise
var strNoiseScale = 0.002;
var dirNoiseScale = 0.004;
var hueNoiseScale = 0.0005;

var vectorField;
var vectorFieldMinStr     = 0.25;
var vectorFieldMaxStr     = 1;
var vectorFieldStrMultip  = 1.5;

var pixelSizeX = 6;
var pixelSizeY = 6;
var lastPixelX;
var lastPixelY;

var nParticles    = 1000;
var particleSize  = 3;
var particles;

var particleMouseAvoidanceDist  = 100;
var particleMouseAvoidanceStr   = 1;

var minHue                = 180;
var maxHue                = 360;
var theHue                = 0;
var hueVariation          = 60;
var theSaturation         = 60; //0-100 (percent)
var backgroundBrightness  = 25;
var particleBrightness    = 80;

var changeFrequency   = 12;
var changeTimer       = 0;
var fadeOutDur        = 0.2;
var fadeOutTimer      = 0;
var fadeInDur         = 0.2;
var fadeInTimer       = 0;
var renderFrequency   = 0.033;
var renderTimer       = 0;

//------------------------------------------------
//                Initialization
//------------------------------------------------
init();
function init()
{
  var includes = ['Utils/Vector2d', 'Utils/MathEx', 'Utils/SimplexNoise', 'Utils/EasingUtil', 'Utils/TimingUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject', 'FullScreenEffects/VectorField/Particle' ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  setRandomHue();

  initCanvas();
  initVectorField();
  initParticles();
}

function setRandomHue()
{
  theHue = (minHue+(hueVariation*0.5)) + (Math.random() * ((maxHue-(minHue))-hueVariation));
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
    fadeOutTimer = 0;

    resetBgCanvas();

    initVectorField();
    resetParticles();
  }
}

function initVectorField()
{
  var simplexNoise = new SimplexNoise();
  var vectorStr;
  var vectorDir;
  var hueValue;
  var theVector;
  var hueWithVar;

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
      hueValue = simplexNoise.noise(x * hueNoiseScale, y * hueNoiseScale); //-1 to 1

      theVector = new Vector2D(Math.cos(vectorDir), Math.sin(vectorDir));
      theVector.multiply(vectorStr * vectorFieldStrMultip);
      vectorField[x][y] = theVector;

      // Background canvas
      hueWithVar = theHue + (hueValue * hueVariation);
      bgCtx.fillStyle = 'hsla('+hueWithVar+','+theSaturation+'%,' +backgroundBrightness +'%,1)';
      bgCtx.fillRect(x,y,pixelSizeX,pixelSizeY);
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
    if (fadeOutTimer < fadeOutDur)
    {
      fadeOutTimer += GameLoop.deltaTime;

      var endOpacity = EasingUtil.easeNone(fadeOutTimer, 1, -1, fadeOutDur);
      bgCanvas.style.opacity = endOpacity;
    }
    else
    {
      changeTimer   = 0;
      fadeOutTimer  = 0;

      setRandomHue();
      resetBgCanvas();

      //reset of the vector field after a while, keeps things interesting...
      initVectorField();

      var l = particles.length;
      for ( var n = 0; n < l; n++ )
      {
        addRandomForceToParticle(particles[n]);
      }
    }
  }

  if (fadeInTimer < fadeInDur)
  {
    fadeInTimer += GameLoop.deltaTime;

    var endOpacity = EasingUtil.easeNone(fadeInTimer, 0, 1, fadeInDur);
    bgCanvas.style.opacity = endOpacity;
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

function resetBgCanvas()
{
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCanvas.style.opacity = 0;
  fadeInTimer = 0;
}

function updateAndDrawParticles( bDraw )
{
  if (bDraw)
  {
    activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
    activeCtx.fillStyle = 'hsla('+theHue+','+theSaturation+'%,' +particleBrightness +'%,0.6)';
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
