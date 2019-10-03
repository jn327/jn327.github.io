//Make sure you have the common elements creator added!
var TopBar = {};
TopBar.init = function( parentElement )
{
  if (parentElement == undefined)
  {
    parentElement = CommonElementsCreator.defaultTopBarParent;
  }

  var rootLocation = CommonElementsCreator.getRootLocation();

  var pathName = window.location.pathname;
  var bIndex = pathName == "/index.html" || pathName == "/" || pathName == "" || pathName == "index.html"
    || (pathName.length > 11 && pathName.substr(pathName.length - 11) == "/index.html");

  //start creating the elements
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

TopBar.addLinks = function( labels, selectedIndex )
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

CommonElementsCreator.addStyles(["topBar"]);
CommonElementsCreator.addLoadEvent( TopBar.init );
