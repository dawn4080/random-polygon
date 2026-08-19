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
  document.getElementById('upg-body').addEventListener('click',e=>{
    const btn=e.target.closest('.upg-btn');
    if(btn&&!btn.disabled){
      gm.buyUpg(btn.dataset.shape, parseInt(btn.dataset.idx, 10));
    }
  });
  
  document.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    
    // 스토리 오프닝 단계에서는 ESC 누르면 스킵 가능하도록 지정
    if (gm.storyOpen) {
      if (e.key === 'Escape') {
        gm.skipStory();
      }
      return;
    }
  
    if(gm.gameOver) return;
    if(k==='s') { gm.triggerBtnAnim('btn-s'); gm.summonTower(); }
    if(k==='g') {
      gm.triggerBtnAnim('btn-g');
      if(gm.recipeOpen) gm.closeRecipeModal(); else gm.openRecipeModal();
    }
    if(k==='a') { gm.triggerBtnAnim('btn-a'); gm.triggerAutoMerge(); }
    if(k==='f') { gm.triggerBtnAnim('btn-f'); gm.toggleSpeed(); }
    if(k==='u') {
      gm.triggerBtnAnim('btn-u');
      if(gm.upgradeOpen)gm.closeUpgrade(); else gm.openUpgrade();
    }
    // 키보드 X키 눌렀을 때 판매 실행
    if(k==='x') { gm.triggerBtnAnim('btn-x'); gm.sellTower(); }
  });
}
