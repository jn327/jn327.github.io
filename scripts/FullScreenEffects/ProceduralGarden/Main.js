//HTML Elements
var skyCanvas, skyCtx;
var terrainCanvas, terrainCtx;
var effectsCanvas, effectsCtx;
var plantsCanvas, plantsCtx;
var activeCanvas, activeCtx;

var skyUpdateFreq            = 0.033;
var skyUpdateTimer           = skyUpdateFreq;
var effectsUpdateFreq        = 0.033;
var effectsUpdateTimer       = effectsUpdateFreq;
var plantsUpdateFreq         = 0.066;
var plantsUpdateTimer        = plantsUpdateFreq;

var dayDur                   = 45;
var dayTimer                 = dayDur * 0.5;
var tod                      = 0; //0-1

var sky;
var wind;
var terrain;

var lastPlantsUpdateWind    = Number.MAX_VALUE;

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes =
  [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise',
    'Utils/EasingUtil', 'Utils/PathUtil', 'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject',
    'FullScreenEffects/ProceduralGarden/Sun', 'FullScreenEffects/ProceduralGarden/Moon',
    'FullScreenEffects/ProceduralGarden/Sky', 'FullScreenEffects/ProceduralGarden/Terrain',
    'FullScreenEffects/ProceduralGarden/Cloud', 'FullScreenEffects/ProceduralGarden/CloudsManager',
    'FullScreenEffects/ProceduralGarden/Plants', 'FullScreenEffects/ProceduralGarden/PlantsManager',
    'FullScreenEffects/ProceduralGarden/Stars', 'FullScreenEffects/ProceduralGarden/StarsManager',
    'FullScreenEffects/ProceduralGarden/Creatures', 'FullScreenEffects/ProceduralGarden/CreatureManager',
    'FullScreenEffects/ProceduralGarden/River', 'FullScreenEffects/ProceduralGarden/Wind'
  ];
  CommonElementsCreator.appendScipts(includes);
}

function start()
{
  initCanvas();

  sky     = new Sky();
  terrain = new Terrain();
  wind    = new Wind();

  sky.init( dayDur, skyCtx, skyCanvas );
  terrain.init( terrainCtx, terrainCanvas, plantsCtx );
}

function initCanvas()
{
  activeCanvas   = CommonElementsCreator.createCanvas();
  activeCtx      = activeCanvas.getContext('2d');

  plantsCanvas   = CommonElementsCreator.createCanvas();
  plantsCtx      = plantsCanvas.getContext('2d');

  effectsCanvas  = CommonElementsCreator.createCanvas();
  effectsCtx     = effectsCanvas.getContext('2d');

  terrainCanvas  = CommonElementsCreator.createCanvas();
  terrainCtx     = terrainCanvas.getContext('2d');

  skyCanvas      = CommonElementsCreator.createCanvas();
  skyCtx         = skyCanvas.getContext('2d');

  validateCanvasSize();
}

function validateCanvasSize()
{
  var maxScale = 600;
  var minScaleV = 600;
  var minScaleH = 400;

  return CanvasScaler.updateCanvasSize( [skyCanvas, terrainCanvas, effectsCanvas, plantsCanvas, activeCanvas],
    maxScale, minScaleV, minScaleH );
}

//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
  if (validateCanvasSize())
  {
    skyUpdateTimer = skyUpdateFreq;
    effectsUpdateTimer = effectsUpdateFreq;
    plantsUpdateTimer = plantsUpdateFreq;

    sky.reset();
    terrain.reset();
  }

  //update the current time of day.
  dayTimer += GameLoop.deltaTime;
  if (dayTimer > dayDur)
  {
    dayTimer = 0;
  }

  var prevTod = tod;
  tod = dayTimer / dayDur;

  //update the wind
  wind.update( dayDur );

  //update the sky. If it needs it.
  skyUpdateTimer += GameLoop.deltaTime;
  if (skyUpdateTimer > skyUpdateFreq)
  {
    skyUpdateTimer = 0;

    sky.updateAndDraw( tod, wind.str );

    //darken the terrain and other bits
    tintMidground();
  }

  //update the effects
  effectsUpdateTimer += GameLoop.deltaTime;
  if (effectsUpdateTimer > effectsUpdateFreq)
  {
    effectsUpdateTimer = 0;

    effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
    terrain.updateAndDrawEffects(tod, effectsCtx, effectsCanvas);
  }

  //update the plants
  var windStrDelta = Math.abs(lastPlantsUpdateWind - wind.str);
  var bPlantsNeedUpdating = windStrDelta > 0.0066;

  plantsUpdateTimer += GameLoop.deltaTime;
  if (bPlantsNeedUpdating && plantsUpdateTimer > plantsUpdateFreq)
  {
    plantsUpdateTimer = 0;
    lastPlantsUpdateWind = wind.str;

    activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
    PlantsManager.updateAndDrawPlants( tod, activeCtx, wind.str );
  }
}

function tintMidground()
{
  //TODO: wanna be able to tint it a bit with the sky gradient too!!!
  var darkenAmount = 85;
  var theFilter = 'brightness('+((100-darkenAmount) + (sky.brightness*darkenAmount))+'%)';

  terrainCanvas.style.filter = theFilter;
  effectsCanvas.style.filter = theFilter;
  plantsCanvas.style.filter = theFilter;
  activeCanvas.style.filter = theFilter;
}

//------------------------------------------------
//                    Mouse events
//------------------------------------------------
function onMouseDown()
{

}
