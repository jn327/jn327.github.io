//HTML Elements
var bgCanvas, bgCtx;
var fgCanvas, fgCtx;

CommonElementsCreator.addStyles(["FullScreenEffects/ocean"]);

var isPaused = false;
var pausedLabel;
window.addEventListener("keyup", (event) => {
  if (event.key == ' ' && !isDead) { 
    isPaused = !isPaused; 
    validatePausedLabel()
  }
});

var isDead = false;
var deadLabel;

function validatePausedLabel()
{
  pausedLabel.element.style.visibility = isPaused ? "visible" : "hidden";
}

function validateDeadLabel()
{
  deadLabel.element.style.visibility = isDead ? "visible" : "hidden";
}

var fgUpdateFreq      = 0.05;
var fgUpdateTimer     = 0;

var bgUpdateFreq      = 0.1;
var bgUpdateTimer     = 0;

var cameraPos;
var cameraMoveSpeed = 1;

var noise;
var water;
var terrain;
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
    'Utils/PathUtil', 'Utils/ObjectPool', 'Utils/ParticleGenerator', 'Utils/CollisionUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject',
    'Components/Canvas', 'Components/Slider', 'Components/DropDown',  'Components/Label',
    'FullScreenEffects/Ocean/Player',
    'FullScreenEffects/Ocean/Water',
    'FullScreenEffects/Ocean/WaterParticle',
    'FullScreenEffects/Ocean/Terrain',
    'FullScreenEffects/Ocean/Noise',
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  initCanvas();

  pausedLabel = new Label(document.body, 0);
  pausedLabel.element.className       = "pausedLabel";
  pausedLabel.element.innerText       = 'PAUSED';
  validatePausedLabel();

  deadLabel = new Label(document.body, 0);
  deadLabel.element.className       = "deadLabel";
  deadLabel.element.innerText       = 'GAME OVER';
  validateDeadLabel();

  cameraPos = new Vector2D(bgCanvas.width * 0.5, bgCanvas.height * 0.5);

  noise = new Noise();
  water = new Water(noise);
  terrain = new Terrain(noise);

  player = new Player(water, terrain);
  player.setPosition(new Vector2D(bgCanvas.width * 0.5, bgCanvas.height * 0.5));
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
  if (player && !isPaused && !isDead)
  {
    let cameraOffset = new Vector2D(cameraPos.x - bgCanvas.width * 0.5, cameraPos.y - bgCanvas.height * 0.5);

    //update the player and water
    player.update(GameLoop.deltaTime, cameraOffset, () => {
      isDead = true;
      validateDeadLabel();
    });
    water.update(GameLoop.deltaTime);

    //have the camera follow the player
    var playerPos = player.getPosition();
    var playerDir = new Vector2D(playerPos.x - cameraPos.x, playerPos.y - cameraPos.y);
    if (playerDir.magnitude() != 0)
    {
      cameraPos.x += playerDir.x * GameLoop.deltaTime * cameraMoveSpeed;
      cameraPos.y += playerDir.y * GameLoop.deltaTime * cameraMoveSpeed;
    }

    //draw the player
    fgUpdateTimer += GameLoop.deltaTime;
    if (fgUpdateTimer > fgUpdateFreq)
    {
      fgUpdateTimer = 0;
      fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
      player.draw(fgCtx, cameraOffset);
    }

    //draw the water
    bgUpdateTimer += GameLoop.deltaTime;
    if (bgUpdateTimer > bgUpdateFreq)
    {
      bgUpdateTimer = 0;
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      terrain.draw(bgCtx, cameraOffset, bgCanvas.width, bgCanvas.height);
      water.draw(bgCtx, cameraOffset, bgCanvas.width, bgCanvas.height);
    }
  }
}