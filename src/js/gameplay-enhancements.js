import { GRID_X, GRID_Y, CELL, COLS, ROWS, SHAPES, TDEFS } from './config.js';

function researchValueText(gm,shape,idx){
  const d=TDEFS[shape],u=d.upgrades[idx],tu=gm.typeUpg[shape],cnt=tu.counts[idx];
  if(u.stat==='dmg'){
    const cur=tu.bDmg,next=cur+u.add;
    return `연구 보너스 데미지 +${cur} → +${next} · 레벨 성장률 +${Math.round((d.dmgGrowth||0)*100)}%/Lv`;
  }
  if(u.stat==='range'){
    const cur=tu.bRange,next=cur+u.add;
    return `연구 보너스 사거리 +${cur} → +${next}`;
  }
  if(u.stat==='spd'){
    const cur=Math.max(8,d.atk+tu.bSpd),next=Math.max(8,d.atk+tu.bSpd+u.add);
    return `Lv1 공격속도 ${(60/cur).toFixed(2)}/초 → ${(60/next).toFixed(2)}/초 · 공격간격 ${cur.toFixed(0)} → ${next.toFixed(0)}`;
  }
  if(u.stat==='aoe'){
    const cur=(d.aoeR||0)+tu.bAoe,next=cur+u.add;
    return `폭발 범위 ${cur} → ${next}`;
  }
  if(u.stat==='chains'){
    const cur=3+(tu.bChains||0),next=cur+u.add;
    return `연쇄 횟수 ${cur}회 → ${next}회`;
  }
  if(u.stat==='vulnerable'){
    const cur=(d.vulnerable||0)+cnt*u.add,next=cur+u.add;
    return `Lv1 취약 +${Math.round(cur*100)}% → +${Math.round(next*100)}% · 타워 레벨당 +${Math.round((d.vulnerableLv||0)*100)}%p`;
  }
  if(u.stat==='vulnerableDuration'){
    const cur=(d.vulnerableDuration||0)+cnt*u.add,next=cur+u.add;
    return `취약 지속 ${(cur/60).toFixed(0)}초 → ${(next/60).toFixed(0)}초`;
  }
  return `현재 연구 ${cnt}회 → ${cnt+1}회`;
}

