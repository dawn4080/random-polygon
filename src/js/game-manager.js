import {
  CW, CH, PW, PATH, GRID_X, GRID_Y, CELL, COLS, ROWS, MAX_ENEMIES,
  BOSS_EVERY, BOSS_LIMIT, WAVE_ENEMIES, INTER_DELAY, SUMMON_COST_INIT,
  GOLD_DMG_RATE, SHAPES, RARITY, TDEFS, rollShape, canvas, ctx,
} from './config.js';
import { Enemy, Tower } from './entities.js';

class GameManager {
  constructor(){this.init();}

  init(){
    this.enemies=[];this.bullets=[]; this.particles=[];
    this.grid=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    this.gold=180;this.wave=0;this.score=0;
    this.waveActive=false;this.spawnQ=0;this.spawnAcc=0;this.spawnInterval=30;

    this.speedMult=1;

    this.selected=null;this.gameOver=false;
    this.upgradeOpen=false;
    this.recipeOpen=false;
    this._upgHash='';
    this.bossWave=false;this.bossAlive=false;this.bossTimeLeft=0;this.bossTimerAcc=0;
    this.nextWaveCD=INTER_DELAY;
    this.spawnDone=false;this.spawnDoneCD=0;
    this.summonCost=SUMMON_COST_INIT;

    this.difficultyMultiplier = 1.0;

    this.banners = [];

    this.storyOpen = globalThis.rpGameStarted ? globalThis.rpSettings?.storyEnabled !== false : true;
    this.storyStep = 0;
    this.stories = [
      {
        title: "각이 지배하는 기하학의 왕국",
        desc: "오랜 세월 동안 이 세상은 날카로운 선과 뚜렷한 모서리를 가진 '다각형'들이 지배하는 사회였습니다.\n\n삼각형 사제, 사각형 저격수, 에픽 별 마법사들은 세상을 수놓으며 번영을 누렸습니다.",
        visual: "📐"
      },
      {
        title: "주변인으로 밀려났던 '동그라미'",
        desc: "하지만 각이 전혀 없고 완벽하게 둥글다는 이유만으로, '동그라미'들은 문명의 변두리로 내쫓겼습니다.\n\n모서리가 없어 구르기만 해야 했던 슬픈 원형 구체들은 혹독한 차별과 지배 속에 고통받아 왔습니다.",
        visual: "🔴"
      },
      {
        title: "슬픈 원형 구체들의 대반란",
        desc: "마침내 고통을 견디다 못한 동그라미 군단이 힘을 모아 혁명을 외쳤습니다.\n\n\"우리의 둥근 매끈함을 세상에 선사하겠다!\"\n그들은 다각형의 성벽을 허물기 위해 대규모 세력 반역을 시작했습니다.",
        visual: "👿"
      },
      {
        title: "다각형들의 연합 방어군 결성",
        desc: "사태의 심각성을 인지한 다각형 종족들은 오랜 갈등과 반목을 접어두고 힘을 합쳤습니다.\n\n가장 강력한 방벽과 신비로운 원소 융합을 연구하여 외곽 성벽에 방어 타워를 건설하기에 이릅니다.",
        visual: "🛡️"
      },
      {
        title: "기하학 방어 전쟁의 시작!",
        desc: "침략해오는 수많은 동그라미 적들을 처치하고 골드를 획득하십시오.\n\n삼각형, 사각형, 별 타워를 전략적으로 융합해 최강의 연쇄 폭발을 일으키는 무지개색 [⚙️ 전설 기어 타워]를 연성하여 방어선을 끝까지 수호하십시오!",
        visual: "⚙️"
      }
    ];

    this.initTypeUpg();
    document.getElementById('boss-wrap').style.display='none';
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('upg-modal').classList.remove('show');
    this.closeRecipeModal();
    this.hideTooltip();
    this.renderStory();
    this.updateUI();
  }

