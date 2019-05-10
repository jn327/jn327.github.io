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

  this.width              = 1;
  this.height             = 1;

  this.lifeTime           = 0;
  this.ageSpeed           = 0.5;
  this.prevUpdateT        = 0;
  this.minLifeTimeScale   = 0.1;
  this.windBendMultip     = 1;
  this.dynamicScaleMin    = 0; //plants with a scale below this number cant be dynamic (no point if they're tiny)
  this.staticScaleMax     = 1; //plants with a scale above this cant be static (probably because they are giant)
}

Plant.prototype.init = function( scale, pos )
{
  this.scale      = scale;
  this.position   = pos;
  this.lifeTime   = Math.random();
}

Plant.prototype.update = function( t )
{
  if (this.lifeTime >= 1) { return; }

  var tDelta = (t < this.prevUpdateT) ? (t + (1 - this.prevUpdateT)) : t - this.prevUpdateT;
  this.prevUpdateT = t;

  this.lifeTime += tDelta * this.ageSpeed;
  if (this.lifeTime > 1)
  {
    this.lifeTime = 1;
  }
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

  this.update = function( t )
  {
    Plant.prototype.update.call( this, t );
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

  this.width              = 30;
  this.height             = 300;
  this.windBendMultip     = 80;

  this.maxPoints          = 16;
  this.minPoints          = 10;

  this.colorYoung         = [165, 128, 74];
  this.colorOld           = [112, 88, 52];

  this.head               = new PalmHead();
  this.headPointIndex     = 0;
  this.dynamicScaleMin    = 0.33;
  this.staticScaleMax     = 0.8;

  this.init = function( scale, pos )
  {
    Plant.prototype.init.call( this, scale, pos );

    this.head.init( scale, new Vector2D(0, 0) );
    this.head.lifeTime = this.lifeTime;

    this.points = [];
    this.buildPoints();
  }

  this.buildPoints = function()
  {
    var nPoints = Math.round(Math.scaleNormal(this.scale, this.minPoints, this.maxPoints));
    this.headPointIndex = Math.round(nPoints * 0.5);

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints-1);
      var t = angleN * Math.PI;

      var y	=	Math.sin(t);
      var x	=	EasingUtil.easeInOutSine(angleN, 0, 1, 1);

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function( t )
  {
    Plant.prototype.update.call( this, t );
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
      theX += EasingUtil.easeInCubic(thePoint.y, 0, this.windBendMultip * windStr * this.scale, 1);

      var theY = thePoint.y * this.height * lifeTimeScale * this.scale;

      ctx.lineTo(this.position.x + theX, this.position.y - theY);

      if (p == this.headPointIndex)
      {
        this.head.position.x = this.position.x + theX;
        this.head.position.y = this.position.y - theY;
      }
    }

    ctx.fill();

    this.head.draw( ctx, windStr );
  }
}

function PalmHead()
{
  //Call our prototype
  PointPlant.call(this);

  this.width          = 100;
  this.height         = 100;
  this.windBendMultip = 30;

  this.nSpikesMin      = 5;
  this.nSpikesMax      = 8;
  this.pointsMin       = 6;
  this.pointsMax       = 8;

  this.angleMin        = 240;
  this.angleMax        = 260;

  this.buildPoints = function()
  {
    var noise = new SimplexNoise();

    var nSpikes       = Math.getRnd(this.nSpikesMin, this.nSpikesMax);
    var totalAngle    = Math.degreesToRad(Math.getRnd(this.angleMin, this.angleMax));
    var anglePerSpike = totalAngle / nSpikes;
    var startAngle    = (Math.PI - totalAngle) * 0.5;

    var totalPoints = Math.round(Math.scaleNormal(this.scale, this.pointsMin, this.pointsMax));;

    var pointsCurve = new AnimationCurve();
    pointsCurve.addKeyFrame(0, 0);
    pointsCurve.addKeyFrame(0.45, 1);
    pointsCurve.addKeyFrame(0.5, 0.2);
    pointsCurve.addKeyFrame(1, 0.8);

    var lastPointsCurve = new AnimationCurve();
    lastPointsCurve.addKeyFrame(0, 0);
    lastPointsCurve.addKeyFrame(0.5, 1);
    lastPointsCurve.addKeyFrame(1, 0);

    for (var i = 0; i < nSpikes; i++)
    {
      var spikeAngle    = startAngle + (anglePerSpike * i);
      var anglePerPoint = anglePerSpike / totalPoints;

      for (var n = 0; n < totalPoints; n++)
      {
        var pointAngle = spikeAngle + (anglePerPoint * n);

        var t = n / (totalPoints-1);
        t = n != (totalPoints-1) ? pointsCurve.evaluate(t) : lastPointsCurve.evaluate(t);

        var sizeScale = Math.scaleNormal(t, 0.33, 1);

        var xCos = Math.cos(pointAngle);
        var ySin = Math.sin(pointAngle);

        var x	=	sizeScale * xCos;
        var y	=	sizeScale * ySin;

        this.points.push(new Vector2D(x, y));
      }
    }
  }
}

