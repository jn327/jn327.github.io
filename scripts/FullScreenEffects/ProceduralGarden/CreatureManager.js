//Handles creatures.
var CreatureManager = {};

CreatureManager.bugs     = [];
CreatureManager.nBugsMin = 25;
CreatureManager.nBugsMax = 30;

CreatureManager.init = function( theCanvas, terrain )
{
  this.bugs     = [];

  var nBugs = Math.getRnd( this.nBugsMin, this.nBugsMax );
  var thisBug;

  for ( var i = 0; i < nBugs; i++ )
  {
    thisBug = new Firefly();
    thisBug.init( theCanvas, terrain );

    this.bugs.push( thisBug );
  }
}

CreatureManager.reset = function( theCanvas, terrain )
{
  var nBugs = this.bugs.length;
  var thisBug;

  for ( var i = 0; i < nBugs; i++ )
  {
    thisBug = this.bugs[i];
    thisBug.init( theCanvas, terrain );
  }
}

CreatureManager.updateAndDraw = function( t, ctx, theCanvas, windStr, skyBrightness, terrain )
{
  var nBugs = this.bugs.length;
  var thisBug;

  for ( var i = 0; i < nBugs; i++ )
  {
    thisBug = this.bugs[i];

    thisBug.update( theCanvas, t, windStr, terrain );
    thisBug.draw( ctx, skyBrightness );
  }
}
