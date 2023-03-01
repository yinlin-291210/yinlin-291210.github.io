---
layout: post
title: "理解原型对象"
subtitle: "JS Prototype"
date: 2023-03-01 21:51:27
author: linbao
header-img:
catalog: true
tags:
  - js
---

# 理解原型对象

## 一、创建对象的一种方式---原型模式

### 1、什么是原型模式？为什么要使用原型模式

​ 我们创建的每一个函数都有一个**prototype**（原型）属性，这个属性是一个指针，指向一个对象，而这个对象的用途是包含可以由特定类型的所有实例共享的属性和方法。如果按照字面意思来理解，那么，**prototype**就是通过调用构造函数而创建的那个对象实例的原型对象。使用原型对象的好处就是可以让所有对象实例共享它所包含的属性和方法。换句话说，就是不必在构造函数中定义对象实例的信息，而是可以将这些信息直接添加到原型对象中。

​ **原型模式创建对象的例子：**

```
function Fish(){

}
Fish.prototype.name='米奇'
Fish.prototype.color='red'
Fish.prototype.width='10'
Fish.prototype.sayName=function(){
	alert(this.name)
}

let fish1 = new Fish()
fish1.sayName() // "米奇"

let fish2 = new Fish()
fish2.sayName() // "米奇"

console.log(fish1.sayName == fish2.sayName) //true
```

例子解析：
我们将**sayName()**方法以和所有属性直接添加到了 **Fish** 的 **prototype** 属性中，构造函数变成了空函数。即使如此，也仍然可以通过调用构造函数来创建新对象，而且新对象还会具有相同的属性和方法，但与构造函数模式不同的是，新对象的这些属性和方法是又所有实例共享的。换句话说，**fish1**和**fish2**访问的都是同一组属性和同一个**sayName**函数。

### 2、原型模式工作原理

#### 2.1 理解原型对象

​ 无论什么时候，只要创建了一个新的函数，就会根据一组特定的规则（特定规则是什么？）为该函数创建一个**prototype**属性，这个属性指向函数的原型对象。在默认情况下（非默认情况下是什么样子？），所有原型对象都会自动获得一个**constructor**属性，这个属性是一个指向**prototype**属性所在函数的指针。那前面例子来说，**Fish.prototype.constructor**指向**Fish**。而通过这个构造函数，我们还可以继续为原型对象添加其他的属性和方法。

​ 创建了自定义的构造函数之后，其原型对象默认只会取得 **constructor** 属性；至于其他方法，则都是从**Object**继承过来的。当调用构造函数创建一个实例后，该实例的内部将包含一个指针（内部属性），指向构造函数的原型对象。**ECMA-262** 第 5 版中管这个属性叫做 `[[Prototype]]` 。虽然在脚本中没有标准的方式访问 `[[Prototype]]` ，但 Firefox、safari 和 chrome 在每个对象上都支持一个属性 `__proto__` ；而在其他实现中，这个属性对于脚本则是完全不可见的。不过，要明确的真正重要的一点就是：这个连接存在于实例与构造函数的原型对象之间，而不是存在于实例与构造函数之间。

​ 以刚才的 **Fish** 构造函数 和 **Fish.prototype** 创建实例的代码为例，下图表示了各个对象之间的关系：

​
![](/img/in-post/js-prototype/%E5%8E%9F%E5%9E%8B%E5%AF%B9%E8%B1%A1.png)

上图展示了**Fish** 构造函数、**Fish** 的原型属性以及 **Fish** 现有的两个实例之间的关系，在此，**Fish.prototype** 指向了原型对象，而 **Fish.prototype.constructor** 又指回了 **Fish** 。**fish1** 和 **fish2** 都包含除 **constructor** 属性之外，还包括后来添加的其他属性。**Fish** 的每个实例——**fish1**和**fish2** 都包含一个内部属性，该属性仅仅指向了 **Fish.prototype** ；换句话说，他们与构造函数没有直接的关系，此外，要格外注意的是，虽然这两个实例都不包含属性和方法，但我们却可以正常调用 **fish1.sayName()** 。这是通过查找对象属性过程来实现的。

```

```

​ 虽然在所有实现中，都无法访问到`[[Prototype]]`,但是我们可以通过 **isPrototypeOf()** 方法来确定对象之间是否存在着这种关系，从本质上来讲，如果 `[[Prototype]]` 指向调用 **isPrototypeOf()** 方法的对象，那么这个方法就会返回 **true**;

```
alert(Fish.prototype.isPrototypeOf(fish1))//true
alert(Fish.prototype.isPrototypeOf(fish2))//true
```

