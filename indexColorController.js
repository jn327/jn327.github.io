function applyColorPalleteToHtml()
{
  ColorUtil.setGlobalColorPallete( ColorUtil.generateColorPallete( 3, 10 ) );

  if (ColorUtil.golbalColorPallete.length > 0 && ColorUtil.golbalColorPallete != undefined)
  {
    var l          = 50;

    var bgColor    = ColorUtil.golbalColorPallete[ColorUtil.golbalColorPallete.length-1];
    var bgHue      = bgColor[0];
    var bgS        = bgColor[1];

    document.body.style.backgroundColor = 'hsla(' +bgHue +', ' +bgS +'%, ' +l +'%, 1)';

    var elColor    = ColorUtil.golbalColorPallete[ColorUtil.golbalColorPallete.length-2];
    var elHue      = elColor[0];
    var elS        = elColor[1];
    for( var i = 0; i < headerElements.length; i++ )
    {
      headerElements[i].style.backgroundColor = 'hsla(' +elHue +', ' +elS +'%, 16%, 1)';
    }

    //grid headers
    var theIndex = 0;
    for (var j = 0; j < 3; j++)
    {
      var container = document.getElementById("gridContainer"+j);
      var header = document.getElementById("gridHeader"+j);

      /*var leftColor   = ColorUtil.golbalColorPallete[theIndex];
      var lHue        = leftColor[0];
      var lS          = leftColor[1];*/
      theIndex ++;
      var rightColor  = ColorUtil.golbalColorPallete[theIndex];
      var rHue        = rightColor[0];
      var rS          = rightColor[1];
      theIndex++;

      container.style.backgroundImage = '';
      header.style.backgroundImage = '';

      //container.style.backgroundColor = 'hsla(' +lHue +', ' +lS +'%, ' +l +'%, 0.33)';
      //header.style.backgroundColor    = 'hsla(' +lHue +', ' +lS +'%, ' +l +'%, 1)';
      container.style.backgroundColor = 'hsla(' +rHue +', ' +rS +'%, ' +l +'%, 0.33)';
      header.style.backgroundColor    = 'hsla(' +rHue +', ' +rS +'%, ' +l +'%, 1)';
    }
  }
}
CommonElementsCreator.addLoadEvent( applyColorPalleteToHtml );
