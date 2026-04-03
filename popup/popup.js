// popup/popup.js

const tokenDot  = document.getElementById("token-dot");
const tokenText = document.getElementById("token-text");
const serverInput = document.getElementById("server-url");
const saveBtn   = document.getElementById("save-btn");
const saveMsg   = document.getElementById("save-msg");
const checkBtn  = document.getElementById("check-token-btn");

// ─── Загрузка сохранённых настроек ────────────────────────────────────────────

chrome.storage.sync.get(["serverUrl"], ({ serverUrl }) => {
  if (serverUrl) serverInput.value = serverUrl;
});

// ─── Проверка LSS токена ───────────────────────────────────────────────────────

async function checkToken() {
  tokenDot.className = "token-dot loading";
  tokenText.textContent = "Проверка...";

  try {
    const resp = await chrome.runtime.sendMessage({ action: "CHECK_TOKEN" });
    if (!resp.ok) throw new Error(resp.error);

    tokenDot.className = "token-dot ok";
    tokenText.textContent = `Токен позаимствован: ${resp.data.preview}`;
  } catch (err) {
    tokenDot.className = "token-dot err";
    tokenText.textContent = err.message || "Ошибка: авторизуйтесь на LSS";
  }
}

// ─── Сохранение настроек ──────────────────────────────────────────────────────

saveBtn.addEventListener("click", () => {
  const serverUrl = serverInput.value.trim().replace(/\/$/, ""); // убираем trailing slash

  chrome.storage.sync.set({ serverUrl }, () => {
    saveMsg.className = "save-msg";
    setTimeout(() => { saveMsg.className = "save-msg hidden"; }, 2500);
  });
});

checkBtn.addEventListener("click", checkToken);

// Проверяем при открытии попапа
checkToken();
