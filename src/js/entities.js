import {
  PATH, GRID_X, GRID_Y, CELL, TDEFS, GOLD_DMG_RATE, ctx,
} from './config.js';

class Enemy{
  constructor(wave,isBoss, difficultyMultiplier){
    this.x=PATH[0].x; this.y=PATH[0].y; this.pi=0; this.isBoss=isBoss;
    this.vulnerableAmount=0; this.vulnerableTimer=0;

    if(isBoss){
      this.sz=28;
      this.maxHp=(1300 + wave * 420 + Math.pow(wave, 1.8) * 45) * difficultyMultiplier;
      this.spd=0.65 + wave * 0.02;
      this.color='#ff3300';
      this.reward=Math.floor((150 + wave * 18) * difficultyMultiplier);
    }else{
      this.sz=10+Math.min(wave*0.35,7);
      this.maxHp=(40 + wave * 25 + Math.pow(wave, 1.7) * 4.5) * difficultyMultiplier;
      this.spd=1.45 + wave * 0.05;
      this.color=`rgb(${Math.min(255,140+wave*8)},50,50)`;
      this.reward=Math.floor((6 + wave * 1.2) * difficultyMultiplier);
    }
    this.hp=this.maxHp; this.alive=true;
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
      if(this.vulnerableTimer<=0){this.vulnerableTimer=0;this.vulnerableAmount=0;}
    }
    const t=PATH[this.pi],dx=t.x-this.x,dy=t.y-this.y,d=Math.hypot(dx,dy),s=this.spd*dt;
    if(d<s+1){this.x=t.x;this.y=t.y;this.pi=(this.pi+1)%PATH.length;}
    else{this.x+=dx/d*s;this.y+=dy/d*s;}
  }
  draw(){
    const{x,y,sz,hp,maxHp,color,isBoss}=this;
    if(isBoss){
      ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fillStyle='#2a0800';ctx.fill();
      ctx.beginPath();ctx.arc(x,y,sz-4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
      ctx.beginPath();ctx.arc(x,y,sz+3,0,Math.PI*2);ctx.strokeStyle='#ff9900';ctx.lineWidth=2.5;ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='13px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('👹',x,y);
    }else{
      ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
      ctx.strokeStyle='#ff8888';ctx.lineWidth=1;ctx.stroke();
    }
    if(this.vulnerableAmount>0){
      ctx.beginPath();ctx.arc(x,y,sz+5,0,Math.PI*2);ctx.strokeStyle='#c084fc';ctx.lineWidth=2;ctx.stroke();
    }
    const bw=Math.max(sz*2.4,26),bh=isBoss?7:4,bx=x-bw/2,by=y-sz-10;
    ctx.fillStyle='#111';ctx.fillRect(bx,by,bw,bh);
    const r=Math.max(0,hp/maxHp);
    ctx.fillStyle=r>.5?'#22c55e':r>.25?'#f59e0b':'#ef4444';
    ctx.fillRect(bx,by,bw*r,bh);
  }
}

class ChainParticle {
  constructor(x1, y1, x2, y2, color) {
    this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
    this.life = 15; this.maxLife = 15;
    this.color = color;
  }
  draw() {
    const p = this.life / this.maxLife;
    ctx.save();ctx.beginPath();ctx.moveTo(this.x1,this.y1);ctx.lineTo(this.x2,this.y2);
    ctx.strokeStyle=this.color;ctx.lineWidth=3*p;ctx.shadowColor=this.color;ctx.shadowBlur=10;ctx.stroke();ctx.restore();
    this.life--;
  }
}

