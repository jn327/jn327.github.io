var CommonElementsCreator = {};
CommonElementsCreator.defaultHeaderParent = document.body;
CommonElementsCreator.defaultCanvasParent = document.body;

CommonElementsCreator.createHeaderElement = function( rootLocation, parentElement )
{
  if (parentElement == undefined)
  {
    parentElement = this.defaultHeaderParent;
  }
  if (rootLocation == undefined)
  {
    rootLocation = '';
  }

  var pathName = window.location.pathname;
  var bIndex = pathName == "/index.html" || pathName == "/" || pathName == "" || pathName == "index.html"
    || (pathName.length > 11 && pathName.substr(pathName.length - 11) == "/index.html");

  //start creating some elements
  var container = document.createElement('div');
  container.id = "headerContainer";
  parentElement.appendChild(container);

  var list = document.createElement('ul');
  list.id = 'headerList';
  container.appendChild(list);

  if (!bIndex)
  {
    var headerItem = document.createElement('a');
    headerItem.className = 'headerLink';
    headerItem.href = "../index.html";
    headerItem.textContent = "Home";
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

CommonElementsCreator.addLinksToHeader = function( labels, selectedIndex )
{
  if (selectedIndex == undefined)
  {
    selectedIndex = -1;
  }

  var list = document.getElementById("headerList");
  var headerItem;
  var headerItems = [];
  for (var i = 0; i < labels.length; i++)
  {
    headerItem = document.createElement('a');
    headerItem.className = i != selectedIndex ? 'headerLink' : 'headerLink-active';
    headerItem.textContent = labels[i];

    list.appendChild(headerItem);
    headerItems.push(headerItem);
  }

  return headerItems
}

CommonElementsCreator.appendScripts = function( includes, rootLocation )
{
  if (rootLocation == undefined)
  {
    rootLocation = '';
  }

  var l = includes.length;
  var theScript;
  for (var i = 0; i < l; i++ )
  {
    theScript = document.createElement('script');
    theScript.src = rootLocation+'scripts/'+includes[i]+'.js';
    document.head.appendChild(theScript);
  }
}

CommonElementsCreator.createCanvas = function( parentElement, className )
{
  if (parentElement == undefined)
  {
    parentElement = this.defaultCanvasParent;
  }

  if (className == undefined)
  {
    className = "defaultCanvas";
  }

  var canvas = document.createElement("canvas");
  canvas.className = className;
  parentElement.insertBefore(canvas, parentElement.firstChild);

  return canvas;
}
