//HTML Elements
var bgCanvas, bgCtx;
var fgCanvas, fgCtx;

var todSliderInput;
var todLabel;
var dropdown;
var layoutIndex              = 0;
var nColumns                 = 5;
var spacing                  = 20;

var dayDur                   = 1;
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
    'Utils/Vector2d', 'Utils/MathEx', 'Utils/ColorUtil', 'Utils/AnimationCurve',
    'Utils/Gradient', 'Utils/EasingUtil', 'Utils/BezierUtil', 'Utils/TimingUtil', 'Utils/PathUtil',
    'GameLoop', 'CanvasScaler', 'GameObject',
    'Components/Canvas', 'Components/Slider', 'Components/Label', 'Components/DropDown'
  ];
  CommonElementsCreator.appendScripts(includes);
}

function start()
{
  initCanvas();
  createTodSlider();
  createLayoutOptions();

  //gradient
  bgGradient = new Gradient();
  bgGradient.addKeyFrame(0, [84, 108, 117]);
  bgGradient.addKeyFrame(1, [176, 213, 217]);

  var easingFunctions =
  [
    EasingUtil.easeNone,
    EasingUtil.easeInBack, EasingUtil.easeInQuad, EasingUtil.easeInSine, EasingUtil.easeInCirc,
    EasingUtil.easeInExpo, EasingUtil.easeInQuint, EasingUtil.easeInQuart, //EasingUtil.easeInBounce,
    EasingUtil.easeInCubic, EasingUtil.easeInElastic,
    EasingUtil.easeOutBack, EasingUtil.easeOutQuad, EasingUtil.easeOutSine, EasingUtil.easeOutCirc,
    EasingUtil.easeOutExpo, EasingUtil.easeOutQuint, EasingUtil.easeOutQuart, //EasingUtil.easeOutBounce,
    EasingUtil.easeOutCubic, EasingUtil.easeOutElastic,
    EasingUtil.easeInOutBack, EasingUtil.easeInOutQuad, EasingUtil.easeInOutSine, EasingUtil.easeInOutCirc,
    EasingUtil.easeInOutExpo, EasingUtil.easeInOutQuint, EasingUtil.easeInOutQuart, //EasingUtil.easeInOutBounce,
    EasingUtil.easeInOutCubic, EasingUtil.easeInOutElastic,
  ];

  for (var i = 0; i < easingFunctions.length; i++)
  {
    animCurves[i] = new AnimationCurve();
    animCurves[i].addKeyFrame(0, 0);
    animCurves[i].addKeyFrame(1, 1, easingFunctions[i]);
  }

  drawCurves();
}

function initCanvas()
{
  fgCanvas  = new Canvas().element;
  fgCtx     = fgCanvas.getContext('2d');

  bgCanvas  = new Canvas().element;
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
  var layout = getLayoutObject(l);
  var theCurve;
  var pos;
  var circleW = 5;
  var iN;
  for (var i = 0; i < l; i++)
  {
    iN = i/l;

    theCurve = animCurves[i];
    pos = getCurvePos(tod, theCurve, layout.offsetX, layout.avblWidth, layout.offsetY, layout.avblHeight);

    var curveVal = Math.clamp(theCurve.evaluate(tod), 0, 1);
    var theColor = bgGradient.evaluate(curveVal);
    fgCtx.fillStyle = "rgba(" +theColor[0] +"," +theColor[1] +"," +theColor[2] +", 0.75)";

    fgCtx.beginPath();
    fgCtx.arc(pos.x, pos.y, circleW, 0, 2 * Math.PI);
    fgCtx.fill();

    layout = updateLayoutObject(layout, i);
  }
}

