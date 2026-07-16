chrome.action.onClicked.addListener(async (tab) => {
  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: "PREENCHER" });
    console.log("[bg] Dados:", res?.valor);
  } catch {
    console.warn("[bg] Content script não carregado nesta aba.");
  }
});