//HTML Elements
let bgCanvas, bgCtx;
let fgCanvas, fgCtx;

CommonElementsCreator.addStyles(["FullScreenEffects/frogs"]);

let isPaused = false;
let pausedLabel;
window.addEventListener("keyup", (event) => {
  if (event.key == ' ') { 
    if (!isDead)
    {
      isPaused = !isPaused; 
      validatePausedLabel();
    }
    else
    {
      location.reload();
    }
  }
});

function validatePausedLabel()
{
  pausedLabel.element.style.visibility = isPaused ? "visible" : "hidden";
}

let isDead = false;
let deadLabel;
function validateDeadLabel()
{
  deadLabel.element.style.visibility = isDead ? "visible" : "hidden";
}

let score = 0;
let scoreLabel;
function validateScoreLabel()
{
  scoreLabel.element.innerText = "Score: "+score;
}

let fpsLabel;

const fgUpdateFreq      = 0.025;
let fgUpdateTimer     = 0;

const cameraMoveSpeed = 2;

let player;
let terrain;

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
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject', 'GameCamera',
    'Components/Canvas', 'Components/Slider', 'Components/DropDown',  'Components/Label',
    'FullScreenEffects/Frogs/Player',
    'FullScreenEffects/Frogs/Terrain',
  ];
  CommonElementsCreator.appendScripts(includes);
}

function onMouseDown()
{
  if (isDead) {
    location.reload(); 
  }
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

  scoreLabel = new Label(document.body, 0);
  scoreLabel.element.className       = "scoreLabel";
  validateScoreLabel();

  fpsLabel = new Label(document.body, 0);
  fpsLabel.element.className       = "fpsLabel";

  GameCamera.position = new Vector2D(0, 0);

  terrain = new Terrain();

  player = new Player(terrain);
  player.setPosition(new Vector2D(GameCamera.position.x, GameCamera.position.y));
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
  const canvases = [bgCanvas, fgCanvas];
  const returnValue = CanvasScaler.updateCanvasSize( canvases );

  GameCamera.drawnAreaSize = new Vector2D(bgCanvas.width, bgCanvas.height);

  return returnValue;
}

function onWindowResize()
{
  if (validateCanvasSize() == true)
  {
    location.reload();
  }
}

//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
  if (player && !isPaused && !isDead)
  {
    player.update(
      fgCanvas.width, 
      fgCanvas.height,
      () => {
        isDead = true;
        validateDeadLabel();
      }
    );
    
    const fpsValue = (GameLoop.fps).toFixed(0)+'fps?';
    if (fpsValue != fpsLabel.element.innerText)
      fpsLabel.element.innerText = fpsValue;

    //have the camera follow the player
    /*const playerPos = player.getPosition();
    const playerDir = new Vector2D(playerPos.x - GameCamera.position.x, playerPos.y - GameCamera.position.y);
    if (playerDir.magnitude() != 0)
    {
      GameCamera.position.x += playerDir.x * GameLoop.deltaTime * cameraMoveSpeed;
      GameCamera.position.y += playerDir.y * GameLoop.deltaTime * cameraMoveSpeed;
    }*/

    //draw the player
    fgUpdateTimer += GameLoop.deltaTime;
    if (fgUpdateTimer > fgUpdateFreq)
    {
      fgUpdateTimer = 0;
      fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
      player.draw(fgCtx);
    }
  }
}