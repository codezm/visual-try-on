var selectImgIndexGlobal = -1;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("content.js", request)
  if (request.action === 'getProductImage') {
    getProductImageUrl(request.openAIApiKey, request.openAIApi, request.selectImgIndex).then(sendResponse);
    return true; // Indicates we will send a response asynchronously
  }
  if (request.action === 'detectTargetSite') {
    sendResponse(detectTargetSite());
    return true;
  }
  if (request.action === 'openPopup') {
    chrome.runtime.openOptionsPage();
    console.log(request);
    return true;
  }

  if (request.action === 'setImgUrl') {
    selectImgIndexGlobal = request.imgUrl;
    if (document.querySelectorAll("[content='Gradio']").length > 0) {
    let imgDivs = document.querySelectorAll(".image-frame img");
    //var btnEles = [];
    for(var i = 0; i < imgDivs.length; i++) {
        if (imgDivs[i].src === request.imgUrl) {
            imgDivs[i].setAttribute('data-index', 1);
        } else {
            imgDivs[i].setAttribute('data-index', -1);
        }
    }}
    return true;
  }
});

function detectTargetSite() {
  if (document.querySelectorAll("[content='Gradio']").length > 0) {
//    let imgDivs = document.querySelectorAll(".image-frame");
//    //var btnEles = [];
//    for(var i = 0; i < imgDivs.length; i++) {
//        var btn = document.createElement("button");
//        btn.innerHTML = '试穿';
//        btn.style.backgroundColor = 'white';
//        btn.style.color = 'black';
//        btn.style.padding = '10px 20px';
//        btn.style.border = 'none';
//        btn.style.bottom = '10px';
//        btn.style.right = '10px';
//        btn.style.borderRadius = '5px';
//        btn.style.cursor = 'pointer';
//        btn.style.position = 'absolute';
//        btn.setAttribute('data-index', i);
//        btn.addEventListener('click', function() {
//            var targetExtensionId = "eojnolahepnlgkkmenhojdefnhoeibkk"; // 插件的ID
//            chrome.runtime.sendMessage(targetExtensionId, {type: 'MsgFromPage', msg: 'Hello, I am page~'}, function(response) {
//              console.log(response);
//            });
//    //        selectImgIndexGlobal = this.getAttribute("data-index");
//
//    //        console.log(selectImgIndexGlobal);
//    //    //    //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//    //    //        //if (tabs.length > 0) {
//    //    //            // 打开browser action的popup页面
//    //    //            //chrome.browserAction.getPopup();
//    //    //            //console.log(chrome.action);
//    //    //            //chrome.action.openPopup();
//    //    //        //}
//    //    //    //});
//    //    //    // 这里的代码会在按钮被点击时执行
//    //    //    //chrome.runtime.sendMessage({action: "openPopup", imageUrl: selectImgIndexGlobal}, function() {
//    //    //    //    console.log('ook')
//    //    //    //});
//        });
//
//        //imgDivs[i].appendChild(`<button style="position: absolute; bottom: 10px; right: 10px; background-color: white; border: none; color: black; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; cursor: pointer; border-radius: 5px;" onclick="toggleButtonColor(this)">试穿</button>`)
//    //    btnEles.push(btn);
//        imgDivs[i].appendChild(btn);
//    }
    
    return "isGradio";
  }
  return "unknow";
}

async function getProductImageUrl(openAIApiKey, openAIApi, selectImgIndex) {
  if (location.href.indexOf("taobao.com") !== -1 || location.href.indexOf("tmall.com") !== -1) {
    // 选择所有元素
    const url = document.querySelector("[class^='mainPicWrap--']").querySelector("img").src;
    return new Promise((resolve, reject) => {
      // 假设异步操作成功，调用resolve
      //resolve({productImageUrl: url});
      resolve({productImageUrl: url.replace("_.webp", "")});
    });
  }

  var imgEles = document.querySelectorAll("img");
  if (imgEles.length === 1) {
      return new Promise((resolve, reject) => {
        resolve({productImageUrl: imgEles[0].src});
      });
  }
  //console.log("selectImgIndexGlobal: ", selectImgIndexGlobal)
  if (document.querySelectorAll("[content='Gradio']").length > 0) {
      var imgEle = document.querySelector('[data-index="1"]');
      if (imgEle) {
          return new Promise((resolve, reject) => {
            resolve({productImageUrl: imgEle.src});
          });
      }
      return new Promise((resolve, reject) => {
        resolve({productImageUrl: imgEles[selectImgIndex].src});
      });
  }

  const htmlContent = document.documentElement.outerHTML;
  const productImageUrl = await getProductImageFromGPT(
    htmlContent,
    openAIApiKey,
    openAIApi
  );
  return { productImageUrl };
}

async function getProductImageFromGPT(htmlContent, openAIApiKey, apiUrl) {
  console.log('getProductImageFromGPT', openAIApiKey, !openAIApiKey);
  if (!openAIApiKey) {
    console.error('OpenAI API key not provided');
    return null;
  }

  const prompt = `
    Analyze the following HTML content and extract the URL of the main product image.
    Look for both <img> tags and CSS background-image properties.
    Consider elements and children with class names or IDs containing words like 'product-image' 'product', 'main', 'featured' etc.
    Return only the full URL with commonly used image extensions (jpg, jpeg, png, webp) of the main product image in JSON format, with the key "productImageUrl".
    If you can't find a product image, return {"productImageUrl": null}.

    HTML content:
    ${htmlContent.substring(
      0,
      50000
    )} // Limiting to few characters to avoid exceeding token limits
  `;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: {
          type: 'json_object',
        },
      }),
    });

    const data = await response.json();

    const result = JSON.parse(data.choices[0].message.content.trim());
    return result.productImageUrl;
  } catch (error) {
    console.error('Error fetching product image from GPT-4o:', error);
    return null;
  }
}
