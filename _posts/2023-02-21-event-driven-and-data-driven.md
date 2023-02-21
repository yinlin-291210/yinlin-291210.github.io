---
layout: post
title: "简单介绍事件驱动和数据驱动"
subtitle: "Event Driven And Data Driven"
date: 2023-02-21 16:13:35
author: linbao
header-img:
catalog: true
tags:
  - 编程范式
---

# 事件驱动和数据驱动

> 事件驱动和数据驱动，都是处理编程范式的一种架构模式

> 它们都是思想性的思维模型

## 事件驱动

### 什么是事件驱动

> 事件驱动架构模式是一种主流的异步分发事件架构模式，常用于设计高度可拓展的应用。当然了，它有很高的适应性，使得它在小型应用、大型应用、复杂应用中都能表现得很好。事件驱动架构模式由高度解耦、单一目的的事件处理组件构成，这些组件负责异步接收和处理事件。

事件驱动往往以事件循环作为程序的逻辑入口

事件驱动一般有两种模式，中介模式和代理模式，中介模式和代理（委托）模式的区别就是中介模式是一对多的模式，而代理模式一对一。

#### 事件代理的流程图 如下

![](/img/in-post/event-driven-and-data-driven/事件代理.png)

#### 事件中介的流程图 如下

![](/img/in-post/event-driven-and-data-driven/事件中介.png)

### 事件驱动在我们编码中的体现

在前端的编程流当中，事件驱动最为经典的三种应用方式，即 DOM 的事件接口，nodejs 的事件循环，消息(api)的路由机制。

前边已经提到了，事件驱动往往以事件循环作为程序入口。
通过对事件通道的异步路由，对事件的具体数据进行分发，以便触发对应的事件。我们用 DOM 事件作为例子，可得出以下路径：

![](/img/in-post/event-driven-and-data-driven/DOM事件模型.png)

转变成现实的代码就是这样子的：

```js
// 事件的dom对象
var domA = document.getElementById("aaaa");

// 事件响应函数1
var eventResponseFunction = function (event) {
  // 业务行为1
};

// 注册事件通道（句柄）click
// click即事件通道，事件监听以及事件代理的名称
// click的监听在事件循环中恒存在，只不过注册这个代码行为，在js runtime时，告诉了事件循环机制
// 你向domA分发click事件之后，将会触发响应函数的行为
// 需要注意的是，dom的事件由于是与js做对接，所以是单线程，同步的
// 由于dom本身的树状结构，分发树型结构对性能的损失非常大，因此所有的事件都是从根节点开始的
// 也因此诞生了两种事件传播的方向，冒泡和捕获，他们都必须通过根节点（起点或者终点）
// 除了分发机制之外，也存在广播机制
domA.addEventListener("click", eventResponseFunction);

// 事件响应函数2
var eventResponseFunction2 = function (event) {
  // 业务行为2
};

// 连续的对某一个事件通道（句柄）进行注册是可以的
// 它们将有序分发
// 即 eventResponseFunction 执行完毕之后，继续执行 eventResponseFunction2
domA.addEventListener("click", eventResponseFunction2);

// 在以上代码当中，除了eventResponseFunction和eventResponseFunction2这个函数之外，所有的代码都属于DOM的应用，只有这两个click事件的响应函数，属于JS

// domA的事件循环及监听的执行顺序为
// 事件循环监听 ---> 触发click ---> 流入中介（根节点） ---> “路由”分发模式(冒泡或者捕获) ---> domA ---> 触发事件响应函数的执行
```

事件驱动一种很典型的高度解耦的编程架构

#### 他的优点其实特别明显，看图就知道了。

极高的可拓展性 ---- 事件通道你想写多少就写多少，只要名字不一样，都可以视为不同的事件句柄，甚至某种协议的标准事件可以与你自己的自定义并存，典型的就是我们使用 vue 可以使用标准 dom 事件，也可以自定义事件，然后去 emit 它。

