function Moon()
{
  this.size = 1;
  this.color = [255, 255, 255];

  this.draw = function( ctx, x, y )
  {
    //halo and rings
    ctx.fillStyle = 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 0.025)';
    ctx.beginPath();
    ctx.arc(x-1, y+2, this.size*2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 0.05)';
    ctx.beginPath();
    ctx.arc(x-2, y-1, this.size*1.4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 0.05)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(x, y, this.size*1.8, 0, 2 * Math.PI);
    ctx.stroke();

    //the actual moon shape
    ctx.fillStyle = 'rgba('+this.color[0]+', '+this.color[1]+','+this.color[2]+', 1)';
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, 2 * Math.PI);
    ctx.fill();

    //the craters
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(x+2, y+5, this.size-5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(x+(this.size*0.1), y+(this.size*0.3), this.size*0.2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(x+(this.size*0.6), y+(this.size*0.1), this.size*0.15, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(x-(this.size*0.4), y+(this.size*0.025), this.size*0.1, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(x-(this.size*0.6), y-(this.size*0.1), this.size*0.2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(x-(this.size*0.3), y-(this.size*0.6), this.size*0.1, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(x+(this.size*0.6), y-(this.size*0.4), this.size*0.15, 0, 2 * Math.PI);
    ctx.fill();
  }
}
