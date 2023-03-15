---
layout: post
title: "简述typeof与instanceof"
subtitle: "Typeof Instanceof"
date: 2023-03-15 11:22:04
author: linbao
header-img:
catalog: true
tags:
  - js
  - 原型链
---

# typeof 和 instanceof

## 一、JS 数据类型

js 数据类型可以分为两种 ：

> 基本数据类型：`Number`、`String`、`Boolean`、`Null`、`Undefined`、`Symbol`、`BigInt`
> 引用数据类型(对象)： `Math`、`Function`、`Object`、`Array`、`BOM`、`DOM`、`RegExp`、`Date`

常用的两种检测类型的方法：`typeof` 以及 `instanceof`。

## 二、typeof 简单介绍

用于判断数据类型，返回值有`number`、`string`、`boolean`、`function`、`undefined`、`object` 六个。

```javascript
<script>
  let a = [1, 2, 3, 4, 5]; let b = 1; let c = "weaface"; let d = false; let f =
  null; let e = new Date(); let g = undefined; let h = function () {};
  console.log(typeof(a)); // object console.log(typeof(b)); // number
  console.log(typeof(c)); // string console.log(typeof(d)); // boolean
  console.log(typeof(e)); // object console.log(typeof(f)); // object
  console.log(typeof(g)); // undefined console.log(typeof(h)); // function
</script>
```

**为什么 `typeof(null)` 返回的一个 `object` 而不是 ` null`?**
解惑：所有 js 数据存储的时候都会被转为二进制数据 0、1，而每种不同的数据都有自己独特的标志：

```javascript
000：对象，数据是对象的应用
001：整型，数据是31位带符号整数
010：浮点数
100：字符串
110：布尔类型
```

有两个值比较特别：

- undefined：用（-2 的 30 次方）表示
- null：对应一个空指针，一般全是 `000`，因为 `null` 是空，转换为二进制就是一长串的 0，而 `object` 的话是`000`，所以被默认 `object`

## 三、instanceof

### 3.1 object instanceof constructor

- 其中，`object` 表示某个实例对象，`constructor` 表示某个构造函数。它的作用是用于检查 `constructor.prototype` 是否存在于参数 `object` 的原型链上。
- 查找构造函数的原型对象是否在实例对象的原型链上，如果在返回 `true`，如果不在返回 `false`。
- 说白了，只要右边变量的 `prototype` 在左边变量的原型链上即可。因此，`instanceof` 在查找的过程中会遍历左边变量的原型链，直到找到右边变量的` prototype`，如果查找失败，则会返回 `false`。

### 3.2 原型与原型链

