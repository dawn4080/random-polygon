import { GRID_X, GRID_Y, CELL, TDEFS, GOLD_DMG_RATE, ctx } from '../../js/config.js';
import { Bullet } from '../projectiles/bullet.js';

export class Tower {
  constructor(col,row,shape){this.col=col;this.row=row;this.shape=shape;this.level=1;this.timer=0;this.mergeLocked=false;this.updatePos();}
  updatePos(){this.cx=GRID_X+this.col*CELL+CELL/2;this.cy=GRID_Y+this.row*CELL+CELL/2;}
  get def(){return TDEFS[this.shape];}
  get upg(){return globalThis.gm?.typeUpg?.[this.shape]??{counts:[0,0,0],bDmg:0,bRange:0,bSpd:0,bAoe:0,bChains:0};}
  get dmg(){
    const u=this.upg;
    const growth=this.def.dmgGrowth??0;
    const upgradedBase=this.def.dmg+u.bDmg;
    const base=Math.round(upgradedBase*Math.pow(1+growth,this.level-1));
    const goldBonus=Math.floor((globalThis.gm?.gold??0)*GOLD_DMG_RATE);
    return base+goldBonus;
  }
  get range(){const u=this.upg;return this.def.range+(this.level-1)*this.def.rangeLv+u.bRange;}
  get atk(){const u=this.upg;return Math.max(8,this.def.atk-(this.level-1)*2.5+u.bSpd);}
  get aoeR(){const u=this.upg;return(this.def.aoeR||0)+u.bAoe;}
  get maxChains(){const u=this.upg;return 3+(u.bChains||0);}
  get vulnerableAmount(){
    if(this.shape!=='Square')return 0;
    const research=(this.upg.counts?.[0]||0)*0.03;
    return (this.def.vulnerable||0)+(this.level-1)*(this.def.vulnerableLv||0)+research;
  }
  get vulnerableDuration(){
    if(this.shape!=='Square')return 0;
    const research=(this.upg.counts?.[2]||0)*60;
    return (this.def.vulnerableDuration||0)+research;
  }

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
    if(this.mergeLocked&&this.shape!=='Gear'){
      ctx.font='13px Segoe UI';ctx.fillStyle='#facc15';ctx.fillText('🔒',cx+22,cy-22);
    }
  }
}
