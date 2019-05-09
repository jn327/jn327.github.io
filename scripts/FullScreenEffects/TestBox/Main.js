//HTML Elements
var bgCanvas, bgCtx;

var todSliderInput;
var dayDur                   = 45;
var dayTimer                 = dayDur * 0.5;
var tod                      = 0; //0-1

var animCurves              = [];
var curveStep               = 0.001;

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes =
  [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise', 'Utils/AnimationCurve',
    'Utils/EasingUtil', 'Utils/PathUtil', 'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject'
  ];
  CommonElementsCreator.appendScipts(includes);
}

function start()
{
  initCanvas();
  createTodSlider();

  //init curves
  animCurves[0] = new AnimationCurve();
  animCurves[0].addKeyFrame(0, 0);
  animCurves[0].addKeyFrame(1, 1, EasingUtil.easeInExpo);

  animCurves[1] = new AnimationCurve();
  animCurves[1].addKeyFrame(0, 0);
  animCurves[1].addKeyFrame(1, 1, EasingUtil.easeInOutSine);

  animCurves[2] = new AnimationCurve();
  animCurves[2].addKeyFrame(0, 0.5);
  animCurves[2].addKeyFrame(1, 1, EasingUtil.easeNone);

  animCurves[3] = new AnimationCurve();
  animCurves[3].addKeyFrame(0, 0);
  animCurves[3].addKeyFrame(0.5, 1, EasingUtil.easeInSine);
  animCurves[3].addKeyFrame(1, 0, EasingUtil.easeOutSine);
  drawCurves();
}

function initCanvas()
{
  bgCanvas  = CommonElementsCreator.createCanvas();
  bgCtx     = bgCanvas.getContext('2d');

  validateCanvasSize();
}

function validateCanvasSize()
{
  var maxScale = 600;
  var minScaleV = 600;
  var minScaleH = 400;

  return CanvasScaler.updateCanvasSize( [bgCanvas],
    maxScale, minScaleV, minScaleH );
}

//------------------------------------------------
//                    Update
//------------------------------------------------
function update()
{
  if (validateCanvasSize())
  {
    //anything canvas size change related..
    drawCurves();
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

  //draw points on anim curve for t.
}

function drawCurves()
{
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  var theCurve;
  var iN;
  var l = animCurves.length;

  for (var i = 0; i < l; i++)
  {
    theCurve = animCurves[i];

    iN = i/l;

    bgCtx.strokeStyle = "hsl("+ (iN * 360) +",80%,50%)";
    bgCtx.lineWidth = 3;

    bgCtx.beginPath();

    for (var t = 0; t <= 1; t+= curveStep)
    {
      moveToT(t, theCurve);
    }
    moveToT(1, theCurve);

    bgCtx.stroke();
  }
}

function moveToT(t, theCurve)
{
  var x = t * bgCanvas.width;
  //1-val because canvas starts at top left and we want to draw from bottom left
  var y = (1 - theCurve.evaluate(t)) * bgCanvas.height;

  if (t == 0)
  {
    bgCtx.moveTo(x,y);
  }
  else
  {
    bgCtx.lineTo(x,y);
  }
}

//------------------------------------------------
//                   sliders
//------------------------------------------------
function createTodSlider()
{
  //Create a slider!
  /* <div class="slidercontainer">
    <input type="range" min="0" max="1" value="0" class="slider" id="todSlider">
  </div> */
  var parentElement             = document.body;
  var sliderContainerDiv        = document.createElement('div');
  sliderContainerDiv.className  = "todSliderContainer";
  parentElement.appendChild( sliderContainerDiv );

  todSliderInput            = document.createElement('input');
  todSliderInput.type       = "range";
  todSliderInput.min        = 0;
  todSliderInput.max        = 100;
  todSliderInput.value      = 0;
  todSliderInput.className  = "todSlider";
  sliderContainerDiv.appendChild( todSliderInput );
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
