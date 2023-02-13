---
layout: post
title: "js单线程及异步原理—事件循环机制"
subtitle: "Js Event-Loop"
date: 2023-02-13 21:26:56
author: linbao
header-img:
catalog: true
tags:
  - js
  - front-end
---

## 一、Js 的单线程

我们知道都 JavaScript 是一门单线程语言，这个单线程就是说在 JS 引擎中负责解释和执行 JavaScript 代码的线程只有一个。说的再通俗点，就是同一时间只能干一件事。

> 为什么 js 就是单线程的呢？
> 答：这与它的用途有关。作为浏览器脚本语言，JavaScript 的主要用途是与用户互动，以及操作 DOM。这决定了它只能是单线程，否则会带来很复杂的同步问题。比如，假定 JavaScript 同时有两个线程，一个线程在某个 DOM 节点上添加内容，另一个线程删除了这个节点，这时浏览器应该以哪个线程为准？所以，为了避免复杂性，从一诞生，JavaScript 就是单线程，这已经成这门语言的核心特征，将来也不会改变。 为了利用多核 CPU 的计算能力，HTML5 提出  Web Worker  标准，允许 JavaScript 脚本创建多个线程，但是子线程完全受主线程控制，且不得操作 DOM。所以，这个新标准并没有改变 JavaScript 单线程的本质。

进程和线程

- 进程是 cpu 资源分配的最小单位（是能拥有资源和独立运行的最小单位）
- 线程是 cpu 调度的最小单位（线程是建立在进程的基础上的一次程序运行单位，一个进程中可以有多个线程）
- 举例说明：
- 进程是一个工厂，工厂有它的独立资源
- 工厂之间相互独立
- 线程是工厂中的工人，多个工人协作完成任务
- 工厂内有一个或多个工人
- 工人之间共享空间

## 二、异步的由来

单线程就意味着，所有任务需要排队，上一个任务结束，才会执行下一个任务。如果前一个任务耗时很长，后一个任务就不得不一直等着。
所以 JavaScript 语言的设计者是这样设计的，主线程可以挂起处于等待中的任务，先运行排在后面的任务。等到挂起的任务返回了结果，再回过头，将其继续执行下去。

> 同步和异步关注的是消息通信机制 (synchronous communication/ asynchronous communication)。同步，就是调用某个东西是，调用方得等待这个调用返回结果才能继续往后执行。异步，和同步相反 调用方不会理解得到结果，而是在调用发出后调用者可用继续执行后续操作，被调用者通过状态来通知调用者，或者通过回掉函数来处理这个调用

![](/img/in-post/js-event-loop/同步.png)
同步示图
![](/img/in-post/js-event-loop/异步.png)
异步示图
于是，所有任务可以分成两种，一种是同步任务，另一种是异步任务。
同步任务：指在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；
异步任务：指不进入主线程的任务。

## 三、Js 异步底层实现

- 浏览器多线程
- 任务队列

  虽然 JS 是单线程的但是浏览器的内核（浏览器渲染进程，Render 进程）是多线程的，在浏览器的内核中不同的异步操作由不同的线程调度执行，执行完成后会将相关的回调添加到任务队列中。而不同的异步操作添加到任务队列的时机也不同。

### 1.浏览器的内核通常有以下常驻线程：

- GUI 渲染线程

  - 负责渲染浏览器界面，解析 HTML\CSS，构建 DOM 树和 RenderObject 树，布局和绘制等。
  - 当界面需要重绘（Repaint)或由于某种操作引发回流(reflow)时，该线程就会执行
  - GUI 线程和 JS 引擎线程是互斥的，当 JS 引擎线程执行时 GUI 线程会被挂起（相当于被冻结了），GUI 更新会被保存在一个队列中等到 JS 引擎空闲时才立即执行，如果 JS 执行时间过长，那么就很容易引起页面渲染被堵塞。

- JavaScript 引擎线程

  - 调用 JS 引擎的线程，也称为 JS 内核或主线程，负责解析 JS 脚本，运行代码。
  - 引擎一直等待着队列中的任务的到来，然后加以处理，浏览器无论什么时候只有一个 js 线程在运行 js 程序。
  - GUI 渲染线程和 JS 引擎线程互斥，所以如果 JS 执行时间过长，就会造成页面的渲染不连贯，阻塞页面渲染。

- 事件触发线程

  - 归属于浏览器而不是 JS 引擎，用来控制事件循环（可以理解为 JS 引擎自己忙不过来，需要浏览器另开线程协助）。
  - 当 JS 引擎执行代码块如 setTimeout 时（也可以来自浏览器内的其他线程，如鼠标点击，Ajax 异步请求等），会将对应的任务添加到事件线程中。
  - 当对应的事件符合触发条件被触发时，该线程会把事件添加到待处理队列的队尾，等待 JS 引擎的处理。

