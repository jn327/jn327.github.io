function DrawBot( _noiseFunct )
{
  //Call our prototype
  GameObject.call(this);

  var active          = false;

  var noiseSpeedMultip= 400;
  var friction        = Math.scaleNormal(Math.random(), 3, 4);

  var scaleNoise      = new SimplexNoise();
  var minScale        = 3;
  var maxScale        = 5;
  var scaleNoiseScale = 4;

  var boidVelMultip         = 6;
  var separationMultip      = 1;
  var alignmentMultip       = 0.025;
  var cohesionMultip        = 0.025;
  var desiredseparation     = 200;
  var separationScaleMultip = 0;
  var alignmentDist         = 400;
  var cohesionDist          = 400;

  var mouseAvoidanceVelMultip = 15;
  var mouseSeparation         = 175;

  var noiseFunct      = _noiseFunct;

  this.color;

  var scaleNoiseSeed  = 0;

  this.velocity     = new Vector2D(0,0);

  this.spawn = function(x, y, theColor)
  {
    this.position.x = x;
    this.position.y = y;

    this.color      = theColor;

    this.velocity.x = 0;
    this.velocity.y = 0;

    scaleNoiseSeed = Math.random(0, 1000000);

    active = true;
  }

  this.update = function( deltaTime, xMin, yMin, xMax, yMax, otherParticles, mousePos )
  {
    var theVel = noiseFunct( this.position.x, this.position.y );
    var boidVel = this.getBoidVel(otherParticles, deltaTime);

    var mouseVel = new Vector2D(0, 0);
    if (mousePos != undefined)
    {
      var dist = this.position.distance( mousePos );
      if (dist < mouseSeparation)
      {
        mouseVel = this.position.getDifference( mousePos );
        mouseVel.normalize();
        mouseVel.divide(dist);        // Weight by distance

        if (mouseVel.magnitude() > 0)
        {
          // Implement Reynolds: Steering = Desired - Velocity
          mouseVel.normalize();
          mouseVel.getDifference(this.velocity);
          mouseVel.multiply(mouseAvoidanceVelMultip);
        }
      }
    }

    this.velocity.x += ((theVel[0] * noiseSpeedMultip) + boidVel.x + mouseVel.x);
    this.velocity.y += ((theVel[1] * noiseSpeedMultip) + boidVel.y + mouseVel.y);

    //TODO: if near bounds, add force away or something.


    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x < xMin)
    {
      //this.position.x = xMin;
      this.position.x = xMax;
    }
    if (this.position.y < yMin)
    {
      //this.position.y = yMin;
      this.position.y = yMax;
    }
    if (this.position.x > xMax)
    {
      //this.position.x = xMax;
      this.position.x = xMin;
    }
    if (this.position.y > yMax)
    {
      //this.position.y = yMax;
      this.position.y = yMin;
    }

    //apply friction
    var tFriction = friction * deltaTime;
    if (tFriction > 1)
    {
      tFriction = 1;
    }
    this.velocity.multiply(1 - tFriction);

    //scale
    var endScale = scaleNoise.scaledNoise((scaleNoiseSeed + GameLoop.currentTime) * scaleNoiseScale, 0);
    this.scale = Math.scaleNormal( endScale, minScale, maxScale );
    if (this.scale < 0)
    {
      this.scale = 0;
    }

  }

  this.isActive = function()
  {
    return active;
  }

  this.despawn = function()
  {
    active = false;
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

      if (dist > 0)
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
