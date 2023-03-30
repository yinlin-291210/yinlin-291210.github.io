---
layout: post
title: "webWorker"
subtitle: "webWorker"
date: 2023-03-30 11:29:11
author: linbao
header-img:
catalog: true
tags:
  - 浏览器
---

### 1.什么是 web worker，他的作用是什么？

JavaScript 是单线程的语言，如果在浏览器中需要执行一些大数据量的计算，页面上的其他操作就会因为来不及响应而出现卡顿的情况，这对用户体验来说是极其糟糕的。而且随着计算机的发展，多核 cpu 的出现，单线程无法充分发挥出计算机的计算能力。

在这种情况下，Web Worker 的出现为 js 提供了一个多线程的环境，让更多耗时的复杂计算拿到另一个子线程中去完成，计算完之后再提供给主进程使用。子线程中的代码不会对主线程产生影响。前端页面可以只负责界面渲染，让用户体验更流畅。

它允许在 Web 程序中并发执行多个 JavaScript 脚本，每个脚本执行流都称为一个线程，彼此间互相独立，并且有浏览器中的 JavaScript 引擎负责管理。这将使得线程级别的消息通信成为现实。使得在 Web 页面中进行多线程编程成为可能。

webWorker 有几个特点：

1. 能够长时间运行（响应）
2. 快速启动和理想的内存消耗
3. 天然的沙箱环境

### 2.web worker 的使用限制

- 同源限制：分配给 Web Worker 线程运行的脚本文件，必须与主线程的脚本文件同源

- DOM 限制：Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用 document、window、parent 这些对象。但是，Worker 线程可以访问 navigator 对象和 location 对象。
- 通信联系：Worker 线程和主线程不再同一个上下文环境，它们不能直接通信，必须通过消息完成。
- 脚本限制：Worker 线程不能执行 `alert()` 和 `confirm()` 方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求
- 文件限制：Worker 线程无法读取本地文件，即不能打开本地的文件系统（`file://`） ，它所加载的脚本，必须来自网络

### 3.web worker 的基本使用

1.检测浏览器是否支持 Web Worker

在创建 web worker 之前，请检测用户的浏览器是否支持它：

```javascript
if (typeof Worker !== "undefined") {
  // 是的! Web worker 支持!
  // 一些代码.....
} else {
  //抱歉! Web Worker 不支持
}
```

2.创建 worker

      需要注意的是，由于 Web Worker 有同源限制，所以在进行本地调试或运行以下示例的时候，需要先启动本地服务器，直接使用 `file://` 协议打开页面的时候，会抛出以下异常：

      ```javascript
      Uncaught DOMException: Failed to construct 'Worker': Script at 'file:///D:/study/study-1/worker1.js' cannot be accessed from origin 'null'.
      ```

​ 我们可以使用 vscode 的 live-server 插件来将 worker 文件放在本地服务器上。

- 使用指定文件路径方式创建

  ```javascript
  //传入脚本文件名作为参数,例如：
  const myWorker1 = new Worker("./worker1.js");

  //还可以传入第二个参数用于指定worker的名字，是一个可选对象。仅可用于指定名字，其他属性不能被识别
  const myWorker2 = new Worker("./worker1.js", { name: "worker2022" });
  ```

- 使用 Blob 创建

  在同一个页面中既有主进程的代码，又有 worker 脚本的内容时，可以使用创建 Blob 的方式生成 worker。

  此时一般需要 worker 的内容放在 script 标签中，但是如果 script 的类型是"text/javascript"就会直接被浏览器解析了，我们并不想这样，而是需要用这些文本内容生成一个 URL 作为创建 worker 的参数，所以这时可以把保存这部分内容的 script 标签的 type 声明为一个浏览器不认识的类型，例如：

  ```javascript
  <script id="worker" type="text/js-worker">
    self.onmessage = function (e){" "}
    {
      // xxx这里是worker脚本的内容
    }
    ;
  </script>
  ```

  ```javascript
  // 获取id为worker的scripr标签下的文字内容，创建Blob对象
  const blob = new Blob([document.querySelector("#worker").textContent]);
  const url = window.URL.createObjectURL(blob); //创建一个表示Blob对象的URL对象
  const worker = new Worker(url);
  ```

  3.worker 与主线程通信

主进程和 worker 之间通过发送消息的机制进行通信。

这个过程中数据并不是被共享而是被复制，发送到通信目标窗口的数据，它将会被**结构化克隆算法序列化**，到达目标窗口再反序列化。所以这种方式不适合频繁大量数据的通信。对于主进程和 worker 自身：

- 都使用 postMessage 发送消息
- 都使用 onmessage 接收消息
- 都使用 onerror 监听错误事件

在主进程中 onmessage、onerror 和 postMessage 必须挂在 worker 对象上。在 worker 中使用时

