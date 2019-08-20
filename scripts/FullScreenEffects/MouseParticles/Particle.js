function Particle( _objectPool, _noiseFunct )
{
  //Call our prototype
  GameObject.call(this);

  var active          = false;
  var objectPool      = _objectPool;

  var noiseSpeedMultip= 250;
  var ageSpeedMultip  = 1;
  var friction        = Math.scaleNormal(Math.random(), 4, 5);

  var scaleNoise      = new SimplexNoise();
  var minScale        = 5;
  var maxScale        = 40;
  var noiseScaleMultip = 0.5;
  var scaleNoiseScale = 4;
  var ageScaleMultip  = 1;
  var minScaleForGradient = 2;

  var boidVelMultip         = 6;
  var separationMultip      = 1;
  var alignmentMultip       = 0.1;
  var cohesionMultip        = 1;
  var desiredseparation     = 0;
  var separationScaleMultip = 0.75;
  var alignmentDist         = 100;
  var cohesionDist          = 100;

  var noiseFunct      = _noiseFunct;

  this.hue            = 0;
  this.saturation     = 90;
  var brightness      = 70;
  var alpha           = 1;
  var ageAlphaMultip  = 1;

  var lifeTime      = 0;
  var maxLifeTime   = Math.scaleNormal(Math.random(), 0.5, 0.6);

  var twoPI         = 2 * Math.PI;

  this.velocity     = new Vector2D(0,0);

  this.spawn = function(x, y, velX, velY, lifeTimeN, theColor)
  {
    if (lifeTimeN == undefined)
    {
      lifeTimeN = 0;
    }
    if (velX == undefined)
    {
      velX = 0;
    }
    if (velY == undefined)
    {
      velY = 0;
    }

    this.position.x = x;
    this.position.y = y;

    this.hue           = theColor[0];
    this.saturation    = theColor[1];

    this.velocity.x = velX;
    this.velocity.y = velY;

    lifeTime = maxLifeTime * lifeTimeN;
    active = true;
  }

  this.update = function( deltaTime, xMin, yMin, xMax, yMax, otherParticles )
  {
    lifeTime += deltaTime;

    //decrease speed linearly from 100% to 0% as we age.
    //ageSpeedMultip = (1 - (lifeTime / maxLifeTime));

    var theVel = noiseFunct( this.position.x, this.position.y );
    var boidVel = this.getBoidVel(otherParticles, deltaTime);

    this.velocity.x += ((theVel[0] * noiseSpeedMultip) + boidVel.x) * ageSpeedMultip;
    this.velocity.y += ((theVel[1] * noiseSpeedMultip) + boidVel.y) * ageSpeedMultip;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //apply friction
    var tFriction = friction * deltaTime;
    if (tFriction > 1)
    {
      tFriction = 1;
    }
    this.velocity.multiply(1 - tFriction);

    //despawn if we've been around too long or if we're out of the screen.
    if ( lifeTime >= maxLifeTime
      || this.position.x < xMin || this.position.x > xMax
      || this.position.y < yMin || this.position.y > yMax )
    {
      this.despawn();
    }
  }

  this.isActive = function()
  {
    return active;
  }

  this.despawn = function()
  {
    active = false;
    objectPool.addToPool(this);
  }

  this.draw = function( ctx )
  {
    //ageAlphaMultip = EasingUtil.easeNone(lifeTime, 1, -1, maxLifeTime);

    ageScaleMultip = EasingUtil.easeInExpo(lifeTime, 1, -1, maxLifeTime);

    var endScale = ((1 - noiseScaleMultip) + (scaleNoise.scaledNoise(lifeTime * scaleNoiseScale, 0) * noiseScaleMultip)) * ageScaleMultip;

    this.scale = Math.scaleNormal( endScale, minScale, maxScale );
    if (this.scale < 0)
    {
      this.scale = 0;
    }

    var theAlpha = (alpha * ageAlphaMultip);

    // if scale is very small, dont do a gradient, just a fill.
    if (this.scale < minScaleForGradient)
    {
      ctx.fillStyle = 'hsla('+this.hue +', '+this.saturation +'%, '+brightness +'%, ' +theAlpha +')';
    }
    else
    {
      var grd = ctx.createRadialGradient(this.position.x, this.position.y, 0, this.position.x, this.position.y, this.scale);
      grd.addColorStop(0, 'hsla('+this.hue +', '+this.saturation +'%, '+brightness +'%, ' +theAlpha +')');
      grd.addColorStop(1, 'hsla('+this.hue +', '+this.saturation +'%, '+brightness +'%, 0)');
      ctx.fillStyle = grd;
    }

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.scale, 0, twoPI);
    ctx.fill();
  }

  // ------ BOID BEHAVIOUR ------
  this.getBoidVel = function(otherParticles, deltaTime)
  {
    // ==== Separation ====
    var separationVel = new Vector2D(0, 0);
    var separationCount = 0;

    // ==== Alignment ====
    var alignmentVel = new Vector2D(0, 0);
    var alignmentCount = 0;

    // ==== Cohesion ====
    var cohesionVel = new Vector2D(0, 0);
    var cohesionCount = 0;

    var otherParticle;
    for (var i = 0; i < otherParticles.length; i++)
    {
      otherParticle = otherParticles[i];
      var dist = this.position.distance(otherParticle.position);

      var hueDist = this.hue - otherParticle.hue;
      var saturationDist = this.saturation - otherParticle.saturation;
      var bSameColor = hueDist == 0 && saturationDist == 0;

      if (dist > 0 && bSameColor)
      {
        // ==== Separation ====
        // For every boid in the system, check if it's too close
        var separationDist = (desiredseparation + ((this.scale + otherParticle.scale) * separationScaleMultip));

        if ( dist <  separationDist )
        {
          // Calculate vector pointing away from neighbor
          var diff = this.position.getDifference( otherParticle.position );
          diff.normalize();
          diff.divide(dist);        // Weight by distance
          separationVel.sum( diff );
          separationCount++;        // Keep track of how many

          /*var hueDist = this.hue - otherParticle.hue;
          var saturationDist = this.saturation - otherParticle.saturation;
          if (hueDist != 0)
          {
            this.hue -= hueDist * deltaTime * 0.1;
          }
          if (saturationDist != 0)
          {
            this.saturation -= saturationDist * deltaTime * 0.1;
          }*/
        }

        // ==== Alignment ====
        if (dist < alignmentDist)
        {
          alignmentVel.sum( otherParticle.velocity );
          alignmentCount++;
        }

        // ==== Cohesion ====
        if (dist < cohesionDist)
        {
          cohesionVel.sum( otherParticle.position ); // Add location
          cohesionCount++;
        }

      }
    }

    var totalVel = new Vector2D(0, 0);

    // ==== Separation ====
    // Average -- divide by how many
    if (separationCount > 0)
    {
      separationVel.divide(separationCount);
      if (separationVel.magnitude() > 0)
      {
        // Implement Reynolds: Steering = Desired - Velocity
        separationVel.normalize();
        separationVel.getDifference(this.velocity);
        separationVel.multiply(separationMultip);
      }
    }
    totalVel.sum(separationVel);

    // ==== Alignment ====
    if (alignmentCount > 0)
    {
      alignmentVel.divide(alignmentCount);
      if (alignmentVel.magnitude() > 0)
      {
        alignmentVel.normalize();
        alignmentVel.getDifference(this.velocity);
        alignmentVel.multiply(alignmentMultip);
      }
    }
    totalVel.sum(alignmentVel);

    // ==== Cohesion ====
    if (cohesionCount > 0)
    {
      cohesionVel.divide(cohesionCount);

      cohesionVel = cohesionVel.getDifference( this.position );  // A vector pointing from the location to the target
      // Normalize desired and scale to maximum speed
      cohesionVel.normalize();

      // Steering = Desired minus Velocity
      cohesionVel.getDifference(this.velocity);
      cohesionVel.multiply(cohesionMultip);
    }
    totalVel.sum(cohesionVel);

    return totalVel.multiply(boidVelMultip);

  }
}
