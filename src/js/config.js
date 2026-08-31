const CW=820, CH=620;
const PW=46, PH=23;
const PX1=36, PY1=26, PX2=784, PY2=594;
const PATH=[{x:PX1,y:PY1},{x:PX2,y:PY1},{x:PX2,y:PY2},{x:PX1,y:PY2}];

const GRID_X=PX1+PH+2;
const GRID_Y=PY1+PH+2;
const CELL=85, COLS=8, ROWS=6;

const MAX_ENEMIES=100, BOSS_EVERY=5, BOSS_LIMIT=60, WAVE_ENEMIES=22;
const INTER_DELAY=360;

const GOLD_DMG_RATE=0.002;
const SUMMON_COST_INIT=50;

function getWaveEnemyCount(wave){
  return Math.min(WAVE_ENEMIES, 18 + Math.max(0, wave - 1));
}

const SHAPES=['Triangle','Square','Star','Gear'];

const RARITY={
  common:{label:'일반',cls:'r-common',color:'#94a3b8'},
  rare:  {label:'희귀',cls:'r-rare',  color:'#a78bfa'},
  epic:  {label:'에픽',cls:'r-epic',  color:'#fbbf24'},
  legend:{label:'전설',cls:'r-legend',color:'#ec4899'},
};
const TDEFS={
  Triangle:{
    label:'▲ 삼각형', tag:'근접', color:'#38bdf8', rarity:'common', prob:0.58,
    desc:'빠른 연사로 인접 적을 위협하지만 단일 피해는 평이함.',
    atk:22, dmg:22, dmgLv:7, range:125, rangeLv:6, aoe:false, upgradeCostGrowth:20,
    upgrades:[
      {name:'날카로운 날',   stat:'dmg',   add:10, baseCost:35, icon:'⚔',  desc:'전체 ▲ 데미지 +10'},
      {name:'광속 베기',     stat:'spd',   add:-2, baseCost:45, icon:'⚡', desc:'전체 ▲ 공격속도 +8%'},
      {name:'도달 범위',     stat:'range', add:10, baseCost:30, icon:'📏', desc:'전체 ▲ 사거리 +10'},
    ]
  },
  Square:{
    label:'■ 사각형', tag:'원거리', color:'#a78bfa', rarity:'rare', prob:0.27,
    desc:'긴 사거리의 저격으로 단일 대상에 강력한 관통 화력 선사.',
    atk:80, dmg:58, dmgLv:16, range:265, rangeLv:13, aoe:false, upgradeCostGrowth:26,
    upgrades:[
      {name:'관통탄',        stat:'dmg',   add:28, baseCost:55, icon:'💥', desc:'전체 ■ 데미지 +28'},
      {name:'속사 장치',     stat:'spd',   add:-5, baseCost:65, icon:'⚡', desc:'전체 ■ 공격속도 +6%'},
      {name:'망원 조준경',   stat:'range', add:30, baseCost:50, icon:'🔭', desc:'전체 ■ 사거리 +30'},
    ]
  },
  Star:{
    label:'★ 별',    tag:'범위', color:'#fbbf24', rarity:'epic', prob:0.15,
    desc:'폭발 범위형 성형 탄환으로 뭉쳐 있는 적들의 밀도를 무너뜨림.',
    atk:105, dmg:65, dmgLv:18, range:215, rangeLv:11, aoe:true, aoeR:55, upgradeCostGrowth:28,
    upgrades:[
      {name:'메가 폭발',     stat:'aoe',   add:12, baseCost:70, icon:'💣', desc:'전체 ★ 폭발반경 +12'},
      {name:'강화 화약',     stat:'dmg',   add:22, baseCost:60, icon:'🔥', desc:'전체 ★ 데미지 +22'},
      {name:'속사 발사기',   stat:'spd',   add:-6, baseCost:75, icon:'⚡', desc:'전체 ★ 공격속도 +6%'},
    ]
  },
  Gear:{
    label:'⚙️ 기어',    tag:'전설', color:'#ec4899', rarity:'legend', prob:0.0,
    desc:'무지개 빛깔의 궁극 기어 타워. 적 타격 시 치명적인 폭사 파동이 연쇄로 터지는 연계 폭발(Chain Explosion)을 일으킵니다.',
    atk:110, dmg:220, dmgLv:50, range:240, rangeLv:20, aoe:true, aoeR:60, upgradeCostGrowth:35,
    upgrades:[
      {name:'공간 해체',     stat:'dmg',   add:80,  baseCost:120, icon:'⚙️', desc:'전설 ⚙️ 전체 데미지 +80'},
      {name:'기어 엔진 과부하', stat:'spd',  add:-8,  baseCost:140, icon:'⚡', desc:'전설 ⚙️ 공격속도 극대화'},
      {name:'연쇄 도화선',   stat:'chains', add:1,   baseCost:130, icon:'🔗', desc:'연계 폭발 도포 횟수 +1'},
    ]
  }
};

function rollShape(){
  const r=Math.random();let acc=0;
  for(const k of Object.keys(TDEFS)){
    if(k === 'Gear') continue;
    acc+=TDEFS[k].prob;if(r<acc)return k;
  }
  return 'Triangle';
}

const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');

export { CW, CH, PW, PH, PX1, PY1, PX2, PY2, PATH, GRID_X, GRID_Y, CELL, COLS, ROWS, MAX_ENEMIES, BOSS_EVERY, BOSS_LIMIT, WAVE_ENEMIES, INTER_DELAY, GOLD_DMG_RATE, SUMMON_COST_INIT, SHAPES, RARITY, TDEFS, getWaveEnemyCount, rollShape, canvas, ctx };
