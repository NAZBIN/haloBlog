# 单点登录

前面我们已经知道了，在同域下的客户端/服务端认证系统中，通过客户端携带凭证，维持一段时间内的登录状态。但当我们业务线越来越多，就会有更多业务系统分散到不同域名下，就需要「一次登录，全线通用」的能力，叫做「单点登录」。

## "虚假"的单点登录（主域名相同）

简单的，如果业务系统都在同一主域名下，比如`wenku.baidu.com` `tieba.baidu.com`，就好办了。可以直接把 cookie domain 设置为主域名  `baidu.com`，百度也就是这么干的。

![图片](https://mmbiz.qpic.cn/mmbiz_png/TRiapJU3MMsZBgRKMl9Uor5iazd3BPKHxhpW7unnFC7LfJnWefCTqckpzrib7gbe1BJbiboUoJJ89TfibK2fQpKA0NQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## "真实"的单点登录（主域名不同）

比如滴滴这么潮的公司，同时拥有`didichuxing.com` `xiaojukeji.com` `didiglobal.com`等域名，种 cookie 是完全绕不开的。这要能实现「一次登录，全线通用」，才是真正的单点登录。这种场景下，我们需要独立的认证服务，通常被称为 SSO。**「一次「从 A 系统引发登录，到 B 系统不用登录」的完整流程」**

![图片](https://mmbiz.qpic.cn/mmbiz_png/TRiapJU3MMsZBgRKMl9Uor5iazd3BPKHxhibSxiaEbDxZ7Q8g2KT6MyrQQr2xjTZjUjrfWNe3xqJFyWs2lZQ9QXCCg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

- 用户进入 A 系统，没有登录凭证（ticket），A 系统给他跳到 SSO

- SSO 没登录过，也就没有 sso 系统下没有凭证（注意这个和前面 A ticket 是两回事），输入账号密码登录

- SSO 账号密码验证成功，通过接口返回做两件事：一是种下 sso 系统下凭证（记录用户在 SSO 登录状态）；二是下发一个 ticket

- 客户端拿到 ticket，保存起来，带着请求系统 A 接口

- 系统 A 校验 ticket，成功后正常处理业务请求

- 此时用户第一次进入系统 B，没有登录凭证（ticket），B 系统给他跳到 SSO

- SSO 登录过，系统下有凭证，不用再次登录，只需要下发 ticket

- 客户端拿到 ticket，保存起来，带着请求系统 B 接口

**「完整版本：考虑浏览器的场景」**上面的过程看起来没问题，实际上很多 APP 等端上这样就够了。但在浏览器下不见得好用。看这里：

![图片](https://mmbiz.qpic.cn/mmbiz_png/TRiapJU3MMsZBgRKMl9Uor5iazd3BPKHxhD6zEMdFrVBcWS6BFJLAOSpPdSY9nStTan2yTbXMqQ2ww5s5o9vy1Jw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

对浏览器来说，SSO 域下返回的数据要怎么存，才能在访问 A 的时候带上？浏览器对跨域有严格限制，cookie、localStorage 等方式都是有域限制的。这就需要也只能由 A 提供 A 域下存储凭证的能力。一般我们是这么做的：

![图片](https://mmbiz.qpic.cn/mmbiz_png/TRiapJU3MMsZBgRKMl9Uor5iazd3BPKHxhgg162SjDO0WTB8kibvTIfKrC2LviboQtWemm0OlYqs0ibhUC6uKU4WYDA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

图中我们通过颜色把浏览器当前所处的域名标记出来。注意图中灰底文字说明部分的变化。

- 在 SSO 域下，SSO 不是通过接口把 ticket 直接返回，而是通过一个带 code 的 URL 重定向到系统 A 的接口上，这个接口通常在 A 向 SSO 注册时约定

- 浏览器被重定向到 A 域下，带着 code 访问了 A 的 callback 接口，callback 接口通过 code 换取 ticket

- 这个 code 不同于 ticket，code 是一次性的，暴露在 URL 中，只为了传一下换 ticket，换完就失效

- callback 接口拿到 ticket 后，在自己的域下 set cookie 成功

- 在后续请求中，只需要把 cookie 中的 ticket 解析出来，去 SSO 验证就好

- 访问 B 系统也是一样