[理解原型对象](https://dev.koal.com/projects/front-end-dep/wiki/20220708-%E4%BD%95%E8%82%B2%E8%B6%85-%E7%90%86%E8%A7%A3%E5%8E%9F%E5%9E%8B%E5%AF%B9%E8%B1%A1)

> `javascript`中，除了 `undefined `与 `null` 之外的万物皆为对象，不管你是字符串，数组，都会有 `__proto__` 属性指向创建自己的构造函数的原型，也就是 `prototype`。

**3.2.1 原型**

> 原型分为隐式原型(`__proto__`)和显式原型(`prototype`)。

由于所有的引用类型(数组、对象、函数）都具有对象特性。即可自由扩展属性(除了`null`)。因此浏览器为每一个可扩展的对象添加了一个`__proto__`属性。该属性称为隐式原型，是一个普通对象。

```javascript
var obj = {
  name: "小明",
};
console.log(obj.__proto__);
```

![](/img/in-post/typeofAndInstanceof/clipboard-202209291853-84ybh.png)

可以看到`__proto__`是一个对象，具有 `constructor`、`hansOwnProperty` 等属性。 函数也是引用类型，因此浏览器为其扩展了一个默认属性 `prototype`。叫作显式原型。我们称为原型对象。

```javascript
var People = function () {
  this.name = "heihei";
};
var p = new People();
console.log(p.__proto__ === People.prototype); // true
```

对象 p 是通过构造函数 People 实例化而来的。因此 p 的隐式原型(`proto`)与构造函数 People 的显示原型(`prototype`)完全相等。

**3.2.2 原型链**
当试图得到一个对象的某个属性时，如果这个对象本身没有这个属性，那么会去它的隐式原型 `__proto__`(即它的构造函数的 `prototype` )中寻找。如果它的构造函数的 `prototype` 中没有该属性，那么就会通过 `prototype.__proto__` 中去寻找。以此类推如果存在该属性会直到找到该属性为止。浏览器为了防止无限循环，找到最上层就是 `object` 了（祖先），再往上找就是 `null` ，说明此时不存在该属性。这个寻找的过程会形成一条链路，就是原型链。如下图所示：

![](/img/in-post/typeofAndInstanceof/clipboard-202209291854-bvjg4.png)

### 3.3 instanceof 判断对象类型原理

```javascript
function instance_of(L, R) {
  // L 表示左表达式，R 表示右表达式
  // 前置判断，L不是object类型或者也不是null又或者R不是一个函数
  if (typeof L !== "object" || L === null || typeof R !== "function") {
    return false;
  }
  var O = R.prototype; // 取 R 的显示原型
  L = L.__proto__; // 取 L 的隐式原型

  while (true) {
    // 假设找到顶端的object，返回false
    if (L === null) return false;
    if (O === L)
      // 当 O 显式原型 严格等于  L隐式原型 时，返回true
      return true;
    L = L.__proto__; //递归操作
  }
}
```

首先我们去判断一下 L 这个实例对象是不是 object 类型或者 null,R 是不是一个函数。如果满足其中一个，我们直接返回就可以了。我们定义一个 O 也就是这个构造函数的原型对象。定义一个 L 取他的隐式原型。因为在查找的过程中隐式原型总是回去找他的显示原型。找到返回 `true`，找不到返回 `fasle`。紧接着我们去假设已经是最顶层的 object，那么们直接返回 false，否则当隐式原型找到了显式原型。我们返回 true。都没有满足的话，`L = L.__proto__`；他指向的是父级的原型对象。层层递归往上找。 `L._proto_._proto_？===Object .prototype`，找到返回`true`，找不到返回`fasle`。

在这里我们分析了`instanceof`底层原理之后，我们需要考虑两个方面：

**1. 未发生继承关系时**

```javascript
function Person(name, age, sex) {
  this.name = name;
  this.age = age;
  this.sex = sex;
}

function Student(score) {
  this.score = score;
}

var per = new Person("小明", 20, "男");
var stu = new Student("92分");

console.log(per instanceof Person); // true
console.log(stu instanceof Student); // true
console.log(per instanceof Object); // true
console.log(stu instanceof Object); // true
```

![](/img/in-post/typeofAndInstanceof/clipboard-202209291854-dpex0.png)

instanceof 的工作流程分析 首先看 per instanceof Person

```javascript
function instance_of(L, R) {
  // L即per ；  R即Person
  // 前置判断，L不是object类型或者也不是null又或者R不是一个函数
  if (typeof L !== "object" || L === null || typeof R !== "function") {
    return false;
  }
  var O = R.prototype; //O为Person.prototype
  L = L.__proto__; // L为per._proto_
  while (true) {
    //执行循环
    if (L === null)
      //不通过
      return false;
    if (O === L)
      //判断：Person.prototype ===per._proto_？
      return true; //如果等于就返回true，证明per是Person类型
    L = L.__proto__;
  }
}
// 执行 per instanceof Person ，通过图示看出Person.prototype === per.__proto__是成立的，所以返回true，证明引用per是属于构造函数Person的。
```

再看看 per instanceof Object

```javascript
function instance_of(L, R) {
  // L即per ；  R即Object
  // 前置判断，L不是object类型或者也不是null又或者R不是一个函数
  if (typeof L !== "object" || L === null || typeof R !== "function") {
    return false;
  }
  var O = R.prototype; // O为Object.prototype
  L = L.__proto__; // L为per._proto_
  while (true) {
    // 执行循环
    if (L === null)
      // 不通过
      return false;
    if (O === L)
      // Object .prototype === per._proto_？  不成立**
      return true;
    L = L.__proto__; // 令L为 per._proto_ ._proto_ 去找父级的原型对象
    // 即图中Person.prototype._proto_指向的对象
    // 接着执行循环，
    // 到Object .prototype === per._proto_ ._proto_  ？
    // 成立，返回true
  }
}
```

**2. 发生继承关系时**

```javascript
function Person(name, age, sex) {
  this.name = name;
  this.age = age;
  this.sex = sex;
}

function Student(name, age, sex, score) {
  Person.call(this, name, age, sex);
  this.score = score;
}

Student.prototype = new Person(); // 这里改变了原型指向，实现继承

var stu = new Student("小明", 20, "男", 99); // 创建了学生对象stu
console.log(stu instanceof Student); // true
console.log(stu instanceof Person); // true
console.log(stu instanceof Object); // true
```

发生继承关系后的原型图解
![](/img/in-post/typeofAndInstanceof/clipboard-202209291855-wqkhb.png)

**instanceof 的工作流程分析**

首先看 stu instanceof Student

```javascript
function instance_of(L, R) {
  //L即stu ；  R即Student
  // 前置判断，L不是object类型或者也不是null又或者R不是一个函数
  if (typeof L !== "object" || L === null || typeof R !== "function") {
    return false;
  }
  var O = R.prototype; //O为Student.prototype,现在指向了per
  L = L.__proto__; //L为stu._proto_，也随着prototype的改变而指向了per

  while (true) {
    //执行循环
    if (L === null)
      //不通过
      return false;
    if (O === L)
      //判断： Student.prototype ===stu._proto_？
      return true; //此时，两方都指Person的实例对象per，所以true
    L = L.__proto__;
  }
}
```

即使发生了原型继承，stu instanceof Student 依然是成立的。
接下来看 stu instanceof Person ，instanceof 是如何判断 stu 继承了 Person

```javascript
function instance_of(L, R) {
  // L即stu ；  R即Person
  // 前置判断，L不是object类型或者也不是null又或者R不是一个函数
  if (typeof L !== "object" || L === null || typeof R !== "function") {
    return false;
  }
  var O = R.prototype; // O为Person.prototype
  L = L.__proto__; //L为stu._proto_，现在指向的是stu实例对象
  while (true) {
    // 执行循环
    if (L === null)
      //不通过
      return false;
    if (O === L)
      //判断：   Person.prototype === stu._proto_ ？
      return true; //此时，stu._proto_ 指向per实例对象，并不满足
    L = L.__proto__; //令L=  stu._proto_._proto_，执行循环
  } //stu._proto_ ._proto_，看图示知：
} //指的就是Person.prototype，所以也返回true
```

stu instanceof Person 返回值为 true，这就证明了 stu 继承了 Person。

## 四、总结

> `typeof` 和 instanceof` 都是用来判断变量类型

> `typeof` 在对值类型 `number`、`string`、`boolean` 、`null` 、 `undefined`、 以及 `引用类型的function`的反应是精准的；但是，对于`对象{ }` 、`数组[ ]` 、`null` 都会返回 `object`，所以为了弥补这一点`instanceof `从原型的角度，来判断某引用属于哪个构造函数，从而判定它的数据类型。
