function Water()
{
    var splashParticles = new ParticleGenerator(
        50,
        (particle, position, force, lifeTime) => {  particle.setup(position, force, lifeTime); },
        () => { return new WaterParticle(); }
    );

    this.createCollisionParticles = function (pos, force)
    {
        //TODO: based on a curve?
        let forceMultip = new Vector2D(force.x, force.y).magnitude();
        let nParticles = forceMultip * 0.2;
        let radius = forceMultip * 0.005;
        let lifeTimeN = forceMultip * 0.75;

        let forceCenter = pos;
        splashParticles.createParticles(nParticles, pos, radius, forceCenter, forceMultip, lifeTimeN);
    }

    this.update = function(deltaTime)
    {
        splashParticles.update((particle) =>
        {
            return particle.update(deltaTime);
        });
    }

    this.draw = function(ctx, cameraOffset, screenWidth, screenHeight) 
    {	
        splashParticles.draw((particle) =>
        {
            particle.draw(ctx, cameraOffset);
        });
    }
}