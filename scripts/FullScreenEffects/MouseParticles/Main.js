//HTML Elements
var offscreenCanvas, offscreenCtx;
var bgCanvas, bgCtx;
var activeCanvas, activeCtx;

var maxParticles          = 300;
var particles;
var particlePool;

var noise;
var curl;
var noiseScale          = 0.005;

var mousePos;
var dragParticlesForce  = 24;
var minMouseRadius      = 6;
var maxMouseRadius      = 20;
var mouseDragTimer      = 0;
var mouseDragTime       = 0.3;
var minMouseParticles   = 2;
var maxMouseParticles   = 20;
var mouseClickRadius    = 2;
var mouseClickParticles = 75;
var mouseParticlesForce = 16;
var currMouseColor;

var dropParticlesMin  = 50;
var dropParticlesMax  = 100;
var dropFrequency     = 2.5;
var dropTimer         = 0;
var dropRadius        = 8;
var dropForceMin      = 12;
var dropForceMax      = 18;

var updateFreq        = 0.033;
var updateTimer       = 0;

var renderFrequency   = 0.033;
var renderTimer       = 0;

var metaballsThreshold = 200;

var activeAreaXMin;
var activeAreaYMin;
var activeAreaXMax;
var activeAreaYMax;

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
  noise = new SimplexNoise();
  function getNoise(x,y) { return noise.scaledNoise(x,y) };
  curl  = new CurlNoise( getNoise, noiseScale, 0.2 );

  initCanvas();

  particles = [];
  particlePool = new ObjectPool();

  ColorUtil.setGlobalColorPallete( ColorUtil.generateColorPallete( 3, 30 ) );

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

  //drawBackgroundNoise();
}

function drawBackgroundNoise()
{
  var bgColor    = ColorUtil.golbalColorPallete[ColorUtil.golbalColorPallete.length-1];
  var bgHue      = bgColor[0];
  var bgS        = bgColor[1];
  var linesHue   = Math.wrap(bgHue + 180, 0, 360 );

  var lineStep  = 16;
  var noiseStep = 8;

  bgCtx.strokeStyle   = 'hsla(' +linesHue +', ' +bgS +'%, 70%, 1)';
  bgCtx.lineWidth     = 1;
  bgCtx.beginPath();

  for (var x = 0; x < bgCanvas.width; x++)
  {
    for (var y = 0; y < bgCanvas.height; y++)
    {
      if (x % noiseStep == 0 && y % noiseStep == 0)
      {
        var simplexVal = noise.scaledNoise(x * noiseScale, y * noiseScale);
        var simplexCol = 255 * simplexVal;
        bgCtx.fillStyle = 'rgb(' +simplexCol +', ' +simplexCol +', ' +simplexCol +')';
        bgCtx.fillRect( x, y, noiseStep, noiseStep );
      }

      if (x % lineStep == 0 && y % lineStep == 0)
      {
        var curlVal     = curl.noise(x, y);
        var curlVector  = new Vector2D(curlVal[0], curlVal[1]);
        curlVector.normalize();
        curlVector.multiply(lineStep);

        var startPoint = new Vector2D(x, y);
        var endPoint = startPoint.getSum(curlVector);
        var arrowEdgeDist = curlVector.getMultiplied(0.75); //how far along the arrow starts
        var arrowEdgePoint = startPoint.getSum(arrowEdgeDist);
        var perpendicularVector = curlVector.getPerpendicular();
        perpendicularVector.multiply(0.25); //how wide the arrow is compared to our length
        var arrowEdgeOne = arrowEdgePoint.getDifference(perpendicularVector);
        var arrowEdgeTwo = arrowEdgePoint.getSum(perpendicularVector);

        bgCtx.moveTo(startPoint.x, startPoint.y);
        bgCtx.lineTo(endPoint.x, endPoint.y);
        bgCtx.lineTo(arrowEdgeOne.x, arrowEdgeOne.y);
        bgCtx.moveTo(endPoint.x, endPoint.y);
        bgCtx.lineTo(arrowEdgeTwo.x, arrowEdgeTwo.y);
      }
    }
  }

  bgCtx.stroke();
}

function initCanvas()
{
  offscreenCanvas = document.createElement('canvas');
  offscreenCtx    = offscreenCanvas.getContext('2d');

  activeCanvas  = CommonElementsCreator.createCanvas();
  activeCtx     = activeCanvas.getContext('2d');

  bgCanvas      = CommonElementsCreator.createCanvas();
  bgCtx         = bgCanvas.getContext('2d');

  validateCanvasSize();
  setOffscreenCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  return CanvasScaler.updateCanvasSize( [bgCanvas, activeCanvas] );
}

