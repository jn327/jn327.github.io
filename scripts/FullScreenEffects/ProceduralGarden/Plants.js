//----------------------------------------
//               ABSTRACT
//----------------------------------------
function Plant()
{
  //Call our prototype
  GameObject.call(this);

  this.color      = [255, 0, 255];
  this.colorYoung = [103, 165, 96];
  this.colorOld   = [57, 114, 56];

  this.width            = 1;
  this.height           = 1;

  this.lifeTime         = 0;
  this.ageSpeed         = 0.2;
  this.prevUpdateT      = 0;
  this.minLifeTimeScale = 0.1;
  this.windBendMultip   = 1;

  this.update = function( t )
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

//----------------------------------------
//             NON ABSTRACT
//----------------------------------------
function Palm()
{
  //Call our prototype
  Plant.call(this);

  this.points = [];

  this.width            = 30;
  this.height           = 300;
  this.windBendMultip   = 30;

  this.colorYoung = [103, 80, 40];
  this.colorOld   = [57, 60, 20];

  this.head       = new PalmHead();

  this.init = function( scale, pos )
  {
    Plant.prototype.init.call( this, scale, pos );

    this.head.init( scale, new Vector2D(0, 0) );

    this.head.colorYoung = [103, 100, 40];
    this.head.colorOld   = [57, 80, 20];

    this.points = [];
    this.buildPoints();
  }

  this.buildPoints = function()
  {
    var nPoints = 30;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints-1);
      var t = angleN * Math.PI;

      var y	=	Math.sin(t);
      var x	=	EasingUtil.easeNone(angleN, 0, 0.7, 1) + EasingUtil.easeOutQuart(y, 0, 0.3, 1);

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function( t )
  {
    this.head.update( t );
  }

  this.draw = function( ctx, windStr )
  {
    Plant.prototype.draw.call( this, ctx, windStr );

    ctx.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    ctx.beginPath();

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

    this.head.position.y = this.position.y; - (this.height * lifeTimeScale * this.scale);
    this.head.position.x = this.position.x + (this.width * 0.5 * lifeTimeScale * this.scale);

    this.head.draw( ctx, windStr );
  }
}

function PalmHead()
{
  //Call our prototype
  PointPlant.call(this);

  this.width            = 50;
  this.height           = 100;
  this.windBendMultip   = 30;

  this.buildPoints = function()
  {
    var nPoints = Math.getRnd(80, 90);

    var noise = new SimplexNoise();
    var spikeFreq = 8;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI * 2;

      //TODO: in a bent shape on y based on x pos.
      //ie: the larger x, the smaller y ....

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
      var angleN = i / (nPoints-1);
      var t = angleN * Math.PI;

      var x	=	EasingUtil.easeOutQuad(angleN, 0, 1, 1);
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
    var nPoints = Math.getRnd(35, 45);

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