self.onmessage \self.postMessage\ self.onerror 就行，或者不写 self，因为在 worker 内部，self 指向 worker 自己。

![web worker.png](/img/in-post/web-worker/web worker.png)

4.关闭 worker

worker 会占用一定的系统资源，在相关的功能执行完之后，要关闭掉 worker。

- 在主线程中关闭

  ```javascript
  //worker 线程会立即被终结，不会有任何机会让它完成自己的操作或清理工作
  worker.terminate();
  ```

- 在 worker 线程内部关闭

  ```javascript
  self.close();
  ```

  5.worker 线程的最大数量

可以根据**`navigator.hardwareConcurrency`**只读属性返回可用于在用户计算机上运行线程的逻辑处理器的数量 。

现代计算机的 CPU 中有多个物理处理器内核（典型的是两个或四个内核），但每个物理内核通常也能够使用高级调度技术一次运行多个线程。例如，一个四核 CPU 可以提供八个 **逻辑处理器核**。逻辑处理器内核的数量可用于衡量可以一次有效运行而无需进行上下文切换的线程数。

但是，浏览器可能会选择报告较少的逻辑核心数，以便更准确地表示[`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)一次可以运行的线程的数量，因此不要将其视为对用户系统中核心数的绝对测量.

6.兼容性

![worker.png](/img/in-post/web-worker/worker.png)

### 4.web worker 的分类

Web worker 规范中定义了两类工作线程，分别是专用线程 Dedicated Worker 和共享线程 Shared Worker，其中，Dedicated Worker 只能为一个页面所使用，而 Shared Worker 则可以被多个页面所共享。

1.专用线程 Dedicated Worker

单线程专用，和一个标签页互相通信，不在赘述。

在 Web Worker 中，我们也可以使用 `importScripts` 方法将一个或多个脚本同步导入到 Web Worker 的作用域中。

脚本的下载顺序不固定，但执行时会按照传入 `importScripts()` 中的文件名顺序进行。这个过程是同步完成的；直到所有脚本都下载并运行完毕，`importScripts()` 才会返回。

```javascript
importScript("xxxa.js", "xxxb.js");
```

2.共享线程 Shared Worker

一个共享 Worker 是一种特殊类型的 Worker，可以被多个浏览上下文访问，比如多个 windows，iframes 和 workers，但这些浏览上下文必须同源。相比 dedicated workers，它们拥有不同的作用域。

与专用线程 Worker 不同的是：
1 同一个 js url 只会创建一个 sharedWorker，其他页面再使用同样的 url 创建 sharedWorker，会复用已创建的 worker，这个 worker 由那几个页面共享。
2 sharedWorker 通过 port 来发送和接收消息

github 就是用它实现的多页面登录状态共享

利用其实现多页面通信示例

有一个**点赞**按钮，每次点击时点赞数会加 1。首先新开一个窗口，然后点击几次。然后再新开另一个窗口继续点击，这时会发现当前页面显示的点赞数是基于前一个页面的点赞数继续累加。这样就实现了多个标签页的数据共享。

work.port 是 MessagePort 对象，MessagePort 接口代表 MessageChannel 的两个端口之一，允许从一个端口发送消息并监听它们到达另一个端口。sharedworker 所有通信都是从 .port 对象实现的.

```html
<body>
  <button id="likeBtn">点赞</button>
  <p>页面1点赞数<span id="likedCount">0</span>个赞</p>
</body>
<script>
  let likeBtn = document.querySelector("#likeBtn");
  let likedCountEl = document.querySelector("#likedCount");
  let worker = new SharedWorker("shared-worker.js");
  worker.port.start(); //sharedWorker通过port来发送和接收消息
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      console.log("切换了");
      // 通过worker port发送消息
      worker.port.postMessage("Reverse");
    }
  });
  likeBtn.addEventListener("click", function () {
    console.log("点了");
    worker.port.postMessage("like");
  });
  // 通过worker port接收消息
  worker.port.onmessage = function (val) {
    console.log(val.data, "val");
    likedCountEl.innerHTML = val.data;
  };
</script>
```

```javascript
let a = 0;
//首先,先监听事件onconnect,不是onmessage事件!当你有web页面开始连接这个共享线程,这个事件就会被调用
onconnect = function (e) {
  let port = e.ports[0]; //当前连接端口
  port.onmessage = function (e) {
    console.log(e.data, "---eeee", e, JSON.stringify(e));
    let obj = new Object();
    for (let key in e) {
      console.log("key:", key);
      console.log(e[key]);
      obj[key] = e[key];
    }
    console.log(obj, "666");
    // console.log(Object.getOwnPropertyNames(e),'99999');
    console.log(Reflect.ownKeys(e), "8888");
    if (e.data === "like") {
      //将消息发回主线程
      port.postMessage(++a);
    }
    if (e.data === "Reverse") {
      port.postMessage(a);
    }
  };
};
```

利用其实现多页面广播消息

当有页面连接共享线程时，将其 port 缓存起来，存到数组中，我们就可以实现通过遍历这个数组向多个页面广播消息。

```html
<body>
  <p>页面1当前时间<span id="nowTime"></span></p>
