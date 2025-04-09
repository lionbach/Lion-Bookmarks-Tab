chrome.runtime.onInstalled.addListener(() => {
  console.log("Bookmarks Reader instalado.");
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("main.html") });
  //chrome.tabs.create({ url: chrome.runtime.getURL("test.html") });
});