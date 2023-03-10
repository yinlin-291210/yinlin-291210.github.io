---
layout: post
title: "理解new运算符与面向对象"
subtitle: "JS OOP and new"
date: 2023-03-01 22:05:09
author: linbao
header-img:
catalog: true
tags:
  - js
  - 编程范式
  - OOP
  - front-end
---

在使用 new 实例化`Person`过程中，`Person`返回什么？‘Tom’？？

```js
function Person(name) {
  this.name = name;
  return name;
}
let p = new Person("Tom");
```

抛开`new`的存在，修改代码

```js
function Person(name) {
  this.name = name;
  return name;
}
let p = Person("Tom");
```

显然输出的结果是`Tom`,但有 new 的存在呢？

## 定义

**`new` 运算符**创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例。

语法 ：`new constructor[(arguments)]`

```js
function Person1(name) {
  this.name = name;
  // 没有返回值
}

function Person2(name) {
  this.name = name;
  return name;
  // 返回非对象
}

function Person3(name) {
  this.name = name;
  return { a: 1 };
  // 返回对象
}

function Person4(name) {
  this.name = name;
  return null;
  // 返回null
}

var p1 = new Person1("aa");
var p2 = new Person2("bb");
var p3 = new Person3("cc");
var p4 = new Person4("dd");

console.log(p1); // Person1 {name: "aa"}
console.log(p2); // Person2 {name: "bb"}
console.log(p3); // {a: 1}
console.log(p4); // Person4 {name: "dd"}
```

根据上面的示例，我们能够得出结论：当使用 new 关键字在修饰构造函数执行时，如果函数没有返回值或返回值是原始数据类型，那么返回的就是构造函数实例后的对象（注意：`return null`，返回的也是构造函数实例后的对象而非`null`）;如果函数 return 引用数据类型，那么返回该引用数据类型。

`new.target`

函数内部可以使用`new.target`属性。如果当前函数是`new`命令调用，`new.target`指向当前函数，否则为`undefined`。

```js
function f() {
  console.log(new.target === f);
}

f(); // false
new f(); // true
```

使用这个属性，可以判断函数调用的时候，是否使用`new`命令。

```js
function f() {
  if (!new.target) {
    throw new Error("请使用 new 命令调用！");
  }
  // ...
}

f(); // Uncaught Error: 请使用 new 命令调用！
```

## 创建自定义对象

创建一个用户自定义的对象需要两步：

1. 通过编写函数来定义对象类型

   创建一个对象类型，需要创建一个指定其名称和属性的函数；对象的属性可以指向其他对象

2. 通过`new`来创建对象实例

   当`new Foo(...)`执行时，会发生以下事情：

   - 一个新对象被创建，如果构造器 Foo 的 prototype 是对象，那么将 O 的内部 `__proto__` 属性指向 Foo.prototype。**`链接到原型实例化的对象可以访问到构造函数原型中的属性`**
   - 使用指定的参数调用构造函数`Foo`,并将`This`指向到新创建的对象。**`实例化后的对象可以访问到构造函数中的属性`**
   - 由构造函数返回的对象就是`new`表达式的结果。如果构造函数没有显示返回一个对象，则使用步骤 1 创建的对象（一般情况下，构造函数不返回值，但是用户可以主动返回对象，来覆盖正常的对象创建步骤）**`优先返回构造函数返回的引用类型数据`**

可以对已定义的对象添加新的属性。例如`carl.color='black'`语句给`carl`添加一个新的属性`color`并赋值`"black"`。但是，这不会影响任何其他对象。要将新属性添加到相同类型的所有对象，需将该属性添加到`Car`对象类型的定义中。

可以使用`Function.prototype`属性将共享属性添加到以前定义的对象类型。这定义了一个由该函数创建的所有对象共享的属性，而不仅仅是对象类型的其中一个实例。

```js
function Car() {}
car1 - new Car();
car2 = new Car();
console.log(car1.color); // undefined
Car.prototype.color = "original color";
console.log(car1.color); // original color
car1.color = "black";
console.log(car1.color); // black
console.log(car1.__proto__.color); //original color
console.log(car2.__proto__.color); //original color
console.log(car1.color); // black
console.log(car2.color); // original color
```

## 面向对象编程

​ `面向对象`是常见的编程思想，是将问题所需属性、方法描述成一个个对象。然后再根据业务逻辑调用对象的属性和方法，第一步，就是要生成对象。对象是单个实物的抽象。通常需要一个模板，表示某一类实物的共同特征，然后对象根据这个模板生成。

​ 可以从两个层面来理解对象：

​ （1）对象是单个实物的抽象。

​ （2）对象是一个容器，封装了属性和方法。

​ 典型的面向对象编程语言（比如 Java），都有“类”（`class`）这个概念。所谓“类”就是对象的模板，对象就是“类”的实例。JavaScript 是高度面向对象的，但是，JavaScript 语言的对象体系，不是基于“类”的，而是基于构造函数（`constructor`）和原型链（`prototype`）。

