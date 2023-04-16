//HTML Elements
var skyCanvas, skyCtx;
var nebulaCanvas, nebulaCtx;
var starsCanvases = [];
var starsCtxs = [];
var cloudsCanvas, cloudsCtx;
var terrainCanvas, terrainCtx;
var effectsCanvas, effectsCtx;
var plantsCanvas, plantsCtx;
var activePlantsCanvas, activePlantsCtx;
var creatureCanvas, creatureCtx;

var canvasToUpdate;

var skyUpdateFreq            = 0.04;
var skyUpdateTimer           = skyUpdateFreq;
var effectsUpdateFreq        = 0.04;
var effectsUpdateTimer       = effectsUpdateFreq;
var plantsUpdateFreq         = 0.066;
var plantsUpdateTimer        = plantsUpdateFreq;
var creatureUpdateFreq       = 0.05;
var creatureUpdateTimer      = creatureUpdateFreq;

var todSliderInput;
var dayDur                   = 45;
var dayTimer                 = dayDur * 0.5;
var tod                      = 0; //0-1

var sky;
var wind;
var terrain;

var lastPlantsUpdateWind    = Number.MAX_VALUE;

var darkenAmount = 85;
var lastUpdateBrightnessVal = Number.MAX_VALUE;

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes =
  [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise', 'Utils/AnimationCurve',
    'Utils/BezierUtil',
    'Utils/Gradient', 'Utils/EasingUtil', 'Utils/TimingUtil', 'Utils/PathUtil', 'Utils/PeriodicFunctions',
    'GameLoop', 'CanvasScaler', 'GameObject',
    'Components/Canvas', 'Components/Slider',
    'FullScreenEffects/ProceduralGarden/Sun', 'FullScreenEffects/ProceduralGarden/Moon',
    'FullScreenEffects/ProceduralGarden/Sky', 'FullScreenEffects/ProceduralGarden/Terrain',
    'FullScreenEffects/ProceduralGarden/Cloud', 'FullScreenEffects/ProceduralGarden/CloudsManager',
    'FullScreenEffects/ProceduralGarden/Plants', 'FullScreenEffects/ProceduralGarden/PlantsManager',
    'FullScreenEffects/ProceduralGarden/Stars', 'FullScreenEffects/ProceduralGarden/StarsManager',
    'FullScreenEffects/ProceduralGarden/Creatures', 'FullScreenEffects/ProceduralGarden/CreatureManager',
    'FullScreenEffects/ProceduralGarden/River', 'FullScreenEffects/ProceduralGarden/Wind'
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  initCanvas();
  createTodSlider();

  sky     = new Sky();
  terrain = new Terrain();
  wind    = new Wind();

  sky.init( dayDur, skyCtx, skyCanvas, nebulaCanvas, nebulaCtx, starsCanvases, starsCtxs, cloudsCanvas, cloudsCtx );
  terrain.init( terrainCtx, terrainCanvas, plantsCtx );

  CreatureManager.init( creatureCanvas, terrain );
}

function initCanvas()
{
  activePlantsCanvas  = new Canvas().element;
  activePlantsCtx     = activePlantsCanvas.getContext('2d');

  plantsCanvas        = new Canvas().element;
  plantsCtx           = plantsCanvas.getContext('2d');

  creatureCanvas      = new Canvas().element;
  creatureCtx         = creatureCanvas.getContext('2d');

  effectsCanvas       = new Canvas().element;
  effectsCtx          = effectsCanvas.getContext('2d');

  terrainCanvas       = new Canvas().element;
  terrainCtx          = terrainCanvas.getContext('2d');

  cloudsCanvas        = new Canvas().element;
  cloudsCtx           = cloudsCanvas.getContext('2d');

  var nStarCanvases = 4;
  var newCanvas;
  for (var i = 0; i < nStarCanvases; i++)
  {
    newCanvas = new Canvas().element;
    starsCanvases.push( newCanvas );
    starsCtxs.push( newCanvas.getContext('2d') );
  }

  nebulaCanvas        = new Canvas().element;
  nebulaCtx           = nebulaCanvas.getContext('2d');

  skyCanvas           = new Canvas().element;
  skyCtx              = skyCanvas.getContext('2d', { alpha: false });

  canvasToUpdate = [skyCanvas, nebulaCanvas, cloudsCanvas, terrainCanvas, effectsCanvas, creatureCanvas, plantsCanvas, activePlantsCanvas];
  for (var i = 0; i < starsCanvases.length; i++)
  {
    canvasToUpdate.push(starsCanvases[i]);
  }

  validateCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  var maxScale = 600;
  var minScaleV = 600;
  var minScaleH = 400;

  return CanvasScaler.updateCanvasSize( canvasToUpdate, maxScale, minScaleV, minScaleH );
}

function onWindowResize()
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
}


//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
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
  var brightnessVal = ((100-darkenAmount) + (sky.brightness*darkenAmount));

  var brightnessDiff = Math.abs(lastUpdateBrightnessVal - brightnessVal);
  if ( brightnessDiff >= 1 )
  {
    var theFilter = 'brightness('+brightnessVal+'%)';

    terrainCanvas.style.filter = theFilter;
    effectsCanvas.style.filter = theFilter;
    plantsCanvas.style.filter = theFilter;
    activePlantsCanvas.style.filter = theFilter;

    lastUpdateBrightnessVal = brightnessVal;
  }
}

//------------------------------------------------
//                   sliders
//------------------------------------------------
function createTodSlider()
{
  //Create a slider!
  todSliderInput = new Slider(document.body, 0)
  todSliderInput.element.style.position = "absolute";
  todSliderInput.element.style.bottom   = "10px";
  todSliderInput.element.style.right    = "10px";

  todSliderInput.element.addEventListener('input', onTodSliderChange);
}

function onTodSliderChange()
{
  dayTimer = (todSliderInput.element.value / 100) * dayDur;
}

function updateTodSlider()
{
  var currTod = tod * 100;
  var todDiff = Math.abs(todSliderInput.element.value - currTod);
  if ( todDiff >= 1 )
  {
    todSliderInput.element.value = currTod;
  }
}
