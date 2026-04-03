(function () {
  "use strict";

  // ─── Стили (добавлены стили для формы) ──────────────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');

    #lss-bridge-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: 'Crimson Pro', Georgia, serif;
      user-select: none;
    }

    #lss-bridge-toggle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a0a00 0%, #3d1c00 100%);
      border: 1.5px solid #c8892a;
      box-shadow: 0 4px 20px rgba(200,137,42,0.35), inset 0 1px 0 rgba(255,200,100,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: box-shadow 0.2s, transform 0.2s;
      color: #c8892a;
      font-size: 20px;
    }
    #lss-bridge-toggle:hover {
      box-shadow: 0 4px 28px rgba(200,137,42,0.6), inset 0 1px 0 rgba(255,200,100,0.2);
      transform: scale(1.07);
    }

    #lss-bridge-card {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 320px;
      background: linear-gradient(160deg, #140800 0%, #1e0f00 60%, #0e0500 100%);
      border: 1px solid #5a3510;
      border-radius: 12px;
      box-shadow:
        0 16px 40px rgba(0,0,0,0.7),
        0 0 0 1px rgba(200,137,42,0.08),
        inset 0 1px 0 rgba(255,200,100,0.08);
      overflow: hidden;
      transform-origin: bottom right;
      animation: lss-card-in 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }

    @keyframes lss-card-in {
      from { opacity: 0; transform: scale(0.85) translateY(8px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);   }
    }

    #lss-bridge-card.hidden {
      display: none;
    }

    .lss-card-header {
      padding: 14px 16px 10px;
      border-bottom: 1px solid rgba(90,53,16,0.6);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .lss-card-header-icon {
      font-size: 15px;
      color: #c8892a;
    }
    .lss-card-title {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #c8892a;
    }
    .lss-card-subtitle {
      font-size: 12px;
      color: rgba(200,137,42,0.5);
      font-style: italic;
      margin-top: 1px;
    }
    .lss-card-rofl {
      font-size: 8px;
      color: rgba(200,137,42,0.5);
      font-style: italic;
      margin-top: 1px;
    }

    .lss-card-body {
      padding: 14px 16px;
    }

    .lss-char-info {
      background: rgba(200,137,42,0.06);
      border: 1px solid rgba(200,137,42,0.15);
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .lss-char-name {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      font-weight: 500;
      color: #e8c068;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lss-char-meta {
      font-size: 12px;
      color: rgba(200,137,42,0.55);
      margin-top: 2px;
      font-style: italic;
    }
    .lss-char-id {
      font-size: 10px;
      color: rgba(200,137,42,0.35);
      margin-top: 4px;
      font-family: monospace;
      word-break: break-all;
    }

    .lss-credentials {
      margin-bottom: 12px;
    }
    .lss-credentials input {
      width: 100%;
      padding: 8px 10px;
      margin-bottom: 8px;
      background: rgba(0,0,0,0.5);
      border: 1px solid #5a3510;
      border-radius: 6px;
      color: #e8c068;
      font-family: 'Crimson Pro', monospace;
      font-size: 12px;
      box-sizing: border-box;
    }
    .lss-credentials input:focus {
      outline: none;
      border-color: #c8892a;
    }
    .lss-remember {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      font-size: 11px;
      color: rgba(200,137,42,0.7);
    }
    .lss-remember input {
      width: auto;
      margin: 0;
    }

    .lss-btn {
      width: 100%;
      padding: 9px 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.03em;
      transition: all 0.18s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      margin-bottom: 8px;
    }
    .lss-btn:last-child { margin-bottom: 0; }

    .lss-btn-primary {
      background: linear-gradient(135deg, #7a4a10 0%, #c8892a 100%);
      color: #fff9ee;
      box-shadow: 0 2px 10px rgba(200,137,42,0.3);
    }
    .lss-btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #9a5f15 0%, #e0a040 100%);
      box-shadow: 0 4px 16px rgba(200,137,42,0.45);
      transform: translateY(-1px);
    }
    .lss-btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .lss-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .lss-status {
      margin-top: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-style: italic;
      line-height: 1.4;
      display: none;
    }
    .lss-status.visible { display: block; }
    .lss-status.success {
      background: rgba(50,140,60,0.15);
      border: 1px solid rgba(50,200,70,0.25);
      color: #7dde8a;
    }
    .lss-status.error {
      background: rgba(180,40,40,0.15);
      border: 1px solid rgba(220,60,60,0.25);
      color: #e87878;
    }
    .lss-status.loading {
      background: rgba(200,137,42,0.1);
      border: 1px solid rgba(200,137,42,0.2);
      color: #c8892a;
    }

    .lss-spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: lss-spin 0.7s linear infinite;
    }
    @keyframes lss-spin { to { transform: rotate(360deg); } }
  `;

  // ─── Вспомогательные функции ─────────────────────────────────────────────────

  /** Извлекает ID персонажа из текущего URL */
  function getCharacterIdFromURL() {
    const m = location.pathname.match(/\/(?:character|characters|hero)s?(?:\/digital)?\/([a-f0-9]{24,})/i);
    return m ? m[1] : null;
  }

  /** Ждёт появления DOM-элемента */
  function waitForElement(selector, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) { resolve(el); return; }

      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Элемент "${selector}" не найден за ${timeout}ms`));
      }, timeout);

      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          clearTimeout(timer);
          observer.disconnect();
          resolve(found);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // ─── Сохранение/загрузка учётных данных ──────────────────────────────────────
  async function saveCredentials(login, password, remember) {
    if (remember) {
      await chrome.storage.local.set({ lssBridgeLogin: login, lssBridgePassword: password });
    } else {
      await chrome.storage.local.remove(['lssBridgeLogin', 'lssBridgePassword']);
    }
  }

  async function loadCredentials() {
    const data = await chrome.storage.local.get(['lssBridgeLogin', 'lssBridgePassword']);
    return { login: data.lssBridgeLogin || '', password: data.lssBridgePassword || '' };
  }

  // ─── Создание панели ─────────────────────────────────────────────────────────
  function createPanel() {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);

    const characterId = getCharacterIdFromURL();

    const panel = document.createElement("div");
    panel.id = "lss-bridge-panel";
    panel.innerHTML = `
      <div id="lss-bridge-card" class="hidden">
        <div class="lss-card-header">
          <span class="lss-card-header-icon">🐛</span>
          <div>
            <div class="lss-card-title">AC Tools</div>
            <div class="lss-card-subtitle">Перенос персонажа</div>
            <div class="lss-card-rofl">Заклинания переносятся не на всех персонажах*</div>
          </div>
        </div>
        <div class="lss-card-body">
          <div class="lss-char-info">
            <div class="lss-char-name" id="lss-char-name">
              ${characterId ? "Загрузка..." : "Перса то открой"}
            </div>
            <div class="lss-char-meta" id="lss-char-meta">—</div>
            <div class="lss-char-id">${characterId ?? "Откройте страницу персонажа"}</div>
          </div>

          <!-- Форма логина/пароля -->
          <div class="lss-credentials">
            <input type="text" id="lss-login" placeholder="Логин (DnD manager)" autocomplete="username">
            <input type="password" id="lss-password" placeholder="Пароль (DnD manager)" autocomplete="current-password">
            <div class="lss-remember">
              <input type="checkbox" id="lss-remember-checkbox">
              <label for="lss-remember-checkbox">Сталкерить меня</label>
            </div>
          </div>

          <button class="lss-btn lss-btn-primary" id="lss-export-btn" ${!characterId ? "disabled" : ""}>
            <span>↑</span>
            <span>Экспортировать</span>
          </button>

          <div class="lss-status" id="lss-status"></div>
        </div>
      </div>

      <button id="lss-bridge-toggle" title="Anal Carnival Tools"><b>AC</b></button>
    `;

    document.body.appendChild(panel);

    const toggle = panel.querySelector("#lss-bridge-toggle");
    const card   = panel.querySelector("#lss-bridge-card");
    toggle.addEventListener("click", () => {
      card.classList.toggle("hidden");
    });

    // Загружаем сохранённые учётные данные
    loadCredentials().then(({ login, password }) => {
      const loginInput = panel.querySelector("#lss-login");
      const passInput  = panel.querySelector("#lss-password");
      const remember   = panel.querySelector("#lss-remember-checkbox");
      loginInput.value = login;
      passInput.value  = password;
      remember.checked = !!(login || password); // если есть сохранённые, ставим галочку
    });

    if (characterId) {
      loadCharacterPreview(characterId, panel);
    }

    const exportBtn = panel.querySelector("#lss-export-btn");
    exportBtn.addEventListener("click", () => handleExport(characterId, panel));

    return panel;
  }

  async function loadCharacterPreview(characterId, panel) {
    try {
      const lssData = await window.LSSAPI.fetchLSSCharacter(characterId);
      const d = typeof lssData.data === "string" ? JSON.parse(lssData.data) : lssData.data;

      panel.querySelector("#lss-char-name").textContent =
        d.name?.value || "(без имени)";
      panel.querySelector("#lss-char-meta").textContent =
        [d.info?.race?.value, d.info?.charClass?.value, `${d.info?.level?.value ?? 1} ур.`]
          .filter(Boolean).join(" · ") || "—";
    } catch (e) {
      panel.querySelector("#lss-char-name").textContent = "(нет доступа)";
      panel.querySelector("#lss-char-meta").textContent = e.message;
    }
  }

  async function handleExport(characterId, panel) {
    const loginInput = panel.querySelector("#lss-login");
    const passInput  = panel.querySelector("#lss-password");
    const rememberCheck = panel.querySelector("#lss-remember-checkbox");
    const login = loginInput.value.trim();
    const password = passInput.value.trim();

    // Проверка заполненности
    if (!login || !password) {
      setStatus(panel.querySelector("#lss-status"), "error", "Введите логин и пароль для экспорта");
      return;
    }

    // Сохраняем, если стоит галочка
    await saveCredentials(login, password, rememberCheck.checked);

    const btn    = panel.querySelector("#lss-export-btn");
    const status = panel.querySelector("#lss-status");

    btn.disabled = true;
    btn.innerHTML = `<span class="lss-spinner"></span><span>Экспорт...</span>`;
    setStatus(status, "loading", "Получение данных персонажа...");

    try {
      // Передаём учётные данные в API (предполагается, что LSSAPI.exportToMyServer умеет принимать их)
      const result = await window.LSSAPI.exportToMyServer(characterId, { login, password });
      setStatus(status, "success",
        `✓ Персонаж успешно перенесён!\nID персонажа: ${result?.id ?? result?._id ?? "—"}`
      );
      btn.innerHTML = `<span>↑</span><span>Экспортировать</span>`;
    } catch (err) {
      setStatus(status, "error", `✗ ГГ: ${err.message}`);
      console.error(err);
      btn.innerHTML = `<span>↑</span><span>Экспортировать</span>`;
    } finally {
      btn.disabled = false;
    }
  }

  function setStatus(el, type, text) {
    el.className = `lss-status visible ${type}`;
    el.textContent = text;
  }

  // ─── SPA: следим за изменением URL ──────────────────────────────────────────
  function init() {
    if (document.getElementById("lss-bridge-panel")) return;
    waitForElement("body")
      .then(() => createPanel())
      .catch(console.warn);
  }

  let lastPath = location.pathname;
  const urlObserver = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      const existing = document.getElementById("lss-bridge-panel");
      if (existing) existing.remove();
      setTimeout(init, 600);
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();