​ `Prototype`等为引擎内部标识符，对我们并不可见。 `Prototype` 正是用于给内部维护原型链，虽然在我们看来，一个对象实例无法直接回溯到其原型（然而引擎内部可以），必须通过构造器中转，即 obj.constructor.prototype。

### 一、函数的`prototype`原型对象

`prototype`是**函数所独有的**，相当于特定类型所有实例对象都可以访问的公共容器。

它的含义是**函数的原型对象**，也就是这个函数所创建的实例的原型对象，由此可知：`f1.__proto__ === Foo.prototype`

`prototype`属性的**作用**：
它的**作用**就是包含可以由特定类型的所有实例共享的属性和方法，也就是让该函数所实例化的对象们都可以找到公用的属性和方法。

### 二、`__proto__`属性

`__proto__`属性，它是**对象所独有的**，可以看到`__proto__`属性都是由**一个对象指向一个对象**，即指向它们的原型对象（也可以理解为父对象），那么这个属性的作用是什么呢？

它的**作用**就是当访问一个对象的属性时，如果该对象内部不存在这个属性，那么就会去它的`__proto__`属性所指向的那个对象（可以理解为父对象）里找，如果父对象也不存在这个属性，则继续往父对象的`__proto__`属性所指向的那个对象里找，如果还没找到，则继续往上找….直到原型链顶端**null**。

此时若还没找到，则返回`undefined`。以上这种通过`__proto__`属性来连接对象直到`null`的一条链即为我们所谓的**原型链**。

### 三、`constructor `属性

**constructor**属性也是**对象才拥有的**，它是从**一个对象指向一个函数**，含义就是**指向该对象的构造函数**，每个对象都有构造函数，从图中可以看出`Function` 这个对象比较特殊，它的构造函数就是它自己（因为 `Function` 可以看成是一个函数，也可以是一个对象，所以函数也拥有 `__proto__` 和 `constructor` 属性），所有函数最终都是由 `Function()` 构造函数得来，所以**constructor**属性的终点就是**Function()**。

![](/img/in-post/js-new-and-oop/原型对象.png)

## new 具体步骤

1、和普通函数执行一样，形成执行上下文、活动对象、作用域链等

2、创建一个空对象

- 空对象是 Object 的实例，即 {} 。

```js
let obj = {};
```

3、空对象的内部属性 **proto** 赋值为构造函数的 prototype 属性

- 该操作是为了将空对象链接到正确的原型上去

```js
function Foo(num) {
  this.number = num;
}
obj.__proto__ = Foo.prototype;
```

4、将构造函数的 this 指向空对象

- 即构造函数内部的 this 被赋值为空对象，以便后面正确执行构造函数。

```js
Foo.call(obj, 1);
```

5、执行构造函数内部代码

- 即给空对象添加属性、方法。

6、返回该新对象

- 如果构造函数内部通过 return 语句返回了一个引用类型值，则 new 操作最终返回这个引用类型值；否则返回刚创建的新对象。
- 引用类型值：除基本类型值（数值、字符串、布尔值、null、undefined、Symbol 值）以外的所有值。

## 实现

首先我们再来回顾下 `new` 操作符的几个作用

- `new` 操作符会返回一个对象，所以我们需要在内部创建一个对象
- 这个对象，也就是构造函数中的 `this`，可以访问到挂载在 `this` 上的任意属性
- 这个对象可以访问到构造函数原型上的属性，所以需要将对象与构造函数链接起来
- 返回原始值需要忽略，返回对象需要正常处理

之后便可以实现这些功能了

```js
function create(func, ...args) {
  let obj = {};
  obj.__proto__ = func.prototype;
  let res = func.apply(obj, args);
  return res instanceof Object ? res : obj;
}
```

1. 首先函数接受不定量的参数，第一个参数为构造函数，接下来的参数被构造函数使用
2. 然后内部创建一个空对象 `obj`
3. 因为 `obj` 对象需要访问到构造函数原型链上的属性，所以我们通过 `obj.__proto__ = Con.prototype`将两者联系起来。这段代码等同于 `obj.__proto__ = Con.prototype`
4. 将 `obj` 绑定到构造函数上，并且传入剩余的参数
5. 判断构造函数返回值是否为对象，如果为对象就使用构造函数返回的值，否则使用 `obj`，这样就实现了忽略构造函数返回的原始值

测试一下

```js
function Test(name, age) {
  this.name = name;
  this.age = age;
}
Test.prototype.sayName = function () {
  console.log(this.name);
};
const a = create(Test, "yck", 26);
console.log(a.name); // 'yck'console.log(a.age) // 26
a.sayName(); // 'yck'
```

## new 之后的底层原理

> - new 之后的流程是什么
> - 内存如何被读写
> - 地址如何产生
> - 地址如何表示

### 整体流程

- 应用程序编译成指令，编译时候，每块数据都有相对地址了。

- 程序开始执行，代码被加载到主存中。

- 指令被送至 cpu 的指令寄存器。

- cpu 从指令寄存器取出指令，执行 new Foo()；代码。,

