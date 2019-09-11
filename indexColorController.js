function applyColorPalleteToHtml()
{
  ColorUtil.setGlobalColorPallete( ColorUtil.generateColorPallete( 3, 30 ) );

  if (ColorUtil.golbalColorPallete.length > 0 && ColorUtil.golbalColorPallete != undefined)
  {
    var color    = ColorUtil.golbalColorPallete[ColorUtil.golbalColorPallete.length-2];
    var hue      = color[0];
    var s        = color[1];
    for( var i = 0; i < headerElements.length; i++ )
    {
      headerElements[i].style.backgroundColor = 'hsla(' +hue +', ' +s +'%, 90%, 1)';
    }
  }
}

CommonElementsCreator.addLoadEvent( applyColorPalleteToHtml );
