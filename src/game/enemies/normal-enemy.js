import { ctx } from '../../js/config.js';
import { BaseEnemy } from './base-enemy.js';

export class NormalEnemy extends BaseEnemy {
  constructor(wave,difficultyMultiplier){
    super({
      size:10+Math.min(wave*0.35,7),
      maxHp:(40+wave*25+Math.pow(wave,1.7)*4.5)*difficultyMultiplier,
      speed:1.45+wave*0.05,
      color:`rgb(${Math.min(255,140+wave*8)},50,50)`,
      reward:Math.floor((6+wave*1.2)*difficultyMultiplier),
      isBoss:false,
    });
  }

  draw(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.sz,0,Math.PI*2);
    ctx.fillStyle=this.color;
    ctx.fill();
    ctx.strokeStyle='#ff8888';
    ctx.lineWidth=1;
    ctx.stroke();
    this.drawVulnerableRing();
    this.drawHealthBar();
  }
}
