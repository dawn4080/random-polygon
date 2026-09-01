export function installBrowserCompatibility(){
  const gestureStyle=document.createElement('style');
  gestureStyle.textContent=`
html,body,#game-container,#start-screen,#story-modal,#upg-modal,#recipe-modal,#settings-modal,#ranking-modal,
button,.main-btn,.upg-btn,canvas {
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}
canvas,#canvas-wrap { touch-action: none; }
input,textarea,[contenteditable="true"] {
  -webkit-user-select: text;
  user-select: text;
  -webkit-touch-callout: default;
}
`;
  document.head.appendChild(gestureStyle);

  for(const type of ['gesturestart','gesturechange','gestureend']){
    document.addEventListener(type,e=>e.preventDefault(),{passive:false});
  }

  let lastTouchEnd=0;
  document.addEventListener('touchend',e=>{
    if(e.target.closest('input,textarea,[contenteditable="true"]'))return;
    const now=Date.now();
    if(now-lastTouchEnd<=300)e.preventDefault();
    lastTouchEnd=now;
  },{passive:false});

  document.addEventListener('contextmenu',e=>{
    if(e.target.closest('input,textarea,[contenteditable="true"]'))return;
    if(e.target.closest('#game-container,#start-screen,#story-modal,#upg-modal,#recipe-modal,#settings-modal,#ranking-modal,button'))e.preventDefault();
  });
}