  renderStory() {
    const modal = document.getElementById('story-modal');
    if (!this.storyOpen) {
      modal.style.display = 'none';
      return;
    }
    modal.style.display = 'flex';
    const current = this.stories[this.storyStep];
    document.getElementById('story-title').textContent = current.title;
    document.getElementById('story-desc').textContent = current.desc;
    document.getElementById('story-visual').textContent = current.visual;

    const nextBtn = document.getElementById('story-next-btn');
    if (this.storyStep === this.stories.length - 1) {
      nextBtn.textContent = "🛡️ 기지 수호 시작!";
      nextBtn.className = "px-6 py-2.5 rounded-[8px] bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold transition shadow-[0_4px_12px_rgba(16,185,129,0.3)]";
    } else {
      nextBtn.textContent = "다음 이야기 ➔";
      nextBtn.className = "px-6 py-2.5 rounded-[8px] bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-[0_4px_12px_rgba(14,165,233,0.3)]";
    }
  }

  nextStory() {
    if (this.storyStep < this.stories.length - 1) {
      this.storyStep++;
      this.renderStory();
    } else {
      this.skipStory();
    }
  }

  skipStory() {
    this.storyOpen = false;
    this.renderStory();
    this.log('🛡️ 기하학 방어선이 구축되었습니다. 웨이브 1 대기 중!');
    this.spawnBanner('⚔️ 방어를 준비하십시오! ⚔️', '#38bdf8');
  }

  spawnBanner(text, color) {
    this.banners.push({text,color,y:-30,targetY:300,life:140,alpha:1});
  }

  triggerBtnAnim(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.remove('bounce-active');
    void btn.offsetWidth;
    btn.classList.add('bounce-active');
    setTimeout(() => btn.classList.remove('bounce-active'), 400);
  }

  initTypeUpg(){
    this.typeUpg={};
    for(const k of SHAPES) this.typeUpg[k]={counts:[0,0,0],bDmg:0,bRange:0,bSpd:0,bAoe:0,bChains:0};
  }

  applyTypeUpg(shape,u){
    const tu=this.typeUpg[shape];
    if(u.stat==='dmg')tu.bDmg+=u.add;
    else if(u.stat==='range')tu.bRange+=u.add;
    else if(u.stat==='spd')tu.bSpd+=u.add;
    else if(u.stat==='aoe')tu.bAoe+=u.add;
    else if(u.stat==='chains')tu.bChains+=u.add;
  }

  openRecipeModal() {
    this.recipeOpen = true;
    document.getElementById('recipe-modal').style.display = 'flex';
    this.renderRecipeModal();
  }

  closeRecipeModal() {
    this.recipeOpen = false;
    document.getElementById('recipe-modal').style.display = 'none';
  }

