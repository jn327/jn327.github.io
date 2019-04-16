//TODO: we can definately share a lot of code here!!!!
//TODO: level of detail!!!
function Palm()
{

}

function Reed()
{
  //Call our prototype
  GameObject.call(this);

  this.color;

  this.maxW = 3;
  this.maxH = 44;

  this.lifeTime = 0;

  this.colorOne  = [103, 165, 96];
  this.colorZero = [57, 114, 56];

  this.ageSpeed = 0.2;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function( scale, pos )
  {
    this.points = [];

    this.color = ColorUtil.lerp(Math.random(), this.colorOne, this.colorZero);

    this.scale      = scale;
    this.position   = pos;
    this.lifeTime   = Math.random();

    var nPoints = 9;

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var x	=	angleN * this.scale;
      var y	=	Math.sin(t) * this.scale;

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function()
  {
      var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
      this.prevUpdateTod = tod;

      this.lifeTime += todDelta * this.ageSpeed;
      if (this.lifeTime > 1)
      {
        this.lifeTime = 1;
      }
  }

  this.draw = function( theCanvas )
  {
    var bendMultip = 50;

    theCanvas.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    theCanvas.beginPath();

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];

      var theX = thePoint.x * this.maxW * this.lifeTime;
      theX -= EasingUtil.easeInCubic(thePoint.y, 0, bendMultip * windStr, 1);

      var theY = thePoint.y * this.maxH * this.lifeTime;

      theCanvas.lineTo(this.position.x + theX, this.position.y - theY);
    }

    theCanvas.fill();
  }
}

function Grass()
{
  //Call our prototype
  GameObject.call(this);

  this.color;

  this.maxW = 50;
  this.maxH = 100;

  this.lifeTime = 0;

  this.colorOne  = [103, 165, 96];
  this.colorZero = [57, 114, 56];

  this.ageSpeed = 0.2;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function( scale, pos )
  {
    this.points = [];
    var nPoints = Math.getRnd(14, 18);

    this.color = ColorUtil.lerp(Math.random(), this.colorOne, this.colorZero);

    var noise = new SimplexNoise();
    var spikeFreq = nPoints;

    this.scale      = scale;
    this.position   = pos;
    this.lifeTime   = Math.random();

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var sizeScale = Math.scaleNormal(0.5 + (-Math.cos(spikeFreq*t) * 0.5), 0.2, 1);
      sizeScale = EasingUtil.easeOutSine(sizeScale, 0, 1, 1);

      var xCos = Math.cos(t);
      var ySin = Math.sin(t);

      var x	=	sizeScale * xCos * this.scale;
      var y	=	sizeScale * ySin * this.scale;

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function()
  {
      var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
      this.prevUpdateTod = tod;

      this.lifeTime += todDelta * this.ageSpeed;
      if (this.lifeTime > 1)
      {
        this.lifeTime = 1;
      }
  }

  this.draw = function( theCanvas )
  {
    var bendMultip = 75;

    theCanvas.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    theCanvas.beginPath();

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];

      var theX = thePoint.x * this.maxW * this.lifeTime;
      theX -= EasingUtil.easeInQuart(thePoint.y, 0, bendMultip * windStr, 1);

      var theY = thePoint.y * this.maxH * this.lifeTime;

      theCanvas.lineTo(this.position.x + theX, this.position.y - theY);
    }

    theCanvas.fill();
  }
}

function Shrub()
{
  //Call our prototype
  GameObject.call(this);

  this.color;

  this.maxW = 50;
  this.maxH = 100;

  this.lifeTime = 0;

  this.colorOne  = [103, 165, 96];
  this.colorZero = [57, 114, 56];

  this.ageSpeed = 0.2;

  this.points = [];

  this.prevUpdateTod = 0;

  this.init = function( scale, pos )
  {
    this.points = [];
    var nPoints = Math.getRnd(25, 30);

    this.color = ColorUtil.lerp(Math.random(), this.colorOne, this.colorZero);

    var noise = new SimplexNoise();
    var spikeFreq = nPoints * 0.2;

    this.scale      = scale;
    this.position   = pos;
    this.lifeTime   = Math.random();

    for (var i = 0; i < nPoints; i++)
    {
      var angleN = i / (nPoints);
      var t = angleN * Math.PI;

      var sizeScale = Math.scaleNormal(0.5 + (-Math.cos(spikeFreq*t) * 0.5), 0.2, 1);
      sizeScale = EasingUtil.easeOutSine(sizeScale, 0, 1, 1);

      var xCos = Math.cos(t);
      var ySin = Math.sin(t);

      var x	=	sizeScale * xCos * this.scale;
      var y	=	sizeScale * ySin * this.scale;

      this.points.push(new Vector2D(x, y));
    }
  }

  this.update = function()
  {
      var todDelta = (tod < this.prevUpdateTod) ? (tod + (1 - this.prevUpdateTod)) : tod - this.prevUpdateTod;
      this.prevUpdateTod = tod;

      this.lifeTime += todDelta * this.ageSpeed;
      if (this.lifeTime > 1)
      {
        this.lifeTime = 1;
      }
  }

  this.draw = function( theCanvas )
  {
    var bendMultip = 75;

    theCanvas.fillStyle = 'rgba('+(this.color[0])+','+(this.color[1])+','+(this.color[2])+', 1)';
    theCanvas.beginPath();

    for (var p = 0; p < this.points.length; p++)
    {
      var thePoint = this.points[p];

      var curvedX = thePoint.x * EasingUtil.easeNone(thePoint.y, 0, 2, 1);
      var theX = curvedX * this.maxW * this.lifeTime;
      theX -= EasingUtil.easeInQuart(thePoint.y, 0, bendMultip * windStr, 1);

      var theY = thePoint.y * this.maxH * this.lifeTime;

      theCanvas.lineTo(this.position.x + theX, this.position.y - theY);
    }

    theCanvas.fill();
  }
}
