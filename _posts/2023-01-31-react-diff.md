---
layout: post
title: "浅谈 ReactVueInferno 在 DOM Diff 算法上的异同"
subtitle: "thinking react diff with vue and interferno"
date: 2023-01-31 17:41:22
author: linbao
header-img: "img/post-bg-2015.jpg"
catalog: true
tags:
  - react
  - vue
  - front-end
---

# 浅谈 ReactVueInferno 在 DOM Diff 算法上的异同

## 一、引言

![](/img/in-post/react-diff/1.jpg)

在现代的前端渲染框架中，Virtual DOM 几乎已经成了标配，通过这样一个缓冲层，我们已经能够实现对 Real DOM 的最少操作，在大家的广泛认知中，操作 DOM 是比较慢的，因此 Virtual DOM 可以实现应用程序的性能提升。

毫无疑问，Virtual DOM 不可能全量同步到 Real DOM，因为那样就违背了设计 Virtual DOM 的初衷，那么 Virtual DOM 同步到 Real DOM 的操作就称之为 DOM Diff，顾名思义，计算两个 DOM Tree 之间的差异性，增量更新 Real DOM。更新动作的原则是，能复用的节点绝不删除重新创建。

不同框架对于 DOM Diff 的理解并不完全一致，但有一点可以达成共识：由于 DOM 本身是树形（Tree）结构，不同层级之间的节点（Node）没有必要对比，因为这可能会带来 O(N³) 的计算复杂度，很可能还不如直接操作 Real DOM 来的快。因此，狭义的 DOM Diff 算法，一般指的是同一层级兄弟节点的范围之内。

本文，我就对典型的几种 DOM Diff 实现进行简单的介绍，并分析潜在的陷阱，以便从原理上理解并更好地使用相应的框架。

## 二、实现简介

### React

![](/img/in-post/react-diff/2.jpg)

大多数开发者都是从 React 上才第一次接触到 Virtual DOM 这个概念的，虽然并非是它发明的。在几年前 Angular 1.x 大热的时候，“脏检查”的原理几乎成为了每一次面试的必考题目。很快，“脏检查”带来的性能上的瓶颈并很快显现出来，除了“饿了么”等少数产品之外，鲜有团队敢于在 C 端系统上部署 Angular，它更多成为了后台系统的效率利器，甚至有很多后端开发者也拥有了编写后台前端的能力，因此 Angular 带来的开发效率上的提升还是相当值得肯定的。

在大多数人的印象里，带来性能革命的就是 React，连带的 JSX、Virtual DOM 都成为了日后开发者耳熟能详的概念。现在我们就来了解一下 React 是如何实现 DOM Diff 的。

![](/img/in-post/react-diff/3.jpg)

假设在 Real DOM 中存在下面这几个兄弟节点：【A、B、C、D、E、F、G】，而现在 Virtual DOM 中是 【D、A、G、F、K、E】。显然，除了顺序打乱了之外，移除了 B 节点和 C 节点，新增了 K 节点。我们来一步一步演示 React 的 DOM Diff 算法。

- 遍历 Virtual DOM。
  - 首先，第 1 个节点除非要被移除，否则不会被移动，于是首节点 D 不动。
  - 遍历到节点 A，在 Real DOM 中节点 A 在节点 D 之前，与 Virtual DOM 中的先后顺序不同，因此我们把节点 A 移动到节点 D 之后（这里使用了 DOM 元素的 insertBefore 方法）。这是第 1 次操作 DOM，此时 Real DOM 为 【B、C、D、A、E、F、G】。
  - 遍历到节点 G，由于在 Real DOM 中节点 G 在节点 A（上一个遍历到的节点）之后，与 Virtual DOM 顺序相同，因此不动。
  - 遍历到节点 F，由于在 Real DOM 中节点 F 在节点 G（上一个遍历到的节点）之前，与 Virtual DOM 顺序不同，因此我们把节点 F 移动到节点 G 之后。这是第 2 次操作 DOM，此时 Real DOM 为 【B、C、D、A、E、G、F】。
  - 遍历到节点 K，在 Real DOM 中不存在 K 节点，我们创建它，并放在节点 F（上一个遍历到的节点）之后。这是第 3 次操作 DOM，此时 Real DOM 为 【B、C、D、A、E、G、F、K】。
  - 遍历到节点 E，由于节点 K（上一个遍历到的节点）是新创建的节点，因此我们直接把节点 E 移动到节点 K 之后。这是第 4 次操作 DOM，此时 Real DOM 为 【B、C、D、A、G、F、K、E】。
