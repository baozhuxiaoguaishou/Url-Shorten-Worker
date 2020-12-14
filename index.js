const html404 = `<!DOCTYPE html>
<body>
  <h1>404 Not Find.</h1>
  <p>网址无效</p>
</body>`

const htmlIndex =`

<!doctype html>
<html>
<head>
<meta http-equiv="content-type" content="txt/html; charset=utf-8" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" integrity="sha256-L/W5Wfqfa0sdBNIKN9cG6QA5F2qx4qICmU2VgLruv9Y=" crossorigin="anonymous">
<title>短网址workers</title>
<style>
html, body {
  height: 100%;
}

</style>
</head>
<body style="    
display: -webkit-box;
display: flex;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
vertical-align: center;
flex-wrap: wrap;
align-content: center;">
<a href="https://github.com/xyTom/Url-Shorten-Worker/">
  <img style="position: absolute; top: 0; right: 0; border: 0;" 
  src="https://cdn.jsdelivr.net/npm/url-shorten-worker@latest/github.png"
  alt="Fork me on GitHub" >
  </a>
    <div class="card" style="width:80%">
        <h5 class="card-header">缩短网址</h5>
        <div class="card-body">
          <h5 class="card-title">请输入长网址：</h5>
          <p class="card-text">Example: https://example.com/long-url/RoowykPo8KPvjZWxQ</p>
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="https://长网址/" id="text">
            <div class="input-group-append">
                    <button class="btn btn-primary" type="button" onclick='shorturl()' id="searchbtn">缩短</button>
            </div>
          </div>    
          <p id="notice"></p>             
</div>
      </div>

      <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Result</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body" id="result">
              No result
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" onclick='copyurl("result")' data-toggle="popover" data-placement="bottom" data-content="已复制!">复制</button>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
              
            </div>
          </div>
        </div>
      </div>     
      
     <script src="https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.slim.min.js" integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js" integrity="sha256-WqU1JavFxSAMcLP2WIOI+GB2zWmShMI82mTpLDcqFUg=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/url-shorten-worker@1.0.5/main.js" crossorigin="anonymous"></script>
</body>
</html>
`
//获取随机字符串
async function randomString(len) {
　　len = len || 6;
　　let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　let maxPos = $chars.length;
　　let result = '';
　　for (i = 0; i < len; i++) {
　　　　result += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return result;
}
//检查网址格式
async function checkURL(URL){
    let str=URL;
    let Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    let objExp=new RegExp(Expression);
    if(objExp.test(str)==true){
      if (str[0] == 'h')
        return true;
      else
        return false;
    }else{
        return false;
    }
} 
//写入KV
async function save_url(URL){
    let random_key=await randomString()
    let is_exist=await LINKS.get(random_key)
    console.log(is_exist)
    if (is_exist == null)
        return await LINKS.put(random_key, URL),random_key
    else
        save_url(URL)
}
//响应请求
async function handleRequest(request) {
  console.log(request)
  //1.如果是post,操作保存网址
  if (request.method === "POST") {
    let req=await request.json()
    console.log(req["url"])
    if(!await checkURL(req["url"]))
    return new Response(`{"status":500,"key":": Error: Url illegal."}`)
    let stat,random_key=await save_url(req["url"])
    console.log(stat)
    if (typeof(stat) == "undefined")
      return new Response(`{"status":200,"key":"/`+random_key+`"}`)
    else
      return new Response(`{"status":200,"key":": Error:Reach the KV write limitation."}`)
  }
  //2.否则,显示首页html
  const requestURL = new URL(request.url)
  const path = requestURL.pathname.split("/")[1]
  console.log(path)
  if(!path){

    //const html= await fetch("https://xytom.github.io/Url-Shorten-Worker/")
    //html.text()
    return new Response(htmlIndex, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  })
  }
  //3.再否则执行网址跳转
  const value = await LINKS.get(path)
  console.log(value)
  

  const location = value
  if (location) {
    return Response.redirect(location, 302)
    
  }
  //4.跳转失败(找不到KV),返回404
  return new Response(html404, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
    status: 404
  })
}


//添加监控
addEventListener("fetch", async event => {
  event.respondWith(handleRequest(event.request))
})
