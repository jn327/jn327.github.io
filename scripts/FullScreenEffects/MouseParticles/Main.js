//HTML Elements
var offscreenCanvas, offscreenCtx;
var bgCanvas, bgCtx;
var activeCanvas, activeCtx;

var canvasToUpdate;
var nActiveCanvases = 1; // between 1 and arbitrary number.

var maxParticles          = 250;
var particles;
var particlePool;

var nDrawBotsNoise;
var nDrawBotsNoiseScale   = 0.0005;
var nDrawBotsMax          = 3;
var nDrawBotsMin          = 1;
var drawBots;
var drawBotsPool;
var drawBotNParticles     = 2;

var drawBotNoise;
var drawBotCurl;
var drawBotNoiseScale     = 0.002;
var botParticlesForce     = 10;

var noise;
var curl;
var noiseScale          = 0.004;
var drawBgNoise         = false;

var mouseHasMoved       = false;
var mousePos;
var dragParticlesForce  = 25;
var minMouseRadius      = 6;
var maxMouseRadius      = 20;
var mouseDragTimer      = 0;
var mouseDragTime       = 0.3;
var minMouseParticles   = 1;
var maxMouseParticles   = 8;
var mouseClickRadius    = 2;
var mouseClickParticles = 33;
var mouseParticlesForce = 10;
var currMouseColor;

var bDoDrop           = false;
var dropParticlesMin  = 25;
var dropParticlesMax  = 50;
var dropFrequency     = 2.5;
var dropTimer         = 0;
var dropRadius        = 2;
var dropForceMin      = 8;
var dropForceMax      = 14;

var updateFreq        = 0.033;
var updateTimer       = 0;

var renderFrequency   = 0.033;
var renderTimer       = 0;

var metaballsThreshold = 120;

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
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject',
    'Components/Canvas',
    'FullScreenEffects/MouseParticles/Particle', 'FullScreenEffects/MouseParticles/DrawBot'
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  noise = new SimplexNoise();
  function getNoise(x,y) { return noise.scaledNoise(x,y) };
  curl  = new CurlNoise( getNoise, noiseScale, 0.2 );

  nDrawBotsNoise  = new SimplexNoise();
  drawBotNoise    = new SimplexNoise();
  function getDrawBotNoise(x,y) { return drawBotNoise.scaledNoise(x,y) };
  drawBotCurl = new CurlNoise( getDrawBotNoise, drawBotNoiseScale, 0.2 );
  drawBotsPool = new ObjectPool();

  initCanvas();

  particles = [];
  particlePool = new ObjectPool();

  drawBots = [];

  ColorUtil.setGlobalColorPallete( ColorUtil.generateColorPallete( 3, 30 ) );

  //background
  var brightness = 80;
  bgCanvas.style.webkitFilter = "brightness("+brightness+"%)";
  bgCanvas.style.filter = "brightness("+brightness+"%)";

  if (nActiveCanvases > 1)
  {
    for (var c = 1; c < nActiveCanvases; c++)
    {
      var n = c / (nActiveCanvases-1);
      var canvasBrightness = brightness + ((100 - brightness) * n);
      console.log("c :"+c +", n: "+n +", brightness: "+canvasBrightness);
      activeCanvas[c].style.webkitFilter = "brightness("+canvasBrightness+"%)";
      activeCanvas[c].style.filter = "brightness("+canvasBrightness+"%)";
    }
  }

  drawBackgroundColor();
}