- 遍历 Real DOM
  - 移除节点 B 和节点 C。第 5、6 次操作 DOM，Real DOM 为【D、A、G、F、K、E】。

![](/img/in-post/react-diff/4.jpg)

一共操作了 6 次 DOM，完成了这次 DOM Diff。

我们假设如果不使用 Virtual DOM，那么所有 DOM 节点都需要移除和重新创建，一共 13 次 DOM 操作，显然我们有了 50%以上的效率提升。

我们言简意赅地总结一下 React 的 DOM Diff 算法的关键逻辑。

- Virtual DOM 中的首个节点不执行移动操作（除非它要被移除），以该节点为原点，其它节点都去寻找自己的新位置；
- 在 Virtual DOM 的顺序中，每一个节点与前一个节点的先后顺序与在 Real DOM 中的顺序进行比较，如果顺序相同，则不必移动，否则就移动到前一个节点的前面或后面

于是，如果不考虑节点的移除和创建，我们可以推导出什么样的重新排序对这套 DOM Diff 算法最不利。最不利的结果无非就是除了首个节点外，其它所有节点都需要移动，对于有 N 个节点的数组，总共移动了 N-1 次。

考虑这个序列【A、B、C、D】，如果想变成【D、C、B、A】，应该是什么样的过程：

- 节点 D 是首个节点，不执行移动。
- 节点 C 移动到节点 D 后面：【A、B、D、C】；
- 节点 B 移动到节点 C 后面：【A、D、C、B】；
- 节点 A 移动到节点 B 后面：【D、C、B、A】。

![](/img/in-post/react-diff/5.jpg)

一共 3 步，正是 N-1。所以，可以确定的是，如果末尾的节点移动到了首位，就会引起最不利的 DOM Diff 结果。

我们用另一个例子验证一下，这个序列【A、B、C、D】，变成【D、A、B、C】。我们一眼看上去就知道，只要把节点 D 移动到首位就可以了，但是我们看 React 它会怎么做：

- 节点 D 是首个节点，不执行移动。
- 节点 A 移动到节点 D 后面：【B、C、D、A】；
- 节点 B 移动到节点 A 后面：【C、D、A、B】；
- 节点 C 移动到节点 B 后面：【D、A、B、C】。

![](/img/in-post/react-diff/6.jpg)

还是 N-1，可见首个节点不执行移动这个特性，导致了只要把末尾节点移动到首位，就会引起 N-1 这种最坏的 DOM Diff 过程，所以大家要尽可能避免这种重排序。

### Vue

![](/img/in-post/react-diff/7.jpg)

Vue 的起步晚于 React，但被广大开发者接受的更迅速。事实上，Vue 并不能与 React 完全等价。React 只是专注于数据到视图的转换，而 Vue 则是典型的 MVVM，带有双向绑定。当然 Vue 还具备更人性化、更方便的的工程化开发框架，这也是它为什么更容易被接受的原因，不过本文不做讨论。

Vue 并未完全自主开发一套 Virtual DOM，而是借鉴了另一个开源库 snabbdom，其核心算法逻辑代码请参考https://github.com/snabbdom/snabbdom/blob/v0.7.3/src/snabbdom.ts#L179。

下面我们还是用之前的例子来演示这套 DOM Diff 是如何运作的，由【A、B、C、D、E、F、G】转换成【D、A、G、F、K、E】。

设定 4 个指针 OS（OldStart）、OE（OldEnd）、NS（NewStart）、NE（NewEnd），分别指向这两个序列的头尾。

| A   | B   | C   | D   | E   | F   | G   |
| --- | --- | --- | --- | --- | --- | --- |
| ↓   |     |     |     |     |     | ↓   |
| OS  |     |     |     |     |     | OE  |

| D   | A   | G   | F   | K   | E   |
| --- | --- | --- | --- | --- | --- |
| ↓   |     |     |     |     | ↓   |
| NS  |     |     |     |     | NE  |

现在我们来交叉比较，看有没有相同的。如果 OS 或 OE 与 NS 相同，则移动到 NS 的位置，如果 OS 或 OE 与 NE 相同，则移动到 NE 的位置。如果都没有相同的，则在 Real DOM 中找到 NS 的元素，移动到 NS 位置。

可见，【A，G】与【D，E】没有相同的，那么就找到 D 元素，移动到 NS 的位置。这是第 1 次操作 DOM，此时 Real DOM 为 【D、A、B、C、E、F、G】，NS++，OS++，现在 4 个指针的指向为：