</body>
<script>
  let nowTimeEl = document.querySelector("#nowTime");
  let worker = new SharedWorker("shared-worker1.js");
  //worker.port.start();//start() 方法是与 addEventListener 配套使用。选择 onmessage 进行事件监听，那么将隐含调用 start() 方法。
  worker.port.onmessage = function (val) {
    nowTimeEl.innerHTML = val.data;
  };
</script>
```

```html
<body>
  <p>页面2当前时间<span id="nowTime"></span></p>
</body>
<script>
  let nowTimeEl = document.querySelector("#nowTime");
  let worker = new SharedWorker("shared-worker1.js");
  //worker.port.start();
  worker.port.onmessage = function (val) {
    nowTimeEl.innerHTML = val.data;
  };
</script>
```

sharedworker.js

```javascript
const portPool = [];
onconnect = function (e) {
  // 发生connect事件时，SharedWorker()构造函数会隐式创建MessagePort实例，并把它的所有权唯一的转移给SharedWorker的实例；MessagePort实例会保存在connect事件对象的ports数组中
  let port = e.ports[0];
  // 在connect时将 port添加到 portPool中
  let obj = new Object();
  for (let key in port) {
    console.log("key:", key);
    console.log(port[key]);
    obj[key] = port[key];
  }
  console.log(obj, "666");
  portPool.push(port);
};

