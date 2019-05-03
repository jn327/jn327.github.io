//----------------------------------------
//               ABSTRACT
//----------------------------------------
function Creature()
{
  //Call our prototype
  GameObject.call(this);

  this.color      = [255, 0, 255];
  this.colorYoung = [103, 165, 96];
  this.colorOld   = [57, 114, 56];

  this.width              = 1;
  this.height             = 1;

  this.lifeTime           = 0;
  this.ageSpeed           = 0.5;
  this.prevUpdateT        = 0;
  this.minLifeTimeScale   = 0.1;
}

Creature.prototype.init = function( scale, pos )
{
  this.scale      = scale;
  this.position   = pos;
  this.lifeTime   = Math.random();
}

Creature.prototype.update = function( t )
{
  if (this.lifeTime != 1) { return; }

  var tDelta = (t < this.prevUpdateT) ? (t + (1 - this.prevUpdateT)) : t - this.prevUpdateT;
  this.prevUpdateT = t;

  this.lifeTime += tDelta * this.ageSpeed;
  if (this.lifeTime > 1)
  {
    this.lifeTime = 1;
  }
}

Creature.prototype.draw = function( ctx, windStr )
{
  this.color = ColorUtil.lerp(this.lifeTime, this.colorYoung, this.colorOld);
}