function setOffscreenCanvasSize()
{
  if (offscreenCanvas.width != bgCanvas.width)
  {
    offscreenCanvas.width = bgCanvas.width;
  }
  if (offscreenCanvas.height != bgCanvas.height)
  {
    offscreenCanvas.height = bgCanvas.height;
  }
}

function onWindowResize()
{
  if (validateCanvasSize() == true)
  {
    setOffscreenCanvasSize();

    activeAreaXMin = 0;
    activeAreaYMin = 0;
    activeAreaXMax = activeCanvas.width;
    activeAreaYMax = activeCanvas.height;

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

  updateTimer += GameLoop.deltaTime;
  if (updateTimer > updateFreq)
  {
    updateTimer = 0;
    updateParticles();
  }

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

      var mouseDelta = currMousePos.getDifference(mousePos);
      mouseDelta.normalize();
      var centerPos = new Vector2D(currMousePos.x - (mouseDelta.x * mouseRadius), currMousePos.y - (mouseDelta.y * mouseRadius));

      mousePos = currMousePos;
      createParticles( particlesToSpawn, mousePos, mouseRadius, centerPos, dragParticlesForce, lifeTimeN, currMouseColor );
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
        theParticle = new Particle( particlePool, curl.noise );
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

      particleForce = new Vector2D(posX, posY).getDifference(forceCenter);
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
    particle.update( updateFreq, 0, 0, canvasW, canvasH );

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

  //TODO: it should be possible to get the rect occupied by each element,
  // then build a bounding rect for all the elements.
  // We can then clear and redraw areas only within the current bounding.
  if (activeAreaXMin == undefined)
  {
    activeAreaXMin = 0;
  }
  if (activeAreaYMin == undefined)
  {
    activeAreaYMin = 0;
  }
  if (activeAreaXMax == undefined)
  {
    activeAreaXMax = activeCanvas.width;
  }
  if (activeAreaYMax == undefined)
  {
    activeAreaYMax = activeCanvas.height;
  }

  var activeAreaXDelta = activeAreaXMax - activeAreaXMin;
  var activeAreaYDelta = activeAreaYMax - activeAreaYMin;

  //clear prev frame
  offscreenCtx.clearRect( activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta );
  activeCtx.clearRect( activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta );

  activeAreaXMin = activeCanvas.width * 0.5;
  activeAreaYMin = activeCanvas.height * 0.5;
  activeAreaXMax = activeCanvas.width * 0.5;
  activeAreaYMax = activeCanvas.height * 0.5;

  if (l > 0)
  {
    for ( var n = 0; n < l; n ++ )
    {
      particle = particles[n];
      particle.draw( offscreenCtx );

      if (activeAreaXMin > 0)
      {
        if ( particle.position.x - particle.scale < activeAreaXMin )
        {
          activeAreaXMin = particle.position.x - particle.scale;
        }
      }
      if (activeAreaYMin > 0)
      {
        if ( particle.position.y - particle.scale < activeAreaYMin )
        {
          activeAreaYMin = particle.position.y - particle.scale;
        }
      }
      if (activeAreaXMax < activeCanvas.width)
      {
        if ( particle.position.x + particle.scale > activeAreaXMax )
        {
          activeAreaXMax = particle.position.x + particle.scale;
        }
      }
      if (activeAreaYMax < activeCanvas.height)
      {
        if ( particle.position.y + particle.scale > activeAreaYMax )
        {
          activeAreaYMax = particle.position.y + particle.scale;
        }
      }
    }

    if (activeAreaXMin < 0)
    {
      activeAreaXMin = 0;
    }
    if (activeAreaYMin < 0)
    {
      activeAreaYMin = 0;
    }
    if (activeAreaXMax > activeCanvas.width)
    {
      activeAreaXMax = activeCanvas.width;
    }
    if (activeAreaYMax > activeCanvas.height)
    {
      activeAreaYMax = activeCanvas.height;
    }

    activeAreaXDelta = activeAreaXMax - activeAreaXMin;
    activeAreaYDelta = activeAreaYMax - activeAreaYMin;

    //update the data and put it back
    var multip = 5;
    var imageData = offscreenCtx.getImageData( activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta );
    var pix = imageData.data;
    var pixL = pix.length;

    for (var i = 0, n = pixL; i <n; i += 4)
    {
      if(pix[i+3] < metaballsThreshold)
      {
        pix[i+3] = 0;
      }
      else
      {
        pix[i+3] = 255;
      }
    }

    activeCtx.putImageData(imageData, activeAreaXMin, activeAreaYMin);
    bgCtx.drawImage(activeCanvas, 0, 0);
  }
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

    createParticles( mouseClickParticles, thePos, mouseClickRadius, thePos, mouseParticlesForce, 0, theColor );
  }
}
