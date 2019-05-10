//HTML Elements
var skyCanvas, skyCtx;
var terrainCanvas, terrainCtx;
var effectsCanvas, effectsCtx;
var plantsCanvas, plantsCtx;
var activePlantsCanvas, activePlantsCtx;
var creatureCanvas, creatureCtx;

var skyUpdateFreq            = 0.033;
var skyUpdateTimer           = skyUpdateFreq;
var effectsUpdateFreq        = 0.033;
var effectsUpdateTimer       = effectsUpdateFreq;
var plantsUpdateFreq         = 0.066;
var plantsUpdateTimer        = plantsUpdateFreq;
var creatureUpdateFreq       = 0.04;
var creatureUpdateTimer      = creatureUpdateFreq;

var todSliderInput;
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
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise', 'Utils/AnimationCurve',
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
  createTodSlider();

  sky     = new Sky();
  terrain = new Terrain();
  wind    = new Wind();

  sky.init( dayDur, skyCtx, skyCanvas );
  terrain.init( terrainCtx, terrainCanvas, plantsCtx );

  CreatureManager.init( creatureCanvas, terrain );
}

function initCanvas()
{
  activePlantsCanvas  = CommonElementsCreator.createCanvas();
  activePlantsCtx     = activePlantsCanvas.getContext('2d');

  plantsCanvas        = CommonElementsCreator.createCanvas();
  plantsCtx           = plantsCanvas.getContext('2d');

  creatureCanvas      = CommonElementsCreator.createCanvas();
  creatureCtx         = creatureCanvas.getContext('2d');

  effectsCanvas       = CommonElementsCreator.createCanvas();
  effectsCtx          = effectsCanvas.getContext('2d');

  terrainCanvas       = CommonElementsCreator.createCanvas();
  terrainCtx          = terrainCanvas.getContext('2d');

  skyCanvas           = CommonElementsCreator.createCanvas();
  skyCtx              = skyCanvas.getContext('2d');

  validateCanvasSize();
}

function validateCanvasSize()
{
  var maxScale = 600;
  var minScaleV = 600;
  var minScaleH = 400;

  return CanvasScaler.updateCanvasSize( [skyCanvas, terrainCanvas, effectsCanvas, creatureCanvas, plantsCanvas, activePlantsCanvas],
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

    CreatureManager.reset( creatureCanvas, terrain );
  }

  //update the current time of day.
  dayTimer += GameLoop.deltaTime;
  if (dayTimer > dayDur)
  {
    dayTimer = 0;
  }

  tod = dayTimer / dayDur;

  //update the slider
  updateTodSlider();

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

  //update the creatures...
  creatureUpdateTimer += GameLoop.deltaTime;
  if (creatureUpdateTimer > creatureUpdateFreq)
  {
    creatureUpdateTimer = 0;

    creatureCtx.clearRect(0, 0, creatureCanvas.width, creatureCanvas.height);
    CreatureManager.updateAndDraw( tod, creatureCtx, creatureCanvas, wind.str, sky.brightness, terrain );
  }

  //update the plants
  var windStrDelta = Math.abs(lastPlantsUpdateWind - wind.str);
  var bPlantsNeedUpdating = windStrDelta > 0.0066;

  plantsUpdateTimer += GameLoop.deltaTime;
  if (bPlantsNeedUpdating && plantsUpdateTimer > plantsUpdateFreq)
  {
    plantsUpdateTimer = 0;
    lastPlantsUpdateWind = wind.str;

    activePlantsCtx.clearRect(0, 0, activePlantsCanvas.width, activePlantsCanvas.height);
    PlantsManager.updateAndDrawPlants( tod, activePlantsCtx, wind.str );
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
  activePlantsCanvas.style.filter = theFilter;
}

//------------------------------------------------
//                   sliders
//------------------------------------------------
function createTodSlider()
{
  //Create a slider!
  // <input type="range" min="0" max="1" value="0" class="slider" id="todSlider">
  var parentElement         = document.body;
  
  todSliderInput            = document.createElement('input');
  todSliderInput.type       = "range";
  todSliderInput.min        = 0;
  todSliderInput.max        = 100;
  todSliderInput.value      = 0;
  todSliderInput.className  = "todSlider";
  parentElement.appendChild( todSliderInput );
  todSliderInput.addEventListener('input', onTodSliderChange);
}

function onTodSliderChange()
{
  dayTimer = (todSliderInput.value / 100) * dayDur;
}

function updateTodSlider()
{
  todSliderInput.value = tod * 100;
}

//------------------------------------------------
//                  Mouse events
//------------------------------------------------
function onMouseDown()
{

}