- 定时触发器线程

  - setTimeout 和 setInterval 所在的线程。
  - 计时完成后就会将特定的事件推入事件触发线程的任务队列中，等待进入主线程执行。
  - 注意：W3C 的 HTML 标准中规定，setTimeout 中低与 4ms 的时间间隔算为 4ms
    > 为什么要单独的定时器线程嘞？
    > 答：因为 JavaScript 引擎是单线程的, 如果处于阻塞线程状态就会影响记计时的准确，因此很有必要单独开一个线程用来计时

- 异步 http 请求线程
  - 用于处理请求 XMLHttpRequest，XMLHttpRequst 在连接后通过浏览器新建一个线程请求
  - 线程如果检测到请求的状态变更，如果设置有回调函数，就将这个回调再放入任务队列中，等待进入主线程执行。

![渲染进程的线程工作图](/img/in-post/js-event-loop/微信图片_20210726163525.png)

JS 引擎线程和事件触发线程是事件循环机制的核心

### 2.什么是任务队列？

“任务队列”是一个事件的队列，任务完成，就在”任务队列”中添加一个事件，表示相关的异步任务已完成，可以执行后续操作了。
“任务队列”是一个先进先出的数据结构，排在前面的事件，优先被主线程读取。主线程的读取过程基本上是自动的，只要执行栈一清空，”任务队列”上第一位的事件就自动进入主线程。

## 四、事件循环制

主线程从"任务队列"中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为 Event Loop（事件循环）。

![浏览器中的Event Loop](/img/in-post/js-event-loop/微信截图_20210723140458.png)

主线程运行的时候，产生堆（heap）和栈（stack），栈中的代码调用各种外部 API 处理异步任务，处理完后将对应回调再放入任务队列。只要栈中的代码执行完毕，主线程就会去读取"任务队列"，依次执行那些事件所对应的回调函数。

- 一个线程中，事件循环是唯一的，但是任务队列可以拥有多个。
  - 微任务队列（micro tasks）只会有一个
  - 宏任务队列（macro tasks）可以有多个
- 任务队列又分为 macro-task（宏任务）与 micro-task（微任务）。
  - 在最新标准中，microtask 称为 jobs，macrotask 称为 task
  - 宏任务是由宿主发起的，而微任务由 JavaScript 自身发起。在 ES3 以及以前的版本中，JavaScript 本身没有发起异步请求的能力，也就没有微任务的存在。在 ES5 之后，JavaScript 引入了 Promise，这样，不需要浏览器，JavaScript 引擎自身也能够发起异步任务了。
