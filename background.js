// 页面加载完成之后创建菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "codezm",
        type: 'normal', // 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal
        title: '试穿', // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
        contexts: ['image'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
    });
})
chrome.contextMenus.onClicked.addListener(
  (info, tab) => {
    chrome.action.openPopup().then(()  =>  {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'setImgUrl', imgUrl: info.srcUrl}, (response) => {
              console.log('bgresponse: ', response);
              chrome.storage.sync.set({ msg: '我来自background' });
          });
        })
    }).catch(() => {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'setImgUrl', imgUrl: info.srcUrl}, (response) => {
              console.log('bgresponse: ', response);
              chrome.storage.sync.set({ msg: '我来自background' });
          });
        })
    });
  },
)
