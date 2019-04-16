var ScriptIncluder = {};

ScriptIncluder.appendScipts = function( includes )
{
  var l = includes.length;
  var theScript;
  for (var i = 0; i < l; i++ )
  {
    theScript = document.createElement('script');
    theScript.src = 'scripts/'+includes[i]+'.js';
    document.head.appendChild(theScript);
  }
}
