import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';

let supabaseClient = null;
let currentUser = null;

const byId = id => document.getElementById(id);

function setAuthMessage(message, isError = false) {
  const element = byId('auth-message');
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function openAuth() {
  byId('auth-modal').classList.add('show');
}

function closeAuth() {
  byId('auth-modal').classList.remove('show');
  setAuthMessage('');
}

async function renderAccount(user) {
  currentUser = user;
  const signedIn = Boolean(user);
  byId('auth-guest-view').hidden = signedIn;
  byId('auth-user-view').hidden = !signedIn;

  if (!signedIn) {
    byId('account-label').textContent = '게스트 · 로그인';
    return;
  }

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('nickname,best_score,best_wave')
    .eq('user_id', user.id)
    .maybeSingle();

  const nickname = profile?.nickname || user.user_metadata?.nickname || '플레이어';
  byId('account-label').textContent = nickname;
  byId('auth-user-email').textContent = user.email || '';
  byId('auth-user-name').textContent = nickname;
  byId('auth-best-score').textContent = (profile?.best_score || 0).toLocaleString();
  byId('auth-best-wave').textContent = profile?.best_wave || 0;
}

async function signUp() {
  const email = byId('auth-email').value.trim();
  const password = byId('auth-password').value;
  const nickname = byId('auth-nickname').value.trim();
  if (!email || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || nickname.length < 2) {
    setAuthMessage('닉네임 2자 이상, 비밀번호는 영문과 숫자를 포함해 8자 이상 입력해 주세요.', true);
    return;
  }

  setAuthMessage('회원가입 처리 중...');
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  });
  if (error) setAuthMessage(error.message, true);
  else setAuthMessage('가입 완료! 이메일 확인이 켜져 있다면 메일의 인증 링크를 눌러 주세요.');
}

async function signIn() {
  const email = byId('auth-email').value.trim();
  const password = byId('auth-password').value;
  if (!email || !password) {
    setAuthMessage('이메일과 비밀번호를 입력해 주세요.', true);
    return;
  }

  setAuthMessage('로그인 중...');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) setAuthMessage(error.message, true);
  else closeAuth();
}

async function signOut() {
  await supabaseClient.auth.signOut();
  closeAuth();
}

async function submitGameResult(score, wave) {
  if (!supabaseClient || !currentUser) return;
  const { error } = await supabaseClient.rpc('submit_game_result', {
    p_score: Math.max(0, Math.floor(score)),
    p_wave: Math.max(0, Math.floor(wave)),
  });
  if (error) console.warn('게임 기록 저장 실패:', error.message);
  else await renderAccount(currentUser);
}

async function initAuth() {
  byId('account-btn').addEventListener('click', openAuth);
  byId('auth-close').addEventListener('click', closeAuth);
  byId('auth-guest-btn').addEventListener('click', closeAuth);
  byId('auth-login-btn').addEventListener('click', signIn);
  byId('auth-signup-btn').addEventListener('click', signUp);
  byId('auth-logout-btn').addEventListener('click', signOut);
  byId('auth-modal').addEventListener('click', event => {
    if (event.target.id === 'auth-modal') closeAuth();
  });
  globalThis.addEventListener('rp:game-over', event => {
    submitGameResult(event.detail.score, event.detail.wave);
  });

  if (!globalThis.supabase?.createClient) {
    byId('account-label').textContent = '게스트 · 연결 오류';
    return;
  }

  supabaseClient = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const { data } = await supabaseClient.auth.getSession();
  await renderAccount(data.session?.user || null);
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => renderAccount(session?.user || null), 0);
  });
}

export { initAuth, submitGameResult };
