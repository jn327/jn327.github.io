function River()
{
  this.midPointsUp      = [];
  this.midPointsDown    = [];
  this.edgePointsUp     = [];
  this.edgePointsDown   = [];

  this.reset = function()
  {
    this.midPointsUp     = [];
    this.midPointsDown   = [];
    this.edgePointsUp    = [];
    this.edgePointsDown  = [];
  }

  this.addPoints = function( pointMid, pointLeft, pointRight )
  {
    this.midPointsUp.push(pointMid);
    this.midPointsDown.unshift(pointMid);

    this.edgePointsUp.push(pointLeft);
    this.edgePointsDown.unshift(pointRight);
  }

  this.nWaves = 3;
  this.drawWaves = function( t, ctx, gradientStart, gradientEnd )
  {
    for ( var k = 0; k < this.nWaves; k++ )
    {
      //sort out alpha and width
      var widthFreq = 0.1;
      var thePos = t + ((widthFreq/this.nWaves) * k);

      var widthMultip = (thePos % widthFreq) / widthFreq;
      widthMultip = EasingUtil.easeOutQuad(widthMultip, 0, 1, 1);
      widthMultip = Math.scaleNormal(widthMultip, 0.5, 1);

      var theAlpha = -(Math.cos((2 * Math.PI * thePos) / widthFreq) * 0.5) + 0.5;
      theAlpha = Math.scaleNormal(theAlpha, 0, 0.33);

      var lineWidth = (thePos % widthFreq) / widthFreq;
      lineWidth = Math.scaleNormal(lineWidth, 3, 9);

      ctx.lineJoin = 'round';
      ctx.lineWidth = lineWidth;

      var grd = ctx.createLinearGradient(0, gradientStart, 0, gradientEnd);
      grd.addColorStop(0.1, "rgba(255,255,255, 0)");
      grd.addColorStop(1, "rgba(255,255,255, "+theAlpha+")");

      ctx.strokeStyle = grd;

      //get on to the drawing
      ctx.beginPath();
      var thePath = new Path2D();
      thePath = PathUtil.createPath(this.midPointsUp, thePath, this.edgePointsUp, widthMultip);
      thePath = PathUtil.createPath(this.midPointsDown, thePath, this.edgePointsDown, widthMultip);

      ctx.stroke(thePath);
    }
  }
}