function drawCurves()
{
  bgCtx.fillStyle = "rgba(168, 156, 136,1)";
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

  var theCurve;
  var iN;
  var l = animCurves.length;
  var layout = getLayoutObject(l);

  bgCtx.lineWidth = 2;

  for (var i = 0; i < l; i++)
  {
    theCurve = animCurves[i];

    //draw guides
    if (i == 0 || layoutIndex == 0)
    {
      bgCtx.beginPath();
      bgCtx.strokeStyle = "rgba(42, 54, 59, 0.15)";
      bgCtx.moveTo(layout.offsetX, layout.offsetY);
      bgCtx.lineTo(layout.offsetX, layout.offsetY + layout.avblHeight);
      bgCtx.lineTo(layout.offsetX + layout.avblWidth, layout.offsetY + layout.avblHeight);
      bgCtx.stroke();
      bgCtx.fillStyle = "rgba(42, 54, 59, 0.02)";
      bgCtx.fillRect(layout.offsetX, layout.offsetY, layout.avblWidth, layout.avblHeight);
    }

    iN = i/l;

    var gradientColor;
    var pos;
    var prevVal = new Vector2D(0,0);
    for (var t = 0; t <= 1; t+= curveStep)
    {
      pos = getCurvePos(t, theCurve, layout.offsetX, layout.avblWidth, layout.offsetY, layout.avblHeight);
      if (t != 0)
      {
        bgCtx.beginPath();

        var curveVal = Math.clamp(theCurve.evaluate(t), 0, 1);
        gradientColor = bgGradient.evaluate(curveVal);
        bgCtx.strokeStyle = "rgba("+gradientColor[0] +"," +gradientColor[1] +"," +gradientColor[2] +", 0.5)";

        bgCtx.moveTo(prevVal.x,prevVal.y);
        bgCtx.lineTo(pos.x,pos.y);
        bgCtx.stroke();
      }

      prevVal.x = pos.x
      prevVal.y = pos.y;
    }

    bgCtx.beginPath();
    gradientColor = bgGradient.evaluate(1);
    bgCtx.strokeStyle = "rgba("+gradientColor[0] +"," +gradientColor[1] +"," +gradientColor[2] +", 0.5)";

    pos = getCurvePos(1, theCurve, layout.offsetX, layout.avblWidth, layout.offsetY, layout.avblHeight);
    bgCtx.moveTo(prevVal.x,prevVal.y);
    bgCtx.lineTo(pos.x,pos.y);
    bgCtx.stroke();

    layout = updateLayoutObject(layout, i);
  }
}

function getLayoutInitialOffsetX()
{
  return bgCanvas.width * 0.25;
}

function getLayoutObject(nItems)
{
  var obj = {};

  obj.offsetX     = getLayoutInitialOffsetX();
  obj.avblWidth   = bgCanvas.width * 0.5;
  obj.offsetY     = bgCanvas.height * 0.2;
  obj.avblHeight  = bgCanvas.height * 0.6;

  if (layoutIndex == 0)
  {
    var nRows = nItems / nColumns;
    obj.avblWidth   = (obj.avblWidth - ((nColumns-1)*spacing))/nColumns;
    obj.avblHeight  = (obj.avblHeight - ((nRows-1)*spacing))/nRows;
  }

  return obj;
}

function updateLayoutObject(layout, i)
{
  if (layoutIndex == 0)
  {
    layout.offsetX += layout.avblWidth + spacing;
    if ((i+1) % nColumns == 0)
    {
      layout.offsetX = getLayoutInitialOffsetX();
      layout.offsetY += layout.avblHeight + spacing;
    }
  }
  return layout;
}

function getCurvePos(t, theCurve, offsetX, avblWidth, offsetY, avblHeight)
{
  return new Vector2D( offsetX+(t*avblWidth), offsetY+((1-theCurve.evaluate(t))*avblHeight) );
}

//------------------------------------------------
//                   sliders
//------------------------------------------------
function createTodSlider()
{
  //Create a slider!
  todSliderInput = new Slider(document.body, 0);
  todSliderInput.element.style.position = "absolute";
  todSliderInput.element.style.bottom   = "10px";
  todSliderInput.element.style.right    = "10px";

  todSliderInput.element.addEventListener('input', onTodSliderChange);

  todLabel = new Label(document.body, 0);
  todLabel.element.style.position = "absolute";
  todLabel.element.style.bottom   = "10px";
  todLabel.element.style.right    = "15px";
}

function onTodSliderChange()
{
  dayTimer = (todSliderInput.element.value / 100) * dayDur;
}

function updateTodSlider()
{
  todSliderInput.element.value = tod * 100;
  todLabel.element.innerText   = tod.toString();
}

// layout
function createLayoutOptions()
{
  //dropdown
  var theItems = ["Separate", "Joined"];
  dropdown = new DropDown(document.body, theItems, "Layout: ", undefined, true);
  dropdown.element.style.width = "160px";
  var dropDownItems = dropdown.items;

  for (var l = 0; l < dropDownItems.length; l++)
  {
    dropDownItems[l].addEventListener('click', bindClickToIndex(l));
  }

  function bindClickToIndex(i)
  {
    // have to wrap it in a closure as when adding event listeners javascript will
    //put them to one side then add them later on once the for loop is done and the value of of i has changed.
    //see https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
    return function() { setSelectedLayout(i); };
  }
}

function setSelectedLayout(i)
{
  dropdown.setSelectedIndex(i);
  dropdown.hideItemsContainer();

  if (layoutIndex != i)
  {
    layoutIndex = i;
    drawCurves();
  }
}