- macro-task 大概包括：script(整体代码), setTimeout, setInterval, setImmediate, I/O, UI rendering。
- micro-task 大概包括: process.nextTick, Promise,MutationObserver(html5 新特性，https://javascript.ruanyifeng.com/dom/mutationobserver.html)
- setTimeout/Promise 等我们称之为任务源。而进入任务队列的是他们指定的具体执行任务。
- 来自不同任务源的任务会进入到不同的任务队列。其中 setTimeout 与 setInterval 是同源的。
- 事件循环的顺序，决定了 JavaScript 代码的执行顺序。它从 script(整体代码)开始第一次循环。之后全局上下文进入函数调用栈。直到调用栈清空(只剩全局)，然后执行所有的 micro-task。当所有可执行的 micro-task 执行完毕之后。循环再次从 macro-task 开始，找到其中一个任务队列执行完毕，然后再执行所有的 micro-task，这样一直循环下去。其中每一个任务的执行，无论是 macro-task 还是 micro-task，都是借助函数调用栈来完成。
  https://segmentfault.com/a/1190000017890535

```javascrip
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

new MutationObserver(function () {
  console.log('mutate');
}).observe(outer, {
  attributes: true,
});

function onClick() {
  console.log('click',Math.random());

  setTimeout(function () {
    console.log('timeout',Math.random());
  }, 0);

  Promise.resolve().then(function () {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```

### NodeJs 的事件循环机制

JS 引擎并不提供 event loop，它是宿主环境（嵌入 JS 引擎的外壳程序，如浏览器）提供的，为了更好的处理交互，不同的宿主环境面对的问题不同，所以会有不同的 event loop 实现

Node.js 也是单线程的 Event Loop，但是它的运行机制不同于浏览器环境。
Node.js 采用 V8 作为 js 的解析引擎，而 Event Loop 遵循的是 libuv,这个库是 node 作者自己写的，内部实现了一整套的异步 io 机制（内部使用 c++和 js 实现），使我们开发异步程序变得简单，因为这个原因导致了一些 js 解析和浏览器的会不一样。

Node.js 在主线程里维护了一个事件队列，当接到请求后，就将该请求作为一个事件放入这个队列中，然后继续接收其他请求。当主线程空闲时(没有请求接入时)，就开始循环事件队列，检查队列中是否有要处理的事件，这时要分两种情况：如果是非 I/O 任务，就亲自处理，并通过回调函数返回到上层调用；如果是 I/O 任务，就从   线程池   中拿出一个线程来处理这个事件，并指定回调函数，然后继续循环队列中的其他事件。
当线程中的 I/O 任务完成以后，就执行指定的回调函数，并把这个完成的事件放到事件队列的尾部，等待事件循环，当主线程再次循环到该事件时，就直接处理并返回给上层调用。 这个过程就叫   事件循环  (Event Loop)，其运行原理如下

![nodejs system](/img/in-post/js-event-loop/2014101084651596.png)

这个图是整个 Node.js 的运行原理，从左到右，从上到下，Node.js 被分为了四层，分别是   应用层、V8 引擎层、Node API 层   和  LIBUV 层。
应用层：    即 JavaScript 交互层，常见的就是 Node.js 的模块，比如 http，fs
V8 引擎层：  即利用 V8 引擎来解析 JavaScript 语法，进而和下层 API 交互
NodeAPI 层：  为上层模块提供系统调用，一般是由 C 语言来实现，和操作系统进行交互 。
LIBUV 层： 是跨平台的底层封装，实现了 事件循环、文件操作等，是 Node.js 实现异步的核心 。

其中 libuv 引擎中的事件循环分为 6 个阶段，它们会按照顺序反复运行。每当进入某一个阶段的时候，都会从对应的回调队列中取出函数去执行。当队列为空或者执行的回调函数数量到达系统设定的阈值，就会进入下一阶段。

![Event Loop-nodejs](/img/in-post/js-event-loop/2019-01-14-005.png)

从上图中，大致看出 node 中的事件循环的顺序：
外部输入数据-->轮询阶段(poll)-->检查阶段(check)-->关闭事件回调阶段(close callback)-->定时器检测阶段(timer)-->I/O 事件回调阶段(I/O callbacks)-->闲置阶段(idle, prepare)-->轮询阶段（按照该顺序反复运行）...

- timers 阶段：这个阶段执行 timer（setTimeout、setInterval）的回调
- I/O callbacks 阶段：处理一些上一轮循环中的少数未执行的 I/O 回调
- idle, prepare 阶段：仅 node 内部使用
- poll 阶段：获取新的 I/O 事件, 适当的条件下 node 将阻塞在这里
- check 阶段：执行 setImmediate() 的回调
- close callbacks 阶段：执行 socket 的 close 事件回调

注意：上面六个阶段都不包括 process.nextTick()
这个函数其实是独立于 Event Loop 之外的，它有一个自己的队列，当每个阶段完成后，如果存在 nextTick 队列，就会清空队列中的所有回调函数，并且优先于其他 microtask 执行。

https://www.cnblogs.com/fundebug/p/diffrences-of-browser-and-node-in-event-loop.html
https://www.cnblogs.com/onepixel/p/7143769.html

## Node 与浏览器的 Event Loop 差异

浏览器和 Node 环境下，microtask 任务队列的执行时机不同
Node 端(node 版本<11.0)，microtask 在事件循环的各个阶段之间执行
 浏览器端，microtask 在事件循环的 macrotask 执行完之后执行

![浏览器和nodejs之前Event Loop的差异](/img/in-post/js-event-loop/2019-01-14-006 (1).png)

接下我们通过一个例子来说明两者区别：

```javascript
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```

浏览器端运行结果：timer1=>promise1=>timer2=>promise2
Node 端运行结果：timer1=>timer2=>promise1=>promise2

> 在 Node11.0 版本之前， JS 的执行栈的顺序是
>
> 执行同类型的所有宏任务 -> 在间隙时间执行微任务 ->event loop 完毕执行下一个 event loop
>
> 而在最新版本的 11.0 之后， NodeJS 为了向浏览器靠齐，对底部进行了修改，最新的执行栈顺序和浏览器的执行栈顺序已经是一样了
>
> 执行首个宏任务 -> 执行宏任务中的微任务 -> event loop 执行完毕执行下一个 eventloop