  renderRecipeModal() {
    if (!this.recipeOpen) return;
    const status = this.checkRecipe();
    const container = document.getElementById('rec-modal-materials');

    const triHTML = `
      <div class="flex items-center gap-3.5 p-3 rounded-[8px] border ${status.tri ? 'border-sky-500/40 bg-sky-950/20' : 'border-[#1e3050] bg-[#0c131c]'}" style="transition: all 0.2s">
        <div class="w-10 h-10 flex items-center justify-center bg-[#111827] rounded-[6px] border border-[#1e3050]">
          <svg width="22" height="22" viewBox="0 0 40 40"><polygon points="20,6 6,34 34,34" fill="#38bdf8" /></svg>
        </div>
        <div class="flex-1">
          <div class="text-xs font-bold text-white flex items-center justify-between"><span>▲ 삼각형 타워</span><span class="text-[10px] text-[#4a7a9a]">(Lv.7 필요)</span></div>
          <div class="text-[11px] mt-1 font-semibold flex items-center gap-1.5 ${status.tri ? 'text-emerald-400' : 'text-rose-400'}"><span>${status.tri ? '✓ 조건 충족' : '✗ 미보유'}</span><span class="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">${status.tri ? '1' : '0'}/1</span></div>
        </div>
      </div>`;

    const squHTML = `
      <div class="flex items-center gap-3.5 p-3 rounded-[8px] border ${status.squ ? 'border-purple-500/40 bg-purple-950/20' : 'border-[#1e3050] bg-[#0c131c]'}" style="transition: all 0.2s">
        <div class="w-10 h-10 flex items-center justify-center bg-[#111827] rounded-[6px] border border-[#1e3050]">
          <svg width="22" height="22" viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" rx="4" fill="#a78bfa" /></svg>
        </div>
        <div class="flex-1">
          <div class="text-xs font-bold text-white flex items-center justify-between"><span>■ 사각형 타워</span><span class="text-[10px] text-[#4a7a9a]">(Lv.7 필요)</span></div>
          <div class="text-[11px] mt-1 font-semibold flex items-center gap-1.5 ${status.squ ? 'text-emerald-400' : 'text-rose-400'}"><span>${status.squ ? '✓ 조건 충족' : '✗ 미보유'}</span><span class="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">${status.squ ? '1' : '0'}/1</span></div>
        </div>
      </div>`;

    const starHTML = `
      <div class="flex items-center gap-3.5 p-3 rounded-[8px] border ${status.star ? 'border-amber-500/40 bg-amber-950/20' : 'border-[#1e3050] bg-[#0c131c]'}" style="transition: all 0.2s">
        <div class="w-10 h-10 flex items-center justify-center bg-[#111827] rounded-[6px] border border-[#1e3050]">
          <svg width="22" height="22" viewBox="0 0 40 40"><polygon points="20,2 25,14 38,14 28,23 32,36 20,28 8,36 12,23 2,14 15,14" fill="#fbbf24" /></svg>
        </div>
        <div class="flex-1">
          <div class="text-xs font-bold text-white flex items-center justify-between"><span>★ 별 타워</span><span class="text-[10px] text-[#4a7a9a]">(Lv.5 필요)</span></div>
          <div class="text-[11px] mt-1 font-semibold flex items-center gap-1.5 ${status.star ? 'text-emerald-400' : 'text-rose-400'}"><span>${status.star ? '✓ 조건 충족' : '✗ 미보유'}</span><span class="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">${status.star ? '1' : '0'}/1</span></div>
        </div>
      </div>`;

    container.innerHTML = triHTML + squHTML + starHTML;
    const combineBtn = document.getElementById('modal-combine-btn');
    if (status.ready) {
      combineBtn.disabled = false;
      combineBtn.classList.remove('from-gray-700','to-gray-700','opacity-40','cursor-not-allowed');
      combineBtn.classList.add('from-pink-600','to-purple-600','animate-pulse');
      combineBtn.innerHTML = '🔮 전설 조합 연성 실행 (준비 완료!)';
    } else {
      combineBtn.disabled = true;
      combineBtn.classList.add('from-gray-700','to-gray-700','opacity-40','cursor-not-allowed');
      combineBtn.classList.remove('from-pink-600','to-purple-600','animate-pulse');
      combineBtn.innerHTML = '🔮 조합 재료 부족 (필드 타워 준비 필요)';
    }
  }

  typeStats(shape,level){
    const d=TDEFS[shape],u=this.typeUpg[shape];
    const growth=d.dmgGrowth??0;
    const upgradedBase=d.dmg+u.bDmg;
    return{
      dmg:Math.round(upgradedBase*Math.pow(1+growth,level-1))+Math.floor(this.gold*GOLD_DMG_RATE),
      range:d.range+(level-1)*d.rangeLv+u.bRange,
      atk:Math.max(8,d.atk-(level-1)*2.5+u.bSpd),
      aoeR:(d.aoeR||0)+u.bAoe
    };
  }

  upgCost(shape,idx){
    const cnt=this.typeUpg[shape].counts[idx];
    return TDEFS[shape].upgrades[idx].baseCost + (cnt * 30);
  }

  restart(){this.init();}
  log(m){document.getElementById('log').textContent=m;}
  hideTooltip(){document.getElementById('tooltip').style.display='none';}

