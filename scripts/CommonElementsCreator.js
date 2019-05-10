var CommonElementsCreator = {};

CommonElementsCreator.createHeaderElement = function( selectedIndex, parentElement, rootLocation )
{
  if (parentElement == undefined)
  {
    parentElement = document.body;
  }
  if (selectedIndex == undefined)
  {
    selectedIndex = -1;
  }
  if (rootLocation == undefined)
  {
    rootLocation = '';
  }

  //start creating some elements
  var container = document.createElement('div');
  container.id = "headerContainer";
  parentElement.appendChild(container);

  var list = document.createElement('ul');
  list.id = 'headerList';
  container.appendChild(list);

  var headerLabels = [ "About me", "Projects" ];
  var headerLinks = [ "index", "projects" ];
  for (var i = 0; i < headerLabels.length; i++)
  {
    var headerItem = document.createElement('a');
    headerItem.className = i != selectedIndex ? 'headerLink' : 'headerLink-active';
    if (i != selectedIndex)
    {
      headerItem.href = rootLocation+headerLinks[i]+".html";
    }
    headerItem.textContent = headerLabels[i];

    list.appendChild(headerItem);
  }

  var imgList = document.createElement('ul');
  imgList.id = 'linksList';
  container.appendChild(imgList);

  var imgTitles = [ "Email me", "Linkedin", "Twitter",
    "BitBucket", "GitHub", "GameJolt", "ItchIo" ];
  var imgLinks = [ "mailto:joshuanewland33@gmail.com", "https://www.linkedin.com/in/jn327/", "https://twitter.com/JoshuaNewland",
    "https://bitbucket.org/Jn327/", "https://github.com/jn327",
    "https://gamejolt.com/@Jn327/games", "https://jn327.itch.io/" ];
  var imgSources = ["email", "linkedin", "twitter",
    "bitbucket", "github", "gamejolt", "itchio" ];
  for (var j = 0; j < imgLinks.length; j++)
  {
    var linkItem = document.createElement('a');
    linkItem.className = 'imageLink';
    linkItem.href = imgLinks[j];
    linkItem.target = '_blank';

    //<span class="tooltiptext">Tooltip text</span>
    var toolTipItem = document.createElement('span');
    toolTipItem.className = 'toolTip';
    toolTipItem.textContent = imgTitles[j];

    var imgItem = document.createElement('img');
    imgItem.className = 'imageLinkIcon';
    imgItem.src = (rootLocation+"images/"+imgSources[j]+".png");

    linkItem.appendChild(imgItem);
    linkItem.appendChild(toolTipItem);
    imgList.appendChild(linkItem);
  }
}

CommonElementsCreator.appendScipts = function( includes )
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

CommonElementsCreator.createCanvas = function( parentElement, className )
{
  if (parentElement == undefined)
  {
    parentElement = document.body;
  }

  if (className == undefined)
  {
    className = "fullFixed";
  }

  var canvas = document.createElement("canvas");
  canvas.className = className;
  document.body.insertBefore(canvas, parentElement.firstChild);

  return canvas;
}