​ （看上图解答）因为**fish1**跟**fish2**内部都有一个指向 Fish.prototype 的指针，因此都返回了**true**;

在 ES5 中，新增加了一个方法，**Object.getPrototypeOf()** ,这个方法会返回 `[[Prototype]]` 的值，

```
alert(Object.getPrototypeOf(fish1) == Person.prototype)//true
alert(Object.getPrototypeOf(fish1).name)//"米奇"
```

​ 每当代码读取某个对象的某个属性时，都会执行一次搜索，目标是具有给定名字的属性，搜索首先是从**对象实例本身开始** 如果有，就返回，如果没有，则继续搜索指针指向的原型对象，就这样一层一层向上找。

​ 虽然可以通过对象实例访问保存在原型中的值，但却不能通过对象实例重写原型中的值，如果我们在实例中添加了一个属性，并且这个属性与实例原型中的一个属性同名，那么实例原型中的那个对应的属性就会被屏蔽（只针对当前实例而言是屏蔽）。

#### 2.2 原型的动态性

​ 由于在原型中查找值的过程是一次搜索，因此我们对原型对象所作的任何修改，都能立即从实例的行为或属性上反应出来——即使是先创建了实例后修改原型，也照样如此。

```
function Fish(){

}
var fish1 = new Fish()
Fish.prototype.sayName = function(){
	alert("斑马")
}
fish1.sayName()//“斑马”
```

​ 由于实例与圆形之间的松散的连接关系，当我们调用 fish1.sayName()方法时，首先会在实例中搜索，在没有找到的情况下，会继续搜索原型，因为实例与原型之间的连接只不过是一个指针，而非一个副本。因此就可以在原型中找到新的 sayName 属性，并返回存在这里的函数。

​ 尽管可以随时为原型添加属性和方法，并且修改能够立即在所有对象实例中反应出来，但是如果重写了整个原型对象，那么情况就不一样了。我们刚才说了，在调用构造函数的时候，会为实例添加一个指向最初原型的 `[[ Prototype ]]` 指针，而把原型修改为另外一个对象就等于切断了构造函数与最初原型之间的联系，请大家记住：实例中的指针仅仅指向原型对象，而不指向构造函数，看下面这个例子：

```
function Fish(){

}
var fish1 = new Fish()

Fish.prototype = {
	constructor:Fish,
	name:'孔雀',
	color:'blue',
	sayName:function(){
		alert(this.name)
	}
}

fish1.sayName()//报错
```

原因如图

![](/img/in-post/js-prototype/%E9%87%8D%E6%96%B0.png)

#### 2.3 原型对象的问题

​ 原型模式也不是没有缺点，首先，它省略了为构造函数初始化参数这一环节，结果所有实例在默认情况下都将取得相同的属性值，虽然这会在某种程度上带来一些不方便，但还不是原型的最大问题，原型模式的最大问题是由其共享的本性导致的。

​ 原型中所有属性是被很多实例共享的，这种共享对于函数非常合适，对于那些包含基本值得属性倒也说的过去，毕竟可以通过添加一个同名属性来屏蔽原型对象中得属性，然后，对于包含引用类型得属性来说，问题就比较突出了。

```
function Fish(){

}
Fish.prototype = {
	constructor:Fish,
	name:'月光',
	color:['red','yellow'],

	sayName:function(){
		alert(this.name)
	}
}

var fish1 = new Fish()
var fish2 = new Fish()

fish1.color.push('white');
console.log('fish1.color',fish1.color)
console.log('fish2.color',fish2.color)
console.log(fish1.color == fish2.color)
```

正因为这个原因的存在，所有一般都不单独使用原型模式，而是通过组合使用构造函数模式和原型模式来创建自定义对象。构造函数模式用于定义实例属性，而原型模式用于定义方法以及共享的属性，结果就是，每个实例都会有自己的一份实例属性的副本，但同时又共享着对方法的引用，最大限度的节省了内存，另外，这种混合模式还支持向构造函数中传参，集两者之长

```
function Fish(name){
	this.name = name;
	this.color=['red','yellow']
}
Fish.prototype={
	constructor:Fish,
	sayName:function(){
		alert(this.name)
	}
}
var fish1 = new Fish('月光');
var fish2 = new Fish('孔雀');
fish1.color.push('white')
console.log("fish1.color",fish1.color)
console.log("fish2.color",fish2.color)
```

#### 总结

总体来看，原型模式，很适合行为以及包含基本值得属性的共享，但是不太适合引用类型值得共享，所以，在我们平时开发使用原型模式得时候，最好是将它与构造函数模式结合起来使用，这样就能够最大限度得规避这些缺点，同时也最大限度得节省了内存
