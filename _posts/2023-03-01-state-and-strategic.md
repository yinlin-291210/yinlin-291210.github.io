---
layout: post
title: "设计模式中的状态模式和策略模式"
subtitle: "State And Strategic"
date: 2023-03-01 10:44:08
author: linbao
header-img:
catalog: true
tags:
  - 设计模式
---

## 设计模式

设计模式是 OOP（面向对象编程思想）特有的东西，即，非 OOP 编程思想，是没有设计模式的，就算有，也不叫设计模式了。

其本质是一种**编程思维模型**，目的在于代码的管理。

已知的 OOP 设计模式，大约有三十多种，也许可能有四十了吧，但我们今天主要讨论一下**状态模式**和**策略模式**

## 状态模式和策略模式的关注点

这两种设计模式非常贴近我们的业务，他们不像是**单例模式**，**组合模式**，**路由模式**那样，在**交互层的业务实现**上，几乎使用不到。

> 听起来贼熟悉，想用起来没处实践。

`状态模式和策略模式相似的地方有三：`

- 都是面向纯业务/算法实现的设计模式
- 使用的方式，实现的方式极其类似，都是通过状态（标记/策略）的管理，来完成具体的业务
- 都可以进行嵌套封装，实现多维策略或者多维状态的维护过程

`状态模式和策略模式的不同之处：`

- 状态模式关注的是状态的变化，它的输入输出都是状态
- 状态模式的状态转换过程，在业务流程里不可见
- 状态模式一定知道所有的状态（有限状态机）
- 策略模式关注的是状态（标记/策略）对应的业务（算法）实现
- 策略模式的状态转换过程，一定可见
- 策略模式的整个实现过程，所有的状态不一定全部可见

## 状态模式

> 允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类。
> 它关注状态改变的过程，并将每一个状态的变更，都延伸出对应的行为

简单的解释一下：

- 第一部分的意思是将状态封装成独立的类，并将请求委托给当前的状态对象，当对象的内部状态改变时，会带来不同的行为变化。
- 第二部分是从客户的角度来看，我们使用的对象，在不同的状态下具有截然不同的行为，这个对象看起来是从不同的类中实例化而来的，实际上这是使用了委托的效果。