function distribute(message) {
  portPool.forEach((port) => {
    port.postMessage(message);
  });
}
//广播当前时间
setInterval(() => {
  distribute(Date.now());
}, 1000);
```

共享线程 Shared Worker 只要还有一个上下文连接就会持续存在；浏览器会记录连接总数，在连接数为 0 时，线程终止

不能通过人为方式在代码里终止共享线程；在 worker 文件调用 close 方法时，只要还有一个端口连接到该共享线程，就不会真正的终止线程

SharedWorker 的“连接”与关联 MessagePort 或 MessageChannel 状态无关；只要建立了连接，浏览器会负责管理该连接

只有当前页面销毁且没有连接时，浏览器才会终止共享线程

### 5.web worker 的通信方式

`Worker`多线程并不一定在所有场景下都能带来性能的提升，因为它需要通信消耗。
提升的性能 = 并行提升的性能 – 通信消耗的性能

(1) `Structured Clone`
[`Structured Clone`](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWeb_Workers_API%2FStructured_clone_algorithm) 是 `postMessage` 默认的通信方式。复制一份线程 `A` 的 `JS Object`内存给到线程 `B`, 线程`B`能获取和操作新复制的内存。
简单有效地隔离不同线程内存, 避免冲突。但`Object`规模过大时, 会占用大量的线程时间。

并不是所有数据都能用这种方式传输，它依赖于结构化克隆算法

结构化克隆算法是[由 HTML5 规范定义](https://www.w3.org/html/wg/drafts/html/master/infrastructure.html#safe-passing-of-structured-data)的用于复制复杂 JavaScript 对象的算法。通过来自 [Workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker)的 `postMessage() `或使用 [IndexedDB](https://developer.mozilla.org/en-US/docs/Glossary/IndexedDB) 存储对象时在内部使用。它通过递归输入对象来构建克隆，同时保持先前访问过的引用的映射，以避免无限遍历循环。该算法由浏览器后台实现，不能直接调用

大多情况下我们对对象进行深拷贝都会使用`JSON.parse(JSON.stringify(obj)`来实现，利用 JSON.stringify 将 js 对象[序列化](https://so.csdn.net/so/search?q=序列化&spm=1001.2101.3001.7020)（JSON 字符串），再使用 JSON.parse 来反序列化(还原)js 对象。但是这种方式有一些缺点：

- 递归数据结构：JSON.stringify()序列化一个递归数据结构时会报错。在使用链表或树时，这很容易发生。
- 内置类型：JSON.stringify()如果值包含其他 JS 关键字，例如 Map，Set，Date，RegExp 或 ArrayBuffer，也会报错。
- Functions：JSON.stringify()会丢失函数 。

结构化克隆算法解决了 JSON.stringify()方法的许多缺点。结构化克隆算法可以处理循环数据结构，支持许多内置数据类型，并且通常更健壮且更快。

HTML 规范公开了一个名为 structuredClone()的函数，该函数完全运行该算法，我们可以用其替代`JSON.parse(JSON.stringify(obj)`来实现深拷贝。

除了 ie 的所有主流浏览器都可以直接使用，[`core-js`](https://github.com/zloirock/core-js) 已经支持 [`structuredClone` 的 polyfill](https://github.com/zloirock/core-js#structuredclone)

```javascript
// 该算法可以识别对象中包含的循环引用，不会无穷遍历对象
const obj = { name: "abc" };
obj.itself = obj;
// const clone = JSON.parse(JSON.stringify(obj))//TypeError: 报错
const objCopy = structuredClone(original);
console.log(objCopy, "clone");
```

![console.png](/img/in-post/web-worker/console.png)

当然它也有一些缺点

结构化克隆算法不能做到的：

- [`Error`](https://developer.mozilla.org/zh-CN/JavaScript/Reference/Global_Objects/Error) 以及 [`Function`](https://developer.mozilla.org/zh-CN/JavaScript/Reference/Global_Objects/Function) 对象是不能被结构化克隆算法复制的；如果你尝试这样子去做，这会导致抛出 `DATA_CLONE_ERR` 的异常。
- 企图去克隆 DOM 节点同样会抛出 `DATA_CLONE_ERR` 异常。
- 对象的某些特定参数也不会被保留
  - `RegExp `对象的 `lastIndex` 字段不会被保留
  - 属性描述符，setters 以及 getters（以及其他类似元数据的功能）同样不会被复制。例如，如果一个对象用属性描述符标记为 read-only，它将会被复制为 read-write，因为这是默认的情况下。
  - 原形链上的属性也不会被追踪以及复制。

(2) `Transfer Memory`

通过结构化克隆拷贝方式发送二进制数据，会造成性能问题。比如，主线程向 Worker 发送一个 500MB 文件，默认情况下浏览器会生成一个原文件的拷贝。为了解决这个问题，JavaScript 允许主线程把二进制数据直接转移给 Worker 线程，但是一旦转移，主线程就无法再使用这些二进制数据了，这是为了防止出现多个线程同时修改数据的麻烦局面。这种转移数据的方法，叫做 Transferable Objects。这使得主线程可以快速把数据交给 Worker，对于影像处理、声音处理、3D 运算等就非常方便了，不会产生性能负担。

如果要直接转移数据的控制权，就要使用下面的写法：

postMessage()方法第二个可选参数是数组，它指定应该将哪些对象转移到目标上下文；原来的上下文将不会再拥有该对象的所有权，会从其上下文抹去

可转移对象必须为 `ArrayBuffer`, `MessagePort` and `ImageBitmap`

```javascript
// Transferable Objects 格式
worker.postMessage(arrayBuffer, [arrayBuffer]);

// 例子
var ab = new ArrayBuffer(1);
worker.postMessage(ab, [ab]);
```

线程`A`将指定内存的所有权和操作权转给线程`B`, 转让后线程`A`无法再访问这块内存。

`Transfer Memory`以失去控制权来换取高效传输, 通过内存独占给多线程并发加锁。

(3) `Shared Array Buffer`

上述两种方式大多情况下是可行的，但是对于一些需要拥有高性能并行性的应用，真正需要的是拥有共享内存。

为了解决这个问题，js 引入了 shared memory 的概念。我们可以通过 SharedArrayBuffer 来创建 Shared memory。

使用 SharedArrayBuffer，它既不克隆也不转移,线程`A`和线程`B`可以**同时访问和操作**同一块内存空间，数据共享。

这意味着它们不像 postMessage 那样具有通信开销和延迟。两个 Web 工作线程都可以立即访问到需要的数据。

内存中唯一可以放进去的只有字节（可以用数字表示），它不能将任何 JavaScript 类型放入其中，例如对象或字符串。

如果我们要传输 js 对象的话，需要开辟一段 SharedArrayBuffer，然后在此之上实现对 js 对象的序列化，反序列化等操作。

要使用它需要先了解一个视图的概念

因为 ArrayBuffer 是一个原始的字节序列，不是所谓的“数组”，无法用下标来查看，因此需要使用 TypedArray 来实现访问，下面列的是具体的方法，它们统称为 TypeArray。它们会将缓冲区中的数据表示为特定的格式，并通过这些格式来读写缓冲区的内容。TypedArray 对象一共提供 9 种类型的视图，每一种视图都是一种构造函数：

- **`Uint8Array`** —— 将 `ArrayBuffer` 中的每个字节视为 0 到 255 之间的单个数字（每个字节是 8 位，因此只能容纳那么多）。这称为 “8 位无符号整数”。
- **`Int8Array`** —— 将 `ArrayBuffer` 中的每个字节视为 -128 到 127 之间的单个数字。这称为 “8 位有符号整数”。
- **`Uint8ClampedArray`** —— 将 `ArrayBuffer` 中的每个字节视为 0 到 255 之间的单个数字。这称为 “8 位无符号整数”。如果你指定一个在 [0,255] 区间外的值，它将被替换为 0 或 255；如果你指定一个非整数，那么它将被设置为最接近它的整数。
- **`Uint16Array`** —— 将每 2 个字节视为一个 0 到 65535 之间的整数。称为 “16 位无符号整数”。
- **`Int16Array`** —— 将每 2 个字节视为一个 -32768 到 32767 之间的整数。称为 “16 位有符号整数”。
- **`Uint32Array`** —— 将每 4 个字节视为一个 0 到 4294967295 之间的整数。称为 “32 位无符号整数”。
- **`Int32Array`** —— 将每 4 个字节视为一个 -2147483648 到 2147483647 之间的整数。称为 “32 位有符号整数”。
- **`Float32Array`** —— 32 位浮点数，长度 4 个字节。
- **`Float64Array`** —— 64 位浮点数，长度 8 个字节。

ArrayBuffer 本身只是一串零和一保存在一行中。ArrayBuffer 无法获取该数组中第一个元素和第二个元素之间的分隔位置。它不知道字节有多长，该用多少位去存

![buffer.png](/img/in-post/web-worker/buffer.png)

为了传输数据，需要将其分解为多个部分，同时将多个部分包装在类似于视图的一种容器中。

例如，您可能有一个 Int8 类型的数组，该数组会将其分解为 8 位字节。

![Int8Array.png](/img/in-post/web-worker/Int8Array.png)

或者，您可以拥有一个无符号的 Int16 数组，该数组会将其分解为 16 位，并像对待无符号整数一样对其进行处理。

![Uint16Array.png](/img/in-post/web-worker/Uint16Array.png)

您甚至可以在同一基本缓冲区上拥有多个视图。对于相同的操作，不同的视图将为您提供不同的结果。

例如，如果我们从下图的 ArrayBuffer 的 Int8 视图中获取元素 0 和 1，即使它们包含完全相同的位，它也会为我们提供与 Uint16 视图中元素 0 不同的值。

![816Array.png](/img/in-post/web-worker/816Array.png)

以上，ArrayBuffer 基本上就像原始内存一样。它模拟了使用 C 等语言进行的直接内存访问。

主线程页面

```javascript
// 首先要新建共享内存 const sharedBuffer = new SharedArrayBuffer(size)  // size 指内存空间的大小 以byte字节为单位 size = 1024 即 1KB
// 其次要在指定的内存上建立视图以供读写数据 const ia = new Int32Array(sharedBuffer)  // 因为内存本身是不具有读写能力的
// 创建一个worker线程
const wk = new Worker("./w1.js");
// 建立 1KB 内存
const sharedBuffer = new SharedArrayBuffer(1024);
// 创建一个指向 sharedBuffer 的 Int32 视图，开始于字节 0，直到缓冲区的末尾
const ia = new Int32Array(sharedBuffer);
// console.log(ia)
// 向内存中写入数据
for (let i = 0; i < ia.length; i++) {
  ia[i] = i;
}
// 将内存地址发送给worker线程
wk.postMessage(sharedBuffer);

// 从子线程获取修改后的信息
wk.onmessage = function (e) {
  console.log(`修改后的数据`, ia[20]);
};
```

子线程 worker.js

```javascript
// onmessage从主线程接收信息
onmessage = function (e) {
  // 接收内存地址
  const sharedBuffer = e.data;
  // console.log(sharedBuffer)
  // 同样的 子线程要读写内存也需要建立视图
  const ia = new Int32Array(sharedBuffer);

  // worker线程修改内存里某一项 主线程再读取的时候就会看到修改后的数据
  ia[20] = 999;
  // 为了使主线程能获取到修改后的内存地址  只要用postMessage()触发主线程的onmessage即可
  postMessage("已修改内存数据");
};
```

这种情况下因为是共享内存，所以任何能够访问到 ia[20]的线程对该值的改变，都可能影响其他线程的读取操作。这样就会产生竞争问题，不像前 2 种传输方式默认加锁。

为了防止多个线程同时修改某个内存，当一个线程修改共享内存以后，必须有一个机制让其他线程同步。ES8 引入了 Atomics 对象，保证所有共享内存的操作都是“原子性”的，并且可以在所有线程内同步。

什么叫“原子性操作”呢？现代编程语言中，一条普通的命令被编译器处理以后，会变成多条机器指令。如果是单线程运行，这是没有问题的；多线程环境并且共享内存时，就会出问题，因为这一组机器指令的运行期间，可能会插入其他线程的指令，从而导致运行结果出错。看个例子

```javascript
// 主线程
ia[42] = 314159; // 原先的值 191
ia[37] = 123456; // 原先的值 163

// Worker 线程
console.log(ia[37]);
console.log(ia[42]);
// 可能的结果
// 123456
// 191
```

类似于 java 中的重排序，在 java 中，java 虚拟机在不影响程序执行结果的情况下，会对 java 代码进行优化，甚至是重排序。导致在多线程并发环境中可能会出现问题。js 也一样，浏览器的 JavaScript 编译器和 CPU 架构本身都有权限重排指令以提升程序执行效率。

上面代码中，主线程的原始顺序是先对 42 号位置赋值，再对 37 号位置赋值。但是，编译器和 CPU 为了优化，可能会改变这两个操作的执行顺序（因为它们之间互不依赖），先对 37 号位置赋值，再对 42 号位置赋值。而执行到一半的时候，Worker 线程可能就会来读取数据，导致打印出 123456 和 191。

我们可以使用 Atomics 来解决这个问题，Atomics.load()和 Atomics.store()用来向缓冲区读写值，而且它除了读写缓冲区的值，还可以构建“代码围栏”。JavaScript 引擎保证非原子指令可以相对于 load()和 store()本地重排，但这个重排不会侵犯原子读写的边界。所有在 Atomics.store 之前的写操作，在 Atomics.load 发送变化之前都会发生。通过使用 Atomics 可以禁止重排序。

```javascript
// 主线程
ia[42] = 314159; // 原先的值 191
Atomics.store(ia, 37, 123456); // 原先的值 163

// Worker 线程
while (Atomics.load(ia, 37) == 123456) {
  //我们通过监测37的变化，如果发生了变化，则我们可以保证之前的42的修改已经发生。
  console.log(ia[37]); // Will print 123456
  console.log(ia[42]); // Will print 314159
}
```

再看一个例子，在 js 中++操作不是一个原子性操作。

```javascript
// 主线程
let worker = new Worker("test.js");
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100000);
const ia = new Int32Array(sab);
for (let i = 0; i < ia.length; i++) {
  ia[i] = i;
}
// 将内存地址发送给worker线程
worker.postMessage(sab);
console.log(ia);

// worker 线程
self.onmessage = function (e) {
  let ia = new Int32Array(e.data);
  // ia[112]++; // 错误
  Atomics.add(ia, 112, 1); //正确
};
```

上面代码中，Worker 线程直接改写共享内存 ia[112]++是不正确的。因为这行语句会被编译成多条机器指令，这些指令之间无法保证不会插入其他进程的指令。如果两个线程同时 ia[112]++，可能就会出现意向不到的结果。

计算机指令对内存操作进行运算的时候，我们可以看做分两步：一是从内存中取值，二是运算并给某段内存赋值。当我们有两个线程对同一个内存地址进行 +1 操作的时候，假设线程是先后顺序运行的，为了简化模型，我们可以如下图表示：

![normal++.jpeg](/img/in-post/web-worker/normal.jpeg)

上面两个线程的运行结果也符合我们的预期，也即线程分别都对同一地址进行了 +1 操作，最后得到结果 3。但因为两个线程是同时运行的，往往会发生下图所表示的问题，也即读取与写入可能不在一个事务中发生：

![abnormal++.jpeg](/img/in-post/web-worker/abnormal.jpeg)

这种情况就叫做竞争问题（Race Condition）。

为了解决上述的竞争问题，浏览器提供了 Atomics API，这组 API 是一组原子操作，可以将读取和写入绑定起来，例如下图中的 S1 到 S3 操作就被浏览器封装成 Atomics.add 这个 API，从而解决竞争问题。

![atomics.jpeg](/img/in-post/web-worker/atomics.jpeg)

Atomics 对象就是为了解决这个问题而提出，它可以保证一个操作所对应的多条机器指令，一定是作为一个整体运行的，中间不会被打断。也就是说，它所涉及的操作都可以看作是原子性的单操作，这可以避免线程竞争，提高多线程共享内存时的操作安全。所以，ia[112]++要改写成 Atomics.add(ia, 112, 1)。

**注意，Atomics 只适用于 Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array or Uint32Array。**

上面例子中，我们使用 while 循环来等待值的变化，这样并不是很有效。while 循环会占用 CPU 资源，造成不必要的浪费。

为了解决这个问题，Atomics 引入了 wait 和 notify 操作，使线程进入休眠(不能在主线程调用)和唤醒线程。

```javascript
console.log(ia[37]); // Prints 163
Atomics.store(ia, 37, 123456);
Atomics.notify(ia, 37, 1); //唤醒线程
```

我们希望 37 的值变化之后通知监听在 37 上的一个数组。

```javascript
Atomics.wait(ia, 37, 163); // 使线程进入休眠
console.log(ia[37]); // Prints 123456
```

当 ia37 的值是 163 的时候，使线程进入休眠。直到被唤醒。

这两个方法相当于锁内存，即在一个线程进行操作时，让其他线程休眠（建立锁），等到操作结束，再唤醒那些休眠的线程（解除锁）。

基于`wait`和`notify`这两个方法的锁内存实现，有兴趣的可以学习一下 Lars T Hansen 的[js-lock-and-condition](https://github.com/lars-t-hansen/js-lock-and-condition)这个库。

浏览器的主线程有权“拒绝”休眠，这是为了防止用户失去响应

**Atomics 方法**

```javascript
// 比起直接的读写操作，它们的好处是保证了读写操作的原子性。
Atomics.load(ia, index);
// 用来从共享内存读出数据
// ia 对象（SharedArrayBuffer 的视图）
// index 位置索引
// 返回ia[index]的值
Atomics.store(ia, index, value);
// 用来向共享内存写入数据
// ia 对象（SharedArrayBuffer 的视图）
// 位置索引
// 值
// 返回ia[index]的值
Atomics.exchange(ia, index, value);
// 用来向共享内存写入数据 与 Atomics.store()的区别是 Atomics.store()返回写入的值，而Atomics.exchange()返回被替换的值
// ia 对象（SharedArrayBuffer 的视图）
// 位置索引
// 值
// 返回ia[index]原来的值（被替换之前的值）
Atomics.wait(ia, index, value, timeout);
// 使线程进入休眠 满足条件才进入休眠 此方法一般用于worker线程 注意，浏览器的主线程不宜设置休眠，这会导致用户失去响应。而且，主线程实际上会拒绝进入休眠。
// ia：共享内存的视图数组。
// index：视图数据的位置（从0开始）。
// value：该位置的预期值。一旦实际值等于预期值，就进入休眠。
// timeout：整数，表示过了这个时间以后，就自动唤醒，单位毫秒。该参数可选，默认值是Infinity，即无限期的休眠，只有通过Atomics.notify()方法才能唤醒
// Atomics.wait()的返回值是一个字符串，共有三种可能的值。如果ia[index]不等于value，就返回字符串not-equal，否则就进入休眠。如果Atomics.notify()方法唤醒，就返回字符串ok；如果因为超时唤醒，就返回字符串timed-out。
// 例如： Atomics.wait(ia, 20, 33, 3000) 解释：当 20 这个位置的值等于33的时候，所在线程才进入休眠，3秒之后自动唤醒，如果没有 3000 这个参数，只有通过Atomics.notify()方法才能唤醒
Atomics.notify(ia, index, count);
// ia：共享内存的视图数组。 此方法一般用于主线程
// index：视图数据的位置（从0开始）。
// count：需要唤醒的 Worker 线程的数量，默认为Infinity
// 运算方法
// 共享内存上面的某些运算是不能被打断的，即不能在运算过程中，让其他线程改写内存上面的值。Atomics 对象提供了一些运算方法，防止数据被改写。
Atomics.add(ia, index, value);
// Atomics.add用于将value加到ia[index]，返回ia[index]旧的值。
Atomics.sub(ia, index, value);
// Atomics.sub用于将value从ia[index]减去，返回ia[index]旧的值。
// 位运算方法
Atomics.and(ia, index, value);
Atomics.or(ia, index, value);
Atomics.xor(ia, index, value);
// 以上三种方法都是用于将vaule与ia[index]进行位运算and/or/xor，放入ia[index]，并返回旧的值。
// Atomics对象还有以下方法。
Atomics.compareExchange(ia, index, oldval, newval);
// 如果ia[index]等于oldval，就写入newval，返回oldval。
// Atomics.compareExchange的一个用途是，从 SharedArrayBuffer 读取一个值，然后对该值进行某个操作，操作结束以后，检查一下 SharedArrayBuffer 里面原来那个值是否发生变化（即被其他线程改写过）。如果没有改写过，就将它写回原来的位置，否则读取新的值，再重头进行一次操作。
Atomics.isLockFree(size);
// 返回一个布尔值，表示Atomics对象是否可以处理某个size的内存锁定。如果返回false，应用程序就需要自己来实现锁定。
```

#### 拓展内容

##### 1.线程池

因为启用工作者线程代价很大，所以某些情况下可以考虑始终保持固定数量的线程活动，需要时就把任务分派给它们；工作者线程再执行计算时，会被标记为忙碌状态；直到通知线程池自己空闲了才准备好接收新任务；这些活动线程就称为”线程池“或“工作者线程池”

一种使用线程池的策略是每个线程都执行同样的任务，但具体执行什么任务由几个参数来控制。通过使用特定于任务的线程池，可以分配固定数量的工作者线程，并根据需要为他们提供参数。工作者线程会接收这些参数，执行耗时的计算，并把结果返回给线程池。然后线程池可以再将其他工作分派给工作者线程去执行。接下来的例子将构建一个相对简单的线程池，但可以涵盖上述思路的所有基本要求。

首先是定义一个 TaskWorker 类，它可以扩展 Worker 类。TaskWorker 类负责两件事：跟踪线程是否正忙于工作，并管理进出线程的信息与事件。另外，传入给这个工作者线程的任务会封装到一个期约中，然后正确地解决和拒绝。这个类的定义如下：

```javascript
class TaskWorker extends Worker {
  constructor(notifyAvailable, ...workerArgs) {
    super(...workerArgs);
    // 初始化为不可用状态
    this.available = false;
    this.resolve = null;
    this.reject = null;
    // 线程池会传递回调
    // 以便工作者线程发出它需要新任务的信号
    this.notifyAvailable = notifyAvailable;
    // 线程脚本在完全初始化之后
    // 会发送一条"ready"消息
    this.onmessage = () => this.setAvailable();
    // console.log(this.onmessage(), 'this.onmessage')
  }

  // 由线程池调用，以分派新任务

  dispatch({ resolve, reject, postMessageArgs }) {
    this.available = false;
    this.onmessage = ({ data }) => {
      resolve(data);
      this.setAvailable();
      // console.log(data, 'data')
    };
    this.onerror = (e) => {
      reject(e);
      this.setAvailable();
    };
    this.postMessage(...postMessageArgs);
  }
  setAvailable() {
    this.available = true;
    this.resolve = null;
    this.reject = null;
    this.notifyAvailable();
  }
}
export default TaskWorker;
```

然后是定义使用 TaskWorker 类的 WorkerPool 类。它还必须维护尚未分派给工作者线程的任务队列。两个事件可以表明应该分派一个新任务：新任务被添加到队列中，或者工作者线程完成了一个任务，应该再发送另一个任务。WorkerPool 类定义如下：

```javascript
import TaskWorker from "./TaskWorker.js";
class WorkerPool {
  constructor(poolSize, ...workerArgs) {
    this.taskQueue = [];
    this.workers = [];
    // 初始化线程池
    for (let i = 0; i < poolSize; ++i) {
      this.workers.push(
        new TaskWorker(() => this.dispatchIfAvailable(), ...workerArgs)
      );
    }
  }
  // 把任务推入队列
  enqueue(...postMessageArgs) {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ resolve, reject, postMessageArgs });
      this.dispatchIfAvailable();
    });
  }
  // 把任务发送给下一个空闲的线程（如果有的话）
  dispatchIfAvailable() {
    if (!this.taskQueue.length) {
      return;
    }
    for (const worker of this.workers) {
      if (worker.available) {
        let a = this.taskQueue.shift();
        worker.dispatch(a);
        break;
      }
    }
  }
  // 终止所有工作者线程
  close() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}
