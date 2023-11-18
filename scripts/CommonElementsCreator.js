var CommonElementsCreator = {};
CommonElementsCreator.defaultTopBarParent = document.body;
CommonElementsCreator.defaultCanvasParent = document.body;
CommonElementsCreator.rootLocation;
CommonElementsCreator.addedStyles = [];
CommonElementsCreator.addedScripts = [];

CommonElementsCreator.addLoadEvent = function(func)
{
  var oldonload = window.onload;
  if (typeof window.onload != 'function')
  {
    window.onload = func;
  }
  else
  {
    window.onload = function()
    {
      if (oldonload)
      {
        oldonload();
      }
      func();
    }
  }
}

CommonElementsCreator.addFonts = function( theFonts )
{
    var l = theFonts.length;
    var theLink;
    for (var i = 0; i < l; i++ )
    {
      theLink = document.createElement('link');
      theLink.href = theFonts[i];
      theLink.rel = "stylesheet";
      document.head.appendChild(theLink);
    }
}

CommonElementsCreator.addStyles = function( theCss )
{
  var rootLocation = this.getRootLocation();

  l = theCss.length;
  for (var i = 0; i < l; i++ )
  {
    //Only add this style if it's not already been added!
    if ( CommonElementsCreator.addedStyles.includes(theCss[i]) == false )
    {
      theLink = document.createElement('link');
      theLink.href = rootLocation +"styles/" +theCss[i] +".css";
      theLink.rel = "stylesheet";
      document.head.appendChild(theLink);

      CommonElementsCreator.addedStyles.push( theCss[i] );
    }
    else
    {
      console.log(rootLocation +"styles/" +theCss[i]+".css has already been added, we won't add this again.")
    }
  }
}

CommonElementsCreator.getRootLocation = function()
{
  var rootLocation = CommonElementsCreator.rootLocation;
  if (rootLocation == undefined)
  {
    rootLocation = "";
  }
  else
  {
    return rootLocation;
  }

  if (window.location.protocol == "file:")
  {
    //TODO: Find a better way to get this, if we change folder location this breaks.
    // using "" breaks if we go into a sub page.
    rootLocation = "C:/Users/joshu/Documents/jn327.github.io/";
  }
  else
  {
    var pathname = window.location.pathname;
    var res = pathname.match(new RegExp("/", "gi")) || [];
    var currDepth = res.length;

    for (var i = 1; i < currDepth; i++)
    {
      rootLocation += "../";
    }
  }

  CommonElementsCreator.rootLocation = rootLocation;
  return rootLocation;
}

CommonElementsCreator.appendScripts = function( includes )
{
  var rootLocation = this.getRootLocation();

  var l = includes.length;
  var theScript;
  for (var i = 0; i < l; i++ )
  {
    if ( CommonElementsCreator.addedScripts.includes(includes[i]) == false )
    {
      theScript = document.createElement('script');
      theScript.src = rootLocation+'scripts/'+includes[i]+'.js';
      document.head.appendChild(theScript);
    }
    else
    {
      console.log(rootLocation+'scripts/'+includes[i]+".js has already been added, we won't add this again.")
    }
  }
}

CommonElementsCreator.addFonts( ["https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap"] )
CommonElementsCreator.addStyles( ["shared"] );
