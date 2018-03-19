chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.query({}, function (tabs) {
    for (var i = 0; i < tabs.length; ++i) {
      chrome.tabs.sendMessage(tabs[i].id, { type: 'MEASURE_IT_STOP' });
    }
  });
});

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, { type: 'MEASURE_IT_CLICK' });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case 'MEASURE_IT_START':
      chrome.browserAction.setIcon({ path: 'icons8-ruler-48.png' });
      break;
    case 'MEASURE_IT_STOP':
      chrome.browserAction.setIcon({ path: 'icons8-ruler-48-bw.png' });
      break;
  }
});