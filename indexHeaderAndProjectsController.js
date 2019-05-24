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
      bgImage     : "images/projects/PlanCo.jpg",
      video       : "images/projects/PlanCo",
      videoFormats: ["webm","mp4"],
      description : "UI developer"
    },
    {
      title       : "Jurassic World Evolution",
      bgImage     : "images/projects/Jwe.jpg",
      video       : "images/projects/Jwe",
      videoFormats: ["webm","mp4"],
      description : "UI developer"
    },
    {
      title       : "Planet Zoo",
      bgImage     : "images/projects/PlanZoo.jpg",
      video       : "images/projects/PlanZoo",
      videoFormats: ["webm","mp4"],
      description : "UI developer"
    }
  ];

  var gamesProjectsData =
  [
    {
      title       : "Duel",
      bgImage     : "images/projects/Duel.jpg",
      video       : "images/projects/Duel",
      videoFormats: ["webm","mp4"],
      description : "Programmer for a small game made with some friends",
      link        : "https://gamejolt.com/games/duel/305917"
    },
    {
      title       : "Abandoned Earth",
      bgImage     : "images/projects/AE.jpg",
      video       : "images/projects/AE",
      videoFormats: ["webm","mp4"],
      description : "Programmer for a game made while a student",
      link        : "https://gamejolt.com/games/abandoned-earth/81441"
    },
    {
      title       : "Space Hole Initiation Training",
      bgImage     : "images/projects/SpaceHole.jpg",
      video       : "images/projects/SpaceHole",
      videoFormats: ["webm","mp4"],
      description : "Programmer for the Brains Eden 2014 winning game",
      link        : "https://gamejolt.com/games/space-hole-initiation-training/81466"
    }
  ];

  var otherProjectsData =
  [
    {
      title       : "RichRap 3dr delta printer",
      bgImage     : "images/projects/3dPrinter.jpg",
      video       : "images/projects/3dPrinter",
      videoFormats: ["webm","mp4"],
      imgFit      : "contain",
      description : "Assembled 3D printer and setup Marlin on an Arduino."
    },
    {
      title       : "LED curtain",
      bgImage     : "images/projects/Leds.jpg",
      video       : "images/projects/Leds",
      videoFormats: ["webm","mp4"],
      description : "Connected some LED strips up to a Raspberry PI using fadeCandy boards to control the LEDs via web browser on the local network."
    },
    {
      title       : "HTML 5 Canvas",
      bgImage     : "images/projects/HTMLCanvas.jpg",
      video       : "images/projects/HTMLCanvas",
      videoFormats: ["webm","mp4"],
      description : "Procedural scene with HTML Canvas",
      link        : "pages/proceduralGarden.html"
    },
    {
      title       : "2000 origami cranes",
      bgImage     : "images/projects/Origami.jpg",
      description : "Lots of origami cranes"
    },
    {
      title       : "2d world map creator",
      bgImage     : "images/projects/ProceduralMap.jpg",
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
  var vid;
  var source;
  var label;
  var theParent;
  for (var j = 0; j < itemsData.length; j++)
  {
    theData = itemsData[j];

    container = document.createElement('li');

    if (theData.link)
    {
      var linkItem = document.createElement('a');
      linkItem.className  = "projects-gridLink";
      linkItem.href       = theData.link;
      linkItem.ariaLabel  = theData.title;
      container.appendChild(linkItem);
      theParent = linkItem;
    }
    else
    {
      theParent = container;
    }

    if (theData.bgImage)
    {
      container.style.backgroundImage = "url('"+theData.bgImage+"')";
      container.style.backgroundSize = theData.imgFit || "cover";
    }

    if (theData.image)
    {
      img = document.createElement('img');
      img.className       = "projects-gridImage";
      img.src             = theData.image;
      img.alt             = "Image file not found: " +theData.image;
      img.style.objectFit = theData.imgFit || "cover";
      theParent.appendChild(img);
    }

    if (theData.video)
    {
      vid = document.createElement('video');
      vid.className       = "projects-gridVideo";
      vid.autoplay        = "autoplay";
      vid.controls        = false;
      vid.loop            = true;
      vid.muted           = true;
      vid.playsinline     = true;
      vid.preload         = "none";
      vid.style.objectFit = theData.imgFit || "cover";
      theParent.appendChild(vid);

      if (theData.videoFormats)
      {
        for (var k = 0; k < theData.videoFormats.length; k++)
        {
          source = document.createElement('source');
          source.src   = theData.video+"."+theData.videoFormats[k];
          source.type  = "video/"+theData.videoFormats[k];

          vid.appendChild(source);
        }
      }
      else
      {
        vid.src = theData.video;
      }
    }

    label = document.createElement('p');
    label.className     = "projects-gridTitle";
    label.textContent   = theData.title;
    container.appendChild(label);

    grid.appendChild(container);
  }
}

//we want to load in the projects after the javascript has loaded,
// otherwise the main javascript has to sit around and wait for the images
// before it gets its init() call from window.onload
CommonElementsCreator.addLoadEvent(initProjects);
CommonElementsCreator.addLoadEvent(initHeaders);
