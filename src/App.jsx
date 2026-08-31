import { useEffect, useState } from 'react';

const SETTINGS_KEY = 'rp:settings';
const defaultSettings = { storyEnabled: true, reducedMotion: false };

function readSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...defaultSettings };
  }
}

function persistSettings(settings) {
  globalThis.rpSettings = settings;
  document.body.classList.toggle('reduced-motion', settings.reducedMotion);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // 저장소 사용이 제한돼도 현재 탭의 설정은 유지한다.
  }
}

function SettingsModal({ open, inGame, settings, onClose, onSave, onQuit }) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  if (!open) return null;
  return (
    <div id="settings-modal" className="show" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section id="settings-box">
        <button id="settings-close" type="button" aria-label="닫기" onClick={onClose}>&times;</button>
        <h2 id="settings-title">⚙️ 게임 설정</h2>
        <p className="settings-sub">설정은 이 브라우저에 자동으로 저장됩니다.</p>
        <label className="setting-row">
          <span><b>오프닝 스토리</b><small>게임을 시작할 때 세계관 이야기를 재생합니다.</small></span>
          <input type="checkbox" checked={draft.storyEnabled} onChange={event => setDraft({ ...draft, storyEnabled: event.target.checked })} />
        </label>
        <label className="setting-row">
          <span><b>UI 애니메이션 줄이기</b><small>버튼과 메뉴의 움직임을 최소화합니다.</small></span>
          <input type="checkbox" checked={draft.reducedMotion} onChange={event => setDraft({ ...draft, reducedMotion: event.target.checked })} />
        </label>
        <div className="settings-guide">
          <b>키보드 조작</b>
          <span>S 소환 · X 판매 · A 자동합성 · G 조합소 · U 연구소 · F 배속</span>
        </div>
        <button id="settings-done" type="button" onClick={() => onSave(draft)}>설정 완료</button>
        {inGame && <button id="settings-quit" type="button" onClick={onQuit}>🚪 게임 그만하기</button>}
      </section>
    </div>
  );
}

export default function App({ gm, openAuth, openRanking }) {
  const [started, setStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(readSettings);
  const [account, setAccount] = useState({ signedIn: false, nickname: null });

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  useEffect(() => {
    const handleAuth = event => setAccount({
      signedIn: Boolean(event.detail.user),
      nickname: event.detail.nickname || null,
    });
    const settingsButton = document.getElementById('game-settings-btn');
    const openGameSettings = () => setSettingsOpen(true);
    globalThis.addEventListener('rp:auth-changed', handleAuth);
    settingsButton.addEventListener('click', openGameSettings);
    return () => {
      globalThis.removeEventListener('rp:auth-changed', handleAuth);
      settingsButton.removeEventListener('click', openGameSettings);
    };
  }, []);

  const startGame = () => {
    globalThis.rpGameStarted = true;
    setStarted(true);
    gm.storyStep = 0;
    if (settings.storyEnabled) {
      gm.storyOpen = true;
      gm.renderStory();
    } else {
      gm.skipStory();
    }
  };

  const quitGame = () => {
    if (!confirm('현재 게임 진행 상황을 종료하고 시작 화면으로 돌아갈까요?')) return;
    setSettingsOpen(false);
    globalThis.rpGameStarted = false;
    gm.init();
    setStarted(false);
  };

  return (
    <>
      {!started && (
        <div id="start-screen" role="dialog" aria-modal="true" aria-labelledby="start-title">
          <section id="start-card">
            <div className="start-logo" aria-hidden="true">⬡</div>
            <p className="start-kicker">RANDOM POLYGON</p>
            <h1 id="start-title">Shape Defense</h1>
            <p className="start-copy">다각형 타워를 합성하고 강화해 동그라미 군단의 침공을 막아내세요.</p>
            <div className="start-actions">
              <button className="start-primary" type="button" onClick={startGame}>
                🎮 {account.signedIn ? '로그인 상태로 게임 시작' : '게스트로 게임 시작'}
              </button>
              <button type="button" onClick={openAuth}>👤 {account.signedIn ? `${account.nickname || '플레이어'} 계정` : '로그인'}</button>
              <button type="button" onClick={openRanking}>🏆 랭킹</button>
              <button type="button" onClick={() => setSettingsOpen(true)}>⚙️ 설정</button>
            </div>
            <p id="start-account-state">
              {account.signedIn ? `${account.nickname || '플레이어'}님의 최고 기록이 온라인에 저장됩니다.` : '로그인하면 최고 기록이 온라인에 저장됩니다.'}
            </p>
          </section>
        </div>
      )}
      <SettingsModal
        open={settingsOpen}
        inGame={started}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={next => { setSettings(next); setSettingsOpen(false); }}
        onQuit={quitGame}
      />
    </>
  );
}