| D   | A   | B   | C   | E   | F   | G   |
| --- | --- | --- | --- | --- | --- | --- |
|     | ↓   |     |     |     |     | ↓   |
|     | OS  |     |     |     |     | OE  |

| D   | A   | G   | F   | K   | E   |
| --- | --- | --- | --- | --- | --- |
|     | ↓   |     |     |     | ↓   |
|     | NS  |     |     |     | NE  |

然后开始第二轮比较，显然 OS 与 NS 都是 A，相同，不用执行任何移动操作，OS++，NS++，现在 4 个指针的指向为：

| D   | A   | B   | C   | E   | F   | G   |
| --- | --- | --- | --- | --- | --- | --- |
|     |     | ↓   |     |     |     | ↓   |
|     |     | OS  |     |     |     | OE  |

| D   | A   | G   | F   | K   | E   |
| --- | --- | --- | --- | --- | --- |
|     |     | ↓   |     |     | ↓   |
|     |     | NS  |     |     | NE  |

现在开始第三轮比较，显然 OE 与 NS 都是 G，相同，现在需要把 OE 移动到 NS 的位置。这是第 2 次操作 DOM，此时 Real DOM 为 【D、A、G、B、C、E、F】，OE–，NS++，现在 4 个指针的指向为：

| D   | A   | G   | B   | C   | E   | F   |
| --- | --- | --- | --- | --- | --- | --- |
|     |     |     | ↓   |     | ↓   |     |
|     |     |     | OS  |     | OE  |     |

| D   | A   | G   | F   | K   | E   |
| --- | --- | --- | --- | --- | --- |
|     |     |     | ↓   |     | ↓   |
|     |     |     | NS  |     | NE  |

现在开始第四轮比较，显然 OE 与 NS 都是 F，相同，现在需要把 OE 移动到 NS 的位置。这是第 3 次操作 DOM，此时 Real DOM 为 【D、A、G、F、B、C、E】，OE–，NS++，现在 4 个指针的指向为：

| D   | A   | G   | F   | B   | C   | E   |
| --- | --- | --- | --- | --- | --- | --- |
|     |     |     |     | ↓   |     | ↓   |
|     |     |     |     | OS  |     | OE  |

| D   | A   | G   | F   | K   | E   |
| --- | --- | --- | --- | --- | --- |
|     |     |     |     | ↓   | ↓   |
|     |     |     |     | NS  | NE  |

现在开始第五轮比较，显然 OE 与 NE 都是 E，相同，不用执行任何移动操作，OE–，NE–，现在 4 个指针的指向为：

| D   | A   | G   | F   | B   | C   | E   |
| --- | --- | --- | --- | --- | --- | --- |
|     |     |     |     | ↓   | ↓   |     |
|     |     |     |     | OS  | OE  |     |

| D   | A   | G   | F   | K       | E   |
| --- | --- | --- | --- | ------- | --- |
|     |     |     |     | ↓       |     |
|     |     |     |     | NS = NE |     |

现在开始第六轮比较，显然 NS（或 NE）指向的 K 在 Real DOM 中并不存在，因此我们创建节点 K，这是第 4 次操作 DOM，此时 Real DOM 为 【D、A、G、F、K、B、C、E】，NS++，现在 4 个指针的指向为：

| D   | A   | G   | F   | K   | B   | C   | E   |
| --- | --- | --- | --- | --- | --- | --- | --- |
|     |     |     |     |     | ↓   | ↓   |     |
|     |     |     |     |     | OS  | OE  |     |

| D   | A   | G   | F   | K   | E   |
| --- | --- | --- | --- | --- | --- |
|     |     |     |     | ↓   | ↓   |
|     |     |     |     | NE  | NS  |

由于 NE<NS，意味着 新序列中已经没有可遍历的元素，因此 OS 与 OE 闭区间内的节点都需要被删除，这是第 5、6 次操作 DOM，此时 Real DOM 为 【D、A、G、F、K、E】。

![](/img/in-post/react-diff/8.jpg)

到此为止，我们用了六次 DOM 操作，与 React 的性能相当。

我们还是总结一下 Vue 的 DOM Diff 算法的关键逻辑：

- 建立新序列（Virtual DOM）头（NS）尾（NE）、老序列（Real DOM）头（OS）尾（OE）一共 4 个指针，然后让 NS/NE 与 OS/OE 比较；
- 如果发现有 OS 或 OE 的值与 NS 或 NE 相同，则把相应节点移动到 NS 或 NE 的位置。