export function applyGameplayEnhancements(gm){
  gm.renderUpgrade=function(force){
    if(!this.upgradeOpen)return;
    const hash=`${this.gold}|${JSON.stringify(this.typeUpg)}`;
    if(!force&&hash===this._upgHash)return;
    this._upgHash=hash;
    document.getElementById('upg-sub').textContent=`현재 자금: ${this.gold}G · 버튼을 꾹 누르면 연속 연구 · 난이도 ×${this.difficultyMultiplier.toFixed(2)}`;
    let html='';
    for(const shape of SHAPES){
      const d=TDEFS[shape],tu=this.typeUpg[shape];
      html+=`<div class="upg-type-section"><div class="upg-type-header"><span style="font-size:14px;font-weight:700;color:${d.color}">${d.label}</span><span style="font-size:10px;color:#7890aa">${d.tag}</span></div>`;
      d.upgrades.forEach((u,i)=>{
        const cnt=tu.counts[i],cost=this.upgCost(shape,i),can=this.gold>=cost;
        html+=`<div class="upg-row"><div class="upg-left"><div class="upg-name">${u.icon} ${u.name} ${cnt>0?`<span class="upg-cnt">×${cnt}</span>`:''}</div><div class="upg-desc">${u.desc}</div><div class="upg-desc" style="color:#93c5fd;margin-top:3px">${researchValueText(this,shape,i)}</div><div class="upg-cost">다음 연구 ${cost}G</div></div><button class="upg-btn" data-shape="${shape}" data-idx="${i}" ${can?'':'disabled'}>연구</button></div>`;
      });
      html+='</div>';
    }
    document.getElementById('upg-body').innerHTML=html;
  };

  const oldBuy=gm.buyUpg.bind(gm);
  gm.buyUpg=function(shape,idx){
    const cost=this.upgCost(shape,idx);
    if(this.gold<cost)return false;
    oldBuy(shape,idx);
    return true;
  };

  gm.toggleMergeLock=function(){
    if(this.gameOver||this.storyOpen||!this.selected){this.log('❌ 잠글 타워를 먼저 선택해 주세요.');return;}
    const t=this.grid[this.selected.row]?.[this.selected.col];
    if(!t||t.shape==='Gear'){this.log('⚙️ 전설 기어는 합성 대상이 아닙니다.');return;}
    t.mergeLocked=!t.mergeLocked;
    this.log(t.mergeLocked?`🔒 ${t.def.label} Lv.${t.level} 합성 잠금 완료`:`🔓 ${t.def.label} Lv.${t.level} 합성 잠금 해제`);
    this.updateUI();
  };

  gm.checkRecipe=function(){
    let triFound=null,squFound=null,starFound=null;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const t=this.grid[r][c];if(!t)continue;
      if(t.shape==='Triangle'&&t.level===7&&!triFound)triFound={r,c};
      else if(t.shape==='Square'&&t.level===7&&!squFound)squFound={r,c};
      else if(t.shape==='Star'&&t.level===5&&!starFound)starFound={r,c};
    }
    return{tri:triFound,squ:squFound,star:starFound,ready:!!(triFound&&squFound&&starFound)};
  };

  gm.triggerAutoMerge=function(){
    if(this.gameOver||this.storyOpen)return;
    let mergedAny=false,mergeCount=0,searching=true;
    while(searching){
      searching=false;
      loop1:for(let r1=0;r1<ROWS;r1++)for(let c1=0;c1<COLS;c1++){
        const t1=this.grid[r1][c1];if(!t1||t1.shape==='Gear'||t1.mergeLocked)continue;
        for(let r2=0;r2<ROWS;r2++)for(let c2=0;c2<COLS;c2++){
          if(r1===r2&&c1===c2)continue;
          const t2=this.grid[r2][c2];
          if(t2&&!t2.mergeLocked&&t1.shape===t2.shape&&t1.level===t2.level){
            t1.level++;this.grid[r2][c2]=null;this.score+=t1.level*60;mergedAny=true;mergeCount++;searching=true;break loop1;
          }
        }
      }
    }
    if(mergedAny){this.log(`✨ 잠금 타워를 제외하고 자동 합성 완료 (${mergeCount}회)`);this.hideTooltip();this.selected=null;}
    else this.log('❌ 잠금되지 않은 합성 가능한 쌍이 없습니다.');
    this.updateUI();
  };

  gm.handleClick=function(px,py){
    if(this.gameOver||this.storyOpen)return;
    const col=Math.floor((px-GRID_X)/CELL),row=Math.floor((py-GRID_Y)/CELL);
    if(col<0||col>=COLS||row<0||row>=ROWS){this.selected=null;this.hideTooltip();this.updateUI();return;}
    if(this.selected){
      const{row:sr,col:sc}=this.selected;
      if(sr===row&&sc===col){this.selected=null;this.hideTooltip();this.updateUI();return;}
      const src=this.grid[sr][sc];if(!src){this.selected=null;this.updateUI();return;}
      const dst=this.grid[row][col];
      if(dst&&(src.shape==='Gear'||dst.shape==='Gear')){this.log('⚙️ 전설 기어 타워는 머지할 수 없습니다.');this.selected=null;this.updateUI();return;}
      if(dst&&src.shape===dst.shape&&src.level===dst.level){
        if(src.mergeLocked||dst.mergeLocked){this.log('🔒 합성 잠금된 타워입니다. 잠금을 해제한 뒤 합성하세요.');this.selected=null;this.updateUI();return;}
        dst.level++;this.grid[sr][sc]=null;this.score+=dst.level*60;this.log(`✨ 머지 성공: Lv.${dst.level}`);this.showTooltip(dst,GRID_X+col*CELL+CELL/2,GRID_Y+row*CELL+CELL/2);
      }else if(!dst){src.col=col;src.row=row;src.updatePos();this.grid[row][col]=src;this.grid[sr][sc]=null;this.hideTooltip();}
      this.selected=null;
    }else{
      if(this.grid[row][col]){this.selected={row,col};this.showTooltip(this.grid[row][col],GRID_X+col*CELL+CELL/2,GRID_Y+row*CELL+CELL/2);}else this.hideTooltip();
    }
    this.updateUI();
  };

  const oldUpdateUI=gm.updateUI.bind(gm);
  gm.updateUI=function(){
    oldUpdateUI();
    const btn=document.getElementById('btn-l'),state=document.getElementById('l-state');
    if(!btn||!state)return;
    const t=this.selected?this.grid[this.selected.row]?.[this.selected.col]:null;
    if(!t||t.shape==='Gear'){
      btn.disabled=true;btn.firstElementChild.textContent='🔓 합성 잠금';state.textContent=t?.shape==='Gear'?'전설 기어는 잠금 불필요':'타워 선택 필요 [L]';
    }else{
      btn.disabled=false;btn.firstElementChild.textContent=t.mergeLocked?'🔒 합성 잠금 해제':'🔓 합성 잠금';state.textContent=t.mergeLocked?'자동/수동 합성 보호 중 [L]':'잠그면 합성에서 제외 [L]';
    }
    const status=this.checkRecipe();
    const tri=document.getElementById('rec-tri-st'),squ=document.getElementById('rec-squ-st'),star=document.getElementById('rec-star-st');
    if(tri&&!status.tri){tri.className='no';tri.textContent='정확히 L7 필요';}
    if(squ&&!status.squ){squ.className='no';squ.textContent='정확히 L7 필요';}
    if(star&&!status.star){star.className='no';star.textContent='정확히 L5 필요';}
  };

  const oldTooltip=gm.showTooltip.bind(gm);
  gm.showTooltip=function(t,px,py){
    oldTooltip(t,px,py);
    if(t.shape!=='Gear'){
      const body=document.getElementById('tt-body');
      body.insertAdjacentHTML('beforeend',`<div class="tt-row" style="color:${t.mergeLocked?'#facc15':'#7890aa'}">합성 잠금 <span>${t.mergeLocked?'🔒 ON':'🔓 OFF'}</span></div>`);
    }
  };

  gm.updateUI();
}