class Bullet{
  constructor(sx,sy,target,dmg,color,aoe,aoeR,isGear,chainCount,vulnerableAmount=0,vulnerableDuration=0){
    this.x=sx;this.y=sy;this.target=target;this.spd=11;
    this.dmg=dmg;this.color=color;this.aoe=aoe;this.aoeR=aoeR||0;
    this.active=true;this.exploding=false;this.et=0;
    this.isGear=isGear;this.chainCount=chainCount||3;
    this.vulnerableAmount=vulnerableAmount;this.vulnerableDuration=vulnerableDuration;
  }
  move(dt,enemies,particles){
    if(this.exploding){this.et+=dt;if(this.et>12)this.active=false;return;}
    if(!this.target.alive){this.active=false;return;}
    const dx=this.target.x-this.x,dy=this.target.y-this.y,d=Math.hypot(dx,dy),s=this.spd*dt;
    if(d<s+2){
      if(this.isGear){
        this.triggerChainExplosion(this.x,this.y,this.target,enemies,particles,this.chainCount);this.exploding=true;
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

  triggerChainExplosion(sx,sy,currentTarget,enemies,particles,chainsLeft){
    if(!currentTarget||chainsLeft<=0)return;
    currentTarget.takeDamage(this.dmg);
    for(let r=0;r<5;r++){
      const angle=Math.random()*Math.PI*2,rx=currentTarget.x+Math.cos(angle)*15,ry=currentTarget.y+Math.sin(angle)*15;
      particles.push(new ChainParticle(currentTarget.x,currentTarget.y,rx,ry,`hsl(${Math.random()*360}, 100%, 70%)`));
    }
    const aliveEnemies=enemies.filter(e=>e.alive&&e!==currentTarget);
    if(aliveEnemies.length>0){
      let nextTarget=aliveEnemies[0],minDist=Math.hypot(nextTarget.x-currentTarget.x,nextTarget.y-currentTarget.y);
      for(const e of aliveEnemies){const d=Math.hypot(e.x-currentTarget.x,e.y-currentTarget.y);if(d<minDist){minDist=d;nextTarget=e;}}
      if(minDist<180){
        particles.push(new ChainParticle(currentTarget.x,currentTarget.y,nextTarget.x,nextTarget.y,'#ec4899'));
        setTimeout(()=>this.triggerChainExplosion(currentTarget.x,currentTarget.y,nextTarget,enemies,particles,chainsLeft-1),80);
      }
    }
  }

  draw(){
    if(this.exploding){
      const p=this.et/12;ctx.beginPath();ctx.arc(this.x,this.y,this.aoeR*p,0,Math.PI*2);
      ctx.fillStyle=`rgba(236, 72, 153, ${.35*(1-p)})`;ctx.fill();ctx.strokeStyle=`rgba(251,191,36,${.7*(1-p)})`;ctx.lineWidth=2;ctx.stroke();return;
    }
    if(this.isGear){
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Date.now()/100);ctx.fillStyle=`hsl(${Date.now()%360}, 100%, 65%)`;
      ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();ctx.restore();
    }else{
      ctx.beginPath();ctx.arc(this.x,this.y,this.aoe?6:4,0,Math.PI*2);ctx.fillStyle=this.color;ctx.shadowColor=this.color;ctx.shadowBlur=6;ctx.fill();ctx.shadowBlur=0;
    }
  }
}

class Tower{
  constructor(col,row,shape){this.col=col;this.row=row;this.shape=shape;this.level=1;this.timer=0;this.updatePos();}
  updatePos(){this.cx=GRID_X+this.col*CELL+CELL/2;this.cy=GRID_Y+this.row*CELL+CELL/2;}
  get def(){return TDEFS[this.shape];}
  get upg(){return globalThis.gm?.typeUpg?.[this.shape]??{bDmg:0,bRange:0,bSpd:0,bAoe:0,bChains:0};}
  get dmg(){
    const u=this.upg;
    const growth=this.def.dmgGrowth??0;
    const base=Math.round(this.def.dmg*Math.pow(1+growth,this.level-1))+u.bDmg;
    const goldBonus=Math.floor((globalThis.gm?.gold??0)*GOLD_DMG_RATE);
    return base+goldBonus;
  }
  get range(){const u=this.upg;return this.def.range+(this.level-1)*this.def.rangeLv+u.bRange;}
  get atk(){const u=this.upg;return Math.max(8,this.def.atk-(this.level-1)*2.5+u.bSpd);}
  get aoeR(){const u=this.upg;return(this.def.aoeR||0)+u.bAoe;}
  get maxChains(){const u=this.upg;return 3+(u.bChains||0);}
  get vulnerableAmount(){return this.shape==='Square'?(this.def.vulnerable||0)+(this.level-1)*(this.def.vulnerableLv||0):0;}
  get vulnerableDuration(){return this.shape==='Square'?(this.def.vulnerableDuration||0):0;}

  update(enemies,bullets,dt){
    this.timer+=dt;if(this.timer<this.atk)return;
    const ir=enemies.filter(e=>e.alive&&Math.hypot(e.x-this.cx,e.y-this.cy)<this.range);if(!ir.length)return;
    const boss=ir.find(e=>e.isBoss);const tgt=boss||ir.reduce((a,b)=>b.pi*1e6+b.x+b.y>a.pi*1e6+a.x+a.y?b:a);
    const isG=this.shape==='Gear';
    bullets.push(new Bullet(this.cx,this.cy,tgt,this.dmg,this.def.color,this.def.aoe,this.aoeR,isG,this.maxChains,this.vulnerableAmount,this.vulnerableDuration));
    this.timer=0;
  }

  _star(cx,cy,pts,r1,r2,color){ctx.beginPath();for(let i=0;i<pts*2;i++){const a=(i*Math.PI/pts)-Math.PI/2,r=i%2===0?r1:r2;i===0?ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}ctx.closePath();ctx.fillStyle=color;ctx.fill();}
  _gear(cx,cy,rOuter,rInner,teeth,color){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(Date.now()/1500);ctx.fillStyle=color;ctx.beginPath();
    for(let i=0;i<teeth*2;i++){const angle=(i*Math.PI)/teeth,r=i%2===0?rOuter:rInner;ctx.lineTo(Math.cos(angle)*r,Math.sin(angle)*r);}ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.arc(0,0,rInner*.4,0,Math.PI*2);ctx.fillStyle='#061108';ctx.fill();ctx.restore();
  }

  draw(sel,showR){
    const{cx,cy,level}=this,d=this.def;
    if(showR){ctx.beginPath();ctx.arc(cx,cy,this.range,0,Math.PI*2);ctx.fillStyle=d.color+'12';ctx.fill();ctx.strokeStyle=d.color+'44';ctx.lineWidth=1;ctx.stroke();}
    if(sel){ctx.beginPath();ctx.arc(cx,cy,33,0,Math.PI*2);ctx.strokeStyle='#fff8';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);}
    ctx.shadowColor=d.color;ctx.shadowBlur=sel?22:8;
    if(this.shape==='Triangle'){ctx.beginPath();ctx.moveTo(cx,cy-23);ctx.lineTo(cx-20,cy+15);ctx.lineTo(cx+20,cy+15);ctx.closePath();ctx.fillStyle=d.color;ctx.fill();}
    else if(this.shape==='Square'){ctx.fillStyle=d.color;ctx.beginPath();ctx.roundRect(cx-19,cy-19,38,38,4);ctx.fill();}
    else if(this.shape==='Star'){this._star(cx,cy,5,22,10,d.color);}
    else if(this.shape==='Gear'){const rainbow=`hsl(${Date.now()%360}, 85%, 60%)`;this._gear(cx,cy,24,16,8,rainbow);}
    ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 11px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`L${level}`,cx,cy+30);
  }
}

export { Enemy, ChainParticle, Bullet, Tower };
