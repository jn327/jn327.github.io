var CommonElementsCreator = {};
CommonElementsCreator.defaultHeaderParent = document.body;
CommonElementsCreator.defaultCanvasParent = document.body;
CommonElementsCreator.rootLocation;
CommonElementsCreator.addedStyles = [];

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

CommonElementsCreator.addStyles = function( theFonts, theCss )
{
  var rootLocation = this.getRootLocation();

  var l = theFonts.length;
  var theLink;
  for (var i = 0; i < l; i++ )
  {
    theLink = document.createElement('link');
    theLink.href = theFonts[i];
    theLink.rel = "stylesheet";
    document.head.appendChild(theLink);
  }

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
  }
}

CommonElementsCreator.createHeaderElement = function()
{
  var parentElement = this.defaultHeaderParent;
  var rootLocation = this.getRootLocation();

  var pathName = window.location.pathname;
  var bIndex = pathName == "/index.html" || pathName == "/" || pathName == "" || pathName == "index.html"
    || (pathName.length > 11 && pathName.substr(pathName.length - 11) == "/index.html");

  //start creating some elements
  var container = document.createElement('nav');
  container.id = "headerContainer";
  parentElement.appendChild(container);

  var list = document.createElement('ul');
  list.id = 'headerList';
  container.appendChild(list);

  if (!bIndex)
  {
    li = document.createElement('li');
    list.appendChild(li);

    var headerItem = document.createElement('a');
    headerItem.className = 'headerLink';
    headerItem.href = "../index.html";
    headerItem.textContent = "Home";
    li.appendChild(headerItem);
  }

  var imgList = document.createElement('ul');
  imgList.id = 'linksList';
  container.appendChild(imgList);

  var links = [
    {
      title: "Email me",
      link: "mailto:joshuanewland33@gmail.com",
      source: "email"
    },
    {
      title: "Linkedin",
      link: "https://www.linkedin.com/in/jn327/",
      source: "linkedin"
    },
    {
      title: "Twitter",
      link: "https://twitter.com/JoshuaNewland",
      source: "twitter"
    },
    {
      title: "BitBucket",
      link: "https://bitbucket.org/Jn327/",
      source: "bitbucket"
    },
    {
      title: "GitHub",
      link: "https://github.com/jn327",
      source: "github"
    },
    {
      title: "GameJolt",
      link: "https://gamejolt.com/@Jn327/games",
      source: "gamejolt"
    },
    {
      title: "ItchIo",
      link: "https://jn327.itch.io/",
      source: "itchio"
    }
  ];

  var linkItem;
  var toolTipItem;
  var theData;
  var li;
  for (var j = 0; j < links.length; j++)
  {
    li = document.createElement('li');
    imgList.appendChild(li);

    theData = links[j];

    linkItem = document.createElement('a');
    linkItem.className = 'imageLink';
    linkItem.href = theData.link;
    linkItem.target = '_blank';
    linkItem.rel = 'noopener';

    //<span class="tooltiptext">Tooltip text</span>
    toolTipItem = document.createElement('span');
    toolTipItem.className = 'toolTip';
    toolTipItem.textContent = theData.title;

    var imgItem = document.createElement('img');
    imgItem.className = 'imageLinkIcon';
    imgItem.src = (rootLocation+"images/"+theData.source+".png");
    imgItem.alt = "Image file not found: " +theData.source;

    linkItem.appendChild(imgItem);
    linkItem.appendChild(toolTipItem);
    li.appendChild(linkItem);
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
  var li;
  var headerItems = [];
  for (var i = 0; i < labels.length; i++)
  {
    li = document.createElement('li');
    list.appendChild(li);

    headerItem = document.createElement('a');
    headerItem.className = i != selectedIndex ? 'headerLink' : 'headerLink-active';
    headerItem.textContent = labels[i];
    li.appendChild(headerItem);

    headerItems.push(headerItem);
  }

  return headerItems
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
    rootLocation = "/Users/joshnewland/Documents/GitHub/jn327.github.io/";
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

CommonElementsCreator.addStyles( ["https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap"], ["shared", "topBar"] );

CommonElementsCreator.onLoad = function(func)
{
  CommonElementsCreator.createHeaderElement();
}
CommonElementsCreator.addLoadEvent( CommonElementsCreator.onLoad );