function Reed()
{
  //Call our prototype
  PointPlant.call(this);

  this.width              = 3;
  this.height             = 44;
  this.windBendMultip     = 60;
  this.dynamicScaleMin    = 0.33;

  this.maxPoints          = 14;
  this.minPoints          = 5;

  this.buildPoints = function()
  {
    var nPoints = Math.round(Math.scaleNormal(this.scale, this.minPoints, this.maxPoints));

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

function Shrub()
{
  //Call our prototype
  PointPlant.call(this);

  this.color;

  this.width              = 50;
  this.height             = 100;
  this.windBendMultip     = 30;
  this.dynamicScaleMin    = 0.33;

  this.nSpikesMin         = 10;
  this.nSpikesMax         = 18;
  this.pointsMultipMin    = 2;
  this.pointsMultipMax    = 6;

  this.buildPoints = function()
  {
    var noise = new SimplexNoise();
    var nSpikes = Math.getRnd(this.nSpikesMin, this.nSpikesMax);
    nSpikes = Math.roundMultip(nSpikes, 2);

    var pointsMultip = Math.round(Math.scaleNormal(this.scale, this.pointsMultipMin, this.pointsMultipMax));
    var nPoints = nSpikes * pointsMultip;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints-1);
      var t = angleN * Math.PI;

      var sizeScale = 0.5 + (-Math.cos(nSpikes*t) * 0.5);
      sizeScale = EasingUtil.easeOutExpo(sizeScale, 0.2, 0.8, 1);

      var xCos = Math.cos(t);
      var ySin = Math.sin(t);

      var x	=	sizeScale * xCos;
      var y	=	sizeScale * ySin;

      this.points.push(new Vector2D(x, y));
    }
  }
}

function Grass()
{
  //Call our prototype
  PointPlant.call(this);

  this.width              = 40;
  this.height             = 50;
  this.windBendMultip     = 30;
  this.dynamicScaleMin    = 0.33;

  this.nSpikesMin         = 6;
  this.nSpikesMax         = 9;
  this.pointsMin          = 6;
  this.pointsMax          = 8;

  this.angleMin = 120;
  this.angleMax = 180;

  this.buildPoints = function()
  {
    var noise = new SimplexNoise();

    var nSpikes       = Math.getRnd(this.nSpikesMin, this.nSpikesMax);
    var totalAngle    = Math.degreesToRad(Math.getRnd(this.angleMin, this.angleMax));
    var anglePerSpike = totalAngle / nSpikes;
    var startAngle    = (Math.PI - totalAngle) * 0.5;

    var totalPoints = Math.round(Math.scaleNormal(this.scale, this.pointsMin, this.pointsMax));;

    var pointsCurve = new AnimationCurve();
    pointsCurve.addKeyFrame(0, 0);
    pointsCurve.addKeyFrame(0.5, 1, EasingUtil.easeInQuad);
    pointsCurve.addKeyFrame(1, 0, EasingUtil.easeOutQuad);

    for (var i = 0; i < nSpikes; i++)
    {
      var spikeAngle = startAngle + (anglePerSpike * i);

      var anglePerPoint = anglePerSpike / totalPoints;

      for (var n = 0; n < totalPoints; n++)
      {
        var pointAngle = spikeAngle + (anglePerPoint * n);
        var t = n / (totalPoints-1);
        t = pointsCurve.evaluate(t);

        var sizeScale = Math.scaleNormal(t, 0.33, 1);

        var xCos = Math.cos(pointAngle);
        var ySin = Math.sin(pointAngle);

        var x	=	sizeScale * xCos;
        var y	=	sizeScale * ySin;

        this.points.push(new Vector2D(x, y));
      }
    }
  }
}