  showTooltip(t,px,py){
    const d=t.def,r=RARITY[d.rarity],gb=Math.floor(this.gold*GOLD_DMG_RATE);
    document.getElementById('tt-name').innerHTML=d.label+` <span class="rarity ${r.cls}">${r.label}</span> · ${d.tag} Lv.${t.level}`;
    document.getElementById('tt-name').style.color=d.color;
    let html=`<div class="tt-row">데미지 <span>${t.dmg}</span></div>
<div class="tt-row">사거리 <span>${t.range}</span></div>
<div class="tt-row">공격속도 <span>${(60/t.atk).toFixed(1)}/초</span></div>`;
    if(t.shape==='Square'){
      html+=`<div class="tt-row" style="color:#c084fc">취약 효과 <span>+${Math.round(t.vulnerableAmount*100)}%</span></div>`;
      html+=`<div class="tt-row" style="color:#c084fc">취약 지속 <span>${(t.vulnerableDuration/60).toFixed(0)}초</span></div>`;
    }
    if(t.shape==='Gear') html+=`<div class="tt-row">연쇄 횟수 <span>${t.maxChains}회</span></div>`;
    html+=`<div class="tt-row" style="color:#4ade80">골드 보너스 <span>+${gb}</span></div>`;
    document.getElementById('tt-body').innerHTML=html;
    const tip=document.getElementById('tooltip');
    const rect=canvas.getBoundingClientRect(),sc=rect.width/CW;
    let lx=px*sc+14,ly=py*sc-14;
    if(lx+230>rect.width)lx=px*sc-240;
    tip.style.left=Math.max(0,lx)+'px';tip.style.top=Math.max(0,ly)+'px';tip.style.display='block';
  }

  openUpgrade(){
    if(this.storyOpen)return;
    this.upgradeOpen=true;
    document.getElementById('upg-modal').classList.add('show');
    this._upgHash='';
    this.renderUpgrade(true);
    this.log('🧪 연구소가 열려 있어도 전투는 계속 진행됩니다.');
  }
  closeUpgrade(){this.upgradeOpen=false;document.getElementById('upg-modal').classList.remove('show');}

  renderUpgrade(force){
    if(!this.upgradeOpen)return;
    const hash=`${this.gold}|${JSON.stringify(this.typeUpg)}`;
    if(!force&&hash===this._upgHash)return;
    this._upgHash=hash;
    document.getElementById('upg-sub').textContent=`현재 자금: ${this.gold}G · 종합 난이도 배율: ×${this.difficultyMultiplier.toFixed(2)}`;
    let html='';
    for(const shape of SHAPES){
      const d=TDEFS[shape],r=RARITY[d.rarity],tu=this.typeUpg[shape];
      html+=`<div class="upg-type-section"><div class="upg-type-header"><span style="font-size:14px;font-weight:700;color:${d.color}">${d.label}</span><span class="rarity ${r.cls}">${r.label}</span></div>`;
      d.upgrades.forEach((u,i)=>{
        const cnt=tu.counts[i],cost=this.upgCost(shape,i),can=this.gold>=cost;
        html+=`<div class="upg-row"><div class="upg-left"><div class="upg-name">${u.icon} ${u.name} ${cnt>0?`<span class="upg-cnt">×${cnt}</span>`:''}</div><div class="upg-desc">${u.desc}</div><div class="upg-cost">${cost}G</div></div><button class="upg-btn" data-shape="${shape}" data-idx="${i}" ${can?'':'disabled'}>연구</button></div>`;
      });
      html+='</div>';
    }
    document.getElementById('upg-body').innerHTML=html;
  }

  buyUpg(shape,idx){
    const cost=this.upgCost(shape,idx);
    if(this.gold<cost)return;
    this.gold-=cost;
    this.typeUpg[shape].counts[idx]++;
    this.applyTypeUpg(shape,TDEFS[shape].upgrades[idx]);
    this.log(`⚙️ 연구 완료: ${TDEFS[shape].label} [${TDEFS[shape].upgrades[idx].name}]`);
    this.renderUpgrade(true);this.updateUI();
  }

