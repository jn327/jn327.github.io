var headerIds = ["about", "projects"];
var headerElements = [];
var headerBtns = [];
var closeBtn;

var visHeaderItemIndex = -1;
var noHeaderHash = "#clear";
var currUrlHash = window.location.hash;
var urlHeaderIndex = (currUrlHash == noHeaderHash) ? -1 : 0;

function initHeaders()
{
  for (var k = 0; k < headerIds.length; k++)
  {
    headerElements.push ( document.getElementById(headerIds[k]) );

    var closeBtn = document.getElementById("close-"+headerIds[k]);
    closeBtn.addEventListener( "click", function() { onHeaderCloseButton() } );

    if ( currUrlHash != "" )
    {
      var hashedId = "#"+headerIds[k];
      if (hashedId == currUrlHash)
      {
        urlHeaderIndex = k;
      }
    }
  }

  //creating the header
  headerBtns = CommonElementsCreator.addLinksToHeader( [ "About me", "Projects" ] );

  //set the selected item.
  setSelectedHeaderItem(urlHeaderIndex);

  //listeners for header buttons
  for (var i = 0; i < headerBtns.length; i++)
  {
    headerBtns[i].addEventListener( "click", bindClickToIndex(i) );
  }
}

function bindClickToIndex(i)
{
  // have to wrap it in a closure as when adding event listeners javascript will
  //put them to one side then add them later on once the for loop is done and the value of of i has changed.
  //see https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
  return function() { setSelectedHeaderItem(i); };
}

function onHeaderCloseButton()
{
  setSelectedHeaderItem(-1);
}

function setSelectedHeaderItem( index )
{
  if (index == visHeaderItemIndex)
  {
    index = -1;
    //return;
  }
  window.location.hash = index >= 0 ? "#"+headerIds[index] : noHeaderHash

  canvasContainer.className = index >= 0 ? "blurred" : "toBlur";

  visHeaderItemIndex = index;
  for (var j = 0; j < headerElements.length; j++)
  {
    headerElements[j].className = (j == index) ? 'labelsContainer-active' : 'labelsContainer';
    headerBtns[j].className = (j == index) ? "headerLink-active" : "headerLink";
  }
}

function initProjects()
{
  //Creating project elements
  var aaaProjectsData =
  [
    {
      title       : "Planet Coaster",
      image       : "images/projects/PlanCo.gif",
      bgImage     : "images/projects/PlanCo.jpeg",
      description : "UI developer"
    },
    {
      title       : "Jurassic World Evolution",
      image       : "images/projects/Jwe.gif",
      bgImage     : "images/projects/Jwe.jpeg",
      description : "UI developer"
    },
    {
      title       : "Planet Zoo",
      image       : "images/projects/PlanZoo.gif",
      bgImage     : "images/projects/PlanZoo.jpeg",
      description : "UI developer"
    }
  ];

  var gamesProjectsData =
  [
    {
      title       : "Duel",
      image       : "images/projects/Duel.gif",
      bgImage     : "images/projects/Duel.jpeg",
      description : "Programmer for a small game made with some friends",
      link        : "https://gamejolt.com/games/duel/305917"
    },
    {
      title       : "Abandoned Earth",
      image       : "images/projects/AE.gif",
      bgImage     : "images/projects/AE.jpeg",
      description : "Programmer for a game made while a student",
      link        : "https://gamejolt.com/games/abandoned-earth/81441"
    },
    {
      title       : "Space Hole Initiation Training",
      image       : "images/projects/SpaceHole.gif",
      bgImage     : "images/projects/SpaceHole.jpeg",
      description : "Programmer for the Brains Eden 2014 winning game",
      link        : "https://gamejolt.com/games/space-hole-initiation-training/81466"
    }
  ];

  var otherProjectsData =
  [
    {
      title       : "RichRap 3dr delta printer",
      image       : "images/projects/3dPrinter.gif",
      bgImage     : "images/projects/3dPrinter.jpeg",
      imgFit      : "contain",
      description : "Assembled 3D printer and setup Marlin on an Arduino."
    },
    {
      title       : "LED curtain",
      image       : "images/projects/Leds.gif",
      bgImage     : "images/projects/Leds.jpeg",
      description : "Connected some LED strips up to a Raspberry PI using fadeCandy boards to control the LEDs via web browser on the local network."
    },
    {
      title       : "HTML 5 Canvas",
      image       : "images/projects/HTMLCanvas.gif",
      bgImage     : "images/projects/HTMLCanvas.jpeg",
      description : "Procedural scene with HTML Canvas",
      link        : "pages/proceduralGarden.html"
    },
    {
      title       : "2000 origami cranes",
      image       : "images/projects/Origami.png",
      description : "Lots of origami cranes"
    },
    {
      title       : "2d world map creator",
      image       : "images/projects/ProceduralMap.png",
      description : "Procedural map creator",
      link        : "https://jn327.itch.io/2d-procedural-world"
    }
  ];

  createProjectElements( "otherProjectsGrid", otherProjectsData );
  createProjectElements( "gamesProjectsGrid", gamesProjectsData )
  createProjectElements( "aaaProjectsGrid", aaaProjectsData );
}

function createProjectElements( gridId, itemsData )
{
  var grid = document.getElementById(gridId);

  var theData;
  var container;
  var img;
  var label;
  var imageParent;
  for (var j = 0; j < itemsData.length; j++)
  {
    theData = itemsData[j];

    container = document.createElement('li');
    //container.textContent = theData.title;

    if (theData.link)
    {
      var linkItem = document.createElement('a');
      linkItem.href = theData.link;
      container.appendChild(linkItem);
      imageParent = linkItem;
    }
    else
    {
      imageParent = container;
    }

    img = document.createElement('img');
    img.src = theData.image;
    img.alt = "Image file not found: " +theData.image;
    img.style.objectFit = theData.imgFit || "cover";
    imageParent.appendChild(img);

    label = document.createElement('p');
    label.textContent = theData.title;
    imageParent.appendChild(label);

    if (theData.bgImage)
    {
      img.style.backgroundImage = "url('"+theData.bgImage+"')";
      img.style.backgroundSize = theData.imgFit || "cover";
    }

    grid.appendChild(container);
  }
}

//we want to load in the projects after the javascript has loaded,
// otherwise the main javascript has to sit around and wait for the images
// before it gets its init() call from window.onload
CommonElementsCreator.addLoadEvent(initProjects);
CommonElementsCreator.addLoadEvent(initHeaders);
