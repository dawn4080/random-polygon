const SETTINGS_KEY = 'rp:settings';
const defaultSettings = { storyEnabled: true, reducedMotion: false };

function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...defaultSettings };
  }
}

function applySettings(settings) {
  globalThis.rpSettings = settings;
  document.body.classList.toggle('reduced-motion', settings.reducedMotion);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // 저장소 사용이 제한된 브라우저에서도 현재 세션 설정은 유지한다.
  }
}

export function bindStartScreen(gm, { openAuth, openRanking }) {
  const byId = id => document.getElementById(id);
  let settings = loadSettings();
  applySettings(settings);

  const openSettings = () => {
    byId('setting-story').checked = settings.storyEnabled;
    byId('setting-reduced-motion').checked = settings.reducedMotion;
    byId('settings-quit').hidden = !globalThis.rpGameStarted;
    byId('settings-modal').classList.add('show');
  };
  const closeSettings = () => byId('settings-modal').classList.remove('show');
  const saveSettings = () => {
    settings = {
      storyEnabled: byId('setting-story').checked,
      reducedMotion: byId('setting-reduced-motion').checked,
    };
    applySettings(settings);
    closeSettings();
  };

  byId('start-play-btn').addEventListener('click', () => {
    globalThis.rpGameStarted = true;
    byId('start-screen').classList.add('hidden');
    gm.storyStep = 0;
    if (settings.storyEnabled) {
      gm.storyOpen = true;
      gm.renderStory();
    } else {
      gm.skipStory();
    }
  });
  byId('start-login-btn').addEventListener('click', openAuth);
  byId('start-ranking-btn').addEventListener('click', openRanking);
  byId('start-settings-btn').addEventListener('click', openSettings);
  byId('game-settings-btn').addEventListener('click', openSettings);
  byId('settings-close').addEventListener('click', closeSettings);
  byId('settings-done').addEventListener('click', saveSettings);
  byId('settings-quit').addEventListener('click', () => {
    if (!confirm('현재 게임 진행 상황을 종료하고 시작 화면으로 돌아갈까요?')) return;
    closeSettings();
    globalThis.rpGameStarted = false;
    gm.init();
    byId('start-screen').classList.remove('hidden');
  });
  byId('settings-modal').addEventListener('click', event => {
    if (event.target.id === 'settings-modal') closeSettings();
  });

  globalThis.addEventListener('rp:auth-changed', event => {
    const signedIn = Boolean(event.detail.user);
    const nickname = event.detail.nickname || '플레이어';
    byId('start-login-btn').textContent = signedIn ? `👤 ${nickname} 계정` : '👤 로그인';
    byId('start-play-btn').textContent = signedIn ? '🎮 로그인 상태로 게임 시작' : '🎮 게스트로 게임 시작';
    byId('start-account-state').textContent = signedIn
      ? `${nickname}님의 최고 기록이 온라인에 저장됩니다.`
      : '로그인하면 최고 기록이 온라인에 저장됩니다.';
  });
}
