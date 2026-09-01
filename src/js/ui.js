import { CW, CH } from './config.js';

export function bindUi(gm, canvas) {
  const viewport=document.querySelector('meta[name="viewport"]');
  if(viewport){
    viewport.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
  }

  const touchStyle=document.createElement('style');
  touchStyle.textContent=`
    #game-container, #game-container *,
    #upg-modal, #upg-modal *,
    #recipe-modal, #recipe-modal *,
    #story-modal, #story-modal *,
    #start-screen, #start-screen * {
      -webkit-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    .main-btn, .main-btn *, .upg-btn, .upg-btn *,
    #canvas-wrap, #canvas-wrap *, canvas {
      touch-action: none !important;
    }
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      user-select: text !important;
      -webkit-touch-callout: default !important;
      touch-action: auto !important;
    }
  `;
  document.head.appendChild(touchStyle);

  const isEditable=target=>Boolean(target?.closest?.('input,textarea,[contenteditable="true"]'));
  document.addEventListener('selectstart',e=>{
    if(!isEditable(e.target))e.preventDefault();
  },true);
  document.addEventListener('contextmenu',e=>{
    if(!isEditable(e.target))e.preventDefault();
  },true);
  document.addEventListener('dblclick',e=>{
    if(!isEditable(e.target))e.preventDefault();
  },true);

  // iOS Safari에서는 버튼의 기본 터치 처리를 직접 막고 게임 동작을 직접 실행한다.
  // 이렇게 해야 빠른 연타가 확대 제스처로 해석되지 않으면서 모든 탭이 정상 입력된다.
  const touchActions={
    'btn-s':()=>{gm.triggerBtnAnim('btn-s');gm.summonTower();},
    'btn-x':()=>{gm.triggerBtnAnim('btn-x');gm.sellTower();},
    'btn-l':()=>{gm.triggerBtnAnim('btn-l');gm.toggleMergeLock();},
    'btn-g':()=>{gm.triggerBtnAnim('btn-g');gm.openRecipeModal();},
    'btn-a':()=>{gm.triggerBtnAnim('btn-a');gm.triggerAutoMerge();},
    'btn-u':()=>{gm.triggerBtnAnim('btn-u');gm.upgradeOpen?gm.closeUpgrade():gm.openUpgrade();},
    'btn-f':()=>{gm.triggerBtnAnim('btn-f');gm.toggleSpeed();},
  };
  Object.entries(touchActions).forEach(([id,action])=>{
    const btn=document.getElementById(id);
    if(!btn)return;
    let active=false;
    btn.addEventListener('touchstart',e=>{
      if(btn.disabled)return;
      active=true;
      e.preventDefault();
      e.stopPropagation();
    },{passive:false});
    btn.addEventListener('touchcancel',()=>{active=false;},{passive:true});
    btn.addEventListener('touchend',e=>{
      if(!active||btn.disabled)return;
      active=false;
      e.preventDefault();
      e.stopPropagation();
      action();
    },{passive:false});
  });

  canvas.addEventListener('click',e=>{
    const rect=canvas.getBoundingClientRect();
    gm.handleClick((e.clientX-rect.left)*(CW/rect.width),(e.clientY-rect.top)*(CH/rect.height));
  });
  document.addEventListener('click',e=>{
    if(!canvas.contains(e.target)&&!e.target.closest('.main-btn')&&!document.getElementById('upg-modal').contains(e.target)&&!document.getElementById('recipe-modal').contains(e.target))gm.hideTooltip();
  });
  document.getElementById('upg-modal').addEventListener('click',e=>{
    if(e.target.id==='upg-modal')gm.closeUpgrade();
  });
  document.getElementById('recipe-modal').addEventListener('click',e=>{
    if(e.target.id==='recipe-modal')gm.closeRecipeModal();
  });

  // 연구 버튼: 짧게 누르면 1회, 계속 누르면 보유 골드가 허용하는 동안 연속 연구
  const upgBody=document.getElementById('upg-body');
  let holdDelay=null,holdRepeat=null;
  const stopHold=()=>{
    if(holdDelay){clearTimeout(holdDelay);holdDelay=null;}
    if(holdRepeat){clearInterval(holdRepeat);holdRepeat=null;}
  };

  // iOS의 길게 누르기 텍스트 선택/복사 메뉴를 연구 버튼에서 확실히 차단한다.
  upgBody.addEventListener('touchstart',e=>{
    if(e.target.closest('.upg-btn'))e.preventDefault();
  },{passive:false,capture:true});
  upgBody.addEventListener('touchmove',e=>{
    if(e.target.closest('.upg-btn'))e.preventDefault();
  },{passive:false,capture:true});

  upgBody.addEventListener('pointerdown',e=>{
    const btn=e.target.closest('.upg-btn');
    if(!btn||btn.disabled)return;
    e.preventDefault();
    const shape=btn.dataset.shape,idx=parseInt(btn.dataset.idx,10);
    gm.buyUpg(shape,idx);
    holdDelay=setTimeout(()=>{
      holdRepeat=setInterval(()=>{
        if(!gm.buyUpg(shape,idx))stopHold();
      },120);
    },420);
  });
  document.addEventListener('pointerup',stopHold);
  document.addEventListener('pointercancel',stopHold);
  document.addEventListener('touchend',stopHold,{passive:true});
  document.addEventListener('touchcancel',stopHold,{passive:true});
  window.addEventListener('blur',stopHold);
  upgBody.addEventListener('contextmenu',e=>{
    if(e.target.closest('.upg-btn'))e.preventDefault();
  });
  
  document.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(gm.storyOpen){
      if(e.key==='Escape')gm.skipStory();
      return;
    }
    if(gm.gameOver)return;
    if(k==='s'){gm.triggerBtnAnim('btn-s');gm.summonTower();}
    if(k==='g'){
      gm.triggerBtnAnim('btn-g');
      if(gm.recipeOpen)gm.closeRecipeModal();else gm.openRecipeModal();
    }
    if(k==='a'){gm.triggerBtnAnim('btn-a');gm.triggerAutoMerge();}
    if(k==='l'){gm.triggerBtnAnim('btn-l');gm.toggleMergeLock();}
    if(k==='f'){gm.triggerBtnAnim('btn-f');gm.toggleSpeed();}
    if(k==='u'){
      gm.triggerBtnAnim('btn-u');
      if(gm.upgradeOpen)gm.closeUpgrade();else gm.openUpgrade();
    }
    if(k==='x'){gm.triggerBtnAnim('btn-x');gm.sellTower();}
  });
}
