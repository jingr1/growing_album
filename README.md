# growing_album
This is a applet of WeChat to record the children's growing path.

### 整体架构

![整体架构](http://easyimage-10028115.file.myqcloud.com/internal/t3n2rrlm.ulr.jpg)

### 1. 准备域名和证书

在微信小程序中，所有的网路请求受到严格限制，不满足条件的域名和协议无法请求，具体包括：

* 只允许和在 MP 中配置好的域名进行通信，如果还没有域名，需要注册一个。
* 网络请求必须走 HTTPS 协议，所以你还需要为你的域名申请一个 SSL 证书。

> 腾讯云提供[域名注册](https://www.qcloud.com/product/dm.html)和[证书申请](https://console.qcloud.com/ssl)服务，还没有域名或者证书的可以去使用

域名注册好之后，可以登录[微信公众平台](https://mp.weixin.qq.com)配置通信域名了。

![配置通信域名](http://easyimage-10028115.file.myqcloud.com/internal/tjzpgjrz.y5a.jpg)

### 2. Nginx 和 Node 代码部署

小相册服务要运行，需要进行以下几步：

* 下载安装 [Nginx](http://nginx.org/)
* 配置 Nginx 反向代理到 `http://127.0.0.1:9993`
* 安装 [Node](https://nodejs.org/)运行环境
* 部署 `server` 目录的代码到服务器上
* 使用 `npm install` 安装依赖模块
* 使用 `npm install pm2 -g` 安装 pm2
* 使用 `npm i cos-nodejs-sdk-v5 --save` 安装 [cos](https://github.com/tencentyun/cos-nodejs-sdk-v5)

### 3. 配置 HTTPS

将配置 `C:\nginx\conf\nginx.conf` 中相应的值修改为上面申请的域名、证书、私钥

    # HTTPS server
    server {
        listen       80;
        listen       443 ssl;
        server_name  www.mcloudx.cn mcloudx.cn;

        ssl_certificate      C:/nginx/ssl/1_www.mcloudx.cn_bundle.crt;
        ssl_certificate_key  C:/nginx/ssl/2_www.mcloudx.cn.key;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;

        location / {
             #node.js应用的端口
             proxy_pass http://127.0.0.1:9993;
       }
   }


配置完成后，即可启动 nginx。

```sh
start nginx
```

### 4. 域名解析

我们还需要添加域名记录解析到我们的云服务器上，这样才可以使用域名进行 HTTPS 服务。

在腾讯云注册的域名，可以直接使用[云解析控制台](https://console.qcloud.com/cns/domains)来添加主机记录，直接选择上面购买的 CVM。

![添加域名解析](http://easyimage-10028115.file.myqcloud.com/internal/uw25hdj2.k1u.jpg)

解析生效后，我们在浏览器使用域名就可以进行 HTTPS 访问。

![HTTPS 访问效果图](http://easyimage-10028115.file.myqcloud.com/internal/bxfkmjea.g41.jpg)

### 5. 开通和配置 COS

本相册的图片资源是存储在 COS 上的，要使用 COS 服务，需要登录 [COS 管理控制台](https://console.qcloud.com/cos/overview)，然后在其中完成以下操作：

- 开通 COS 服务分配得到唯一的`APP ID`
- 使用密钥管理生成一对`SecretID`和`SecretKey`（用于调用 COS API）
- 在 Bucket 列表中创建**公有读私有写**访问权限、**CDN加速**的 bucket（存储图片的目标容器）
- 参考 config_example.js 创建属于你自己的 config.js 配置文件,按注释修改对应的 COS 配置

### 6. 启动 Node 服务

使用`pm2`管理 Node 进程，执行以下命令启动 Node 服务：

```bash
pm2 start process.json
```
### 7. 微信小程序服务器配置

进入微信公众平台管理后台设置服务器配置，配置类似如下设置：

![小程序服务器配置](http://easyimage-10028115.file.myqcloud.com/internal/erz2fmyd.bx1.jpg)

注意：需要将 `www.qcloud.la` 设置为上面申请的域名，将 downloadFile 合法域名设置为在 COS 管理控制台中自己创建的 bucket 的相应 **CDN 加速访问地址**，如下图所示：

![CDN加速访问地址](http://easyimage-10028115.file.myqcloud.com/internal/1criixcb.wat.jpg)

### 8. 启动小相册 Demo

在微信开发者工具将小相册应用包源码添加为项目，并把源文件`config.js`中的通讯域名修改成上面申请的域名。

![修改配置文件](http://easyimage-10028115.file.myqcloud.com/internal/nvqrghyi.pl4.jpg)

然后点击调试即可打开小相册 Demo 开始体验。

![调试](http://easyimage-10028115.file.myqcloud.com/internal/uo4m5gcd.tpr.jpg)

这里有个问题。截止目前为止，微信小程序提供的上传和下载 API 无法在调试工具中正常工作，需要用手机微信扫码预览体验。

## 主要功能实现

### 上传图片

上传图片使用了微信小程序提供的`wx.chooseImage(OBJECT)`获取需要上传的文件路径，然后调用上传文件接口`wx.request(OBJECT)`发送 HTTPS POST 请求到自己指定的后台服务器。和传统表单文件上传一样，请求头`Content-Type`也是`multipart/form-data`。后台服务器收到请求后，使用 npm 模块 multiparty 解析 `multipart/form-data` 请求，将解析后的数据保存为指定目录下的临时文件。拿到临时文件的路径后，就可直接调用 COS SDK 提供的[文件上传 API](https://www.qcloud.com/doc/product/430/5947#.E6.96.87.E4.BB.B6.E4.B8.8A.E4.BC.A0) 进行图片存储，最后得到图片的存储路径及访问地址（存储的图片路径也可以直接在 COS 管理控制台看到）。

### 获取图片列表

调用[列举目录下文件&目录 API](https://www.qcloud.com/doc/product/430/5947#.E5.88.97.E4.B8.BE.E7.9B.AE.E5.BD.95.E4.B8.8B.E6.96.87.E4.BB.B6.26amp.3B.E7.9B.AE.E5.BD.95)可以获取到在 COS 服务端指定 bucket 和该 bucket 指定路径下存储的图片。

### 下载和保存图片

指定图片的访问地址，然后调用微信小程序提供的 `wx.downloadFile(OBJECT)` 和 `wx.saveFile(OBJECT)` 接口可以直接将图片下载和保存本地。这里要注意图片访问地址的域名需要和服务器配置的 downloadFile 合法域名一致，否则无法下载。

### 删除图片

删除图片也十分简单，直接调用[文件删除 API](https://www.qcloud.com/doc/product/430/5947#.E6.96.87.E4.BB.B6.E5.88.A0.E9.99.A4) 就可以将存储在 COS 服务端的图片删除。

## LICENSE

[MIT](LICENSE)
