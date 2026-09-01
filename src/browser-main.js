import { canvas } from './js/config.js';
import { GameManager } from './js/game-manager.js';
import { bindUi } from './js/ui.js';

// 모바일/태블릿 브라우저 기본 제스처가 게임 조작을 가로채지 않도록 차단한다.
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

// iOS Safari의 제스처 확대(핀치/더블탭 계열)와 더블탭 확대를 게임 UI에서 방지한다.
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

globalThis.rpGameStarted = false;
const gm = new GameManager();
globalThis.gm = gm;

gm.storyOpen = false;
gm.renderStory();
bindUi(gm, canvas);

const SETTINGS_KEY='rp:settings';
const defaultSettings={storyEnabled:true,reducedMotion:false};
const readSettings=()=>{try{return{...defaultSettings,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}}catch{return{...defaultSettings}}};
let settings=readSettings();
let signedIn=false;
let nickname=null;
let started=false;

function applySettings(){
  globalThis.rpSettings=settings;
  document.body.classList.toggle('reduced-motion',settings.reducedMotion);
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{}
}
applySettings();

const root=document.getElementById('react-app');
function renderStart(){
  if(started){root.innerHTML='';return;}
  root.innerHTML=`<div id="start-screen" role="dialog" aria-modal="true" aria-labelledby="start-title"><section id="start-card"><div class="start-logo">⬡</div><p class="start-kicker">RANDOM POLYGON</p><h1 id="start-title">Shape Defense</h1><p class="start-copy">다각형 타워를 합성하고 강화해 동그라미 군단의 침공을 막아내세요.</p><div class="start-actions"><button class="start-primary" id="start-game-btn" type="button">🎮 ${signedIn?'로그인 상태로 게임 시작':'게스트로 게임 시작'}</button><button id="start-login-btn" type="button">👤 ${signedIn?(nickname||'플레이어')+' 계정':'로그인'}</button><button id="start-ranking-btn" type="button">🏆 랭킹</button><button id="start-settings-btn" type="button">⚙️ 설정</button></div><p id="start-account-state">${signedIn?(nickname||'플레이어')+'님의 최고 기록이 온라인에 저장됩니다.':'로그인하면 최고 기록이 온라인에 저장됩니다.'}</p></section></div>`;
  document.getElementById('start-game-btn').onclick=startGame;
  document.getElementById('start-login-btn').onclick=()=>document.getElementById('account-btn').click();
  document.getElementById('start-ranking-btn').onclick=()=>document.getElementById('ranking-btn').click();
  document.getElementById('start-settings-btn').onclick=()=>openSettings(false);
}

function startGame(){
  started=true;
  globalThis.rpGameStarted=true;
  root.innerHTML='';
  gm.storyStep=0;
  if(settings.storyEnabled){gm.storyOpen=true;gm.renderStory();}
  else gm.skipStory();
}

function openSettings(inGame=started){
  const wrap=document.createElement('div');
  wrap.id='settings-modal';wrap.className='show';
  wrap.innerHTML=`<section id="settings-box"><button id="settings-close" type="button">&times;</button><h2>⚙️ 게임 설정</h2><p class="settings-sub">설정은 이 브라우저에 자동으로 저장됩니다.</p><label class="setting-row"><span><b>오프닝 스토리</b><small>게임을 시작할 때 세계관 이야기를 재생합니다.</small></span><input id="set-story" type="checkbox" ${settings.storyEnabled?'checked':''}></label><label class="setting-row"><span><b>UI 애니메이션 줄이기</b><small>버튼과 메뉴의 움직임을 최소화합니다.</small></span><input id="set-motion" type="checkbox" ${settings.reducedMotion?'checked':''}></label><div class="settings-guide"><b>키보드 조작</b><span>S 소환 · X 판매 · A 자동합성 · L 합성잠금 · G 조합소 · U 연구소 · F 배속</span></div><button id="settings-done" type="button">설정 완료</button>${inGame?'<button id="settings-quit" type="button">🚪 게임 그만하기</button>':''}</section>`;
  document.body.appendChild(wrap);
  const close=()=>wrap.remove();
  document.getElementById('settings-close').onclick=close;
  wrap.onclick=e=>{if(e.target===wrap)close();};
  document.getElementById('settings-done').onclick=()=>{settings={storyEnabled:document.getElementById('set-story').checked,reducedMotion:document.getElementById('set-motion').checked};applySettings();close();};
  const quit=document.getElementById('settings-quit');
  if(quit)quit.onclick=()=>{if(confirm('현재 게임 진행 상황을 종료하고 시작 화면으로 돌아갈까요?')){close();started=false;globalThis.rpGameStarted=false;gm.init();gm.storyOpen=false;gm.renderStory();renderStart();}};
}

document.getElementById('game-settings-btn').onclick=()=>openSettings(started);
globalThis.addEventListener('rp:auth-changed',e=>{signedIn=Boolean(e.detail.user);nickname=e.detail.nickname||null;if(!started)renderStart();});
renderStart();

