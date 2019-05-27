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
      headerElements[i].style.backgroundColor = 'hsla(' +hue +', ' +s +'%, 20%, 1)';
    }

    //grid headers
    var theIndex = 0;
    for (var j = 0; j < 3; j++)
    {
      var container = document.getElementById("gridContainer"+j);
      var header = document.getElementById("gridHeader"+j);

      container.style.backgroundImage = '';
      header.style.backgroundImage = '';

      container.style.backgroundColor = 'hsla(' +hue +', ' +s +'%, 16%, 1)';
      header.style.backgroundColor    = 'hsla(' +hue +', ' +s +'%, 24%, 1)';
    }

    var projectsHeader = document.getElementById("projectsHeader");
    projectsHeader.style.backgroundImage = '';
    projectsHeader.style.backgroundColor    = 'hsla(' +hue +', ' +s +'%, 30%, 1)';
  }
}

CommonElementsCreator.addLoadEvent( applyColorPalleteToHtml );
