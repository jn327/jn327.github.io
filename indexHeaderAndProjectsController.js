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
  headerBtns = TopBar.addLinks( [ "About me", "Projects" ] );

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
  var projectsData =
  [
    {
      title     : "Frontier Developments - UI Developer - 2015 to 2018",
      subTitle  : "I Developed and maintained data driven UI elements from designs provided to me by our UI designers.<br>Implementation was done in Animate CC in Actionscript, my UI usually took in JSON data from a SetData(someData) call and displayed info based on this, granular updates where often supported with a setDataById function.<br>I also wrote a lot of test & example data in Lua to help Gameplay programmers with integrating and using my UI.",
      items  :
      [
        {
          title       : "Planet Coaster",
          image       : "images/projects/PlanCo.jpg",
          //bgImage     : "images/projects/PlanCo_firstFrame.jpg",
          //video       : "images/projects/PlanCo",
          videoFormats: ["webm","mp4"],
          description : ["Worked on from late pre production to post release.", "Developed the info panel, bottom HUD bar, scenario editor, park management, color picker, display sequencer, options menu and various other little bits."]
        },
        {
          title       : "Jurassic World Evolution",
          image       : "images/projects/Jwe.jpg",
          //bgImage     : "images/projects/Jwe_firstFrame.jpg",
          //video       : "images/projects/Jwe",
          videoFormats: ["webm","mp4"],
          description : ["Worked on from mid to late production. Developed the mission and contract UI, context sensitive info tooltip and front end saving, loading and options menus."]
        },
        {
          title       : "Planet Zoo",
          image       : "images/projects/PlanZoo.jpg",
          //bgImage     : "images/projects/PlanZoo_firstFrame.jpg",
          //video       : "images/projects/PlanZoo",
          videoFormats: ["webm","mp4"],
          description : ["Worked on from late pre production to early production, made some improvements to codebase, set up a few shared components and worked on early implementation of color picker and info panels."]
        }
      ]
    },
    {
      title     : "Unity Games",
      subTitle  : "I have a load of small Unity game projects on <a href='https://gamejolt.com/@Jn327/games' target='_blank' rel='noopener' >GameJolt</a> and <a href='https://jn327.itch.io/' target='_blank' rel='noopener' >Itch.io</a>, these are some of my favourites:",
      items     :
      [
        {
          title       : "Duel",
          image       : "images/projects/Duel.jpg",
          //bgImage     : "images/projects/Duel_firstFrame.jpg",
          //video       : "images/projects/Duel",
          videoFormats: ["webm","mp4"],
          description : ["One of 2 programmers for a small Unity game made with some friends.", "This one originally started out as a game jam game, we've since showcased it at a couple of gaming events."],
          link        : { url: "https://gamejolt.com/games/duel/305917", text: "Check it out" },
        },
        {
          title       : "Abandoned Earth",
          image       : "images/projects/AE.jpg",
          //bgImage     : "images/projects/AE_firstFrame.jpg",
          //video       : "images/projects/AE",
          videoFormats: ["webm","mp4"],
          description : ["Solo programmer for a Unity game made while a student."],
          link        : { url: "https://gamejolt.com/games/abandoned-earth/81441", text: "Check it out" },
        },
        {
          title       : "Space Hole Initiation Training",
          image       : "images/projects/SpaceHole.jpg",
          //bgImage     : "images/projects/3dPrinter_firstFrame.jpg",
          //video       : "images/projects/SpaceHole",
          videoFormats: ["webm","mp4"],
          description : ["One of 2 programmers for a 48h game jam (Brains Eden 2014).", "Made in Unity.", "This ended up being the winning game"],
          link        : { url: "https://gamejolt.com/games/space-hole-initiation-training/81466", text: "Check it out" },
        },
        {
          title       : "ToyBox",
          image       : "images/projects/Toybox.jpg",
          description : ["2nd year university video games development project, made in Unity.", "I was one of 3 programmers for this one and worked on the UI, the level falling apart, hooking up the animations and most of the pickups."],
          link        : { url: "https://gamejolt.com/games/toybox/81461", text: "Check it out" },
        },
        {
          title       : "Marching madness",
          image       : "images/projects/MarchingMadness.jpg",
          description : ["One of 2 programmers for a 48h games jam (Brains Eden 2015).", "This game is Lemmings but with terrible physics, made in Unity.", "I worked on the AI, the players dragging ability, tutorials and UI."],
          link        : { url: "https://gamejolt.com/games/marching-madness/167312", text: "Check it out" },
        }
      ]
    },
    {
      title   : "HTML Canvas experiments",
      items   :
      [
        {
          title       : "HTML 5 Canvas desert scene",
          image       : "images/projects/HTMLDesert.jpg",
          //bgImage     : "images/projects/HTMLDesert_firstFrame.jpg",
          //video       : "images/projects/HTMLDesert",
          videoFormats: ["webm","mp4"],
          description : ["Procedural scene made with HTML Canvas and javascript."],
          link        : { url: "pages/proceduralGarden.html", text: "Check it out" },
        },
        {
          title       : "HTML 5 Canvas particles",
          image       : "images/projects/HTMLParticles.jpg",
          description : ["Particles with HTML Canvas, mostly an excuse to mess with vector fields."],
          link        : { url: "pages/mouseParticles.html", text: "Check it out" },
        },
      ]
    },
    {
      title   : "Misc",
      items   :
      [
        {
          title       : "RichRap 3dr delta printer",
          image       : "images/projects/3dPrinter.jpg",
          //bgImage     : "images/projects/3dPrinter_firstFrame.jpg",
          //video       : "images/projects/3dPrinter",
          videoFormats: ["webm","mp4"],
          //imgFit      : "contain",
          description : ["Assembled a 3D printer and setup Marlin on an Arduino."]
        },
        {
          title       : "LED curtain",
          image       : "images/projects/Leds.jpg",
          //bgImage     : "images/projects/Leds_firstFrame.jpg",
          //video       : "images/projects/Leds",
          videoFormats: ["webm","mp4"],
          description : ["Connected around 1400 12v LEDs up to a Raspberry PI using fadeCandy boards to control the screen via web browser on the local network."],
          link        : { url: "https://twitter.com/JoshuaNewland/status/1036053996388134912", text: "More info" },
        },
        {
          title       : "2000 origami cranes",
          image       : "images/projects/Origami.jpg",
          description : ["Over 2000 origami cranes made over a few months."]
        },
        {
          title       : "2d procedural world",
          image       : "images/projects/ProceduralMap.jpg",
          description : ["Final year student project.", "Procedural 2d game world made in Unity."],
          link        : { url: "https://jn327.itch.io/2d-procedural-world", text: "More info" },
        },
        {
          title       : "Riosat.com",
          image       : "images/projects/Riosat.jpg",
          description : ["Wordpress website."],
          link        : { url: "https://riosat.com", text: "Check it out" },
        }
      ]
    }
  ];

  createProjectElements( "projectsScrollContainer", projectsData );
}

