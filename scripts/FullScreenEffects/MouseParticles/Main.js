//HTML Elements
var bgCanvas, bgCtx;
var activeCanvas, activeCtx;

var maxParticles          = 100;
var particles;
var particlePool;

var mousePos;
var mouseParticlesForce = 5;
var minMouseRadius      = 6;
var maxMouseRadius      = 12;
var mouseDragTimer      = 0;
var mouseDragTime       = 0.66;
var minMouseParticles   = 10;
var maxMouseParticles   = 300;
var currMouseColor;

var dropParticlesMin  = 150;
var dropParticlesMax  = 300;
var dropFrequency     = 2;
var dropTimer         = 0;
var dropRadius        = 2;
var dropForceMin      = 2;
var dropForceMax      = 3;

var renderFrequency   = 0.033;
var renderTimer       = 0;

var metaballsThreshold = 240;

//------------------------------------------------
//                Initialization
//------------------------------------------------
init();
function init()
{
  var includes = [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/SimplexNoise', 'Utils/EasingUtil', 'Utils/AnimationCurve',
    'Utils/TimingUtil', 'Utils/CurlNoise', 'Utils/ObjectPool', 'Utils/ColorUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject', 'FullScreenEffects/MouseParticles/Particle'
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  initCanvas();

  particles = [];
  particlePool = new ObjectPool();

  ColorUtil.setGlobalColorPallete( ColorUtil.generateColorPallete( 3, 20 ) );

  //background
  bgCanvas.style.webkitFilter = "brightness(80%)";
  bgCanvas.style.filter = "brightness(80%)";
  drawBackgroundColor();
}

function drawBackgroundColor()
{
  var bgColor    = ColorUtil.golbalColorPallete[ColorUtil.golbalColorPallete.length-1];
  var bgHue      = bgColor[0];
  var bgS        = bgColor[1];

  bgCtx.fillStyle = 'hsla(' +bgHue +', ' +bgS +'%, 70%, 1)';
  bgCtx.fillRect( 0, 0, bgCanvas.width, bgCanvas.height );
}

function initCanvas()
{
  activeCanvas  = CommonElementsCreator.createCanvas();
  activeCtx     = activeCanvas.getContext('2d');

  bgCanvas      = CommonElementsCreator.createCanvas();
  bgCtx         = bgCanvas.getContext('2d');

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
    drawBackgroundColor();
    resetParticles();
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

}

function spawnParticles()
{
  updateDropParticles();
  spawnMouseParticles();
}

function updateDropParticles()
{
  dropTimer += GameLoop.deltaTime;

  if (dropTimer > dropFrequency)
  {
    dropTimer = 0;

    var thePos = new Vector2D(Math.random() * activeCanvas.width, Math.random() * activeCanvas.height);
    var nParticles  = Math.scaleNormal(Math.random(), dropParticlesMin, dropParticlesMax);
    var theForce    = Math.scaleNormal(Math.random(), dropForceMin, dropForceMax);
    var lifeTimeN   = Math.scaleNormal(Math.random(), 0, 0.3);
    var theColor    = getRandomColor();

    createParticles( nParticles, thePos, dropRadius, thePos, theForce, lifeTimeN, theColor );
  }
}

function getRandomColor()
{
  var theIndex = Math.round(Math.random() * (ColorUtil.golbalColorPallete.length - 1));
  return ColorUtil.golbalColorPallete[theIndex];
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

    var mouseHasMoved = mousePos.x != currMousePos.x || mousePos.y != currMousePos.y;
    if ( mouseHasMoved )
    {
      if (currMouseColor == undefined)
      {
        currMouseColor = getRandomColor();
      }

      mouseDragTimer += GameLoop.deltaTime;

      var mouseDragN = mouseDragTimer / mouseDragTime;
      mouseDragN = Math.clamp(mouseDragN, 0, 1);

      var mouseRadius = Math.scaleNormal( mouseDragN, minMouseRadius, maxMouseRadius);
      var particlesToSpawn = Math.scaleNormal( mouseDragN, minMouseParticles, maxMouseParticles);

      var lifeTimeN = 1 - mouseDragN;

      var mouseDelta = currMousePos.getDirection(mousePos);
      mouseDelta.normalize();
      var centerPos = new Vector2D(currMousePos.x - (mouseDelta.x * mouseRadius), currMousePos.y - (mouseDelta.y * mouseRadius));

      mousePos = currMousePos;
      createParticles( particlesToSpawn, mousePos, mouseRadius, centerPos, mouseParticlesForce, lifeTimeN, currMouseColor );
    }
    else
    {
      currMouseColor = undefined;
      mouseDragTimer = 0;
    }
  }
}

function createParticles( nParticles, pos, radius, forceCenter, forceMultip, lifeTimeN, theColor )
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

      particleForce = new Vector2D(posX, posY).getDirection(forceCenter);
      particleForce.normalize();
      particleForce = particleForce.getMultiplied(forceMultip);

      theParticle.spawn(posX, posY, particleForce.x, particleForce.y, lifeTimeN, theColor);

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

  //update the data and put it back
  var imageData = activeCtx.getImageData(0, 0, activeCanvas.width, activeCanvas.height);
  var pix = imageData.data;

  for (var i = 0, n = pix.length; i <n; i += 4)
  {
    if(pix[i+3] < metaballsThreshold)
    {
      pix[i+3] = 0;
    }
  }

  activeCtx.putImageData(imageData, 0, 0);
  bgCtx.drawImage(activeCanvas, 0, 0);

  /*l = ColorUtil.golbalColorPallete.length;
  var w         = 0.01 * activeCanvas.width;
  var h         = 0.05 * activeCanvas.height;
  var padding   = 1;
  var dPadding  = padding * 2;

  for ( var i = 0; i < l; i ++ )
  {
    var color = ColorUtil.golbalColorPallete[i];

    activeCtx.fillStyle = 'hsla(' +color[0] +', ' +color[1] +'%, 50%, 1)';
    activeCtx.fillRect(padding + w*i, activeCanvas.height-(h+padding), w, h);
  }*/
}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseUp()
{
  if (MouseTracker.mousePos != undefined)
  {
    var canvasW = activeCanvas.width;
    var canvasH = activeCanvas.height;

    dropTimer = 0;

    var thePos      = new Vector2D(MouseTracker.mousePos.x * canvasW, MouseTracker.mousePos.y * canvasH);
    var theColor    = getRandomColor();

    createParticles( maxMouseParticles, thePos, maxMouseRadius, thePos, mouseParticlesForce, 0, theColor );
  }

}