  checkRecipe() {
    let triFound=null,squFound=null,starFound=null;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const t=this.grid[r][c];if(!t)continue;
      if(t.shape==='Triangle'&&t.level>=7&&!triFound)triFound={r,c};
      else if(t.shape==='Square'&&t.level>=7&&!squFound)squFound={r,c};
      else if(t.shape==='Star'&&t.level>=5&&!starFound)starFound={r,c};
    }
    return{tri:triFound,squ:squFound,star:starFound,ready:(triFound&&squFound&&starFound)};
  }

  getRefundValue(t) {
    if(!t)return 0;
    if(t.shape==='Gear')return Math.floor(this.summonCost*2.5);
    return Math.floor(this.summonCost*0.5*t.level);
  }

  sellTower() {
    if(this.gameOver||this.storyOpen)return;
    if(!this.selected){this.log('❌ 판매할 타워를 먼저 클릭하여 선택해 주세요.');return;}
    const{row,col}=this.selected,t=this.grid[row][col];if(!t)return;
    const refund=this.getRefundValue(t);this.gold+=refund;this.grid[row][col]=null;
    this.log(`💰 타워 판매 완료: +${refund}G 획득 (Lv.${t.level} ${t.def.label})`);
    this.selected=null;this.hideTooltip();this.updateUI();
  }

  updateUI(){
    const currentTowers=this.grid.flat().filter(Boolean).length;
    document.getElementById('s-gold').textContent=this.gold+'G';
    document.getElementById('s-wave').textContent=this.wave;
    document.getElementById('s-score').textContent=this.score;
    document.getElementById('s-towers').textContent=`${currentTowers} / 20`;
    const pct=Math.min(100,this.enemies.length/MAX_ENEMIES*100);
    document.getElementById('ec-inner').style.width=pct+'%';
    document.getElementById('ec-text').textContent=`${this.enemies.length} / ${MAX_ENEMIES}`;
    document.getElementById('s-cost').textContent=`비용: ${this.summonCost}G [S]`;
    document.getElementById('btn-s').disabled=(this.gold<this.summonCost||this.gameOver||currentTowers>=20||this.storyOpen);

    const sellBtn=document.getElementById('btn-x'),sellCost=document.getElementById('x-cost');
    if(this.selected&&!this.storyOpen){
      const{row,col}=this.selected,t=this.grid[row][col];
      if(t){const refund=this.getRefundValue(t);sellBtn.disabled=false;sellCost.textContent=`판매가: +${refund}G [X]`;}
      else{sellBtn.disabled=true;sellCost.textContent='타워 선택 필요 [X]';}
    }else{sellBtn.disabled=true;sellCost.textContent='타워 선택 필요 [X]';}

    const status=this.checkRecipe();
    const recTri=document.getElementById('rec-tri-st'),recSqu=document.getElementById('rec-squ-st'),recStar=document.getElementById('rec-star-st'),gearBtn=document.getElementById('btn-g');
    if(status.tri){recTri.className='ok';recTri.textContent='OK';}else{recTri.className='no';recTri.textContent='L7 미달';}
    if(status.squ){recSqu.className='ok';recSqu.textContent='OK';}else{recSqu.className='no';recSqu.textContent='L7 미달';}
    if(status.star){recStar.className='ok';recStar.textContent='OK';}else{recStar.className='no';recStar.textContent='L5 미달';}
    gearBtn.className=status.ready?'main-btn ready':'main-btn';

    document.getElementById('speed-txt').textContent=`▶ 속도: ${this.speedMult}×`;
    const speedBtn=document.getElementById('btn-f');
    if(this.speedMult>1)speedBtn.classList.add('speed-active');else speedBtn.classList.remove('speed-active');

    if(this.bossWave&&this.bossAlive){
      document.getElementById('boss-wrap').style.display='flex';
      const boss=this.enemies.find(e=>e.isBoss&&e.alive);
      if(boss)document.getElementById('boss-inner').style.width=(boss.hp/boss.maxHp*100).toFixed(1)+'%';
      document.getElementById('boss-timer').textContent=Math.ceil(this.bossTimeLeft)+'s';
    }else document.getElementById('boss-wrap').style.display='none';
    if(this.upgradeOpen)this.renderUpgrade();
    if(this.recipeOpen)this.renderRecipeModal();
  }

  toggleSpeed(){
    if(this.storyOpen)return;
    if(this.speedMult===1)this.speedMult=1.5;else if(this.speedMult===1.5)this.speedMult=2;else this.speedMult=1;
    this.log(`⏩ 배속 설정: ${this.speedMult}×`);this.updateUI();
  }

  fuseLegendary() {
    if(this.storyOpen)return;
    const status=this.checkRecipe();
    if(!status.ready){this.log('❌ 재료가 충족되지 않았습니다. 삼각형 L7, 사각형 L7, 별 L5이 필요합니다.');return;}
    this.grid[status.tri.r][status.tri.c]=null;this.grid[status.squ.r][status.squ.c]=null;this.grid[status.star.r][status.star.c]=null;
    this.grid[status.tri.r][status.tri.c]=new Tower(status.tri.c,status.tri.r,'Gear');this.score+=2000;
    this.log('✨ [전설 탄생] 삼각형, 사각형, 별이 융합해 무지개색 [⚙️ 전설 기어 타워]가 출현했습니다!');
    this.spawnBanner('⚙️ 전설 조합 성공! ⚙️','#ec4899');this.closeRecipeModal();this.hideTooltip();this.selected=null;this.updateUI();
  }

  triggerAutoMerge() {
    if(this.gameOver||this.storyOpen)return;
    let mergedAny=false,mergeCount=0,searching=true;
    while(searching){
      searching=false;
      loop1:for(let r1=0;r1<ROWS;r1++)for(let c1=0;c1<COLS;c1++){
        const t1=this.grid[r1][c1];if(!t1||t1.shape==='Gear')continue;
        for(let r2=0;r2<ROWS;r2++)for(let c2=0;c2<COLS;c2++){
          if(r1===r2&&c1===c2)continue;
          const t2=this.grid[r2][c2];
          if(t2&&t1.shape===t2.shape&&t1.level===t2.level){t1.level++;this.grid[r2][c2]=null;this.score+=t1.level*60;mergedAny=true;mergeCount++;searching=true;break loop1;}
        }
      }
    }
    if(mergedAny){this.log(`✨ 일괄 자동 합성 완료 (${mergeCount}회 대성공)`);this.hideTooltip();this.selected=null;}
    else this.log('❌ 필드에 합성 가능한 쌍이 존재하지 않습니다.');
    this.updateUI();
  }

  summonTower(){
    if(this.storyOpen)return;
    const currentTowers=this.grid.flat().filter(Boolean).length;
    if(currentTowers>=20){this.log('❌ 필드 타워는 최대 20마리까지만 소환할 수 있습니다!');return;}
    if(this.gold<this.summonCost)return;
    const empty=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(!this.grid[r][c])empty.push({r,c});
    if(!empty.length){this.log('격자가 전부 가득 찼습니다!');return;}
    const{r,c}=empty[Math.floor(Math.random()*empty.length)],shape=rollShape();
    this.grid[r][c]=new Tower(c,r,shape);this.gold-=this.summonCost;this.summonCost+=2;
    this.log(`타워 소환 성공! (다음 소환 비용: ${this.summonCost}G)`);this.updateUI();
  }

  startWave(){
    if(this.waveActive||this.gameOver||this.storyOpen)return;
    this.wave++;this.waveActive=true;this.spawnDone=false;this.spawnDoneCD=0;
    this.bossWave=this.wave>0&&this.wave%BOSS_EVERY===0;this.spawnAcc=0;
    if(this.bossWave){
      this.spawnQ=0;this.spawnDone=true;this.bossAlive=true;this.bossTimeLeft=BOSS_LIMIT;this.bossTimerAcc=0;
      this.enemies.push(new Enemy(this.wave,true,this.difficultyMultiplier));this.log(`👹 보스 웨이브 ${this.wave} 출현! 60초 내 저지하세요!`);
    }else{
      this.spawnQ=WAVE_ENEMIES;this.spawnInterval=Math.max(18,30-Math.floor(this.wave*0.4));this.bossAlive=false;this.log(`⚔️ 웨이브 ${this.wave} 격전 시작.`);
    }
    this.updateUI();
  }

  handleClick(px,py){
    if(this.gameOver||this.storyOpen)return;
    const col=Math.floor((px-GRID_X)/CELL),row=Math.floor((py-GRID_Y)/CELL);
    if(col<0||col>=COLS||row<0||row>=ROWS){this.selected=null;this.hideTooltip();this.updateUI();return;}
    if(this.selected){
      const{row:sr,col:sc}=this.selected;
      if(sr===row&&sc===col){this.selected=null;this.hideTooltip();this.updateUI();return;}
      const src=this.grid[sr][sc];if(!src){this.selected=null;this.updateUI();return;}
      const dst=this.grid[row][col];
      if(dst&&(src.shape==='Gear'||dst.shape==='Gear')){this.log('⚙️ 전설 기어 타워는 머지할 수 없습니다.');this.selected=null;this.updateUI();return;}
      if(dst&&src.shape===dst.shape&&src.level===dst.level){dst.level++;this.grid[sr][sc]=null;this.score+=dst.level*60;this.log(`✨ 머지 성공: Lv.${dst.level}`);this.showTooltip(dst,GRID_X+col*CELL+CELL/2,GRID_Y+row*CELL+CELL/2);}
      else if(!dst){src.col=col;src.row=row;src.updatePos();this.grid[row][col]=src;this.grid[sr][sc]=null;this.hideTooltip();}
      this.selected=null;
    }else{
      if(this.grid[row][col]){this.selected={row,col};this.showTooltip(this.grid[row][col],GRID_X+col*CELL+CELL/2,GRID_Y+row*CELL+CELL/2);}else this.hideTooltip();
    }
    this.updateUI();
  }

  update(){
    if(this.gameOver)return;
    const dt=this.speedMult;
    if(this.storyOpen)return;
    if(!this.waveActive){this.nextWaveCD-=dt;if(this.nextWaveCD<=0)this.startWave();}
    if(this.bossWave&&this.bossAlive){this.bossTimeLeft-=(1/60)*dt;if(this.bossTimeLeft<=0){this.endGame('boss');return;}}
    if(this.waveActive&&!this.bossWave&&!this.spawnDone){
      this.spawnAcc+=dt;
      if(this.spawnAcc>=this.spawnInterval){this.enemies.push(new Enemy(this.wave,false,this.difficultyMultiplier));this.spawnQ--;this.spawnAcc=0;if(this.spawnQ<=0){this.spawnDone=true;this.spawnDoneCD=INTER_DELAY;}}
    }
    if(this.waveActive&&!this.bossWave&&this.spawnDone){
      this.spawnDoneCD-=dt;
      if(this.spawnDoneCD<=0){this.waveActive=false;const b=Math.floor((this.wave*25+50)*Math.sqrt(this.difficultyMultiplier));this.gold+=b;this.score+=this.wave*100;this.nextWaveCD=0;this.log(`🌟 웨이브 클리어 보상: +${b}G 획득`);}
    }
    if(this.waveActive&&this.bossWave&&this.bossAlive){
      const boss=this.enemies.find(e=>e.isBoss&&e.alive);
      if(!boss||boss.hp<=0){this.bossAlive=false;this.waveActive=false;const b=Math.floor((this.wave*40+100)*this.difficultyMultiplier);this.gold+=b;this.score+=this.wave*200;this.nextWaveCD=INTER_DELAY;this.difficultyMultiplier*=1.15;this.log(`🏆 보스 격파 완료! 난이도 ×${this.difficultyMultiplier.toFixed(2)}`);this.spawnBanner('👹 보스를 처치했습니다! 👹','#4ade80');}
    }
    for(const e of this.enemies)if(e.alive)e.move(dt);
    for(let i=this.enemies.length-1;i>=0;i--){const e=this.enemies[i];if(!e.alive){this.gold+=e.reward;this.score+=e.reward;this.enemies.splice(i,1);}}
    if(this.enemies.length>=MAX_ENEMIES){this.endGame('overflow');return;}
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.grid[r][c])this.grid[r][c].update(this.enemies,this.bullets,dt);
    for(let i=this.bullets.length-1;i>=0;i--){const b=this.bullets[i];b.move(dt,this.enemies,this.particles);if(!b.active)this.bullets.splice(i,1);}
    for(let i=this.particles.length-1;i>=0;i--)if(this.particles[i].life<=0)this.particles.splice(i,1);
    for(let i=this.banners.length-1;i>=0;i--){const banner=this.banners[i];banner.life-=dt;banner.y+=(banner.targetY-banner.y)*0.08*dt;if(banner.life<30)banner.alpha=banner.life/30;if(banner.life<=0)this.banners.splice(i,1);}
    this.updateUI();
  }

  endGame(reason){
    this.gameOver=true;this.closeUpgrade();this.closeRecipeModal();
    const title=document.getElementById('ov-title'),sub=document.getElementById('ov-sub');
    if(reason==='boss'){title.textContent='⏱️ 타임아웃!';title.style.color='#ff5500';sub.textContent='60초 내에 보스를 처치하지 못했습니다.';}
    else{title.textContent='💥 방어선 붕괴!';title.style.color='#f87171';sub.textContent=`적이 ${this.enemies.length}마리를 초과하여 기지가 점령당했습니다.`;}
    document.getElementById('overlay').classList.add('show');
    globalThis.dispatchEvent(new CustomEvent('rp:game-over',{detail:{score:this.score,wave:this.wave}}));
  }

  draw(){
    ctx.fillStyle='#0b150d';ctx.fillRect(0,0,CW,CH);this.drawPath();
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const x=GRID_X+c*CELL,y=GRID_Y+r*CELL,isSel=this.selected&&this.selected.row===r&&this.selected.col===c;
      ctx.fillStyle=isSel?'#ffffff12':'#061108';ctx.strokeStyle=isSel?'#ffffff88':'#152b1b';ctx.lineWidth=isSel?2:1;ctx.beginPath();ctx.roundRect(x+2,y+2,CELL-4,CELL-4,5);ctx.fill();ctx.stroke();
    }
    if(this.selected){
      const{row:sr,col:sc}=this.selected,src=this.grid[sr][sc];
      if(src)for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
        const dst=this.grid[r][c];
        if(dst&&(r!==sr||c!==sc)&&dst.shape===src.shape&&dst.level===src.level){ctx.strokeStyle='#facc1577';ctx.lineWidth=2;ctx.fillStyle='#facc150c';ctx.beginPath();ctx.roundRect(GRID_X+c*CELL+2,GRID_Y+r*CELL+2,CELL-4,CELL-4,5);ctx.fill();ctx.stroke();}
      }
    }
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const t=this.grid[r][c];if(t){const s=this.selected&&this.selected.row===r&&this.selected.col===c;t.draw(s,s);}}
    for(const e of this.enemies)if(e.alive)e.draw();
    for(const b of this.bullets)if(b.active)b.draw();
    for(const p of this.particles)p.draw();
    ctx.beginPath();ctx.arc(PATH[0].x,PATH[0].y,12,0,Math.PI*2);ctx.fillStyle='#4ade8022';ctx.fill();ctx.strokeStyle='#4ade80';ctx.lineWidth=2;ctx.stroke();
    const gcx=GRID_X+(COLS*CELL)/2,gcy=GRID_Y+(ROWS*CELL)/2;
    if(!this.waveActive&&!this.gameOver&&!this.storyOpen){const s=Math.ceil(this.nextWaveCD/60);ctx.fillStyle=this.wave%5===4?'#ff8800':'#7eb8f7';ctx.font='bold 15px Segoe UI';ctx.textAlign='center';ctx.fillText(`다음 웨이브 ${this.wave+1} 대기 중... (${s}초)`,gcx,gcy);}
    if(this.enemies.length>=MAX_ENEMIES*0.8){ctx.fillStyle=`rgba(239,68,68,${.08+.05*Math.sin(Date.now()/150)})`;ctx.fillRect(0,0,CW,CH);}
    for(const banner of this.banners){ctx.save();ctx.globalAlpha=banner.alpha;ctx.fillStyle='rgba(15, 23, 42, 0.9)';ctx.strokeStyle=banner.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(CW/2-250,banner.y-35,500,70,8);ctx.fill();ctx.stroke();ctx.fillStyle=banner.color;ctx.font='bold 24px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(banner.text,CW/2,banner.y);ctx.restore();}
  }

  drawPath(){
    const loop=[...PATH,PATH[0]];
    ctx.beginPath();ctx.moveTo(loop[0].x,loop[0].y);for(let i=1;i<loop.length;i++)ctx.lineTo(loop[i].x,loop[i].y);ctx.strokeStyle='#142417';ctx.lineWidth=PW;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    ctx.beginPath();ctx.moveTo(loop[0].x,loop[0].y);for(let i=1;i<loop.length;i++)ctx.lineTo(loop[i].x,loop[i].y);ctx.strokeStyle='#0d1a10';ctx.lineWidth=PW-8;ctx.stroke();
  }
}

export { GameManager };