function drawBackgroundColor()
{
  var bgColor    = ColorUtil.golbalColorPallete[ColorUtil.golbalColorPallete.length-1];
  var bgHue      = bgColor[0];
  var bgS        = bgColor[1];

  bgCtx.fillStyle = 'hsla(' +bgHue +', ' +bgS +'%, 70%, 1)';
  bgCtx.fillRect( 0, 0, bgCanvas.width, bgCanvas.height );

  if (drawBgNoise)
  {
    drawBackgroundNoise();
  }
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

  activeCanvas = [];
  activeCtx = [];
  for ( var i = 0; i < nActiveCanvases; i++ )
  {
    activeCanvas.push( new Canvas().element );
    activeCtx.push( activeCanvas[i].getContext('2d') );
  }

  bgCanvas      = new Canvas().element;
  bgCtx         = bgCanvas.getContext('2d');

  canvasToUpdate = activeCanvas;
  canvasToUpdate.push (bgCanvas);

  validateCanvasSize();
  setOffscreenCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  return CanvasScaler.updateCanvasSize( canvasToUpdate );
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
    activeAreaXMax = activeCanvas[0].width;
    activeAreaYMax = activeCanvas[0].height;

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
  updateNDrawBots();
  spawnParticles();

  var bUpdate = false;
  var bDraw = false;
  updateTimer += GameLoop.deltaTime;
  if (updateTimer > updateFreq)
  {
    updateTimer = 0;
    bUpdate = true;
  }

  renderTimer += GameLoop.deltaTime;
  if (renderTimer > renderFrequency)
  {
    renderTimer = 0;
    bDraw = true;

    //it should be possible to get the rect occupied by each element,
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
      activeAreaXMax = activeCanvas[0].width;
    }
    if (activeAreaYMax == undefined)
    {
      activeAreaYMax = activeCanvas[0].height;
    }

    var activeAreaXDelta = activeAreaXMax - activeAreaXMin;
    var activeAreaYDelta = activeAreaYMax - activeAreaYMin;

    //clear prev frame
    offscreenCtx.clearRect( activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta );
    activeCtx[0].clearRect( activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta );

    activeAreaXMin = activeCanvas[0].width * 0.5;
    activeAreaYMin = activeCanvas[0].height * 0.5;
    activeAreaXMax = activeCanvas[0].width * 0.5;
    activeAreaYMax = activeCanvas[0].height * 0.5;
  }

  if (bDraw || bUpdate)
  {
    var l = particles.length;
    var particle;

    var canvasW = activeCanvas[0].width;
    var canvasH = activeCanvas[0].height;

    if (l > 0)
    {
      for ( var n = 0; n < l; n ++ )
      {
        particle = particles[n];

        if (bUpdate)
        {
          particle.update( updateFreq, 0, 0, canvasW, canvasH, particles );
        }

        if (bDraw)
        {
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
          if (activeAreaXMax < activeCanvas[0].width)
          {
            if ( particle.position.x + particle.scale > activeAreaXMax )
            {
              activeAreaXMax = particle.position.x + particle.scale;
            }
          }
          if (activeAreaYMax < activeCanvas[0].height)
          {
            if ( particle.position.y + particle.scale > activeAreaYMax )
            {
              activeAreaYMax = particle.position.y + particle.scale;
            }
          }
        }

        if (bUpdate)
        {
          if (particle.isActive() == false)
          {
            particles.splice(n, 1);
            n--;
            l--;
          }
        }
      }

      if (bDraw)
      {
        if (activeAreaXMin < 0)
        {
          activeAreaXMin = 0;
        }
        if (activeAreaYMin < 0)
        {
          activeAreaYMin = 0;
        }
        if (activeAreaXMax > activeCanvas[0].width)
        {
          activeAreaXMax = activeCanvas[0].width;
        }
        if (activeAreaYMax > activeCanvas[0].height)
        {
          activeAreaYMax = activeCanvas[0].height;
        }

        var activeAreaXDelta = activeAreaXMax - activeAreaXMin;
        var activeAreaYDelta = activeAreaYMax - activeAreaYMin;

        //update the data and put it back
        if (activeAreaXDelta > 0 && activeAreaYDelta > 0)
        {
          var imageData = offscreenCtx.getImageData( activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta );
          var pix = imageData.data;
          var pixL = pix.length;

          for (var i = 0; i < pixL; i += 4)
          {
            if(pix[i+3] < metaballsThreshold)
            {
              pix[i+3] = 0;
            }
            else
            {
              //pix[i+3] *= 1.2;
              pix[i+3] = 255;
            }
          }

          activeCtx[0].putImageData(imageData, activeAreaXMin, activeAreaYMin);

          if (nActiveCanvases > 1)
          {
            for (var c = 1; c < nActiveCanvases; c++)
            {
              activeCtx[c].clearRect( 0, 0, activeCanvas[c].width, activeCanvas[c].height );
              activeCtx[c].drawImage(activeCanvas[c-1], 0, 0);
            }
          }

          bgCtx.drawImage(activeCanvas[0], activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta,
            activeAreaXMin, activeAreaYMin, activeAreaXDelta, activeAreaYDelta );
        }
      }
    }
  }

}

