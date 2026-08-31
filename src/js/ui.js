import { CW, CH } from './config.js';

export function bindUi(gm, canvas) {
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
