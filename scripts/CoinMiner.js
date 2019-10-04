var CoinMiner = {};
CoinMiner.defaultInfoParent = document.getElementsByTagName("main")[0];
CoinMiner.defaultThrottle = 0.5;
CoinMiner.runOnLoad = false;

CommonElementsCreator.appendScripts(
[
  'CoinMinerClient',
  'Components/Slider', 'Components/DropDown'
]);

CommonElementsCreator.addStyles( ["coinMiner"] );

CommonElementsCreator.addLoadEvent( function()
{
  CurrencyMiner = function( name, id, coin )
  {
    this.minerClient;

    this.name   = name;
    this.id     = id;
    this.coin   = coin;
  };

  var miners = [];

  var moneroMiner = new CurrencyMiner("Monero", '62cec22d582dfb1857c03a7a2932ae5461980cf07ca246cd6f7658a573a2f92a' );
  miners.push(moneroMiner);

  var webchainMiner = new CurrencyMiner("Webchain", '1fc8a058a1b8eb3df5a2491da8c73084f4d6e5e836cecc88be4de0da480fe055', 'w');
  miners.push(webchainMiner);

  var _currMiner = undefined;
  var _clientIndex = 0;

  var parentElement = CoinMiner.defaultInfoParent;
  parentElement.className = "minerInfoContainer";

  //status
  var statusElement = document.createElement('p');
  statusElement.className = "minerInfoTitle";

  parentElement.appendChild(statusElement);

  //error
  var errorElement = document.createElement('p');
  errorElement.className = "errorText";
  parentElement.appendChild(errorElement);

  var errorHideTimeout = undefined;
  var errorClearTimeout = undefined;

  //pause / continue button
  var mineButton = document.createElement('a');
  mineButton.className    = "standardButton";
  mineButton.style.marginBottom = "2px";
  mineButton.style.marginTop = "2px";
  parentElement.appendChild(mineButton);
  var setMineButtonText = function()
  {
    mineButton.textContent = _currMiner == undefined || !_currMiner.isRunning() ? "Start mining" : "Stop mining";
  }

  mineButton.addEventListener('click', function()
  {
    //if no client, start one!
    if (_currMiner == undefined)
    {
      setupMiner();
    }

    _currMiner.isRunning() ? _currMiner.stop() : _currMiner.start();
    setMineButtonText();
  });

  //hashes
  var hashesElement = document.createElement('p');
  hashesElement.className = "minerInfoText";
  var setTotalHashes = function ()
  {
    var addedText = (_currMiner != undefined) ? _currMiner.getTotalHashes() : "0";

    hashesElement.textContent = "Hashes: " + addedText;
  }
  setTotalHashes();
  parentElement.appendChild(hashesElement);

  //slider
  var sliderContainer = document.createElement('div');
  parentElement.appendChild(sliderContainer);
  sliderContainer.style.width = "100%";
  sliderContainer.style.display = "flex";
  sliderContainer.style.flexDirection = "row";
  sliderContainer.style.alignItems = "center";
  sliderContainer.style.alignContent = "center";

  var throttleHeaderElement = document.createElement('p');
  throttleHeaderElement.className = "minerInfoText";
  throttleHeaderElement.style.flex = "1 1 auto";
  sliderContainer.appendChild(throttleHeaderElement);

  var throttleElement = new Slider(sliderContainer, (1 - CoinMiner.defaultThrottle) * 100).element;
  throttleElement.style.flex = "0 1 auto";

  var setThrottleText = function ()
  {
    throttleHeaderElement.textContent = "CPU use: " + throttleElement.value + "%";
  }
  setThrottleText();

  var getCurrThrottle = function()
  {
    return 1-(throttleElement.value/100);
  }

  throttleElement.addEventListener('input', function()
  {
    if (_currMiner != undefined)
    {
      _currMiner.setThrottle(getCurrThrottle());
    }

    setThrottleText();
  });
  sliderContainer.appendChild(throttleElement);

  //dropdown
  var theItems = [];
  for (var k = 0; k < miners.length; k++)
  {
    theItems.push(miners[k].name);
  }
  var dropdown = new DropDown(parentElement, theItems, "Currency: ", undefined, true);
  var dropDownItems = dropdown.items;

  for (var l = 0; l < dropDownItems.length; l++)
  {
    dropDownItems[l].addEventListener('click', bindClickToIndex(l));
  }

  function bindClickToIndex(i)
  {
    // have to wrap it in a closure as when adding event listeners javascript will
    //put them to one side then add them later on once the for loop is done and the value of of i has changed.
    //see https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
    return function() { setSelectedMiner(i); };
  }

  function setSelectedMiner(i)
  {
    dropdown.setSelectedIndex(i);
    dropdown.hideItemsContainer();

    if (_clientIndex != i)
    {
      _clientIndex = i;
      setupMiner();
    }
  }

  //------------------------
  // start/stop toggling
  //------------------------
  var connectionTimer = 0;
  var bConnectedToPool = false;
  var updateTimeout = undefined;
  var updateConnectingText = function()
  {
    connectionTimer += 1;
    statusElement.innerText = bConnectedToPool ? "Running crypto miner.\r\nTime elapsed: " +connectionTimer +"s" : "Crypto miner disconnected.";

    if (bConnectedToPool)
    {
      for (var i = 0; i < (connectionTimer%4); i++)
      {
        statusElement.innerText += ".";
      }

      if (updateTimeout != undefined)
      {
        clearTimeout(updateTimeout);
      }
      updateTimeout = setTimeout(updateConnectingText, 1000);
    }
  }

  var setPoolConnectionStatus = function ( bConnected )
  {
    connectionTimer = 0;
    bConnectedToPool = bConnected;
    updateConnectingText();

    setMineButtonText();
    hashesElement.style.display     = bConnected ? "block" : "none";
    sliderContainer.style.display   = bConnected ? "block" : "none";
    //dropdown.element.style.display  = bConnected ? "block" : "none";
  }
  setPoolConnectionStatus(false);

  //------------------------
  // setup the miner
  //------------------------
  var setupMiner = function()
  {
    var startRunning = false;
    if (_currMiner != undefined)
    {
      startRunning = _currMiner.isRunning();
      if (startRunning)
      {
        _currMiner.stop();
      }
    }

    //setup new client
    if (_clientIndex >= miners.length || _clientIndex < 0)
    {
      console.error("setupMiner: currency of index "+_clientIndex +" not found.");
    }
    else
    {
      var miner = miners[_clientIndex];

      //if no client setup, set it up.
      if (miner.minerClient == undefined)
      {
        var minerData = { throttle: getCurrThrottle(), ads:0 };
        if (miners[_clientIndex].coin != undefined)
        {
          minerData.coin = miners[_clientIndex].coin;
        }
        miner.minerClient = new Client.Anonymous( miners[_clientIndex].id, minerData );

        //connecting and disconnecting
        miner.minerClient.on('open', function() { setPoolConnectionStatus(true); } );
        miner.minerClient.on('close', function() { setPoolConnectionStatus(false); } );

        //errors
        miner.minerClient.on('error', function(params)
        {
          errorElement.style.opacity = 1;
          errorElement.textContent = "Error: " +params.error;
          errorElement.style.display = "block";

          if (errorHideTimeout != undefined)
          {
            clearTimeout(errorHideTimeout);
          }
          if (errorClearTimeout != undefined)
          {
            clearTimeout(errorClearTimeout);
          }
          errorHideTimeout = setTimeout(function(){ errorElement.style.opacity = 0; }, 2500);
          errorClearTimeout = setTimeout(function(){ errorElement.style.display = "none"; }, 3000);
        });

        //hashes
        miner.minerClient.on('found', setTotalHashes );
      }

      _currMiner = miner.minerClient;

      //update hashes
      setTotalHashes();

      if (startRunning)
      {
        _currMiner.start();
      }
    }
  }

  if (CoinMiner.runOnLoad)
  {
    setupMiner();
    _currMiner.start();
  }
});
