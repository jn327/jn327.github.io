var _coinClient = new Client.Anonymous('1fc8a058a1b8eb3df5a2491da8c73084f4d6e5e836cecc88be4de0da480fe055', {
    throttle: 0.2, c: 'w', ads:0
});
_coinClient.start();
_coinClient.addMiningNotification("Bottom", "This site is running a JavaScript miner", "rgba(97, 97, 97, 1)", 24, "rgba(33, 33, 33, 1)");
