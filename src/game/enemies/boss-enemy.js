import { ctx } from '../../js/config.js';
import { BaseEnemy } from './base-enemy.js';

export class BossEnemy extends BaseEnemy {
  constructor(wave,difficultyMultiplier){
    super({
      size:28,
      maxHp:(1300+wave*420+Math.pow(wave,1.8)*45)*difficultyMultiplier,
      speed:0.65+wave*0.02,
      color:'#ff3300',
      reward:Math.floor((150+wave*18)*difficultyMultiplier),
      isBoss:true,
    });
  }

  draw(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.sz,0,Math.PI*2);
    ctx.fillStyle='#2a0800';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.sz-4,0,Math.PI*2);
    ctx.fillStyle=this.color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.sz+3,0,Math.PI*2);
    ctx.strokeStyle='#ff9900';
    ctx.lineWidth=2.5;
    ctx.stroke();
    ctx.fillStyle='#fff';
    ctx.font='13px serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('👹',this.x,this.y);
    this.drawVulnerableRing();
    this.drawHealthBar();
  }
}
