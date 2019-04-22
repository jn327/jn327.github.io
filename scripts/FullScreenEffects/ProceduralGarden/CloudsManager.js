//Handles spawning clouds
var CloudsManager = {};

CloudsManager.minClouds           = 3;
CloudsManager.maxClouds           = 8;
CloudsManager.clouds              = [];

CloudsManager.startY              = 0; //from top to bottom
CloudsManager.endY                = 0.25;

CloudsManager.initClouds = function( theWidth, theHeight )
{
  this.clouds = [];

  var nClouds = Math.getRnd(this.minClouds, this.maxClouds);
  for (var i = 0; i < nClouds; i++)
  {
    var newCloud = new Cloud();
    this.setRandomCloudPos(newCloud, theWidth, theHeight);
    newCloud.init();

    this.clouds[i] = newCloud;
  }
}

CloudsManager.setRandomCloudPos = function(theCloud, theWidth, theHeight)
{
  theCloud.position.x = Math.random() * theWidth;
  theCloud.position.y = EasingUtil.easeInQuad(Math.random(), this.startY, this.endY - this.startY, 1) * theHeight;
}


CloudsManager.updateAndDrawClouds = function( ctx, windStr, brightness, theWidth )
{
  var l = this.clouds.length;
  for (var i = 0; i < l; i++)
  {
    this.clouds[i].update( windStr, theWidth );
    this.clouds[i].draw( ctx, brightness );
  }
}

CloudsManager.randomizeClouds = function( theWidth, theHeight )
{
  var l = this.clouds.length;
  for (var i = 0; i < l; i++)
  {
    this.setRandomCloudPos(this.clouds[i], theWidth, theHeight);
  }
}
