function ParticleGenerator(maxParticles, spawnParticleFunct, getParticleFunct)
{
    this.particles = [];
    this.particlePool = new ObjectPool();
    this.maxParticles = maxParticles;

    this.getParticle = getParticleFunct;
    this.spawnParticle = spawnParticleFunct;

    this.resetParticles = function()
    {
        while (this.particles.length > 0)
        {
            this.particlePool.addToPool(this.particles.pop());
        }
    }

    this.createParticles = function( nParticles, pos, radius, forceCenter, forceMultip, lifeTimeN )
    {
        for (var i = 0; i < nParticles; i++)
        {
            if (this.particles.length < maxParticles)
            {
                var theParticle = this.particlePool.getItem();
                if (theParticle == null) { theParticle = this.getParticle(); }

                var posX = pos.x + (Math.sin(Math.random() * Math.TWOPI) * (Math.random() * radius));
                var posY = pos.y + (Math.cos(Math.random() * Math.TWOPI) * (Math.random() * radius));

                particleForce = new Vector2D(posX, posY).getDifference(forceCenter);
                particleForce.normalize();
                particleForce = particleForce.getMultiplied(forceMultip);

                this.spawnParticle(theParticle, new Vector2D(posX, posY), particleForce, lifeTimeN);
                this.particles.push(theParticle);
            }
            else
            {
                i = nParticles;
            }
        }
    }

    this.update = function(callback)
    {
        var l = this.particles.length;
        let particle;
        for ( var n = 0; n < l; n ++ )
        {
            particle = this.particles[n];
            if (callback(particle) == false)
            {
                this.particlePool.addToPool(particle);
                this.particles.splice(n, 1);
                n--;
                l--;
            }
        }
    }

    this.draw = function(callback) 
    {	 
        var l = this.particles.length;
        for ( var n = 0; n < l; n ++ )
        {
            callback(this.particles[n]);
        }
    }
}