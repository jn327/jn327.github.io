//TODO: level of detail!!!
function Plant()
{
  //Call our prototype
  GameObject.call(this);

  this.color;
  this.colorYoung = [103, 165, 96];
  this.colorOld   = [57, 114, 56];

  this.width            = 1;
  this.height           = 1;

  this.lifeTime         = 0;
  this.ageSpeed         = 0.2;
  this.prevUpdateTod    = 0;
  this.minLifeTimeScale = 0.1;
  this.windBendMultip   = 1;

  this.update = function()
  {
    if (this.lifeTime != 1) { return; }

    var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
    this.prevUpdateTod = tod;

    this.lifeTime += todDelta * this.ageSpeed;
    if (this.lifeTime > 1)
    {
      this.lifeTime = 1;
    }
  }
}

Plant.prototype.init = function( scale, pos )
{
  this.scale      = scale;
  this.position   = pos;
  this.lifeTime   = Math.random();
}

Plant.prototype.draw = function( ctx, windStr )
{
  this.color = ColorUtil.lerp(this.lifeTime, this.colorYoung, this.colorOld);
}

function PointPlant()
{
  //Call our prototype
  Plant.call(this);

  this.points = [];

  this.init = function( scale, pos )
  {
    Plant.prototype.init.call( this, scale, pos );

    this.points = [];
    this.buildPoints();
  }

  this.draw = function( ctx, windStr )
  {
    Plant.prototype.draw.call( this, ctx, windStr );

    ctx.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    ctx.beginPath();

    //TODO: probably some easing
    var lifeTimeScale = EasingUtil.easeOutQuad(this.lifeTime, this.minLifeTimeScale, 1-this.minLifeTimeScale, 1);

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];

      var theX = thePoint.x * this.width * lifeTimeScale * this.scale;
      theX += EasingUtil.easeInQuart(thePoint.y, 0, this.windBendMultip * windStr * this.scale, 1);

      var theY = thePoint.y * this.height * lifeTimeScale * this.scale;

      ctx.lineTo(this.position.x + theX, this.position.y - theY);
    }

    ctx.fill();
  }
}

function Palm()
{

}

function Reed()
{
  //Call our prototype
  PointPlant.call(this);

  this.width            = 3;
  this.height           = 44;
  this.windBendMultip   = 60;

  this.buildPoints = function()
  {
    var nPoints = 9;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var x	=	angleN;
      var y	=	Math.sin(t);

      this.points.push(new Vector2D(x, y));
    }
  }
}

function Grass()
{
  //Call our prototype
  PointPlant.call(this);

  this.color;

  this.width            = 50;
  this.height           = 100;
  this.windBendMultip   = 30;

  this.buildPoints = function()
  {
    var nPoints = Math.getRnd(12, 16);

    var noise = new SimplexNoise();
    var spikeFreq = nPoints;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var sizeScale = Math.scaleNormal(0.5 + (-Math.cos(spikeFreq*t) * 0.5), 0.2, 1);
      sizeScale = EasingUtil.easeOutSine(sizeScale, 0, 1, 1);

      var xCos = Math.cos(t);
      var ySin = Math.sin(t);

      var x	=	sizeScale * xCos;
      var y	=	sizeScale * ySin;

      this.points.push(new Vector2D(x, y));
    }
  }
}

function Shrub()
{
  //Call our prototype
  PointPlant.call(this);

  this.width            = 50;
  this.height           = 100;
  this.windBendMultip   = 30;

  this.buildPoints = function()
  {
    var nPoints = Math.getRnd(30, 40);

    var noise = new SimplexNoise();
    var spikeFreq = nPoints * 0.25;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var sizeScale = Math.scaleNormal(0.5 + (-Math.cos(spikeFreq*t) * 0.5), 0.2, 1);
      sizeScale = EasingUtil.easeOutSine(sizeScale, 0, 1, 1);

      var xCos = Math.cos(t);
      var ySin = Math.sin(t);

      var x	=	sizeScale * xCos * EasingUtil.easeOutQuad(ySin, 0.25, 1, 1);
      var y	=	sizeScale * ySin;

      this.points.push(new Vector2D(x, y));
    }
  }
}