function createProjectElements( parentId, items )
{
  for (var i = 0; i < items.length; i++)
  {
    var itemData = items[i];

    var parent = document.getElementById(parentId);

    var gridContainer       = document.createElement('div');
    gridContainer.className = "gridContainer";
    parent.appendChild(gridContainer);

    if (itemData.title)
    {
      var theLabel          = document.createElement('p');
      theLabel.className    = "gridHeaderLabel";
      theLabel.textContent  = itemData.title;
      gridContainer.appendChild(theLabel);
    }

    if (itemData.subTitle)
    {
      var theLabel          = document.createElement('p');
      theLabel.className    = "gridSubHeaderLabel";
      theLabel.innerHTML    = itemData.subTitle;
      gridContainer.appendChild(theLabel);
    }

    var grid          =  document.createElement('ul');
    grid.className    = "projects-grid";
    gridContainer.appendChild(grid);

    var theData;
    var container;
    var img;
    var vid;
    var source;
    var label;
    var description;
    for (var j = 0; j < itemData.items.length; j++)
    {
      theData = itemData.items[j];

      container = document.createElement('li');

      if (theData.bgImage)
      {
        container.style.backgroundImage = "url('"+theData.bgImage+"')";
        if (theData.imgFit)
        {
          container.style.backgroundSize = theData.imgFit || "cover";
        }
      }

      if (theData.image)
      {
        img = document.createElement('img');
        img.className       = "projects-gridImage";
        img.src             = theData.image;
        img.alt             = "Image file not found: " +theData.image;
        img.style.objectFit = theData.imgFit || "cover";

        container.appendChild(img);
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
        container.appendChild(vid);

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

      if (theData.description)
      {
        for (var l = 0; l < theData.description.length; l++)
        {
          description = document.createElement('p');
          description.className     = "projects-gridDescription";
          description.textContent   = theData.description[l];
          container.appendChild(description);
        }
      }

      if (theData.link)
      {
        var spacerItem = document.createElement('div');
        spacerItem.className  = "projects-gridSpacer";
        container.appendChild(spacerItem);

        var linkItem = document.createElement('a');
        linkItem.className    = "standardButton";
        linkItem.href         = theData.link.url;
        linkItem.textContent  = theData.link.text;
        linkItem.target="_blank";
        linkItem.rel="noopener";
        linkItem.style.marginTop = "12px";
        linkItem.setAttribute('aria-label', theData.title);
        container.appendChild(linkItem);
      }

      grid.appendChild(container);
    }
  }
}

//we want to load in the projects after the javascript has loaded,
// otherwise the main javascript has to sit around and wait for the images
// before it gets its init() call from window.onload
CommonElementsCreator.addLoadEvent(initProjects);
CommonElementsCreator.addLoadEvent(initHeaders);