极低的耦合度 ---- 事件与事件之间，几乎没有明显的依赖关系，也许有，但对于事件的响应函数（具体业务代码）而言，几乎不需要去特别关心事件之间的关系，用就完事了（如 dom 事件中的 mousedown，mouseup 与 click 之间的关系）

#### 事件驱动的缺点也极其明显

不易于开发 ---- 我们用 JS 去对接 DOM 事件接口，是非常的 happy，简单易懂，逻辑单纯，那是因为 JS 是单线程的，你试试想象多线程的事件分发机制，搞多线程为啥容易掉头发

粒度较粗 ---- 不管是 DOM 事件也好，api 的路由机制也好，或者是消息分发的机制也好，事件驱动的共同缺点就是粒度比较粗，很典型的问题就是我们处理 api 的 response 时，还得去处理它的状态码，这里可不是指 http 的状态码，当然他也算是表现之一，但 http status 不是我们要真正写的代码，编程层面主要是指我们在 json 格式的 response 里带过来的状态码 code，很多 code 我们都是需要用 js 代码去处理的，你想象一下，如果不是粒度太粗了，我们需要做这种处理吗？

其本质就是轮询 ---- 你想象中的事件驱动，事件监听触发事件，实际上的事件驱动，无限循环的轮询事件监听，不停的侦听是否有事件触发，效率的高低取决于你运行环境的性能以及事件循环引擎的配置。典型的 golang api 监听，while(true)代码监听某个端口。

既然是轮询，那么就不可能做到真正的同步，所有的事件其实都是有序触发的，对于事件来源的利用率就会很低，归根结底，事件驱动实际上还是面向用户的，为了预测用户交互行为，并及时作出响应，我们就必须要去监听用户可能会存在的某种事件行为，也因此我们就必须要去定义轮询过程中的种种事件，而这些事件，因为轮询的原因，永远无法同步触发。

> 事件驱动架构还有其他的优点和缺点，我们在这里就不一一赘述了，主要还是想简单介绍一下，什么是事件驱动，我们在我们的开发过程中，都有哪些地方用到了

## 数据驱动

### 什么是数据

数据就是用抽象的方式，去描述物质的各种特点，记录下来，再反过来使用对应的记录，将对应的物质总结出来。（自己总结的）

数据可以是动态的（比如状态，视图数据实体等）

数据也可以是静态的（比如 DB 中的持久化数据，浏览器本地存储中的 cookie 等等）

### 什么是数据驱动

通过数据（状态）的变化，驱动视图（业务）的变化。

简简单单的一句话，却概括了与普通流程思维完全不同的一种思维模型。

普通的流程思维即：

渲染页面 ---> 构建 DOM 树 ---> 监听事件 ---> 触发事件 ---> 执行事件响应函数 ---> 执行业务行为 ---> 更新视图

典型的代码如：

```js
// 获得一个带着dom的jquery对象
var $aaa = $("#aaaSpan");

// 给aaa这个jquery对象绑定一个事件监听
$aaa.click(function (e) {
  // 在事件监听内执行对应的业务行为
  // 更新视图
  if ($aaa.hasClass("disabled")) {
    $aaa.removeClass("disabled");
    $aaa.addClass("actived");
  } else {
    $aaa.addClass("disabled");
    $aaa.removeClass("actived");
  }
});
```

在上边这个流程里，dom 是 dom，事件是事件，逻辑是逻辑，我们清楚的知道那部分是 dom，那部分是事件，那部分是业务逻辑，我们会分别处理他。

dom，事件，业务逻辑简单明了，符合人类的思维。

所以我们大部分代码都长这个样子，不管我们使用的是什么框架。

这实际上就是基于事件驱动的过程思维，简单来说就是按部就班。

#### 那么数据驱动是什么样子的呢？

数据驱动的本质，就是对数据（状态）的维护，换句话说就是，我们根本不会去关心所谓的视图更新，业务逻辑。

我们只关心数据！

#### 如何做到这一点？

看下边的代码

