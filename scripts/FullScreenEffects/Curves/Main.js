//HTML Elements
var bgCanvas, bgCtx;
var fgCanvas, fgCtx;

var todSliderInput;
var dayDur                   = 45;
var dayTimer                 = dayDur * 0.5;
var tod                      = 0; //0-1

var animCurves              = [];
var curveStep               = 0.001;

var bgGradient;

//------------------------------------------------
//                    Start
//------------------------------------------------
init();
function init()
{
  var includes =
  [
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/SimplexNoise', 'Utils/AnimationCurve',
    'Utils/Gradient', 'Utils/EasingUtil', 'Utils/TimingUtil', 'Utils/PathUtil',
    'GameLoop', 'MouseTracker', 'CanvasScaler', 'GameObject'
  ];
  CommonElementsCreator.appendScripts(includes, "../");
}

function start()
{
  initCanvas();
  createTodSlider();

  //gradient
  bgGradient = new Gradient();
  bgGradient.addKeyFrame(0, [198, 0, 0]);
  bgGradient.addKeyFrame(0.5, [0, 52, 198], EasingUtil.easeInExpo);
  bgGradient.addKeyFrame(1, [0, 198, 122]);

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

  animCurves[4] = new AnimationCurve();
  animCurves[4].addKeyFrame(0, 0);
  animCurves[4].addKeyFrame(0.25, 1, EasingUtil.easeInSine);
  animCurves[4].addKeyFrame(0.5, 0, EasingUtil.easeOutSine);
  animCurves[4].addKeyFrame(0.75, 1, EasingUtil.easeInSine);
  animCurves[4].addKeyFrame(1, 0, EasingUtil.easeOutSine);
  drawCurves();
}

function initCanvas()
{
  fgCanvas  = CommonElementsCreator.createCanvas();
  fgCtx     = fgCanvas.getContext('2d');

  bgCanvas  = CommonElementsCreator.createCanvas();
  bgCtx     = bgCanvas.getContext('2d');

  validateCanvasSize();
  window.addEventListener( "resize", TimingUtil.debounce(onWindowResize, 250) );
}

function validateCanvasSize()
{
  return CanvasScaler.updateCanvasSize( [bgCanvas, fgCanvas] );
}

function onWindowResize()
{
    if (validateCanvasSize())
    {
      //anything canvas size change related..
      drawCurves();
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

  //draw points on anim curve for t.
  fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

  var l = animCurves.length;
  var theCurve;
  var pos;
  var circleW = 10;
  for (var i = 0; i < l; i++)
  {
    theCurve = animCurves[i];
    pos = getCurvePos(tod, theCurve);

    var theColor = bgGradient.evaluate(1 - (pos.y / fgCanvas.height));
    fgCtx.fillStyle = "rgba(" +theColor[0] +"," +theColor[1] +"," +theColor[2] +", 0.5)";

    fgCtx.beginPath();
    fgCtx.arc(pos.x, pos.y, circleW, 0, 2 * Math.PI);
    fgCtx.fill();

  }
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

    bgCtx.strokeStyle = "hsl("+ (iN * 360) +", 100%, 40%)";
    bgCtx.lineWidth = 2;

    bgCtx.beginPath();

    var pos;
    for (var t = 0; t <= 1; t+= curveStep)
    {
      pos = getCurvePos(t, theCurve);
      if (t == 0)
      {
        bgCtx.moveTo(pos.x,pos.y);
      }
      else
      {
        bgCtx.lineTo(pos.x,pos.y);
      }
    }

    pos = getCurvePos(1, theCurve);
    bgCtx.lineTo(pos.x,pos.y);

    bgCtx.stroke();
  }
}

function getCurvePos(t, theCurve)
{
  return new Vector2D(t * bgCanvas.width, (1 - theCurve.evaluate(t)) * bgCanvas.height);
}

//------------------------------------------------
//                   sliders
//------------------------------------------------
function createTodSlider()
{
  //Create a slider!
  var parentElement         = document.body;

  todSliderInput            = document.createElement('input');
  todSliderInput.type       = "range";
  todSliderInput.min        = 0;
  todSliderInput.max        = 100;
  todSliderInput.value      = 0;
  todSliderInput.className  = "slider";
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
