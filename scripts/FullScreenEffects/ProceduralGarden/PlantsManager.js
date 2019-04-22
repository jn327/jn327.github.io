//Handles plants
var PlantsManager = {};

PlantsManager.plants = [];

PlantsManager.reset = function()
{
  this.plants = [];
}

PlantsManager.updateAndDrawPlants = function( ctx, windStr )
{
  //loop thru the plants, update and draw them
  var l = this.plants.length;
  for (var i = 0; i < l; i++)
  {
    this.plants[i].update();
    this.plants[i].draw(ctx, windStr);
  }
}

PlantsManager.addPlants = function( thePlants, scale, position )
{
  var nPlants = thePlants.length;
  if (nPlants > 0)
  {
    var thePlant;
    for (var p = 0; p < nPlants; p++)
    {
      thePlant = thePlants[p];
      thePlant.init(scale, position);
      this.plants.push(thePlant);
    }
  }
}