async function initOnline(){
  try{
    const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.57.4');
    const supabase=createClient('https://vqdlexfgsmvbdmypykja.supabase.co','sb_publishable_aR4Uf1GmYOTyMrL-Ea3YMg_dIlptleq');
    let currentUser=null;
    const authModal=document.getElementById('auth-modal');
    const setMsg=(m,err=false)=>{const el=document.getElementById('auth-message');el.textContent=m;el.classList.toggle('error',err);};
    const renderAccount=async user=>{currentUser=user;const on=Boolean(user);document.getElementById('auth-guest-view').hidden=on;document.getElementById('auth-user-view').hidden=!on;if(!on){document.getElementById('account-label').textContent='게스트 · 로그인';globalThis.dispatchEvent(new CustomEvent('rp:auth-changed',{detail:{user:null,nickname:null}}));return;}const {data:p}=await supabase.from('profiles').select('nickname,best_score,best_wave').eq('user_id',user.id).maybeSingle();const name=p?.nickname||user.user_metadata?.nickname||'플레이어';document.getElementById('account-label').textContent=name;document.getElementById('auth-user-name').textContent=name;document.getElementById('auth-user-email').textContent=user.email||'';document.getElementById('auth-best-score').textContent=(p?.best_score||0).toLocaleString();document.getElementById('auth-best-wave').textContent=p?.best_wave||0;globalThis.dispatchEvent(new CustomEvent('rp:auth-changed',{detail:{user,nickname:name}}));};
    document.getElementById('account-btn').onclick=()=>authModal.classList.add('show');
    document.getElementById('auth-close').onclick=()=>authModal.classList.remove('show');
    document.getElementById('auth-guest-btn').onclick=()=>authModal.classList.remove('show');
    document.getElementById('auth-login-btn').onclick=async()=>{const email=document.getElementById('auth-email').value.trim(),password=document.getElementById('auth-password').value;if(!email||!password){setMsg('이메일과 비밀번호를 입력해 주세요.',true);return;}setMsg('로그인 중...');const{error}=await supabase.auth.signInWithPassword({email,password});if(error)setMsg(error.message,true);else authModal.classList.remove('show');};
    document.getElementById('auth-signup-btn').onclick=async()=>{const email=document.getElementById('auth-email').value.trim(),password=document.getElementById('auth-password').value,n=document.getElementById('auth-nickname').value.trim();if(!email||password.length<8||!/[A-Za-z]/.test(password)||! /\d/.test(password)||n.length<2){setMsg('닉네임 2자 이상, 비밀번호는 영문과 숫자를 포함해 8자 이상 입력해 주세요.',true);return;}setMsg('회원가입 처리 중...');const{error}=await supabase.auth.signUp({email,password,options:{data:{nickname:n}}});setMsg(error?error.message:'가입 완료! 이메일 확인이 켜져 있다면 인증 링크를 눌러 주세요.',Boolean(error));};
    document.getElementById('auth-logout-btn').onclick=async()=>{await supabase.auth.signOut();authModal.classList.remove('show');};
    const rankingModal=document.getElementById('ranking-modal');
    async function loadRanking(){const msg=document.getElementById('ranking-message'),list=document.getElementById('ranking-list');msg.textContent='랭킹을 불러오는 중...';const{data,error}=await supabase.from('profiles').select('user_id,nickname,best_score,best_wave').order('best_score',{ascending:false}).order('best_wave',{ascending:false}).limit(10);if(error){msg.textContent=error.message;msg.classList.add('error');return;}list.replaceChildren();(data||[]).forEach((p,i)=>{const li=document.createElement('li');if(p.user_id===currentUser?.id)li.classList.add('is-me');li.innerHTML=`<strong>${i<3?['🥇','🥈','🥉'][i]:i+1}</strong><span>${p.nickname||'플레이어'}</span><b>${(p.best_score||0).toLocaleString()}</b><span>${p.best_wave||0}</span>`;list.append(li);});msg.textContent=data?.length?'최신 기록입니다.':'아직 등록된 기록이 없습니다.';}
    document.getElementById('ranking-btn').onclick=async()=>{rankingModal.classList.add('show');await loadRanking();};
    document.getElementById('ranking-close').onclick=()=>rankingModal.classList.remove('show');
    document.getElementById('ranking-refresh').onclick=loadRanking;
    const{data}=await supabase.auth.getSession();await renderAccount(data.session?.user||null);supabase.auth.onAuthStateChange((_e,s)=>setTimeout(()=>renderAccount(s?.user||null),0));
    globalThis.addEventListener('rp:game-over',async e=>{if(!currentUser)return;await supabase.rpc('submit_game_result',{p_score:Math.max(0,Math.floor(e.detail.score)),p_wave:Math.max(0,Math.floor(e.detail.wave))});});
  }catch(err){console.warn('온라인 기능 초기화 실패',err);}
}
initOnline();

function loop(){gm.update();gm.draw();requestAnimationFrame(loop);}loop();
