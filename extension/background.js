// Vivaldi ignores `chrome_url_overrides`, so redirect its built-in start page to ours.
const VIVALDI_START = /^(chrome|vivaldi):\/\/(vivaldi-webui\/startpage|newtab)/

function redirect(tabId, url) {
  if (url && VIVALDI_START.test(url)) {
    chrome.tabs.update(tabId, { url: chrome.runtime.getURL('index.html') })
  }
}

chrome.tabs.onCreated.addListener((tab) => redirect(tab.id, tab.pendingUrl || tab.url))
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => redirect(tabId, changeInfo.url))
