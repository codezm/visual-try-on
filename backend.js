var imgUrl = "";
chrome.contextMenus.create({
    id: "codezm",
	type: 'normal', // 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal
	title: '试穿', // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
	contexts: ['image'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
	//onclick: function(){}, // 单击时触发的方法
	//parentId: 1, // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	//documentUrlPatterns: 'https://*.baidu.com/*' // 只在某些页面显示此右键菜单
});
chrome.contextMenus.onClicked.addListener(
  (info, tab) => {
    console.log(info, tab);

    chrome.action.openPopup().then(()  =>  {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, (tabs) => {
          //let message = {
            ////这里的内容就是发送至content-script的内容
            //info: window.localStorage.getItem('isShow')
          //}
          chrome.tabs.sendMessage(tabs[0].id, {action: 'setImgUrl', imgUrl: info.srcUrl}, (response) => {
              //console.log('bgresponse: ', response);
          });
          //chrome.tabs.sendMessage(tabs[0].id, message, res => {
            //console.log('bg=>content')
            //console.log(res)
          //})
        })
    });
    //imgUrl = info.srcUrl;
    //console.log(imgUrl);
  },
)


function getImgUrl() {
    return imgUrl;
}
