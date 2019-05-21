//HTML Elements
var bgCanvas, bgCtx;
var activeCanvas, activeCtx;

var maxParticles      = 3000;
var minParticlesPerFrame  = 10;
var maxParticlesPerFrame  = 1000;
var particles;
var particlePool;

var mousePos;
var mouseMoveParticleForce = 5;
var minMouseRadius  = 6;
var maxMouseRadius  = 12;
var mouseDragTimer  = 0;
var mouseDragTime   = 0.5;

var dropParticlesMin  = 200;
var dropParticlesMax  = 500;
var dropFrequency     = 0.2;
var dropTimer         = 0;
var dropRadius        = 4;
var dropForceMin      = 2;
var dropForceMax      = 3;

var renderFrequency   = 0.02;
var renderTimer       = 0;

//bg
var hueValue;
var minHue                = 180;
var maxHue                = 360;
var hueVariance           = 40;
var hueChangeSpeed        = 50000;
var hueOffset             = Math.random() * hueChangeSpeed;
var hueChangeCurve;
var bgSaturation          = 60; //0-100 (percent)
var bgBrightness          = 10;
var bgUpdateFreq          = 0.4;
var bgUpdateTimer         = 0;

//------------------------------------------------
//                Initialization
//------------------------------------------------
init();
function init()
{
  var includes = [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/SimplexNoise', 'Utils/EasingUtil', 'Utils/AnimationCurve',
    'Utils/TimingUtil', 'Utils/CurlNoise', 'Utils/ObjectPool',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject', 'FullScreenEffects/MouseParticles/Particle'
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  initCanvas();

  hueChangeCurve = new AnimationCurve();
  hueChangeCurve.addKeyFrame(0, 0);
  hueChangeCurve.addKeyFrame(0.5, 1);
  hueChangeCurve.addKeyFrame(1, 0);

  particles = [];
  particlePool = new ObjectPool();

  updateBgCanvas();
}

function initCanvas()
{
  activeCanvas  = CommonElementsCreator.createCanvas();
  activeCtx     = activeCanvas.getContext('2d');

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
    resetParticles();
    updateBgCanvas();
  }
}

function resetParticles()
{
  var theParticle;
  while (particles.length > 0)
  {
    theParticle = particles.pop()
    theParticle.despawn();
  }
}

//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
  spawnParticles();

  updateParticles();
  renderTimer += GameLoop.deltaTime;
  if (renderTimer > renderFrequency)
  {
    renderTimer = 0;
    drawParticles();
  }

  bgUpdateTimer += GameLoop.deltaTime;
  if (bgUpdateTimer > bgUpdateFreq)
  {
    bgUpdateTimer = 0;
    updateBgCanvas();
  }

}

function spawnParticles()
{
  spawnDropParticles();
  spawnMouseParticles();
}

function spawnDropParticles()
{
  dropTimer += GameLoop.deltaTime;

  if (dropTimer > dropFrequency)
  {
    dropTimer = 0;

    var nParticles  = Math.scaleNormal(Math.random(), dropParticlesMin, dropParticlesMax);
    var thePos      = new Vector2D(Math.random() * activeCanvas.width, Math.random() * activeCanvas.height);
    var theForce    = Math.scaleNormal(Math.random(), dropForceMin, dropForceMax);
    var lifeTimeN   = Math.scaleNormal(Math.random(), 0, 0.3);

    createParticles( nParticles, thePos, dropRadius, thePos, theForce, lifeTimeN );
  }
}

function spawnMouseParticles()
{
  if (MouseTracker.mousePos != undefined)
  {
    var canvasW = activeCanvas.width;
    var canvasH = activeCanvas.height;

    var currMousePos = new Vector2D(MouseTracker.mousePos.x * canvasW, MouseTracker.mousePos.y * canvasH);
    var particleForce = new Vector2D(0,0);
    if( mousePos == undefined )
    {
      mousePos = currMousePos;
    }

    var mouseDown = MouseTracker.bMouseDown;
    var mouseHasMoved = mousePos.x != currMousePos.x || mousePos.y != currMousePos.y;

    if ( mouseHasMoved || mouseDown )
    {
      mouseDragTimer = (mouseDown && !mouseHasMoved) ? mouseDragTime : mouseDragTimer + GameLoop.deltaTime;

      var mouseDragN = mouseDragTimer / mouseDragTime;
      mouseDragN = Math.clamp(mouseDragN, 0, 1);

      var mouseRadius = Math.scaleNormal( mouseDragN, minMouseRadius, maxMouseRadius);
      var particlesToSpawn = Math.scaleNormal( mouseDragN, minParticlesPerFrame, maxParticlesPerFrame);

      var lifeTimeN = 1 - mouseDragN;

      var centerPos;
      if (mouseDown && !mouseHasMoved)
      {
        centerPos = currMousePos;
      }
      else
      {
        var mouseDelta = currMousePos.direction(mousePos);
        mouseDelta.normalize();
        centerPos = new Vector2D(currMousePos.x - (mouseDelta.x * mouseRadius), currMousePos.y - (mouseDelta.y * mouseRadius));
      }

      mousePos = currMousePos;
      createParticles( particlesToSpawn, mousePos, mouseRadius, centerPos, mouseMoveParticleForce, lifeTimeN );
    }
    else
    {
      mouseDragTimer = 0;
    }
  }
}

function createParticles( nParticles, pos, radius, forceCenter, forceMultip, lifeTimeN )
{
  var twoPI = Math.PI * 2;

  for (var i = 0; i < nParticles; i++)
  {
    if (particles.length < maxParticles)
    {
      var theParticle = particlePool.getItem();
      if (theParticle == null)
      {
        theParticle = new Particle( particlePool );
      }

      var posX = pos.x + (Math.sin(Math.random() * twoPI) * (Math.random() * radius));
      var posY = pos.y + (Math.cos(Math.random() * twoPI) * (Math.random() * radius));

      if (posX < 0)
      {
        posX = 0;
      }
      if (posY < 0)
      {
        posY = 0;
      }

      particleForce = new Vector2D(posX, posY).direction(forceCenter);
      particleForce.normalize();
      particleForce = particleForce.getMultiplied(forceMultip);

      theParticle.spawn(posX, posY, particleForce.x, particleForce.y, lifeTimeN);

      particles.push(theParticle);
    }
    else
    {
      i = nParticles;
    }
  }
}

function updateParticles()
{
  var l = particles.length;
  var particle;

  var canvasW = activeCanvas.width;
  var canvasH = activeCanvas.height;

  var particlesToRemove = [];

  for ( var n = 0; n < l; n ++ )
  {
    particle = particles[n];
    particle.update( GameLoop.deltaTime, 0, 0, canvasW, canvasH );

    if (particle.isActive() == false)
    {
      particlesToRemove.push(particle);
    }
  }

  for (var i = 0; i < particlesToRemove.length; i++)
  {
    var theIndex = particles.indexOf(particlesToRemove[i]);
    if (theIndex >= 0)
    {
      particles.splice(theIndex, 1);
    }
  }
}

function drawParticles()
{
  var l = particles.length;
  var particle;

  activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

  for ( var n = 0; n < l; n ++ )
  {
    particle = particles[n];
    particle.draw( activeCtx );
  }
}

//background
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

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
