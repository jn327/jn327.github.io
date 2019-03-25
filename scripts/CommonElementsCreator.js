function createHeaderElement( parentElement, selectedIndex, rootLocation )
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

  var headerLabels = [ "About me", "Projects", "Blog"];
  var headerLinks = [ "index", "projects", "blog"];
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

  var imgTitles = [ "Email me", "Have a look at my Linkedin", "I'm on Twitter, sometimes",
    "My BitBucket page", "You can also find me on GitHub",
    "I've some games on GameJolt", "I've got games on Itch.io" ];
  var imgLinks = [ "mailto:joshuanewland33@gmail.com", "https://www.linkedin.com/in/jn327/", "https://twitter.com/JoshuaNewland",
    "https://bitbucket.org/Jn327/", "https://github.com/jn327",
    "https://gamejolt.com/@Jn327/games", "https://jn327.itch.io/" ];
  var imgSources = ["email", "linkedin", "twitter",
    "bitbucket", "gitHub", "gamejolt", "itchio" ];
  for (var j = 0; j < imgLinks.length; j++)
  {
    var linkItem = document.createElement('a');
    linkItem.className = 'imageLink';
    linkItem.href = imgLinks[j];
    linkItem.target = '_blank';

    var imgItem = document.createElement('img');
    imgItem.className = 'imageLinkIcon';
    imgItem.src = (rootLocation+"images/"+imgSources[j]+".png");

    linkItem.appendChild(imgItem);
    imgList.appendChild(linkItem);
  }
}
