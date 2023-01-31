---
layout: post
title: "虚拟 dom 与模板引擎"
subtitle: "virtual dom and template engine"
date: 2023-01-31 17:50:28
author: linbao
header-img:
catalog: true
tags:
  - vue
  - virtual-dom
---

# 虚拟 dom 与模板引擎

## 一、前言

> Q：我们在了解虚拟 dom 之前先思考一个前置问题，为什么 dom 操作非常消耗性能？

我们先来对比一下这两段代码哪个快

```javascript
const dom = document.createElement("div");

// 操作数据
console.time("操作数据");
let res = 0;
for (let i = 0; i <= 1e4; i++) {
  res = i;
}
dom.innerHTML = res;
console.timeEnd("操作数据");

// 操作dom
console.time("操作dom");
for (let i = 0; i <= 1e4; i++) {
  dom.innerHTML = i;
}
console.timeEnd("操作dom");
```

答案：
![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221004-eyihc.png)

> 可以看到操作 dom 消耗的时间远比操作数据要多得多，至于为什么，我们先来了解下 dom 操作在浏览器中的执行过程：

![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221004-2g2qg.png)

由此可见 dom 操作在浏览器中其实经历了一个很复杂的过程，那么在此基础上，在 js 上是否有好的方案能够应对 dom 问题呢？

其实上面的案例已经有答案了，如果**让 js 尽量去缓存必要的数据，更新界面时只更新与当前 dom 的数据差异，不就减少了 dom 操作吗？**

在这个思想下，就诞生了虚拟 dom

ps：防抖与节流就是遵循了这个思想，因为读 dom 也是一种 dom 操作

## 二、数据转视图

在讲虚拟 dom 之前，我们再讲一个概念：数据转视图，数据转视图顾名思义就是将我们获取到的数据输出到页面里展示给用户
![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221005-bzlve.png)

在没有虚拟 dom 的时代，将数据转换为视图主要有三种方案

- 纯 dom 操作法（如上文所说效率很低，但很稳定）

```javascript
for (let i = 0; i < arr.length; i++) {
  let li = document.createElement("li");
  let hdDiv = document.createElement("div");
  hdDiv.classList.add("hd");
  hdDiv.innerText = arr[i].name + "的基本信息";

  let bdDiv = document.createElement("div");
  bdDiv.classList.add("bd");
  for (let key in arr[i]) {
    let str = "";
    let value = arr[i][key];
    if (key === "name") {
      str = "姓名：" + value;
    } else if (key === "age") {
      str = "年龄：" + value;
    } else {
      str += "性别：" + value;
    }
    let p = document.createElement("p");
    p.innerText = str;
    bdDiv.appendChild(p);
  }
  li.appendChild(hdDiv);
  li.appendChild(bdDiv);
  list.appendChild(li);
}
```

- 数组 join 法(为了解决`''`无法换行的问题采用 join 拼接 html，后来 es6 有了反引号)

```javascript
let htmlStr = "";
for (let i = 0; i < arr.length; i++) {
  let str = [
    "<li>",
    '<div className="hd">' + arr[i].name + "的基本信息</div>",
    '<div className="bd">',
    "<p>姓名：" + arr[i].name + "</p>",
    "<p>年龄：" + arr[i].age + "</p>",
    "<p>性别：" + arr[i].sex + "</p>",
    "</div>",
    "</li>",
  ].join("");
  htmlStr += str;
}
list.innerHTML = htmlStr;
```

> 这种方法不错，但扩展性不好，是一个萝卜一个坑的解法，如果换种展示方式，那就要做重复性劳动

- es6 反引号法，和 join 法类似，缺点也一样

## 三、介绍 [mustache](https://github.com/janl/mustache.js)

- 模板引擎是第四种解决方案，首先由 mustache 提出并实现，mustache 是“胡子”的意思，因为它的嵌入标记`{{ }}`非常像胡子，mustache 的默认模板`{{ }}`后来也被 vue 沿用。
- mustache.js 是一个简单强大的 JavaScript 模板引擎，使用它可以简化在 js 代码中的 html 编写，它最重要的成就是想到用虚拟 dom 去优化 dom 问题。