```js
// 缓存一个jquery对象
var $aaa = $("#aaaSpan");

// 创建状态劫持者
// catcher 公共方法，任意作用域可见
var catcher = (function () {
  // 私有状态，外部不可见
  var status = true;

  return {
    // catcher 实际上就是setter 但它比setter多了一个业务发布的行为
    // 实际上就是setter和publisher的结合体
    aaaCatcher: function (state) {
      status = state;
      business(status);
    },
    // getter
    aaaGetter: function () {
      return status;
    },
  };
})();

// 获取aaaCatcher
var aaaCatcher = catcher.aaaCatcher;
// 获取 getter
var aaaGetter = catcher.aaaGetter;

// 被劫持的行为
function business(status) {
  if (status) {
    $aaa.removeClass("disabled");
    $aaa.addClass("actived");
  } else {
    $aaa.addClass("disabled");
    $aaa.removeClass("actived");
  }
}

// 以上代码，当我不允许你进行等号=赋值操作，仅允许aaaCatcher执行的aaaStatus状态维护的操作时
// 每次状态的变更，都会导致视图的更新
// 而在这个过程里，你知道视图更新的逻辑吗？如果我把代码盖住的话，你实际上不知道的。

// 这其实就是vue等mvvm框架vm的核心逻辑
// 也就是数据驱动的核心实现
// 状态劫持 和 视图渲染
```

这样看起来是不是就是，干了同样的事情，但我们写的代码还变多了呢？

真的是这样吗？

在上边的代码里，有几部分实际上不可见的。

如

```js
aaaCatcher;
```

如

```js
business;
```

我们在框架内部写代码时，能看到的代码实际上只有

```
// 缓存一个jquery对象
var $aaa = $('#aaaSpan');

// 私有状态，外部不可见
var aaaStatus = true;
```

每当对 aaaStatus 的状态进行赋值操作的维护，`aaaCatcher`和`business`都会被触发，因而导致视图的更新。

`business`越是复杂，我们节省的代码就越多。

整个前端的逻辑，从重心在视图更新，而向重心在数据维护转变。

在 mvvm 的框架里，数据驱动的架构图，简示如下：

![](/img/in-post/event-driven-and-data-driven/数据驱动.png)

在实际设计和编写代码的过程里，状态的维护代码基本上是需要我们去写的，譬如 ajax 的收发，事件当中数据的收集，转换等处理工作。
但视图的转换，数据的传递，数据状态之间的依赖关系，基本上已经由底层框架为我们全部做好了。

在第一部分直接通过事件响应，编写过程代码的程序里，业务逻辑所需要的所有的细节，都需要我们耗费心智负担，去帮助程序处理（写明文代码）

但是在第二部分，我们将底层框架做好的部分隐去之后（`aaaCatcher`和`business`），我们实际上要写的代码就只有两行。

> 数据驱动就是不需要我们再关注视图和业务逻辑，只要需要关注数据本身，所有的思维方式都是从数据的变化出发，而所谓的视图变化，业务的变化，都是因为数据的变化而引发的变化，他们是声明式的，而不是命令式的。

简单来说就是，我们清楚的知道目标，所以不需要去关注过程。

#### 看一个数据驱动的例子吧

```html
<template>
  <div :disabled="aaa && bbb" @click="onDivClick" ref="div"></div>
  <!--<div :disabled="div2Disabled" @click="onDivClick2" ref="div2" ></div>-->
</template>

<script type="text/javascript">
  exports defaulut {
    data : function(){
      return {
        aaa: true,
        bbb：false,
        ccc: 1
      };
    },

    /*
    computed:{
      div2Disabled(){
        return this.ccc % 2 && this.aaa && this.bbb
      }
    },
    */

    methods: {
      onDivClick( e ){
        // 数据驱动
        this.aaa = false;

        // 命令式编程 过程代码
        // this.refs.div.setAttribute('disabled', this.aaa && this.bbb);
      },

      // onDivClick2(){
      //   this.ccc++;

      //   命令式编程，过程代码
      //   this.refs.div.setAttribute('disabled', this.ccc % 2 && this.aaa && this.bbb);
      // }
    }
  };
</script>
```

vue 的数据驱动，数据流动图例如下：

![](/img/in-post/event-driven-and-data-driven/数据驱动架构.png)
