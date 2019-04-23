//Handles plants
var PlantsManager = {};

PlantsManager.dynamicPlants = [];
PlantsManager.staticPlants = [];

PlantsManager.reset = function()
{
  this.dynamicPlants = [];
  this.staticPlants = [];
}

PlantsManager.updateAndDrawPlants = function( t, ctx, windStr )
{
  //loop thru the plants, update and draw them
  var l = this.dynamicPlants.length;
  for (var i = 0; i < l; i++)
  {
    this.dynamicPlants[i].update( t );
    this.dynamicPlants[i].draw(ctx, windStr);
  }
}

PlantsManager.drawStaticPlants = function( ctx )
{
  //loop thru the plants, update and draw them
  var l = this.staticPlants.length;
  for (var i = 0; i < l; i++)
  {
    this.staticPlants[i].draw(ctx, 0);
  }
}

PlantsManager.addPlants = function( thePlants, scale, staticChance, position )
{
  var nPlants = thePlants.length;
  if (nPlants > 0)
  {
    var thePlant;
    for (var p = 0; p < nPlants; p++)
    {
      thePlant = thePlants[p];
      thePlant.init(scale, position);

      if ((scale <= thePlant.staticScaleMax && Math.random() < staticChance) && scale >= thePlant.dynamicScaleMin)
      {
        this.dynamicPlants.push(thePlant);
      }
      else
      {
        this.staticPlants.push(thePlant);
      }
    }
  }
}