- 在主存中分配好内存，并且映射到虚拟内存的堆中，物理地址和虚拟地址在页表中关联。

- 与此同时，把 p 所在的物理页缓存到 CPU 高速缓存中，地址放进 TLB 快表。

- let f = new Foo()；返回 f 的虚拟地址。

- 读 f 的值。先去 TLB 查看是否存在 f 的地址，如果存在，去高速缓存查看值在不在。

  > TLB 负责缓存最近常被访问的页表项，大大提高了地址的转换速度

- 如果 TLB 不存在对应的地址，才会继续查常规的页表。

### 相关概念

#### 1.虚拟内存

每一个进程的虚拟地址都是从 0 开始，包含放置代码区，堆，栈，和内核映射区。在这里的地址都是连续的，会被分成很多虚拟页，每一个虚拟页为 4K 大小，页会映射到物理内存，物理内存的地址不会重复，当一个进程开始执行或者请求堆内存，会在物理内存寻找空余的物理页（也是一页 4K 大小）存放。虚拟内存保证了每个进程的地址独立，不会被其他进程的访问到。

虚拟内存有三个重要的作用

1. 虚拟内存可以结合磁盘和物理内存的优势为进程提供看起来速度足够快并且容量足够大的存储；
2. 虚拟内存可以为进程提供独立的内存空间并引入多层的页表结构将虚拟内存翻译成物理内存，进程之间可以共享物理内存减少开销，也能简化程序的链接、装载以及内存分配过程；
3. 虚拟内存可以控制进程对物理内存的访问(通过页表)，隔离不同进程的访问权限，提高系统的安全性；

#### 2.虚拟页

虚拟内存由虚拟页构成，每个虚拟页 4K 大小。

> - 虚拟页号（Virtual Page Number ），一页通常是 4K，VPN 表示在虚拟内存的第几页。
> - 虚拟页偏移（Virtual Page Offset），虚拟内存的页内偏移，一页中的第几个字节。
> - 物理页号（Physical Page Number），一页通常是 4K，VPN 表示在物理内存的第几页。
> - 物理页偏移（Physical Page Offset），物理内存的页内偏移，一页中的第几个字节。

一个物理地址，实际上是物理页号+偏移值构成的，当我们要访问某一块内存时候，会使用虚拟页号（VPN）去页表找到真实的物理页号（PPN），通过虚拟页偏移（VPO）找到真实的物理地址。

#### 3.物理页

物理页也被称为页帧，和虚拟页类似，只不过物理页是构成内存的

#### 4.页表

操作系统为每个进程提供一个页表，多个进程对应多个页表。页表保存了物理地址，虚拟内存的地址能够找到物理内存的地址，就是通过页表映射的。

需要说明的是

- 当我们要访问 p 地址对应的内存时候，操作系统会检查地址是否在虚拟内存的当前进程中，操作系统不允许访问其他进程的私有内存。
- 存在多级页表。
- 页表有操作系统维护，分配内存时填写响应的页表项，释放内存清除响应的页表项，程序退出释放它的页表。
- 有一种特殊情况，高速缓存和主存都没有找到，那么此时说明物理页在磁盘中。一般这种情况是爆内存了，主存不足以存放得下，那么把一部分不常用的内存放进磁盘。由于磁盘读写比较慢的原因，导致访问会卡顿。

### 总结

为了在多进程环境下，使得进程之间的内存地址不受影响，相互隔离，于是操作系统就为每个进程独立分配一套**虚拟地址空间**，每个程序只关心自己的虚拟地址就可以，实际上大家的虚拟地址都是一样的，但分布到物理地址内存是不一样的。作为程序，也不用关心物理地址的事情。

每个进程都有自己的虚拟空间，而物理内存只有一个，所以当启用了大量的进程，物理内存必然会很紧张，于是操作系统会通过**内存交换**技术，把不常使用的内存暂时存放到硬盘（换出），在需要的时候再装载回物理内存（换入）。

那既然有了虚拟地址空间，那必然要把虚拟地址「映射」到物理地址，这个事情通常由操作系统来维护。

那么对于虚拟地址与物理地址的映射关系，可以有**分段**和**分页**的方式，同时两者结合都是可以的。

内存分段是根据程序的逻辑角度，分成了栈段、堆段、数据段、代码段等，这样可以分离出不同属性的段，同时是一块连续的空间。但是每个段的大小都不是统一的，这就会导致内存碎片和内存交换效率低的问题。

于是，就出现了内存分页，把虚拟空间和物理空间分成大小固定的页，这样就不会产生细小的内存碎片。同时在内存交换的时候，写入硬盘也就一个页或几个页，这就大大提高了内存交换的效率。

再来，为了解决简单分页产生的页表过大的问题，就有了**多级页表**，它解决了空间上的问题，但这就会导致 CPU 在寻址的过程中，需要有很多层表参与，加大了时间上的开销。于是根据程序的**局部性原理**，在 CPU 芯片中加入了 **TLB**，负责缓存最近常被访问的页表项，大大提高了地址的转换速度。
