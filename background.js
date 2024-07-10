const iconActive = 'icon/128-active.png'
const iconInactive = 'icon/128-inactive.png'

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => CozeChatbotMinimizerExtension.onActionIconClicked()
  })
})

chrome.tabs.onUpdated.addListener(async (_, __, tab) => {
  if (/^https:\/\/www\.coze\.com\/space\/\d+\/bot\/\d+$/.test(tab.url)) {
    await Promise.all([
      chrome.action.setIcon({ path: iconActive, tabId: tab.id }),
      chrome.action.enable(tab.id),
    ])
  } else {
    await Promise.all([
      chrome.action.setIcon({ path: iconInactive, tabId: tab.id }),
      chrome.action.disable(tab.id),
    ])
  }
})
