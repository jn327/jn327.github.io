//HTML Elements
var bgCanvas, bgCtx;
var fgCanvas, fgCtx;

var isPaused = false;

var fgUpdateFreq      = 0.05;
var fgUpdateTimer     = 0;

var cameraPos;
var player;

//------------------------------------------------
//                Initialization
//------------------------------------------------
init();
function init()
{
  var includes = [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/SimplexNoise', 'Utils/EasingUtil', 'Utils/AnimationCurve',
    'Utils/TimingUtil', 'Utils/CurlNoise', 'Utils/BezierUtil', 'Utils/CanvasDrawingUtil',
    'Utils/PathUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject',
    'Components/Canvas', 'Components/Slider', 'Components/DropDown',  'Components/Label',
    'FullScreenEffects/Ocean/Particle',
    'FullScreenEffects/Ocean/Player',
    //'FullScreenEffects/Ocean/TerrainLayer',
    //'FullScreenEffects/Ocean/WaterCurrentLayer',
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  cameraPos = new Vector2D(0, 0);

  initCanvas();

  player = new Player();
  player.setPosition(100, 100);
}

function initCanvas()
{
  fgCanvas  = new Canvas().element;
  fgCtx     = fgCanvas.getContext('2d', { alpha: true });

  bgCanvas  = new Canvas().element;
  bgCtx     = bgCanvas.getContext('2d', { alpha: true });
  bgCanvas.style.backgroundColor = '#34c3eb';

  validateCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  var canvases = [bgCanvas, fgCanvas];
  return CanvasScaler.updateCanvasSize( canvases );
}

function onWindowResize()
{
  if (validateCanvasSize() == true)
  {
    //TODO: update noise, player, terrain, water, etc?
  }
}

//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
  if (player && !isPaused)
  {
    //foreground
    player.update(GameLoop.deltaTime);

    fgUpdateTimer += GameLoop.deltaTime;
    if (fgUpdateTimer > fgUpdateFreq)
    {
      fgUpdateTimer = 0;

      fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
      player.draw(fgCtx);
    }
  }
}