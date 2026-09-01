import { ctx } from '../../js/config.js';
import { ChainParticle } from '../effects/chain-particle.js';

export class Bullet {
  constructor(sx,sy,target,dmg,color,aoe,aoeR,isGear,chainCount,vulnerableAmount=0,vulnerableDuration=0){
    this.x=sx;this.y=sy;this.target=target;this.spd=11;
    this.dmg=dmg;this.color=color;this.aoe=aoe;this.aoeR=aoeR||0;
    this.active=true;this.exploding=false;this.et=0;
    this.isGear=isGear;this.chainCount=chainCount||3;
    this.vulnerableAmount=vulnerableAmount;this.vulnerableDuration=vulnerableDuration;
  }

  move(dt,enemies,particles){
    if(this.exploding){this.et+=dt;if(this.et>7)this.active=false;return;}
    if(!this.target.alive){this.active=false;return;}
    const dx=this.target.x-this.x,dy=this.target.y-this.y,d=Math.hypot(dx,dy),s=this.spd*dt;
    if(d<s+2){
      if(this.isGear){
        this.triggerChainExplosion(this.target,enemies,particles,this.chainCount);this.exploding=true;
      }else if(this.aoe){
        enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-this.x,e.y-this.y)<this.aoeR)e.takeDamage(this.dmg);});
        this.exploding=true;
      }else{
        this.target.takeDamage(this.dmg);
        if(this.vulnerableAmount>0&&this.target.alive)this.target.applyVulnerable(this.vulnerableAmount,this.vulnerableDuration);
        this.active=false;
      }
    }else{this.x+=dx/d*s;this.y+=dy/d*s;}
  }

  triggerChainExplosion(firstTarget,enemies,particles,maxChains){
    let current=firstTarget;
    const visited=new Set();
    for(let hop=0;hop<maxChains&&current&&current.alive;hop++){
      visited.add(current);
      current.takeDamage(this.dmg);
      const candidates=enemies.filter(e=>e.alive&&!visited.has(e));
      let next=null,minDist=Infinity;
      for(const e of candidates){
        const dist=Math.hypot(e.x-current.x,e.y-current.y);
        if(dist<180&&dist<minDist){minDist=dist;next=e;}
      }
      if(!next)break;
      particles.push(new ChainParticle(current.x,current.y,next.x,next.y,'#ec4899'));
      current=next;
    }
  }

  draw(){
    if(this.exploding){
      const p=this.et/7;
      ctx.beginPath();ctx.arc(this.x,this.y,10+8*p,0,Math.PI*2);
      ctx.strokeStyle=`rgba(236,72,153,${0.55*(1-p)})`;ctx.lineWidth=2;ctx.stroke();return;
    }
    if(this.isGear){
      ctx.beginPath();ctx.arc(this.x,this.y,5,0,Math.PI*2);ctx.fillStyle='#ec4899';ctx.fill();
    }else{
      ctx.beginPath();ctx.arc(this.x,this.y,this.aoe?6:4,0,Math.PI*2);ctx.fillStyle=this.color;ctx.fill();
    }
  }
}
