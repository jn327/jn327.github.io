//HTML Elements
var bgCanvas, bgCtx;
var fgCanvas, fgCtx;
var skyCanvas, skyCtx;

CommonElementsCreator.addStyles(["FullScreenEffects/ocean"]);

var isPaused = false;
var pausedLabel;
window.addEventListener("keyup", (event) => {
  if (event.key == ' ' && !isDead) { 
    isPaused = !isPaused; 
    validatePausedLabel()
  }
});

function validatePausedLabel()
{
  pausedLabel.element.style.visibility = isPaused ? "visible" : "hidden";
}

var isDead = false;
var deadLabel;
function validateDeadLabel()
{
  deadLabel.element.style.visibility = isDead ? "visible" : "hidden";
}

var score = 0;
var scoreLabel;
function validateScoreLabel()
{
  scoreLabel.element.innerText = "Score: "+score;
}

var speedLabel;
var fpsLabel;

var fgUpdateFreq      = 0.025;
var fgUpdateTimer     = 0;

var bgUpdateFreq      = 0.1;
var bgUpdateTimer     = 0;

var cameraMoveSpeed = 1;

var noise;
var skyNoise;
var water;
var terrain;
var sky;
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
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject', 'GameCamera',
    'Components/Canvas', 'Components/Slider', 'Components/DropDown',  'Components/Label',
    'FullScreenEffects/Ocean/Player',
    'FullScreenEffects/Ocean/Sky',
    'FullScreenEffects/Ocean/Water',
    'FullScreenEffects/Ocean/WaterParticle',
    'FullScreenEffects/Ocean/OceanParticle',
    'FullScreenEffects/Ocean/TrashItem',
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

  speedLabel = new Label(document.body, 0);
  speedLabel.element.className       = "speedLabel";

  scoreLabel = new Label(document.body, 0);
  scoreLabel.element.className       = "scoreLabel";
  validateScoreLabel();

  fpsLabel = new Label(document.body, 0);
  fpsLabel.element.className       = "fpsLabel";

  GameCamera.position = new Vector2D(bgCanvas.width * 0.5, bgCanvas.height * 0.5);

  noise = new Noise();
  skyNoise = new Noise();

  water = new Water(noise);
  terrain = new Terrain(noise, new Vector2D(GameCamera.position.x, GameCamera.position.y));
  sky = new Sky(skyNoise);

  player = new Player(water, terrain, noise);
  player.setPosition(new Vector2D(GameCamera.position.x, GameCamera.position.y));
}

function initCanvas()
{
  skyCanvas  = new Canvas().element;
  skyCtx     = skyCanvas.getContext('2d', { alpha: true });

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
  var canvases = [bgCanvas, fgCanvas, skyCanvas];
  var returnValue = CanvasScaler.updateCanvasSize( canvases );

  GameCamera.drawnAreaSize = new Vector2D(bgCanvas.width, bgCanvas.height);

  return returnValue;
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
    //update the player, sky, terrain and water
    player.update(
      () => {
        isDead = true;
        validateDeadLabel();
      }
    );
    let speedValue = (player.getSpeed() * 10).toFixed(0)+'kph';
    if (speedValue != speedLabel.element.innerText)
      speedLabel.element.innerText = speedValue;

    let fpsValue = (GameLoop.fps).toFixed(0)+'fps?';
    if (fpsValue != fpsLabel.element.innerText)
      fpsLabel.element.innerText = fpsValue;

    terrain.update(
      player, 
      () => {
        this.score += 1;
        validateScoreLabel();
      }
    );
    water.update();
    sky.update();

    //have the camera follow the player
    var playerPos = player.getPosition();
    var playerDir = new Vector2D(playerPos.x - GameCamera.position.x, playerPos.y - GameCamera.position.y);
    if (playerDir.magnitude() != 0)
    {
      GameCamera.position.x += playerDir.x * GameLoop.deltaTime * cameraMoveSpeed;
      GameCamera.position.y += playerDir.y * GameLoop.deltaTime * cameraMoveSpeed;
    }

    //draw the player
    fgUpdateTimer += GameLoop.deltaTime;
    if (fgUpdateTimer > fgUpdateFreq)
    {
      fgUpdateTimer = 0;
      fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
      player.draw(fgCtx);
    }

    //draw the water, terrain & sky
    bgUpdateTimer += GameLoop.deltaTime;
    if (bgUpdateTimer > bgUpdateFreq)
    {
      bgUpdateTimer = 0;
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);

      terrain.draw(bgCtx, bgCanvas.width, bgCanvas.height);

      sky.draw(skyCtx, bgCtx, skyCanvas.width, skyCanvas.height);

      water.draw(bgCtx, bgCanvas.width, bgCanvas.height);
    }
  }
}