说的简单一点，其实 Vue 的这个 DOM Diff 过程就是一个查找排序的过程，遍历 Virtual DOM 的节点，在 Real DOM 中找到对应的节点，并移动到新的位置上。不过这套算法使用了双向遍历的方式，加速了遍历的速度。

从以上原理中我们可以轻易地推导出对该算法最不利的莫过于序列倒序。比如从【A、B、C、D】转换为【D、C、B、A】，算法将执行 N-1 次移动，与 React 相同，并没有更坏。

那么我们再看一眼对于 React 无法高效处理的例子，【A、B、C、D】转换为【D、A、B、C】，看一下 Vue 的算法表现如何。

![](/img/in-post/react-diff/9.jpg)

在第一轮比较中，Real DOM 的末尾节点 D 与 Virtual DOM 的首节点 D 相同，那么就把节点 D 移动到首位，变成【D、A、B、C】，直接一步到位，高效完成了转换，从这一点上，并没有犯 React 的错。

不过值得说明的是，在匹配不成功的情况下，如何找到 NS 节点在 Real DOM 的位置，并非是顺序遍历的（否则就会导致 O(N²) 的复杂度），而是预先存储了各个节点的位置，查找映射表即可，所以可以说是用一定的空间复杂度换了时间复杂度。

### Inferno

![](/img/in-post/react-diff/10.jpg)

Inferno 虽然在一定程度上兼容 React 语法，但它最大的卖点却是其卓越的算法。如果说 React、Vue 的算法能在一定程度上能节约 DOM 操作的次数的话， 那么毫无夸张地说，Inferno 的算法就是能把 DOM 操作的次数降到最低。我们来看一下它是怎么办到的。

下面我们还是用之前的例子来演示这套 DOM Diff 是如何运作的，由【A、B、C、D、E、F、G】转换成【D、A、G、F、K、E】。

首先，我们记录 Virtual DOM 的各个元素在 Real DOM 中的序号：【3、0、6、5、-1、4】，记录为数组 maxIncrementSubSeq，其中-1 表示在 Real DOM 中并不存在，需要创建。

这个数组能说明什么呢？别着急，现在我们来获取该数组的“最大递归子序列”，当然，仅限非负数。

这个例子有 4 个子序列都满足需求：【3、5】、【3、4】、【0、5】、【0、4】，具体算法已经很成熟，这里不关心，我们随便取一个【3、5】。

Real DOM 在【3、5】位置上是节点 D 和节点 G。这说明这两个节点是不需要移动位置的，其它都要移动或删除。

从数组 maxIncrementSubSeq 中我们已经能够推断出应该删除的节点是位于位置【1、2】的两个节点 B 和 C，因为【1、2】并未出现在数组 maxIncrementSubSeq 中。这是第 1、2 次 DOM 操作，此时 Real DOM 为 【A、D、E、F、G】。

接下来我们从后往前遍历 Virtual DOM：

- 最后一个是节点 E，那我们就把节点 E 移动到最后，这是第 3 次 DOM 操作，此时 Real DOM 为 【A、D、F、G、E】；
- 遍历到节点 K，这是一个新节点，我们创建并插入到节点 E（上一个遍历到的节点）之前，这是第 4 次 DOM 操作，此时 Real DOM 为 【A、D、F、G、K、E】；
- 遍历到节点 F，那我们就把节点 F 移动到节点 K 之前，这是第 5 次 DOM 操作，此时 Real DOM 为 【A、D、G、F、K、E】；
- 遍历到节点 G，由于节点 G 位于最大递增子序列中，因此不需要移动；
- 遍历到节点 A，由于节点 A 也位于最大递增子序列中，因此也不需要移动；
- 遍历到节点 D，那我们就把节点 D 移动到节点 A 之前，这是第 6 次 DOM 操作，此时 Real DOM 为 【D、A、G、F、K、E】。

![](/img/in-post/react-diff/11.jpg)

同样操作了六次 DOM，相比于 Vue、React 好像并没有什么优势，不过这是因为这个例子中的最大递增子序列太短导致的，也就是说，能保持位置不动的元素不够多。

同样再看一眼对于 React 无法高效处理的例子，【A、B、C、D】转换为【D、A、B、C】，看一下 Inferno 的算法表现如何。

![](/img/in-post/react-diff/12.jpg)

显然，最大递增子序列所代表的不需要移动的元素是【A、B、C】，那么从后往前遍历 Virtual DOM，先后经历节点 C、B、A 都不需要移动，到节点 D 才需要移动一次，因此对于这种特殊场景，Inferno 也只需要一次 DOM 操作，与 Vue 效率相同。

