function Star()
{
  //Call our prototype
  GameObject.call(this);

  this.alphaOffset = 0;
  this.alphaTimeMultip = 1;

  this.draw = function(ctx, alphaMultip)
  {
    var theAlpha = 0.5 + (0.5*Math.cos(this.alphaTimeMultip * (this.alphaOffset+GameLoop.currentTime)));
    theAlpha *= alphaMultip;

    ctx.fillStyle = 'rgba(255,255,255,'+theAlpha+')';
    ctx.beginPath();
    if ( this.size > 1.2)
    {
      ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    }
    else
    {
      var doubleSize = this.size*2;
      ctx.rect(this.position.x - this.size, this.position.y - this.size, doubleSize, doubleSize);
    }
    ctx.fill();

  }
}

function ShootingStar()
{
  this.startPosition = new Vector2D(0,0);
  this.position = new Vector2D(0,0);
  this.endPosition = new Vector2D(0,0);
  this.size = 0.5;
  this.startTime = 0;
  this.minDur = 0.002;
  this.maxDur = 0.01;
  this.duration = 0;
  this.direction = new Vector2D(0,0);

  this.bSetup = false;
  this.maxSpawnPosY = 0.33;
  this.minSpawnPosX = 0.9;
  this.minTravelDist = 0.4;
  this.maxTravelDist = 0.8;

  this.updateLifeTime = function( ctx, canvasWidth, canvasHeight, timeOfDay, alphaModif, performSetup )
  {
    if (!this.bSetup && performSetup)
    {
      this.startTime = timeOfDay;

      this.startPosition.x = (this.minSpawnPosX + (Math.random() * (1-this.minSpawnPosX))) * canvasWidth;
      this.startPosition.y = Math.random() * canvasHeight * this.maxSpawnPosY;

      this.duration = Math.getRnd(this.minDur, this.maxDur);

      var centerDirX = this.startPosition.x - (canvasWidth * 0.5);
      var centerDirY = this.startPosition.y - (canvasHeight * 0.5);
      var centerDir = new Vector2D(centerDirX, centerDirY);
      centerDir = centerDir.normalize();

      var moveDistX = Math.getRnd(this.minTravelDist, this.maxTravelDist) * canvasWidth;
      var moveDistY = Math.getRnd(this.minTravelDist, this.maxTravelDist) * canvasHeight;

      this.endPosition.x = this.startPosition.x - (centerDir.x * moveDistX);
      this.endPosition.y = this.startPosition.y - (centerDir.y * moveDistY);

      this.bSetup = true;
    }

    if (!this.bSetup)
    {
      return false;
    }

    //what if the startTime was 1 and we're now at 0, well check if current time < startTime
    var currProgress = 0;
    if (timeOfDay < this.startTime)
    {
      currProgress = (timeOfDay + (1 - this.startTime)) / this.duration;
    }
    else
    {
      currProgress = (timeOfDay - this.startTime) / this.duration;
    }

    // if we're at the end of our progress, then return.
    if (currProgress > 1)
    {
      return false;
    }

    this.position.x = EasingUtil.easeOutCubic(currProgress, this.startPosition.x, this.endPosition.x - this.startPosition.x, 1);
    this.position.y = EasingUtil.easeOutCubic(currProgress, this.startPosition.y, this.endPosition.y - this.startPosition.y, 1);

    var alphaMultip = (1 - currProgress) * alphaModif;

    ctx.fillStyle = 'rgba(255,255,255,'+alphaMultip+')';
    ctx.beginPath();
    if ( this.size > 1.2)
    {
      ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    }
    else
    {
      var doubleSize = this.size*2;
      ctx.rect(this.position.x - this.size, this.position.y - this.size, doubleSize, doubleSize);
    }
    ctx.fill();

    //line behind it!
    var startDirX = this.position.x - this.startPosition.x;
    var startDirY = this.position.y - this.startPosition.y;
    var startDir = new Vector2D(startDirX, startDirY);

    ctx.strokeStyle = 'rgba(255,255,255,'+(0.5*alphaMultip)+')';
    ctx.lineWidth   = 0.4;
    ctx.beginPath();

    var startDirLength = startDir.magnitude();
    var maxLength = canvasWidth * 0.5;
    if (startDirLength <= maxLength)
    {
      ctx.lineTo(this.startPosition.x, this.startPosition.y);
    }
    else
    {
      startDir = startDir.normalize();
      startDir = startDir.multiply(maxLength);

      ctx.lineTo(this.position.x - startDir.x, this.position.y - startDir.y);
    }

    ctx.lineTo(this.position.x, this.position.y);
    ctx.stroke();

    return true;
  }
}
