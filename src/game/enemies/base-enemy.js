import { PATH, ctx } from '../../js/config.js';

export class BaseEnemy {
  constructor({ size, maxHp, speed, color, reward, isBoss=false }) {
    this.x=PATH[0].x;
    this.y=PATH[0].y;
    this.pi=0;
    this.isBoss=isBoss;
    this.sz=size;
    this.maxHp=maxHp;
    this.hp=maxHp;
    this.spd=speed;
    this.color=color;
    this.reward=reward;
    this.alive=true;
    this.vulnerableAmount=0;
    this.vulnerableTimer=0;
  }

  takeDamage(amount){
    const multiplier=1+this.vulnerableAmount;
    this.hp-=amount*multiplier;
    if(this.hp<=0)this.alive=false;
  }

  applyVulnerable(amount,duration){
    this.vulnerableAmount=Math.max(this.vulnerableAmount,amount);
    this.vulnerableTimer=Math.max(this.vulnerableTimer,duration);
  }

  move(dt){
    if(this.vulnerableTimer>0){
      this.vulnerableTimer-=dt;
      if(this.vulnerableTimer<=0){
        this.vulnerableTimer=0;
        this.vulnerableAmount=0;
      }
    }
    const target=PATH[this.pi];
    const dx=target.x-this.x,dy=target.y-this.y,distance=Math.hypot(dx,dy),step=this.spd*dt;
    if(distance<step+1){
      this.x=target.x;
      this.y=target.y;
      this.pi=(this.pi+1)%PATH.length;
    }else{
      this.x+=dx/distance*step;
      this.y+=dy/distance*step;
    }
  }

  drawHealthBar(){
    const bw=Math.max(this.sz*2.4,26),bh=this.isBoss?7:4,bx=this.x-bw/2,by=this.y-this.sz-10;
    ctx.fillStyle='#111';
    ctx.fillRect(bx,by,bw,bh);
    const ratio=Math.max(0,this.hp/this.maxHp);
    ctx.fillStyle=ratio>.5?'#22c55e':ratio>.25?'#f59e0b':'#ef4444';
    ctx.fillRect(bx,by,bw*ratio,bh);
  }

  drawVulnerableRing(){
    if(this.vulnerableAmount<=0)return;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.sz+5,0,Math.PI*2);
    ctx.strokeStyle='#c084fc';
    ctx.lineWidth=2;
    ctx.stroke();
  }
}