以下内容来源于网络[js 设计模式——状态模式](https://www.cnblogs.com/loveyt/p/11403784.html)

举一个例子，没错就是电灯的例子（不要烦，请耐心往下看）

```js
// 首先定义了一个Light类
class Light {
  // 定义一个状态变量
  constructor() {
    this.state = "off";
  }
  // 定义一个改变状态的方法
  change() {
    if (this.state === "off") {
      console.log("开灯");
      this.state = "on";
    } else {
      console.log("关灯");
      this.state = "off";
    }
  }
}
// 创建实例
let light = new Light();
// 调用方法
light.change();
```

当当当当，到此我们已经编写了一个状态机，逻辑简单又缜密，看起来还有那么点无懈可击。BUT，你懂的事实并非如此，人生也没那么多的如意。随着人类的进步，需求也不（de） 断（cuo） 进（jin） 步（chi）(●'◡'●)，于是新的电灯出现了，这电灯可厉害了，第一次点击弱光，再次点击强光，再点七彩光，再点 emmm 关了。

按我们上面的逻辑来写，那可就刺激了：

- 首先违反了开闭原则，每次改动都要更改 change()方法，使得方法变得不稳定
- 状态切换的不明显，无法一目了然的明白一共有多少种状态
- 状态之间的切换关系，不过是往 change()方法里添加 if、else 语句，是 change()方法更加难阅读和维护

> 开闭原则：开闭原则（Open-Closed Principle，OCP）是指一个软件实体（如类、模块和函数）应该对扩展开放，对修改关闭。所谓的开闭，也正是对扩展和修改两个行为的一个原则。它强调的是用抽象构建框架，用实现扩展细节，可以提高软件系统的可复用性及可维护性。开闭原则是面向对象设计中最基础的设计原则，它指导我们如何建立稳定、灵活的系统。

> 例如版本更新，我们尽可能不修改源代码，但是可以增加新功能。在现实生活中开闭原则也有体现。比如，很多互联网公司都实行弹性作息时间，只规定每天工作 8 小时。意思就是说，对于每天工作 8 小时这个规定是关闭的，但是你什么时候来、什么时候走是开放的。早来早走，晚来晚走。开闭原则的核心思想就是面向抽象编程

回过头我们再来讨论下状态模式上面提出的三个点

有首歌怎么唱来着“新的电灯已经出现，怎么能够停滞不前”，哈哈，所以状态模式来了~~~

因为电灯的例子有点单调，所以我们换一个例子：

```js
// 单曲循环类
class SingleCycle {
  constructor(self) {
    this._self = self;
  }
  modeSwitch() {
    console.log("现在是单曲循环");
    this._self.setState(this._self.listCirculation);
  }
}
// 列表循环类
class ListCirculation {
  constructor(self) {
    this._self = self;
  }
  modeSwitch() {
    console.log("现在是列表循环");
    this._self.setState(this._self.sequentialPlay);
  }
}
// 顺序播放类
class SequentialPlay {
  constructor(self) {
    this._self = self;
  }
  modeSwitch() {
    console.log("现在是顺序播放");
    this._self.setState(this._self.shufflePlay);
  }
}
// 随机播放类
class ShufflePlay {
  constructor(self) {
    this._self = self;
  }
  modeSwitch() {
    console.log("现在是随机播放");
    this._self.setState(this._self.singleCycle);
  }
}
// 音乐类
class Music {
  constructor() {
    // 为每个状态都创建一个状态对象
    this.singleCycle = new SingleCycle(this);
    this.listCirculation = new ListCirculation(this);
    this.sequentialPlay = new SequentialPlay(this);
    this.shufflePlay = new ShufflePlay(this);
    // 定义初始状态为顺序播放
    this.currState = this.sequentialPlay;
  }
  // 切换播放模式
  changeMode() {
    this.currState.modeSwitch();
  }
  // 下一次点击时的播放状态
  setState(newState) {
    this.currState = newState;
  }
}
// 实例化音乐类
let music = new Music();
// 调用切换播放模式方法
music.changeMode();
```

好了，到此我们改编完成，如果你没有懵掉，good，如果你懵掉了，往下看：

- 首先我们定义了 4 个状态类 SingleCycle（单曲循环） 、 ListCirculation（列表循环） 、 SequentialPlay（顺序播放） 、 ShufflePlay（随机播放）
- 每个状态类都定义了一个变量 \_self 来接收 Music（音乐类） 传过来的 this，还有一个方法 modeSwitch（状态更改），用来改变下一次要播放的状态
- 然后定义了一个 Music（音乐类） ，首先在里面为每一个状态都创建了一个状态对象，还定义了一个变量 currState 来记录下一次点击时的状态。
- 最后就是 Music（音乐类）里面定义的两种方法 changeMode（切换播放模式） 、 setState（下一次点击时的播放状态） 。当我们点击切换模式的时候，在 changeMode（切换播放模式） 中去调用之前定义好的状态类中的 modeSwitch（状态更改） 方法，完成模式切换的同时调用 Music（音乐类）中的 setState（下一次点击时的播放状态） 方法来对状态进行改变，保证下一次点击时切换不同的模式。

通过上面的方法可以看出：

- 我们可以在 Music（音乐类） 中清楚的知道一共有多少个状态，同时 Music（音乐类） 中不再进行任何实质性的操作，而是通过 this.currState.modeSwitch() 交给了当前持有的状态对象去执行
- 状态的切换规律被事先在每一个状态类中定义好了，在 Music（音乐类） 中没有任何一个和状态切换相关的条件分支语句

> 小小的拓展

通过上面的介绍我们了解到了每一个状态类都有一个 modeSwitch() 方法，也就意味着我们每次添加状态类都要写一个方法，问题来了，人非圣贤，孰能无过？所以咧难免会丢掉的嘛！

然后做一些小小的优化：

```js
// 定义一个State类
class State {
  constructor(self) {
    this._self = self;
  }
  modeSwitch() {
    throw new Error("父类的 modeSwitch 方法必须被重写");
  }
}

// 状态类（举一个为例）

// 单曲循环类（继承State类）
class SingleCycle extends State {
  modeSwitch() {
    console.log("现在是单曲循环");
    this._self.setState(this._self.listCirculation);
  }
}
```

> 状态模式，关注的是状态本身，其状态变更引发的变化（业务更新）其实是其状态变化的副产品，也就是副作用

> 划重点：也因此，状态模式只要检查对象对应的状态，就可以确认工作是否已经真实完成

> 当当当当： 在我们前端交互层的工作里，那部分跟状态模式一模一样呢？MVVM 的 M

MVVM 分层架构模型中，M 层的对外更新，完全是依赖将自己的数据，完全当作状态来管理做到的。

> 因此你每次写一个 this.a = 1，并且引发视图变化时，你可以不用去关心视图的变化，因为你知道那一定是正确的，不会出错的，稳定的，这并不是因为你不需要做这件事，而是因为状态模式的理念已经否定了副作用会出错的可能，状态模式的思维模型里就没有状态副作用会发生变化的可能。

这一点是状态模式的核心思路！

**在 OOP 编程思想下，只要你能保证通过 check 最终状态，就可以确认自己的业务是否正确实现，就已经 follow 了状态模式的核心思想，而非你一定要以某种形式的代码，去实现一个代码模板式的状态机**

**使用状态机来管理对象生命流的好处更多体现在`代码的可维护性`、`可测试性`上，明确的`状态条件`、`原子的响应动作`、`事件驱动迁移目标状态`，对于`流程复杂易变`的业务场景能`大大减轻维护和测试的难度`**

## 策略模式

以下内容来源于知乎[JS 设计模式之策略模式](https://zhuanlan.zhihu.com/p/146500964)

什么是策略模式？

**策略模式就是将一系列算法封装起来，并使它们相互之间可以替换。被封装起来的算法具有独立性，外部不可改变其特性。**

生活中有很多场景其实都是可以利用策略模式来体现的，比如你要出门旅游，资金又有限，目的地已经确定了，路线和交通方式有很多，你可以选一个最符合资金情况的方案。

今天采用两个场景，第一个场景是商城搞促销活动，第二个场景是表单验证。那么下面直接进入正题。

假如今天是双十一，商城有促销，促销方案如下：

1、满 100 减 5
2、满 200 减 15
3、满 300 减 30
4、满 400 减 50

老板让程序员小 A 设计一个算法来计算促销后的价格，小 A 一乐，这么简单的逻辑，还需要设计？拿起键盘直接盘它：

```js
function full100(price) {
  return price - 5;
}
function full200(price) {
  return price - 15;
}
function full300(price) {
  return price - 30;
}
function full400(price) {
  return price - 50;
}
function calculate(type, price) {
  if (type == "full100") {
    return full100(price);
  }
  if (type == "full200") {
    return full200(price);
  }
  if (type == "full300") {
    return full300(price);
  }
  if (type == "full400") {
    return full400(price);
  }
}
```

从代码上看确实没啥毛病，但是如果情况有变呢？岂不是每添加一个方案就会写一个方法和一个 if 判断。

显然，这种方式扩展性不高，需要改正，这时小 A 灵光一闪，我把它封装到一个对象中，每个算法都封装为一个方法，再写一个调用计算的方法给外部调用，然后只需要给它传参不就行了么。

再考虑全面一点，如果我的方案有变化呢，我不想每次去添加方法，而是给它一个接口自己去完成促销方案的添加。

于是修改代码如下：

```js
var countPrice = {
  returnPrice: {
    full100: function (price) {
      return price - 5;
    },
    full200: function (price) {
      return price - 15;
    },
    full300: function (price) {
      return price - 30;
    },
    full400: function (price) {
      return price - 50;
    },
  },
  getPirce: function (type, money) {
    return this.returnPrice[type] ? this.returnPrice[type](money) : money;
  },
  addRule: function (type, discount) {
    this.returnPrice[type] = function (price) {
      return price - discount;
    };
  },
};
```

怎么样，代码是不是少了很多，来做一下测试，假如用户选择了满 300 减 30 的优惠方案，调用如下：

```js
console.log(countPrice.getPirce("full300", 399));
// 输出 369
```

现在促销方案有新增，新增一个满 500 减 100 的方案，体验一下这个方法的强大吧：

```js
countPrice.addRule("full500", 100);
console.log(countPrice.getPirce("full500", 599));
// 输出 499
```

现在来看看第二个场景，表单验证。

小 A 接到一个新的需求，开发一个用户注册页面，其中表单包含了用户名、密码、确认密码以及手机号码，要求所有数据都不为空，密码至少 6 位，确认密码必须与密码相等。

先编写好表单：

```html
<form action="" id="form">
  姓名：<input type="text" id="username" /><br />
  密码：<input type="password" id="password1" /><br />
  确认密码：<input type="password" id="password2" /><br />
  手机号：<input type="text" id="phone" /><br />
  <input type="submit" value="提交" />
</form>
```

然后直接做表单验证：

```js
function getValue(id) {
  return document.getElementById(id).value;
}
var formData = document.getElementById("form");
formData.onsubmit = function () {
  var name = getValue("username");
  var pwd1 = getValue("password1");
  var pwd2 = getValue("password2");
  var tel = getValue("phone");
  if (name.replace(/(^\s*)|(\s*$)/g, "") === "") {
    alert("用户名不能为空");
    return false;
  }
  if (pwd1.replace(/(^\s*)|(\s*$)/g, "") === "") {
    alert("密码不能为空");
    return false;
  }
  if (pwd2.replace(/(^\s*)|(\s*$)/g, "") === "") {
    alert("确认密码不能为空");
    return false;
  }
  if (pwd2 !== pwd1) {
    alert("确认密码与原密码不相同！");
    return false;
  }
  if (tel.replace(/(^\s*)|(\s*$)/g, "") === "") {
    alert("手机号码不能为空");
    return false;
  }
  if (!/^1[3,4,5,7,8,9][0-9]\d{8}$/.test(tel)) {
    alert("手机号码格式不正确");
    return false;
  }
  alert("注册成功");
};
```

大功告成。可是仅仅 4 个表单数据，就用了 6 个 if 去判断，如果这个页面不是用户注册，而是某个管理页面中的表单，包含了十多个表单数据呢，一直 if 写到底？

那么策略模式就来解决表单验证中规则复用、一条数据多个校验规则的问题。

我们先把上面所有的 if 判断改写一下，封装成一个个方法，为了能够让所有表单均可使用，我们把它封装到一个原型对象中：

```js
function Validate() {}
Validate.prototype.rules = {
  // 是否手机号
  isMobile: function (str) {
    var rule = /^1[3,4,5,7,8,9][0-9]\d{8}$/;
    return rule.test(str);
  },
  // 是否必填
  isRequired: function (str) {
    // 除去首尾空格
    var value = str.replace(/(^\s*)|(\s*$)/g, "");
    return value !== "";
  },
  // 最小长度
  minLength: function (str, length) {
    var strLength = str.length;
    return strLength >= length;
  },
  // 是否相等
  isEqual: function () {
    // 可以接收多个参数比较
    var args = Array.prototype.slice.call(arguments);
    // 取首项与后面所有的项比较，如果每个都相等，就返回true
    var equal = args.every(function (value) {
      return value === args[0];
    });
    return equal;
  },
};
```

接下来封装开始验证的方法，这个方法会接收一个参数，是用户传递进来的校验规则对象，对象的键名是字段名，键值是数组类型，可包含多个校验规则，而每一个规则拥有三个属性，分别为规则名、需要校验的值以及校验不通过的提示语。

为了方便封装校验方法时作对比，我们先把表单提交的校验信息编写好：

```js
formData.onsubmit = function () {
  event.preventDefault();
  var validator = new Validate();
  var result = validator.test({
    username: [
      {
        rule: "isRequired",
        value: this.username.value,
        message: "用户名不能为空！",
      },
    ],
    password1: [
      {
        rule: "isRequired",
        value: this.password1.value,
        message: "密码不能为空！",
      },
      {
        rule: "minLength",
        value: [this.password1.value, 6],
        message: "密码长度不能小于6个字符！",
      },
    ],
    password2: [
      {
        rule: "isRequired",
        value: this.password2.value,
        message: "确认密码不能为空！",
      },
      {
        rule: "minLength",
        value: [this.password2.value, 6],
        message: "确认密码长度不能小于6个字符！",
      },
      {
        rule: "isEqual",
        value: [this.password2.value, this.password1.value],
        message: "确认密码与原密码不相同！",
      },
    ],
    isMobile: [
      {
        rule: "isRequired",
        value: this.phone.value,
        message: "手机号不能为空！",
      },
      {
        rule: "isMobile",
        value: this.phone.value,
        message: "手机号格式不正确！",
      },
    ],
  });
  if (result) {
    console.log(result);
  } else {
    console.log("校验通过");
  }
};
```

ok，开始封装校验方法：

```js
Validate.prototype.test = function (rules) {
  var v = this;
  var valid; // 保存校验结果
  for (var key in rules) {
    // 遍历校验规则对象
    for (var i = 0; i < rules[key].length; i++) {
      // 遍历每一个字段的校验规则
      var ruleName = rules[key][i].rule; // 获取每一个校验规则的规则名
      var value = rules[key][i].value; // 获取每一个校验规则的校验值
      if (!Array.isArray(value)) {
        // 统一校验值为数组类型
        value = new Array(value);
      }
      var result = v.rules[ruleName].apply(this, value); // 调用校验规则方法进行校验
      if (!result) {
        // 如果校验不通过，就获取校验结果信息，并立即跳出循环不再执行，节约消耗
        valid = {
          errValue: key,
          errMsg: rules[key][i].message,
        };
        break;
      }
    }
    if (valid) {
      // 如果有了校验结果，代表存在不通过的字段，则立即停止循环，节约消耗
      break;
    }
  }
  return valid; // 把校验结果反悔出去
};
```

我们来测试一下：

```js
// 输入： ‘菜鸟库’、不输入、不输入、不输入
// 打印结果：{errValue: "password1", errMsg: "密码不能为空！"}

// 输入： ‘菜鸟库’、12345、456123、不输入
// 打印结果：{errValue: "password1", errMsg: "密码长度不能小于6个字符！"}

// 输入：‘菜鸟库’、123456、456123、不输入
// 打印结果：{errValue: "password2", errMsg: "确认密码与原密码不相同！"}

// 输入：‘菜鸟库’、123456、123456、12345678911
// 打印结果： {errValue: "isMobile", errMsg: "手机号格式不正确！"}

// 输入： ‘菜鸟库’、123456、123456、13100808854
// 打印结果： 校验通过
```

完美，表单验证的方法就封装完成了。

看完后同学们有没有有一个发现，尽管采用策略模式能够封装很多算法，但是对于用户，也就是没有参与封装的其他开发者来说，他们并不知道有哪些方法可以使用，如果不去阅读这些算法，很容易走回以前的老套路或者重复封装。这也是策略模式一个比较大的缺点。

其次，如果算法非常复杂，且存在某几个算法拥有相同的某个逻辑的时候，这些算法不能共享这个逻辑，因为每个算法之间必须相互独立。

当然，它的优点是有目共睹的，将一个个算法封装起来，提高代码复用率，减少代码冗余；策略模式可看作为 if/else 判断的另一种表现形式，在达到相同目的的同时，极大的减少了代码量以及代码维护成本。

**策略模式关注于策略（标记/状态）所对应的业务/算法实现，当锚定一个策略，就意味着某一个业务或者算法被启动，并将一定得到所期望的结果**

**策略模式更倾向于业务的实现**

## 表驱动

表驱动全称叫表驱动法，并非是一种设计模式，而是一种写代码的方法。

表驱动作为一种模板代码，其本身就是策略模式。

什么样的代码是表驱动？

```js
var tableList = {
  方案1: function () {
    return 1;
  },
  方案2: function () {
    return 2;
  },
  方案3: function () {
    return 3;
  },
  方案4: function () {
    return 4;
  },
  方案5: function () {
    return 5;
  },
};

// ok，以上代码已经定义了一张业务映射表
// 接下来使用它

function use(key) {
  key = key.toString();
  return tableList[key] && tableList[key]();
}

// 注意，没有use的调用了，因为我们已经达成表驱动了
// 表驱动并非是完整设计模式，可以将业务归纳，它只是已经写代码的方法，上面的表定义，和函数use里的return 返回的表达式 tableList[key] && tableList[key]() 就是表驱动
```

**通过预先定义或者拓展的业务/算法映射表来确定标记（key），再通过参数化的 key 来任意调用表中的业务**

这是策略模式的一种简单实现

## 状态策略机

实际上根本没有状态策略机这种东西，状态/策略机，指的是同时在一个领域里即使用了状态模式的思想，又实现了策略模式的思想

当你使用状态机来管理 **状态变更的过程** 以及其 **变更业务的实现**

再使用表驱动获得其**最初**和**最终**的状态，作为 key，那么你就可以稳定获得状态机两端的指定业务。

此业务可能与状态机本身有关，也可能无关。

比如我们常用的一种架构体系**事务**

事务的实现：

- 起始状态，事务保存初始状态以及架构体系快照
- 使用状态机来维护事务的业务执行过程的所有状态，并记录下来
- 结束状态
  - 失败，回滚所有的状态机状态（别忘了状态机是可以切换状态的），目标是回滚到起始状态
  - 成功，结束事务