export default WorkerPool;
```

定义了这两个类之后，现在可以把任务分派到线程池，并在工作者线程可用时执行它们。在这个例子中，假设我们想计算 1000 万个浮点值之和。为节省转移成本，我们使用 SharedArrayBuffer。工作者线程的脚本（worker.js）大致如下：

```javascript
self.onmessage = ({ data }) => {
  let sum = 0;
  let view = new Float32Array(data.arrayBuffer);
  // 求和
  for (let i = data.startIdx; i < data.endIdx; ++i) {
    // 不需要原子操作，因为只需要读
    sum += view[i];
  }
  // 把结果发送给工作者线程
  self.postMessage(sum);
};
// 发送消息给 TaskWorker
// 通知工作者线程准备好接收任务了
self.postMessage("ready");
```

有了以上代码，利用线程池分派任务的代码可以这样写：

```javascript
import WorkerPool from "./WorkerPool.js";
const totalFloats = 1e8;
const numTasks = 20;
const floatsPerTask = totalFloats / numTasks;
const numWorkers = 4;
// 创建线程池
const pool = new WorkerPool(numWorkers, "./worker.js");
// 填充浮点值数组
let arrayBuffer = new SharedArrayBuffer(4 * totalFloats);
let view = new Float32Array(arrayBuffer);
for (let i = 0; i < totalFloats; ++i) {
  view[i] = Math.random();
}
let partialSumPromises = [];
for (let i = 0; i < totalFloats; i += floatsPerTask) {
  partialSumPromises.push(
    pool.enqueue({
      startIdx: i,
      endIdx: i + floatsPerTask,
      arrayBuffer: arrayBuffer,
    })
  );
}
// 等待所有期约完成，然后求和
Promise.all(partialSumPromises)
  .then((partialSums) => partialSums.reduce((x, y) => x + y))
  .then(console.log);
```
