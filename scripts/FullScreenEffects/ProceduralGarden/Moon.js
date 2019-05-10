function Moon()
{
  //Call our prototype
  GameObject.call(this);

  this.visible    = false;
  this.color      = [255, 255, 255];
  this.setTime    = 0.1;
  this.riseTime   = 0.9;
  this.sizeMin    = 30;
  this.sizeMax    = 60;

  this.sizeChangeCurve = new AnimationCurve();
    this.sizeChangeCurve.addKeyFrame(0, 1);
    this.sizeChangeCurve.addKeyFrame(0.5, 0, EasingUtil.easeOutCubic);
    this.sizeChangeCurve.addKeyFrame(1, 1, EasingUtil.easeInCubic);

  this.posChangeCurve = new AnimationCurve();
    this.posChangeCurve.addKeyFrame(0, 1);
    this.posChangeCurve.addKeyFrame(0.5, 0, EasingUtil.easeOutCubic);
    this.posChangeCurve.addKeyFrame(1, 1, EasingUtil.easeInCubic);

  this.update = function( t, avblW, avblH )
  {
    this.visible = ( t >= this.riseTime || t <= this.setTime );

    if (this.visible)
    {
      var totalMoonTime = this.setTime + (1-this.riseTime);
      var moonTime = (t < this.setTime) ? (1-this.riseTime) + t : t - this.riseTime;
      var moonTimeNormal = moonTime / totalMoonTime;

      var sizeN = this.sizeChangeCurve.evaluate(moonTimeNormal);
      var posN = this.posChangeCurve.evaluate(moonTimeNormal);

      this.size = Math.scaleNormal(sizeN, this.sizeMin, this.sizeMax);

      var heightOffsetTop = 0.1;
      var heightOffsetBottom = 0.2;

      this.position.x = moonTimeNormal * avblW;
      this.position.y = (heightOffsetTop * avblH) + this.size + (posN * ((1-heightOffsetBottom) * avblH));
    }
  }

  this.draw = function( ctx )
  {
    if (this.visible == false) { return; }

    //halo and rings
    this.drawCircle( ctx, 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 0.025)', -1, 2, this.size*2 );
    this.drawCircle( ctx, 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 0.05)', -2, -1, this.size*1.4 );

    ctx.strokeStyle = 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 0.05)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size*1.8, 0, 2 * Math.PI);
    ctx.stroke();

    //the actual moon shape
    this.drawCircle( ctx, 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 1)', 0, 0, this.size );

    //shadow
    var spotColor = 'rgba(0, 0, 0, 0.05)';
    this.drawCircle( ctx, spotColor, 2, 5, this.size-5 );

    //the craters
    this.drawCircle( ctx, spotColor, this.size*0.1, this.size*0.3, this.size*0.2 );
    this.drawCircle( ctx, spotColor, this.size*0.6, this.size*0.1, this.size*0.15 );
    this.drawCircle( ctx, spotColor, -this.size*0.4, this.size*0.025, this.size*0.1 );
    this.drawCircle( ctx, spotColor, -this.size*0.6, -this.size*0.1, this.size*0.2 );
    this.drawCircle( ctx, spotColor, -this.size*0.6, -this.size*0.1, this.size*0.2 );
    this.drawCircle( ctx, spotColor, -this.size*0.3, -this.size*0.6, this.size*0.1 );
    this.drawCircle( ctx, spotColor, this.size*0.6, -this.size*0.4, this.size*0.15 );
  }

  this.drawCircle = function( ctx, fillStyle, x, y, size)
  {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(this.position.x + x, this.position.y + y, size, 0, 2 * Math.PI);
    ctx.fill();
  }
}
