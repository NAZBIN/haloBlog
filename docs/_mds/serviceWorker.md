## Service Worker
使用Service Worker缓存前端资源，Service Worker还提供了拦截请求的例子，能够结合LocalStorage（缓存css、js）成为一个独立的解决方案。

和浏览器自动的资源缓存机制相比，Service Worker 加上 Cache Storage 这个缓存机制，具有更高的准确性和可靠性。因为它可以确保两点：
1. 缓存永远不过期。你只要下载过一次，就永远不需要再重新下载，除非主动删除。
2. 永远不会访问过期的资源。换句话说，如果发布了一个新版本，那么你可以通过版本化的一些机制，来确保用户访问到的一定是最新的资源。
   
这样，你的前端应用就像一个只需要安装一次的 App，安装过之后，就不需要再重新下载了，这样使用起来加载速度会更快。

Service Worker 是一段独立于页面之外的 JavaScript 脚本，它并不在 Web 页面中运行，但是会在 Web 页面加载时，由一段代码去触发注册、下载和激活。一旦安装完成之后，Service Worker 就会拦截所有当前域名下的所有请求，由代码逻辑决定应该如何处理。  
要使用 Service Worker，基本上分为注册、初始化、拦截请求等步骤，下面我们就看一下各个部分应该如何用代码实现。

使用 Service Worker 的第一步，就是告诉浏览器当前域名下我需要使用 Service Worker。我们可以使用下面的代码来实现：
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      // 注册成功
      console.log('Service worker registered.');
    }, (err) => {
      // 注册失败
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
```
在 Service Worker 安装之后初始化缓存机制在 Service Worker 的实现代码被下载和执行后，会触发安装完成的事件，这个时候，你就可以在 sw.js 里监听这个事件，从而初始化自己的缓存机制。比如下面的代码，就演示了如何在安装事件中配置 Cache Storage：
```js
const cacheName = 'my_app_cache';
// 在 sw.js 中监听安装完成事件
self.addEventListener('install', function(e) {
  console.log('Service worker installed.');
  // 初始化 Cache Storage
  const cacheOpenPromise = caches.open(cacheName);
  // 安装过程中，等待 Cache Storage 配置完成
  e.waitUntil(cacheOpenPromise);
});
```
Cache Storage 也是浏览器提供的一种缓存机制，专门用于缓存一个请求的 request 和 response 的配对关系。此外，它还提供了 API，用来判断某个 request 是不是有对应的 response 已经缓存。所以 Cache Storage 也可以认为是专门为 Service Worker 提供的缓存机制。  
有了这样一段代码，我们就完成了 Service Worker 的安装。需要特别注意的是，每次打开 Web 页面时，页面其实都会调用 Service Worker 的 register 方法去注册。但是浏览器会判断脚本内容是否有变化，只有发生了变化才会重新安装。

拦截请求当 Service Worker 安装完成后，接下来就是处于运行状态，能够拦截前端的请求了。你可以通过监听 fetch 事件来处理所有的请求，然后根据请求内容等条件来决定如何处理请求。比如使用本地缓存或者发送到服务器端，实现的方式就是在 sw.js 文件中加入下面的代码
```js

// 监听所有的请求
self.addEventListener('fetch', function(e) {
  // 如果请求的路径不是 js 结尾，就通过 return false 来告诉 
  // service worker 这个请求应该发送到服务器端
  if (!request.url.endsWith('.js')) return false;
  
  // 否则检查 cache 中是否有对应的 response
  const promise = caches.open(cacheName).then(cache => {
    // 使用 cache.match 
    return cache.match(e.request).then(res => {
      if (res) {
        // 如果缓存存在则直接返回结果
        return Promise.resolve(res);
      } else {
        // 否则发出请求，并存到 cache
        const req = new Request(e.request.url);
        return fetch(corsRequest).then(res => {
          // 更新 cache
          cache.put(request, res.clone());
          return res;
        })
      }
    });
  });
  // 使用 e.respondWith 方法给请求返回内容
  e.respondWith(promise);
});
```
在这段代码中，采用的是一种缓存优先的策略。如果发现缓存存在，就使用缓存。否则发送请求到服务器端，然后把响应存放到缓存，并同时返回给调用者。这是一种最为高效的静态资源缓存策略，因为只会下载一次，但同时也对静态资源的打包有一定要求，那就是任何一次代码更新，都需要有唯一的路径。在实际的项目中，一般会通过加入时间戳，或者版本化的命名静态资源文件来实现。当然，在实际的项目中，使用 Service Worker 其实还有更多的考虑因素，比如何时删掉旧版本缓存，如何处理请求失败等等。但是核心机制基本就是示例代码中的内容，相信你在真正使用时，能够完善地加入对应的细节处理。

提升 React 应用的加载性能。主要分为两个部分来讲。第一部分是资源的分包，用于实现按需加载的功能。在这里，我们主要利用了 import 语句和 Webpack 对分包的支持，这样就能够实现按需加载，从而提高首屏页面的打开速度。第二个是 Service Worker 的概念和用法。不同于 PWA，这里的 Service Worker 仅仅用作前端静态资源的缓存。这是一个非常高效的缓存机制，可以保证静态资源仅被加载一次，从而极大地提高第二次以及后续打开 App 的速度。