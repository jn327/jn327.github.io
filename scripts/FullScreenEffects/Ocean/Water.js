function Water(noise)
{
    var splashParticles = new ParticleGenerator(
        50,
        (particle, position, force, lifeTime) => {  particle.setup(position, force, lifeTime); },
        () => { return new WaterParticle(); }
    );

    this.createCollisionParticles = function (pos, force)
    {
        //TODO: based on a curve?
        let forceMultip = new Vector2D(force.x, force.y).magnitude() * 0.25;
        let nParticles = forceMultip * 0.2;
        let radius = 1;
        let lifeTimeN = forceMultip * 3;

        let forceCenter = pos;
        splashParticles.createParticles(nParticles, pos, radius, forceCenter, forceMultip, lifeTimeN);
    }

    this.update = function()
    {
        splashParticles.update((particle) =>
        {
            return particle.update();
        });
    }

    this.draw = function(ctx, screenWidth, screenHeight) 
    {	
        splashParticles.draw((particle) =>
        {
            particle.draw(ctx);
        });
    }
}