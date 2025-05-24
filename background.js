chrome.runtime.onInstalled.addListener(() => {
  console.log("Bookmarks Reader instalado.");
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
  //chrome.tabs.create({ url: chrome.runtime.getURL("test.html") });
});