function updateNDrawBots()
{
  var nDrawBots = nDrawBotsNoise.scaledNoise(GameLoop.currentTime * nDrawBotsNoiseScale, 0);
  nDrawBots = Math.scaleNormal( nDrawBots, nDrawBotsMin, nDrawBotsMax );
  while (drawBots.length < nDrawBots)
  {
    var theBot = drawBotsPool.getItem();
    if (theBot == null)
    {
      theBot = new DrawBot( drawBotCurl.noise );
    }
    drawBots.push( theBot );

    var theColor = getRandomColor();
    var xPos = activeCanvas[0].width * Math.scaleNormal(Math.random(), 0.1, 0.9);
    var yPos = activeCanvas[0].height * Math.scaleNormal(Math.random(), 0.1, 0.9);
    theBot.spawn(xPos, yPos, theColor);
  }

  while (drawBots.length > nDrawBots)
  {
    var theBot = drawBots.pop();

    theBot.despawn();
    drawBotsPool.addToPool(theBot);
  }

  //update them and spawn some particles
  var theBot;
  var l = nDrawBots;
  for ( var i = 0; i < l; i ++ )
  {
    theBot = drawBots[i];
    if (theBot != undefined)
    {
      theBot.update( GameLoop.deltaTime, 0, 0, activeCanvas[0].width, activeCanvas[0].height, drawBots, mousePos, mouseHasMoved);

      //spawn particles around it
      var botSpawnN = theBot.getFadeInNormal();
      var theLifetime = Math.scaleNormal(1 - botSpawnN, 0.05, 0.95);
      createParticles( drawBotNParticles, theBot.position, theBot.scale * botSpawnN, theBot.position, botParticlesForce * botSpawnN, theLifetime, theBot.color );

      if (theBot.isActive() == false)
      {
        drawBots.splice(i, 1);
        drawBotsPool.addToPool(theBot);
        i--;
        l--;
      }
    }
  }

}

function spawnParticles()
{
  updateDropParticles();
  spawnMouseParticles();
}

function updateDropParticles()
{
  if (bDoDrop == false)
    return;

  dropTimer += GameLoop.deltaTime;

  if (dropTimer > dropFrequency)
  {
    dropTimer = 0;

    var thePos = new Vector2D(Math.random() * activeCanvas[0].width, Math.random() * activeCanvas[0].height);
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
    var canvasW = activeCanvas[0].width;
    var canvasH = activeCanvas[0].height;

    var currMousePos = new Vector2D(MouseTracker.mousePos.x * canvasW, MouseTracker.mousePos.y * canvasH);
    var particleForce = new Vector2D(0,0);
    if( mousePos == undefined )
    {
      mousePos = currMousePos;
    }

    mouseHasMoved = mousePos.x != currMousePos.x || mousePos.y != currMousePos.y;
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
  for (var i = 0; i < nParticles; i++)
  {
    if (particles.length < maxParticles)
    {
      var theParticle = particlePool.getItem();
      if (theParticle == null)
      {
        theParticle = new Particle( particlePool, curl.noise );
      }

      var posX = pos.x + (Math.sin(Math.random() * Math.TWOPI) * (Math.random() * radius));
      var posY = pos.y + (Math.cos(Math.random() * Math.TWOPI) * (Math.random() * radius));

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

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseUp()
{
  if (MouseTracker.mousePos != undefined)
  {
    var canvasW = activeCanvas[0].width;
    var canvasH = activeCanvas[0].height;

    dropTimer = 0;

    var thePos      = new Vector2D(MouseTracker.mousePos.x * canvasW, MouseTracker.mousePos.y * canvasH);
    var theColor    = getRandomColor();

    createParticles( mouseClickParticles, thePos, mouseClickRadius, thePos, mouseParticlesForce, 0, theColor );
  }
}
