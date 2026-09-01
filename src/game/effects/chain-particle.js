import { ctx } from '../../js/config.js';

export class ChainParticle {
  constructor(x1,y1,x2,y2,color){
    this.x1=x1;this.y1=y1;this.x2=x2;this.y2=y2;
    this.life=8;this.maxLife=8;this.color=color;
  }

  draw(){
    const p=this.life/this.maxLife;
    ctx.save();
    ctx.globalAlpha=p;
    ctx.beginPath();
    ctx.moveTo(this.x1,this.y1);
    ctx.lineTo(this.x2,this.y2);
    ctx.strokeStyle=this.color;
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.restore();
    this.life--;
  }
}
