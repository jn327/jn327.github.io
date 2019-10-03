var CoinMiner = {};

//Expects a div id'd 'minerInfoContainer' somewhere in your html
CoinMiner.init = function()
{
  var parentElement = document.getElementById("minerInfoContainer");
  parentElement.className = "minerInfoContainer";

  //get the miner script from coinImps hosting
  //TODO: download locally too...
  var coinScript = document.createElement('script');
  document.body.appendChild(coinScript);
  coinScript.src = "https://www.hostingcloud.racing/Ffk7.js";
  //coinScript.src = "https://3558932317/6fnq.js";

  coinScript.onload = function ()
  {
    //we have the miner, start a client
    //var _coinClient = new Client.Anonymous('1fc8a058a1b8eb3df5a2491da8c73084f4d6e5e836cecc88be4de0da480fe055', {throttle: 0.2, c: 'w', ads:0 });
    var _coinClient = new Client.Anonymous
    (
      '62cec22d582dfb1857c03a7a2932ae5461980cf07ca246cd6f7658a573a2f92a',
      { throttle: 0.5, ads:0 }
    );
    _coinClient.start();

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

    _coinClient.on('error', function(params)
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

    //pause / continue button
    var mineButton = document.createElement('a');
    mineButton.className    = "standardButton";
    mineButton.style.marginBottom = "2px";
    mineButton.style.marginTop = "2px";
    parentElement.appendChild(mineButton);
    var setMineButtonText = function()
    {
      mineButton.textContent = _coinClient.isRunning() ? "Stop mining" : "Start mining";
    }

    mineButton.addEventListener('click', function()
    {
      _coinClient.isRunning() ? _coinClient.stop() : _coinClient.start();
      setMineButtonText();
    });

    //hashes
    var hashesElement = document.createElement('p');
    hashesElement.className = "minerInfoText";
    var setTotalHashes = function ()
    {
      hashesElement.textContent = "Hashes: " + _coinClient.getTotalHashes();
    }
    setTotalHashes();
    _coinClient.on('found', setTotalHashes );
    parentElement.appendChild(hashesElement);

    //slider
    var sliderContainer = document.createElement('div');
    parentElement.appendChild(sliderContainer);
    sliderContainer.style.width = "100%";
    sliderContainer.style.display = "flex";
    sliderContainer.style.flexDirection = "row";
    sliderContainer.style.alignItems = "center";

    var throttleHeaderElement = document.createElement('p');
    throttleHeaderElement.className = "minerInfoText";
    throttleHeaderElement.style.width = "100%";
    sliderContainer.appendChild(throttleHeaderElement);

    var throttleElement = document.createElement('input');
    throttleElement.className = "slider";
    throttleElement.style.width = "90px";
    throttleElement.type      = "range";
    throttleElement.min       = 0;
    throttleElement.max       = 100;
    throttleElement.value     = _coinClient.getThrottle() * 100;

    var setThrottleText = function ()
    {
      throttleHeaderElement.textContent = "CPU use: " + (100 - (throttleElement.value) + "%");
    }
    setThrottleText();

    throttleElement.addEventListener('input', function()
    {
      _coinClient.setThrottle(throttleElement.value/100);
      setThrottleText();
    });
    sliderContainer.appendChild(throttleElement);

    //status toggling
    var connectionTimer = 0;
    var bConnectedToPool = false;
    var updateTimeout = undefined;
    var updateConnectingText = function()
    {
      connectionTimer = bConnectedToPool ? 0 : connectionTimer + 1;
      statusElement.textContent = bConnectedToPool ? "Running a crypto miner in the background." : "Attempting to connect to crypto mining pool, time elapsed: "+connectionTimer+"s";

      if (!bConnectedToPool)
      {
        for (var i = 0; i < (connectionTimer%4); i++)
        {
          statusElement.textContent += ".";
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
      bConnectedToPool = bConnected;
      updateConnectingText();

      setMineButtonText();
      hashesElement.style.display   = bConnected ? "block" : "none";
      sliderContainer.style.display = bConnected ? "block" : "none";
    }

    setPoolConnectionStatus(false);
    _coinClient.on('open', function() { setPoolConnectionStatus(true); } );
    _coinClient.on('close', function() { setPoolConnectionStatus(false); } );
  }
}

CommonElementsCreator.addStyles( [], ["coinMiner", "slider"] );
CommonElementsCreator.addLoadEvent( CoinMiner.init );
