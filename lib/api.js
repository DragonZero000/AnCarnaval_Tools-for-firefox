/**
 * Отправляет сообщение в background service worker и возвращает Promise.
 * @param {object} message
 * @returns {Promise<any>}
 */
function bgRequest(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response) {
        reject(new Error("Нет ответа от background. Service worker мог уснуть."));
        return;
      }
      if (!response.ok) {
        reject(new Error(response.error ?? "Неизвестная ошибка"));
        return;
      }
      resolve(response.data);
    });
  });
}

/**
 * @param {string} characterId 
 */
async function exportToMyServer(characterId, authData) {
  console.log("exportToMyServer")
  return bgRequest({ action: "EXPORT_TO_MY_SERVER", characterId: characterId, authData: authData});
}

/**
 * @param {string} myCharacterId
 * @param {string} lssCharacterId
 */
async function importFromMyServer(myCharacterId, lssCharacterId) {
  return bgRequest({ action: "IMPORT_FROM_MY_SERVER", myCharacterId, lssCharacterId });
}

/**
 * @param {string} characterId
 */
async function fetchLSSCharacter(characterId) {
  return bgRequest({ action: "FETCH_LSS_CHARACTER", characterId });
}

window.LSSAPI = { exportToMyServer, importFromMyServer, fetchLSSCharacter, bgRequest };
