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

var pixelSizeX = 8;
var pixelSizeY = 8;
var lastPixelX;
var lastPixelY;

var nParticles    = 1750;
var particleSize  = 2;
var particles;

var particleMouseAvoidanceDist  = 50;
var particleMouseAvoidanceStr   = 200;

var minHue        = 180;
var maxHue        = 360;
var theHue        = 0;
var hueVariation  = 60;
var theSaturation = 90; //0-100 (percent)

var changeFrequency   = 20;
var changeTimer       = 0;
var fadeOutDur        = 1.25;
var fadeOutTimer      = 0;
var fadeInDur         = 0.75;
var fadeInTimer       = 0;

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
    //activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

    initVectorField();
    resetParticles();
  }
}

function initVectorField()
{
  var strNoise = new SimplexNoise();
  var dirNoise = new SimplexNoise();
  var hueNoise = new SimplexNoise();

  vectorField = [];

  for ( var x = 0; x < bgCanvas.width; x += pixelSizeX )
  {
    lastPixelX = x;
    vectorField[x] = [];

    for ( var y = 0; y < bgCanvas.height; y+= pixelSizeY )
    {
      lastPixelY = y;

      var vectorStr = (strNoise.noise(x * strNoiseScale, y * strNoiseScale) + 1) * 0.5; //0-1
      vectorStr = Math.scaleNormal(vectorStr, vectorFieldMinStr, vectorFieldMaxStr);
      var vectorDir = (dirNoise.noise(x * dirNoiseScale, y * dirNoiseScale) + 1) * Math.PI;
      var hueValue = strNoise.noise(x * hueNoiseScale, y * hueNoiseScale); //-1 to 1

      var theVector = new Vector2D(Math.cos(vectorDir), Math.sin(vectorDir));
      theVector.multiply(vectorStr * vectorFieldStrMultip);
      vectorField[x][y] = theVector;

      // Background canvas
      var hueWithVar = theHue + (hueValue * hueVariation);
      bgCtx.fillStyle = 'hsla('+hueWithVar+','+theSaturation+'%,85%,1)';
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
  var randForce = vectorFieldStrMultip * 0.66;
  theParticle.addForce(Math.getRnd(-1,1) * randForce, Math.getRnd(-1,1) * randForce);

  return theParticle;
}

function resetParticles()
{
  for ( var n = 0; n < particles.length; n++ )
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

      var endOpacity = EasingUtil.easeInQuad(fadeOutTimer, 1, -1, fadeOutDur);
      bgCanvas.style.opacity = endOpacity;
      activeCanvas.style.opacity = endOpacity;
    }
    else
    {
      changeTimer = 0;
      fadeOutTimer   = 0;

      setRandomHue();
      resetBgCanvas();

      //reset of the vector field after a while, keeps things interesting...
      initVectorField();
      resetParticles();
    }
  }

  if (fadeInTimer < fadeInDur)
  {
    fadeInTimer += GameLoop.deltaTime;

    var endOpacity = EasingUtil.easeInQuad(fadeInTimer, 0, 1, fadeInDur);
    endOpacity = Math.clamp(endOpacity, 0, 1);
    bgCanvas.style.opacity = endOpacity;
    activeCanvas.style.opacity = endOpacity;
  }

  renderCanvas();
}

function resetBgCanvas()
{
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCanvas.style.opacity = 0;
  activeCanvas.style.opacity = 0;
  fadeInTimer = 0;
}

function renderCanvas()
{
  //activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

  var particleHue = theHue; //(theHue+180) % 360;
  bgCtx.fillStyle = 'hsla('+particleHue+','+theSaturation+'%,98%,0.03)';

  var particle;
  var xPos;
  var yPos;
  for ( var n = 0; n < particles.length; n++ )
  {
    particle = particles[n];

    //Guard against null ref!
    xPos = Math.roundMultip(particle.position.x, pixelSizeX);
    yPos = Math.roundMultip(particle.position.y, pixelSizeY);

    if (xPos >= 0 && yPos >= 0
      && xPos <= lastPixelX && yPos <= lastPixelY)
    {
      //avoid the mouse!!!
      if (MouseTracker.bMouseDown && MouseTracker.mousePos != undefined)
      {
        var mouseDist = particle.position.distance( MouseTracker.mousePos );
        if (mouseDist < particleMouseAvoidanceDist)
        {
          var mouseStr = (particleMouseAvoidanceDist-mouseDist)/particleMouseAvoidanceDist;

          var mouseDir = particle.position.direction(MouseTracker.mousePos);
          mouseDir.multiply( mouseStr * particleMouseAvoidanceStr * GameLoop.deltaTime );
          particle.addForce( mouseDir.x, mouseDir.y );
        }
      }

      // accelerate the particle
      var velocityVector = vectorField[xPos][yPos];
      particle.addForce( velocityVector.x * GameLoop.deltaTime, velocityVector.y * GameLoop.deltaTime );
    }

    // move the particle
    particle.update();
    particle.wrapPosition(0,0, activeCanvas.width, activeCanvas.height);

    //draw the particles
    bgCtx.fillRect(particle.position.x, particle.position.y, particle.scale, particle.scale);
    //bgCtx.fillRect(xPos, yPos, particle.scale, particle.scale);

    //activeCtx.fillStyle = 'hsla('+particleHue+','+theSaturation+'%,98%,0.66)';
    //activeCtx.fillStyle = 'rgba(255,255,255,1)';
    //activeCtx.fillRect(particle.position.x, particle.position.y, particle.scale, particle.scale);
    //activeCtx.fillRect(xPos, yPos, particle.scale, particle.scale);
  }

}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