![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221023-rp86l.png)
转换为虚拟 DOM 树：
![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221023-xvwox.png)

- 虚拟 dom 为后续模板引擎的发展提供了崭新的思路，个人理解它的实现方式有点像 AST 语法树，可以理解成 html 版的 AST 语法树，实现模板引擎的过程是不是也可以反推别的语言/**协议**的 AST 语法树实现。

### 使用方法

- 基本使用

```javascript
let templateStr = `<h1>我买了{{thing}}，很{{mood}}</h1>`;
let data = {
  thing: "手机",
  mood: "开心",
};

let domStr = Mustache.render(templateStr, data);
// <h1>我买了手机，很开心</h1>
console.log(domStr);
```

- 数组

```javascript
let templateStr = `
  <ul>
    {{#arr}}
      <li>{{.}}</li> 
    {{/arr}}
  </ul>`;
let data = {
  arr: ["A", "B", "C"],
};

let domStr = Mustache.render(templateStr, data);
/** 
  <ul>
     <li>A</li> 
     <li>B</li> 
     <li>C</li> 
  </ul>;
*/
console.log(domStr);
```

- 对象数组（如果是对象数组，可以直接使用对象中的属性）

```javascript
let templateStr = `
    <ul>
      {{#arr}}
        <li>
          <div class="hd">{{name}}的基本信息</div>
          <div class="bd">
            <p>姓名：{{name}}</p>
            <p>年龄：{{age}}</p>
            <p>性别：{{sex}}</p>
          </div>
        </li>;
      {{/arr}}
    </ul>`;

// 数据对象
let data = {
  arr: [
    { name: "小明", age: 12, sex: "男" },
    { name: "小红", age: 11, sex: "女" },
    { name: "小王", age: 13, sex: "男" },
  ],
};
let domStr = Mustache.render(templateStr, data);
console.log(domStr);
```

![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221024-qagpj.png)

- etc...

> 可以看到使用起来非常简单，不仅使用简单，还 follow 了减少 dom 操作的原则，在当时是具有革命性的。

### 模板引擎实现思路

> 模板引擎的实现总的来说就两步：  
> 一、将 html DOM 结构转换为 `tokens` 这样的树状结构，即虚拟 dom。
>
> 二、配合数据解析 `tokens`，将数据放入模板位置，再返回 html DOM 结构。
>
> **我认为可以联想到编译时和运行时**，尤其第一步，很像编译时的构建 AST 语法树。

## 四、模板引擎的具体实现

**注意：** 以下实现基于自己对模板引擎的理解，虽然也是分为上述两大步实现，但具体实现细节和 mustache 官方不一样，希望大家以高度怀疑的态度去听我的分享。

![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221025-9w014.png)

### 我们来看一下每一步的具体逻辑

#### 一、html =>虚拟 dom

1. 将字符串传入解析器，扫描出最近的需要被解析的匹配规则

```typescript
/**
 * 找出tail中最近的需要解析的匹配规则
 * @returns 可能tail中全是一般字符串，返回就是undefined
 */
confirmRe(): KeyType | undefined {
  const str = this.tail;
  const { reMap } = compilerAttributes;
  return [...reMap.keys()]
    .sort((a, b) => {
      const indexA =
        str.search(reMap.get(a)) === -1 ? 2 ** 53 : str.search(reMap.get(a));
      const indexB =
        str.search(reMap.get(b)) === -1 ? 2 ** 53 : str.search(reMap.get(b));
      return indexA - indexB;
    })
    .shift();
}
```

2. 将字符串中的匹配部分截取出去，并将结果放入`Writer`

```typescript
// 根据匹配规则和当前tail截取出要被转成vNode的字符串，再将tail的这部分截出去
scanUtil(re: RegExp) {
  const match: RegExpMatchArray | { index: number } = this.tail.match(re) || {
    index: -1,
  };
  // index为被匹配到的字符串的起始位置
  const index = match.index!;
  let cutIndex = 0;
  let value = "";
  switch (index) {
    // -1说明tail都是一般字符串，可以直接结束迭代
    case -1:
      value = this.tail;
      this.tail = "";
      return value;
    // 0说明是tail是<div>xxxx这样的情况，需要被截取的字符串就该是<div>
    case 0:
      cutIndex = (match as RegExpMatchArray)[0].length;
      break;
    /** index!==0说明前面有普通字符串，设置cutIndex为index
     * 比如：xxxx<div>，需要被截取的字符串就该是xxxx
     */
    default:
      cutIndex = index;
  }
  value = this.tail.substring(0, cutIndex);
  this.tail = this.tail.substring(cutIndex);
  return value;
}

