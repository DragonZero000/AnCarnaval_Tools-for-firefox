// background.js — Service Worker
// Работает в фоне, имеет доступ к cookies и выступает прокси для запросов к LSS API.
// Content scripts не могут напрямую читать httpOnly cookies или слать cross-origin запросы
// без CORS — этим занимается background.

// ─── Получение токена из cookie lss-jwt ───────────────────────────────────────

async function getLSSToken() {
  return new Promise((resolve, reject) => {
    chrome.cookies.get(
      { url: "https://longstoryshort.app", name: "lss-jwt" },
      (cookie) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!cookie) {
          reject(new Error("Cookie lss-jwt не найдена. Убедитесь, что вы авторизованы на LSS."));
          return;
        }
        const token = cookie.value.replace(/^"|"$/g, "");
        resolve(token);
      }
    );
  });

}

// ─── Запросы к LSS API ─────────────────────────────────────────────────────────

async function fetchLSSCharacter(characterId) {
  const token = await getLSSToken();
  const resp = await fetch(
    `https://api.longstoryshort.app/character/${characterId}/`,
    {
      method: "GET",
      headers: {
        "accept": "application/json",
        "authorization": `Bearer ${token}`,
        "content-type": "application/json",
        "origin": "https://longstoryshort.app",
        "referer": "https://longstoryshort.app/"
      }
    }
  );
  if (!resp.ok) throw new Error(`LSS API: ${resp.status} ${resp.statusText}`);
  return resp.json();
}

async function updateLSSCharacter(characterId, lssPayload) {
  const token = await getLSSToken();
  const resp = await fetch(
    `https://api.longstoryshort.app/character/${characterId}/`,
    {
      method: "PATCH",
      headers: {
        "accept": "application/json",
        "authorization": `Bearer ${token}`,
        "content-type": "application/json",
        "origin": "https://longstoryshort.app",
        "referer": "https://longstoryshort.app/"
      },
      body: JSON.stringify(lssPayload)
    }
  );
  if (!resp.ok) throw new Error(`LSS API (update): ${resp.status} ${resp.statusText}`);
  return resp.json();
}


async function fetchMyServerCharacter(myCharacterId, serverUrl) {
  const resp = await fetch(`${serverUrl}/api/characters/${myCharacterId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (!resp.ok) throw new Error(`Ваш сервер: ${resp.status} ${resp.statusText}`);
  return resp.json();
}

async function sendToMyServer(normalizedCharacter, serverUrl, marimoToken) {
  const deepCopy = JSON.parse(JSON.stringify(normalizedCharacter));
  
  console.log("Отправляю финальный снимок (POST):", deepCopy);

  // 1. Создаем персонажа (POST)
  const resp = await fetch(`${serverUrl}/api/characters/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + marimoToken
    },
    body: JSON.stringify(deepCopy)
  });

  if (!resp.ok) throw new Error(`Ошибка создания (POST): ${resp.status} ${resp.statusText}`);

  // 2. Получаем данные ответа, чтобы вытащить ID
  const responseData = await resp.json();
  const chID = responseData.id;

  if (!chID) {
    console.error("Сервер не вернул ID. Весь ответ:", responseData);
    throw new Error("ID персонажа не найден в ответе сервера");
  }

  console.log("ID получен:", chID, ". Отправляю обновление (PUT)...");

  // 3. Обновляем персонажа (PUT)
  const put_resp = await fetch(`${serverUrl}/api/characters/${chID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + marimoToken
    },
    body: JSON.stringify(deepCopy)
  });

  // Исправленная проверка статуса (2xx)
  if (!put_resp.ok) {
    throw new Error(`Ошибка обновления (PUT): ${put_resp.status} ${put_resp.statusText}`);
  }

  // Возвращаем результат последнего успешного запроса
  return await put_resp.json();
}

// ─── Обработчик сообщений от content scripts ──────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handleMessage(msg)
    .then((result) => sendResponse({ ok: true, data: result }))
    .catch((err)  => sendResponse({ ok: false, error: err.message }));
  return true; // обязательно для асинхронных ответов
});

async function handleMessage(msg) {
  // Получаем serverUrl из хранилища
  const serverUrl = "https://manager.marimo.chickenkiller.com";

  switch (msg.action) {

    // ── Экспорт ─────────────────────────────────────────────
    case "EXPORT_TO_MY_SERVER": {
      if (!serverUrl) throw new Error("Укажите URL вашего сервера в настройках расширения.");
      const lssData     = await fetchLSSCharacter(msg.characterId);
      console.log("lssData: ", lssData)
      const authResp = await fetch(`${serverUrl}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"email": msg.authData.login, "password": msg.authData.password})
      });
       if (!authResp.ok) {
        const errorText = await authResp.text();
        throw new Error(`Ошибка аутентификации: ${authResp.status} ${errorText}`);
      }
      const authData = await authResp.json(); 
      const yourServerToken = authData.token; 
      console.log(yourServerToken)
      const lssToken = await getLSSToken();
      const normalized  = await lssToNormalized(lssData, yourServerToken, lssToken);           // transform.js (инжектится в bg через import)
      const result = await sendToMyServer(normalized, serverUrl, yourServerToken);
      return result;
    }

    // ── Импорт: шедевро сайт → LSS (не рабочее) ──────────────────────────────────────────────
    case "IMPORT_FROM_MY_SERVER": {
      if (!serverUrl) throw new Error("Укажите URL вашего сервера в настройках расширения.");
      const myChar     = await fetchMyServerCharacter(msg.myCharacterId, serverUrl);
      const lssPayload = normalizedToLSS(myChar);              // transform.js
      const result     = await updateLSSCharacter(msg.lssCharacterId, lssPayload);
      return result;
    }

    // ── Проверка токена (для попапа) ───────────────────────────────────────────
    case "CHECK_TOKEN": {
      const token = await getLSSToken();
      return { valid: !!token, preview: token.slice(0, 20) + "…" };
    }

    // ── Получить данные LSS-персонажа напрямую (для content_mysite.js) ─────────
    case "FETCH_LSS_CHARACTER": {
      return await fetchLSSCharacter(msg.characterId);
    }

    default:
      throw new Error(`Неизвестный action: ${msg.action}`);
  }
}

// ─── Импорт transform-функций (ES modules в MV3 поддерживаются _ вставил) ───────────────
import { lssToNormalized, normalizedToLSS } from "./lib/transform.js";