那么对于序列倒序这种特殊场景，由于最大递增子序列的长度为 1，所以也需要 N-1 次 DOM 移动操作，与 Vue 相同。

那么有没有能优于 Vue 算法的场景呢？试想将【A、B、C、D、E】转换为【C、D、E、A、B】。

对于 Inferno 而言，由于最大递增子序列【C、D、E】的长度为 3，所以只需要 5-3=2 次 DOM 操作即可完成重排序。

```js
ABCDE;
ↆ;
ACDEB;
ↆ;
CDEAB;
```

对于 Vue 而言，则依赖于算法在遇到无匹配的逻辑分支下，是决定补 NS 指针的节点位置还是补 NE 指针，如果是后者，则也只需要 2 次 DOM 移动操作，如果是前者，则需要 3 次。从实现代码上来看，是前者。

```js
ABCDE;
ↆ;
CABDE;
ↆ;
CDABE;
ↆ;
CDEAB;
```

因此在一些比较特殊的情况下，Inferno 在节省 DOM 操作次数的指标上，是可能优于 Vue 的，不过也不多。

现在我们再来回想一下 React 的算法，在上面这个例子中，React 也只需要移动 2 次就够了。

```js
ABCDE;
ↆ;
BCDEA;
ↆ;
CDEAB;
```

如果你仔细回味，就会发现，React 的 DOM Diff 算法其实也体现了最大递增子序列的概念，但是它假定这个子序列一定是从第一个位置开始的，一旦不是这样子，算法效率就会恶化，这也是为什么它不能很好地处理末尾节点移动到首位这种场景的，因为子序列长度仅为 1。

## 三、总结

简单阐述了 React、Vue、Inferno 的算法梗概之后，我们统一总结一下：

- Inferno 利用最大递增子序列的算法达到了移动 DOM 次数最少的目标；
- React 假定最大递增子序列从 0 开始，在末尾节点移动到首位的场景中会恶化；
- Vue 利用双向遍历排序的方法，有可能不是最优解，但与最优解十分逼近；
- 三种算法对于倒序这种场景都降级为理论上的最少 N-1 次。

因此，在实际的业务开发中，序列倒序是最应该被避免的，对于 React 还应注意末尾节点的问题，除此之外，没有什么特别需要担心的，框架都会在足够程度上（虽然可能不是最优的）利用现有 DOM 而不是重新创建，从而实现性能优化的发挥。

需要特别指出的是，包括但不限于 React、Vue、Inferno 在内的众多框架，在同一层级节点上，都希望业务指定一个 key 值来判定重渲染前后是否是同一个节点，如果连 key 值都不同，那么 DOM 节点是不会被重用的。

在很多“最佳实践”文章中，都认为用数组遍历的序号来做 key 值是不可取的，不过这也取决于具体场景，典型的是，如果遍历的数据是静态不可变的，那么使用序号来做 key 并不会有什么问题。

退一步说，如果数组顺序变化，依然用序号做 key 会有什么问题呢？这个问题需要从两方面来回答。

首先，对于性能来讲，渲染前后对于同一个序号的数据发生了变化，框架依然可能会重用节点，这可能会导致后代节点的大量删除与重建。

其次，对于渲染结果正确性来讲，一般也不会有问题，但有一种场景，就是 DOM 上的数据并没有同步到框架中，比如 React 中的一个概念，叫做“失控组件（https://reactjs.org/docs/uncontrolled-components.html）”，那么重渲染之后，未同步的数据很可能出现在错误的节点中。

这就是使用序号来做 key 需要注意的知识点。

对于 Inferno 而言，key 值的逻辑并不绝对，对于静态数组或者只是在尾部添加元素的数组，不使用 key 反倒在性能上更有优势。不过对于使用频率高得多的 React 和 Vue，还是老老实实都添加 key 为好。

最后，还有一个问题需要回答，Inferno 的算法是否解决了将一个数组打乱成另一个数组，中间最少需要几步的问题呢？我看不见得，大家要注意 DOM 有这样一个操作：insertBefore，它的功能是在一个节点前面插入另一个节点，如果要插入的节点就在这个兄弟节点集合中，那么它还会被自动从原来的位置移除。

数组有这样的特性吗？恐怕没有。数组是顺序存储的，在一个位置插入数据会导致后面的数据全部后移，这是可观的性能开销。

如果换成双向链表，那么我认为应用这几种算法都问题不大。