// 将scanUtil截取出的字符串和对应属性传入writer
writer.buildTokens(match, currentKey);
```

3. `Writer`根据字符串和对应属性解析成`vNode`对象

```typescript
/**
 * @param value 需要被解析的字符串
 * @param currentKey 字符串对应的类型
 * @returns 虚拟节点vNode
 */
private strToToken(value: string, currentKey?: KeyType): VNode<KeyType> {
  const basicVnode: BasicVNode = {
    value,
    from: this.fromIndex,
    end: this.fromIndex + value.length - 1,
  };
  let vNode = getVnode(basicVnode);
  let $1;
  if (currentKey) {
    $1 = value.match(compilerAttributes.reMap.get(currentKey)!)!;
  }
  if ($1) {
    vNode.type = currentKey;
    if (currentKey !== KeyType.KEY_END) {
      /** 这段逻辑用于解析标签或模板上附带的属性，
      如: <div class='class' id = 'id' >上的class和id
      */
      const attributes = $1[1].split(" ");
      const topName = attributes.shift()!;
      const props: {
        [key: string]: any;
      } = {};
      attributes.forEach((attribute: string) => {
        const [key, value] = attribute.split("=");
        if (!value) {
          props[key] = true;
        } else {
          props[key] =
            value === "false"
              ? false
              : value === "true"
              ? true
              : value.replace(/"|'/g, "");
        }
      });
      switch (currentKey) {
        case KeyType.KEY_LABEL:
        case KeyType.KEY_LABEL2:
          vNode = getVnode({
            ...basicVnode,
            label: topName,
            props,
          });
          break;
        case KeyType.KEY_ARR:
        case KeyType.KEY_NAME:
          vNode = getVnode({
            ...basicVnode,
            name: topName,
            props,
          });
          break;
      }
    }
  }
  // 如果没有匹配结果，说明是一般字符串
  else {
    vNode = getVnode({
      ...basicVnode,
      type: KeyType.KEY_TEXT,
      content: value,
    });
  }
  this.fromIndex = vNode.end + 1;
  return vNode;
}
```

![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221026-0yujx.png)
![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221026-pqgld.png)

4. `Writer`根据栈将`vNode`对象写进`tokens`中（关键）

> 思考：我们现在有一个`tokens`对象，有一个待放入`tokens`的`vNode`节点，我们该如何知道该节点要放在`tokens`的哪个位置呢？
> 答案：栈！根据开始标签入栈，根据闭合标签出栈，利用栈的先进后出去描述生成树的过程。

```typescript
/**
 * 利用栈的先进后出描述构建树的过程，根据开始标签入栈，根据闭合标签出栈
 * @param token 被strToToken解析出来的虚拟节点对象
 */
private spliceTokens(token: VNode<KeyType>) {
  /** 当前tokens最大深度 */
  const treeDepIndex = this.treeDep.length - 1;
  /** token应挂载位置 */
  const index = this.treeDep[treeDepIndex];
  /** 最大深度为0，直接挂载到最外层 */
  if (!treeDepIndex) {
    this.tokens[index] = token;
  } else {
    let fa = this.tokens[this.treeDep[0]] as any;
    for (let i = 1; i < treeDepIndex; i++) {
      fa = fa.childrens![this.treeDep[i]];
    }
    fa.childrens = fa.childrens || {};
    if (token.type === KeyType.KEY_END) {
      // 校验闭标签
      const endRe = compilerAttributes.reMap.get(token.type);
      const endMatch = token.value.match(endRe!)!;
      let needError = false;
      switch (fa.type) {
        case KeyType.KEY_LABEL:
          if (endMatch[1] !== fa.label) {
            needError = true;
          }
          break;
        case KeyType.KEY_ARR:
          if (endMatch[2] !== fa.name) {
            needError = true;
          }
          break;
      }
      if (needError) {
        new TagErrorHandle()
          .getError({
            tagName: "EndTag",
            value: token.value,
            from: token.from,
            end: token.end,
          })
          .show();
      }
      fa.endValue = token.value;
    } else {
      fa.childrens[index] = token;
    }
  }
  /** 操作栈准备下次迭代 */
  switch (token.type) {
    /** 开始标签入栈 */
    case KeyType.KEY_LABEL:
    case KeyType.KEY_ARR:
      this.treeDep.push(0);
      break;
    /** 闭标签出栈，出栈后最大深度值+1 */
    case KeyType.KEY_END:
      this.treeDep.pop();
      this.treeDep[treeDepIndex - 1] += 1;
      break;
    /** 未进栈的节点，有隐形出入栈的动作，需要将最大深度值+1 */
    default:
      this.treeDep[treeDepIndex] += 1;
  }
}
```

5. 重复第一步，直到`tail`为空字符串，最后生成`tokens`

```typescript
// 迭代重复上述操作
while (this.tail) {
  const currentKey = this.confirmRe();
  let currentRe = new RegExp(Compiler._neverRe);
  if (currentKey) {
    currentRe = compilerAttributes.reMap.get(currentKey)!;
  }
  const match = this.scanUtil(currentRe);
  writer.buildTokens(match, currentKey);
}
```

最终的`tokens`:
![](/img/in-post/virtual-dom-and-template-engine/clipboard-202207221026-pa95h.png)

#### 二、虚拟 dom+data => html

1. 根据`tokens`和`data`递归构建`result`

```typescript
// 核心代码

/**
 * 递归拼接result
 * @param token 当前叶子节点
 * @param data 叶子节点应对应的数据
 * @param fromArray 上级节点中是否有数组节点，如果有需要做特殊处理
 */
private recurseToken(token: any, data: any, fromArray = false) {
  if (!token) {
    return;
  }
  const recurse = (data: any) => {
    for (let i in token.childrens || {}) {
      this.recurseToken(token.childrens[i], data, true);
    }
  };
  switch (token.type) {
    case KeyType.KEY_ARR:
      const arr = this.getData(token.name!, data);
      if (arr) {
        if (arr instanceof Array) {
          for (let i = 0; i < arr.length; i++) {
            recurse(arr[i]);
          }
        } else {
          new TypeErrorHandle()
            .getError({
              name: "arr",
              supposed: "Array",
              nowType: typeof arr,
            })
            .show();
        }
      }
      break;
    case KeyType.KEY_NAME:
      let replaceData = this.getData(token.name!, data);
      if (token.name === "." && fromArray) {
        replaceData = data;
      }
      this.result += token.value.replace(
        compilerAttributes.reMap.get(token.type)!,
        replaceData || ""
      );
      break;
    default:
      this.result += token.value;
      recurse(data);
  }
  if (token.endValue && token.type !== KeyType.KEY_ARR) {
    this.result += token.endValue;
  }
}
```

## 五、展望与思考

1. 未来需要给这个轮子添加单元测试。
2. 相对于 vue 来说还有很多功能未实现，模板引擎只是第一步，还需要考虑自定义事件，自定义属性，指令。。。
3. 在虚拟 dom 基础上，模板引擎暂时还未实现上文所说的只更新数据差异，还需要带入 diff 算法的思想。
4. 思考一下：递归是最好的构建 html 的算法吗？
5. 再思考一下：虚拟 dom 是优化 dom 操作的最好方案吗？

## 六、总结

> 第一次造轮子，有一说一过程挺艰辛的，还有很多工作未做，但造出来之后的成就感是很强的，我认为造轮子最重要的不是结果，而是过程，享受造轮子的过程对我而言是最快乐的事情，希望大家也能勇于尝试，在自己喜欢的领域享受快乐。
