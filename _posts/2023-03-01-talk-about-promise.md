---
layout: post
title: "浅谈Promise"
subtitle: "Talk About Promise"
date: 2023-03-01 21:47:33
author: linbao
header-img:
catalog: true
tags:
  - js
---

## Promise

> Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了`Promise`对象。
>
> 所谓`Promise`，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

### 为什么 Promise 叫做 Promise？

Promise 在红宝书中被叫做期约，也可以被翻译为承诺。是因为它的状态在从最初始的待定状态(`pending`)落定(`settled`)为代表成功的兑现(fulfilled)状态，或者代表失败的(rejected)状态之后。任何其他操作都无法改变这个状态了。如果说状态还可以被改变，那就不符合 Promise 设计的规范，那么叫 Promise 的意义也就丢失了。

### 为什么 Promise 存在 then 方法？

then 方法是为期约实例添加处理程序（个人理解即是定义的各种函数方法）的主要方法。它的作用是为 Promise 实例添加状态改变时的回调函数。它接收最多两个参数：`onResolved` 处理程序和 `onRejected` 处理程序。这两个参数都是可选的，如果提供的话， 则会在期约分别进入“兑现”和“拒绝”状态时执行。

then 方法会将被 resolve 后的值或 reject 的值传递出来，该值会被保存到对象内部，不会向外部暴露。如以下代码所示：

```javascript
// 加载图片
function loadImg(src) {
  const promise = new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject("图片加载失败");
    };
    img.src = src;
  });
  return promise;
}

const src = "logo_new.png";
const result = loadImg(src);

result
  .then((img) => {
    console.log("img.width", img.width);
    return img;
  })
  .then((img) => {
    console.log("img.height", img.height);
  })
  .catch((err) => {
    console.log(err);
  });
```

### 为什么 Promise 的 then 方法带有链式调用？

还是拿上述代码做举例，本来在第一个 then 方法可能分位多个职责角色来完成，把这些角色都分开，然后用一个链串起来。这样就将请求者和处理 者、包括多个处理者之间进行了分离。这也是设计模式中的职责链模式。多次使用.then 方法时都会返回一个新的 Promise，因此才可以实现被链式调用。

而前端中，最常见的就是链式操作。例如 jQuery 的链式操作和 Promise 的链式操作。

```js
$(".div1").show().css("color", "red").append($("#p1"));
```

### 异常处理语句

你可以用 `throw` 语句抛出一个异常并且用 `try...catch` 语句捕获处理它。

#### `try...catch` 语句

`try...catch` 语句标记一块待尝试的语句，并规定一个以上的响应应该有一个异常被抛出。如果我们抛出一个异常，`try...catch`语句就捕获它。

`try...catch` 语句有一个包含一条或者多条语句的 try 代码块，0 个或 1 个的`catch`代码块，catch 代码块中的语句会在 try 代码块中抛出异常时执行。

在我们后面的 Promise 实现中就会使用到对应`try...catch`语句对异常进行捕获。

#### `throw` 语句

使用`throw`语句抛出一个异常。当你抛出异常，你规定一个含有值的表达式要被抛出。

throw 语句就可以用到在`try...catch`语句中，catch 代码块中抛出异常时使用。

## Promise/A+ 实现

[Promise/A+](https://promisesaplus.com/)

[Promise/A+中文翻译版本](https://www.ituring.com.cn/article/66566)

[Promise/A+测试用例](https://github.com/promises-aplus/promises-tests)

Promise 其实就是一个构造函数，我们可以使用这个构造函数创建一个 Promise 实例。 该构造函数很简单，它只有一个参数，按照 Promise/A+规范的命名，我们把 Promise 构造函数的参数叫做 executor,它是函数类型的参数。 这个函数又 具有`resolve`，`reject`两个方法作为参数。

因此我们可以根据此结论开始实现`Promise` 的第一步，先简单地实现一个构造函数，代码如下。

```javascript
function Promise(executor) {}
```

### **Promise 初见雏形**

在日常的嵌套回调场景中可以使用如下方法。

```javascript
Request("userInfo")
  .then(
    (data) => Requeset(`${data.id}/friednList`),
    (error) => {
      console.log(error);
    }
  )
  .then(
    (data) => console.log(data),
    (error) => {
      console.log(error);
    }
  );
```

Promise 构造函数返回一个 Promise 对象实例，这个返回的 Promise 对象具有一个 then 方法。在 then 方法中，调用者可以定义两个参数，分别是`onfulfilled`和`onrejected`，他们都是函数类型的参数。其中，`onfulfilled`通过参数可以获取`Promise`对象经过`resolve`处理后的值，`onrejected`可以获取`Promise`对象经过`reject`处理后的值。通过这个值，我们来处理异步操作完成后的逻辑。

```javascript
function Promise(exector)

Promise.prototype.then = function(onfufileed, onrejected) {}
```

接下来看一个示例，从示例中理解`Promise`的重点内容。

```javascript
let promise1 = new Promise((resolve, reject) => {
  resolve("data");
});

promise1.then((data) => {
  console.log(data);
});

let promise2 = new Promise((resolve, reject) => {
  reject("error");
});

promise2.then(
  (data) => {
    console.log(data);
  },
  (error) => {
    console.log(error);
  }
);
```

在使用 `new` 关键字调用 `Promise` 构造函数时，在合适的时机（往往是异步操作结束时）调用 executor 的参数`resolve`，并将经过`resolve`处理后的值作为`resolve`的函数参数执行，这个值便可以在后续`then`方法的第一个函数参数（`onfulfilled`）中拿到；同理，在出现错误时，调用`exeuctor`的参数`reject`，并将错误信息作为`reject`的函数参数执行，这个错误信息可以在后续`then`方法的第二个函数参数（`onrejected`）中得到。

因此，我们在实现`Promise`时，应该有两个变量，分别存储经过`resolve`处理后的值，以及经过`reject`处理后的值（当然，因为 Promise 状态的唯一性，不可能同时出现经过`resolve`处理后的值和经过`reject`处理后的值，因此也可以用一个变量来存储）；同时还需要存在一个状态，这个状态就是 Promise 实例的状态（pending、fufilled、rejected）；最后要提供 resolve 方法及 reject 方法，这两个方法需要作为 executor 的参数提供给开发者使用，代码如下。

```javascript
function Promise(executor) {
  // const self = this
  this.status = "pending";
  this.value = null;
  this.reason = null;

  //function resolve(value){
  //   self.value = value
  //}

  //function reject(reason){
  //    self.reason = reason
  //}

  const resolve = (value) => {
    this.value = value;
  };

  const reject = (reason) => {
    this.reason = reason;
  };
}

Promise.prototype.then = function (
  onfulfilled = Function.prototype,
  onrejected = Function.prototype
) {
  onfulfilled(this.value);

  onrejected(this.reason);
};
```

为什么 then 要放在 Promise 构造函数的原型上，而不是放在构造函数内部呢？

这涉及了原型、原型链的知识：每个 Promise 实例的 then 方法逻辑都是一致的，实例在调用该方法时，可以通过原型（Promise.prototype）来调用，而不需要每次实例化都新创建一个 then 方法，以便节省内存。

### **Promise 实现状态完善**

接下来看一道题：

```javascript
let promise = new Promise((resolve, reject) => {
  resolve("data");
  reject("error");
});

promise.then(
  (data) => {
    console.log(data);
  },
  (error) => {
    console.log(error);
  }
);
```

以上代码只会输出 data。我们知道， Promise 实例的状态只能从 pending 变为 fulfilled，或者从 pending 变为 rejected。状态一旦变更完毕，就不可再次变化或逆转。也就是说，如果一旦变为 fulfilled，就不能再变为 rejected；一旦变为 rejected，就不能再变为 fulfilled。

那我们的代码实现显然无法满足这一特性。执行上一段代码将会输出 data 及 error，因此需要对状态进行判断和完善，如下。

```javascript
function Promise(executor) {
  this.status = "pending";
  this.value = null;
  this.reason = null;

  const resolve = (value) => {
    if (this.status === "pending") {
      this.value = value;
      this.status = "fulfilled";
    }
  };

  const reject = (reason) => {
    if (this.status === "pending") {
      this.reason = reason;
      this.status = "rejected";
    }
  };
}

Promise.prototype.then = function (onfulfilled, onrejected) {
  onfulfilled =
    typeof onfulfilled === "function" ? onfulfilled : (data) => data;
  onrejected =
    typeof onrejected === "function"
      ? onrejected
      : (error) => {
          throw error;
        };

  if (this.status === "fulfilled") {
    onfulfilled(this.value);
  }
  if (this.status === "rejected") {
    onrejected(this.reason);
  }
};
```

可以看到，resolve 和 reject 方法中加入了判断，只允许 Promise 实例状态从 pending 变为 fulfilled，或者从 pending 变为 rejected。

同时注意，这里对 Promise.prototype.then 的参数 onfulfilled 和 rejected 进行了判断，当实参不是函数类型时，就需要赋予默认函数值。这时的默认值不再是函数元 Function.prototype 了。下一段会介绍为什么要这么改。

但是 Promise 是用来解决异步问题的，而我们的代码全部都是同步执行的，似乎还差了更重要的逻辑。

### **Promise 异步实现完善**

到目前为止，实现还差了哪些内容呢？我们从下面的示例代码入手，逐步分析。

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("data");
  }, 2000);
});

promise.then((data) => {
  console.log(data);
});
```

正常来讲，上述代码会在 2s 后输出 data，但是现在，代码并没有输出任何信息。这是为什么呢？

原因很简单，因为我们的实现逻辑全是同步的。上述代码在实例化一个`Promise`的构造函数时，会在 setTimeout 逻辑中调用 resolve，也就是说，2s 后才会调用 resolve 方法，更改 Promise 实例状态。而结合我们的实现，then 方法中的 onfulfilled 是同步执行的，它在执行时 this.status 仍然为 pending，并没有做到 “2s 后再执行 onfulfilled”。

我们似乎应该在合适的时间去调用`onfulfilled`方法，这个合适的时间应该是开发者调用 resolve 的时刻，那么我们先在状态 (status) 为 pending 时把开发者传进来的 onfulfilled 方法存起来，再在 resolve 方法中执行即可。代码如下：

```javascript
function Promise(executor) {
  this.status = "pending";
  this.value = null;
  this.reason = null;
  this.onFulfilledFunc = Function.prototype;
  this.onrejectedFunc = Function.prototype;

  const resovle = (value) => {
    if (this.status === "pending") {
      this.value = value;
      this.status = "fulfilled";

      this.onFulfilledFunc(this.value);
    }
  };

  const reject = (reason) => {
    if (this.status === "pending") {
      this.reason = reason;
      this.status = "rejected";

      this.onRejectedFunc(this.reason);
    }
  };

  executor(resolve, reject);
}

Promise.prototype.then = function (onfulfilled, onrejected) {
  onfulfilled =
    typeof onfulfilled === "function" ? onfulfilled : (data) => data;
  onrejected =
    typeof onrejected === "function"
      ? onrejected
      : (error) => {
          throw error;
        };

  if (this.status === "fulfilled") {
    onfulfilled(this.value);
  }
  if (this.status === "rejected") {
    onrejected(this.reason);
  }
  if (this.status === "pending") {
    this.onFulfilledFunc = onfulfilled;
    this.onRejectedFunc = onrejected;
  }
};
```

通过测试发现，我们实现的代码也可以支持异步执行了！同时，我们知道 Promise 是异步执行的！再来看一个例子，请判断一下代码的输出结果：

```javascript
const promise = new Promise((resolve, reject) => {
  resolve("data");
});

promise.then((data) => {
  console.log(data);
});
console.log(1);
```

正常话，这里会按照顺序先输出 1，再输出 data。

而我们实现的代码却没有考虑这种情况，实际先输出了 data，再输出 1,。因此，需要将 resolve 和 reject 的执行放到任务队列中。这里可以使用 queueMicrotask 中，保证异步执行。

```javascript
const resolve = (value) => {
  if (value instanceof Promise) {
    return value.then(resolve, reject);
  }
  queueMicrotask(() => {
    if (this.status === "pending") {
      this.value = value;
      this.status = "fulfilled";

      this.onFulfilledFunc(this.value);
    }
  });
};

const reject = (reason) => {
  queueMicrotask(() => {
    if (this.status === "pending") {
      this.reason = reason;
      this.status = "rejected";

      this.onRejectedFunc(this.reason);
    }
  });
};

executor(resolve, reject);
```

这样一来，在执行到 executor(resolve, reject) 时，也能保证在 queueMicrotask 中才执行 Promise 被决议后的任务，不会阻塞同步任务。

同时，我们在 resolve 方法中加入了对 value 值是否为一个 Promise 实例的判断语句。到目前为止，整个实现代码如下所示：

```javascript
function Promise(executor) {
  this.status = "pending";
  this.value = null;
  this.reason = null;
  this.onFulfilledFunc = Function.prototype;
  this.onRejectedFunc = Function.prototype;

  const resolve = (value) => {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }

    queueMicrotask(() => {
      if (this.status === "pending") {
        this.value = value;
        this.status = "fulfilled";

        this.onFulfilledFunc(this.value);
      }
    });
  };

  const reject = (reason) => {
    queueMicrotask(() => {
      if (this.status === "pending") {
        this.reason = reason;
        this.status = "rejected";

        this.onRejectedFunc(this.reason);
      }
    });
  };

  executor(resolve, reject);
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : (data) => data;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (error) => {
          throw error;
        };

  if (this.status === "fulfilled") {
    onFulfilled(this.value);
  }
  if (this.status === "rejected") {
    onRejected(this.reason);
  }
  if (this.status === "pending") {
    this.onFulfilledFunc = onFulfilled;
    this.onRejectedFunc = onRejected;
  }
};
```

下面的实现也会按照顺序，先输出 1，再输出 data

```javascript
const promise = new Promise((resolve, reject) => {
  resolve("data");
});

promise.then((data) => {
  console.log(data);
});

console.log(1);
```

### **Promise 细节完善**

到此为止，我们的 Promise 实现似乎越来越靠谱了，但是还有些细节需要完善。

比如，在 Promise 实例状态变更之前添加多个 then 方法。

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("data");
  }, 2000);
});

promise.then((data) => {
  console.log(`1: ${data}`);
});

promise.then((data) => {
  console.log(`2: ${data}`);
});
```

以上代码应该会得到以下输出

```
1: data
2: data
```

而我们的实现只会输出 2: data，这是因为第二个 then 方法中的 onFulfilledFunc 会覆盖第一个 then 方法中的 onFulfilledFunc。

这个问题也好解决，只需要将所有 then 方法中的 onFulfilled 储存到一个数组 onFulfilledArray 中，在当前 Promise 被决议时依次执行 onFulfilledArray 数组内的方法即可。对于 onRejectFunc 同理，改动后的实现代码如下。

```javascript
function Promise(executor) {
  this.status = "pending";
  this.value = null;
  this.reason = null;
  this.onFulfilledArray = [];
  this.onRejectedArray = [];

  const resolve = (value) => {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }
    if (this.staus === "pending") {
      queueMicrotask(() => {
        this.value = value;
        this.staus = "fulfilled";

        this.onFulfilledArray.forEach((fn) => fn(value));
      });
    }
  };

  const reject = (reason) => {
    if (this.status === "pending") {
      queueMicrotask(() => {
        this.reason = reason;
        this.status = "rejected";

        this.onRejectedArray.forEach((fn) => fn(reason));
      });
    }
  };

  executor(resolve, reject);
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfiledd === "function" ? onFulfilled : (data) => data;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (error) => {
          throw error;
        };

  if (this.status === "fulfilled") {
    onFulfilled(this.value);
  }
  if (this.status === "rejected") {
    onRejected(this.reason);
  }
  if (this.status === "pending") {
    this.onFulfilledArray.push(onFulfilled);
    this.onRejectedArray.push(onRejected);
  }
};
```

另外一个需要完善的细节是，在构造函数中如果出错，将会自动触发 Promise 实例状态变为 rejected，因此我们用 try...catch 块对 executor 进行包裹：

```javascript
try {
  executor(resolve, reject);
} catch (e) {
  reject(error);
}
```

到目前为止，我们已经初步实现了基本的 Promise。得到一个好的实现结果固然重要，但是在实现过程中，我们也加深了对 Promise 的理解，得出下面一些重要的结论。

- Promise 的状态具有凝固性。
- Promise 可以在 then 方法第二个参数中进行错误处理
- Promise 实例可以添加多个 then 处理场景。

距离完整的实现越来越近了，接下来继续实现 Promise then 链式调用效果。

### **Promise then 的链式调用**

在正式介绍此部分知识点前，我们先来看一道题目：请判断以下代码的输出结果。

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("lucas");
  }, 2000);
});

promise
  .then((data) => {
    console.log(data);
    return `${data} next then`;
  })
  .then((data) => {
    console.log(data);
  });
```

这段代码执行后，将会在 2s 后输出 lucas，紧接着输出 lucas next then。

我们看到，Promise 实例的 then 方法支持链式调用，输出经过 resolve 处理的值后，如果在 then 方法体的 onfulfilled 函数中同步显示返回新的值，则将会在新 Promise 实例 then 方法的 onfulfilled 函数体中输出新值。

如果在第一个 then 方法体的 onfulfilled 函数中返回另一个 Promise 实例，结果又将如何呢？

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("lucas");
  }, 1000);
});

promise
  .then((data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`${data} next then`);
      }, 1000);
    });
  })
  .then((data) => {
    console.log(data);
  });
```

上述代码将会在 1s 后输出 lucas 紧接着再过 1s （第 2s）输出 lucas next then

由此可知，一个 Promise 实例 then 方法的 onfulfilled 函数和 onrejected 函数时支持再次返回一个 Promise 实例的，也支持返回一个非 Promise 实例的普通值，并且，返回的这个 Promise 实例或这个非 Promise 实例的普通值将会传给下一个 then 方法的 onfulfilled 函数或 onrejected 函数，这样，then 方法就支持链式调用了。

### **链式调用的初步实现**

让我们分析一下，是不是为了能够支持 then 方法的链式调用，每一个 then 方法的 onfulfilled 函数和 onrejected 函数都应该返回一个 Promise 实例。

我们一步一步来分析，先看一个实际使用 Promise 链的场景，代码如下：

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("lucas");
  }, 2000);
});

promise
  .then((data) => {
    console.log(data);
    return `${data} next then`;
  })
  .then((data) => {
    console.log(data);
  });
```

这种 onfulfilled 函数会返回一个普通字符串类型的基本值，这里的 onfulfilled 函数的代码如下：

```javascript
(data) => {
  console.log(data);
  return `${data} next then`;
};
```

在前面实现 then 方法中，我们可以创建一个新的 Promise 实例，即 promise2，并最终将这个 promise2 返回，代码如下：

```javascript
Promise.prototype.then = function (onfulfilled, onrejected) {
  onFulfilled =
    typeof onFulfiledd === "function" ? onFulfilled : (data) => data;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (error) => {
          throw error;
        };

  // promise2 将作为 then 方法的返回值
  let promise2;
  if (this.status === "fulfilled") {
    return (promise2 = new Promise((resolve, rejecet) => {
      setTimeout(() => {
        try {
          // 这个新的promise2 resolved的值为onfulfiledd的执行结果
          let result = onfulfilled(this.value);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }

  if (this.status === "rejected") {
    onrejected(this.reason);
  }
  if (this.status === "pending") {
    this.onFulfilledArray.push(onfulfilled);
    this.onRejectedArray.push(onrejected);
  }
};
```

当然，别忘了另外两种情况也要加入相同的逻辑：

```javascript
Promise.prototype.then = function (onfulfilled, onrejected) {
  onFulfilled =
    typeof onFulfiledd === "function" ? onFulfilled : (data) => data;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (error) => {
          throw error;
        };

  // promise2 将作为 then 方法的返回值
  let promise2;
  if (this.status === "fulfilled") {
    return (promise2 = new Promise((resolve, reject) => {
      queueMicroTask(() => {
        try {
          // 这个新的promise2 resolved 处理后的值为onfulfiledd的执行结果
          let result = onfulfilled(this.value);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }

  if (this.status === "rejected") {
    return (promise2 = new Promise((resolve, reject) => {
      queueMicroTask(() => {
        try {
          // 这个新的promise2 reject 处理后的值为onfulfiledd的执行结果
          let result = onrejected(this.value);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }
  if (this.status === "pending") {
    return (promise2 = new Promise((resolve, reject) => {
      try {
        this.onFulfilledArray.push(() => {
          const result = onfulfilled(this.value);
          resolve(result);
        });
      } catch (e) {
        reject(e);
      }

      try {
        this.onRejectedArray.push(() => {
          const result = onrejected(this.reason);
          resolve(result);
        });
      } catch (e) {
        reject(e);
      }
    }));
  }
};
```

这里要重点理解`this.status === 'pending'` 判断分支中的逻辑，这也是最难理解的。当使用 Promise 实例调用其 then 方法时，应该返回一个 Promise 实例，返回的就是`this.status === 'pending'` 判断分支中返回的 promise2,。那么，这个 promise2 什么时候被决议呢？应该是在异步处理结束后，依次执行`onFulfilledArray`或`onRejectedArray`数组中的函数时。

我们再思考一下，`onFulfilledArray`或`onRejectedArray`数组中的函数应该做些什么呢？很明显，需要切换 promise2 的状态，并进行决议。

理顺了 `onFulfilledArray` 或 `onRejectedArray` 数组中的函数需要执行的逻辑，再进行改动。将`this.onFulfilledArray.push`的函数由：

```jsx
this.onFulfilledArray.push(onfulfilled);
```

改为以下形式：

```javascript
() => {
  try {
    let result = onfulfilled(this.value);
    resolve(result);
  } catch (e) {
    reject(e);
  }
};
```

this.onRejectedArray.push 函数的改动方式同理。

此时 Promise 实现的完整代码如下:

```javascript
function Promise(executor) {
  this.status = "pending";
  this.value = null;
  this.reason = null;
  this.onFulfilledArray = [];
  this.onRejectedArray = [];

  const resolve = (value) => {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }

    queueMicrotask(() => {
      if (this.status === "pending") {
        this.value = value;
        this.status = "fulfilled";

        this.onFulfilledArray.forEach((fn) => {
          fn(value);
        });
      }
    });
  };

  const reject = (reason) => {
    queueMicrotask(() => {
      if (this.status === "pending") {
        this.reason = reason;
        this.status = "onrejected";

        this.onRejectedArray.forEach((fn) => {
          fn(reason);
        });
      }
    });
  };

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

Promise.prototype.then = function (onfulfilled, onrejected) {
  // promise2 将作为 then方法的返回值
  let promise2;
  if (this.status === "fulfilled") {
    return (promise2 = new Promise((resolve, reject) => {
      try {
        // 这个新的promise2得经过resolve处理后的值为onfulfilled的执行结果
        const result = onfulfilled(this.value);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }));
  }

  if (this.status === "onrejected") {
    return (promise2 = new Promise((resolve, reject) => {
      try {
        // 这个新的promise2得经过reject处理后的值为onrejected的执行结果
        const result = onrejected(this.reason);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }));
  }

  if (this.status === "pending") {
    return (promise2 = new Promise((resolve, reject) => {
      this.onFulfilledArray.push(() => {
        try {
          const result = onfulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.onRejectedArray.push(() => {
        try {
          const result = onrejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }
};
```

### **链式调用的完善实现**

我们继续来实现 then 方法，以便显示返回一个 Promise 实例。对应场景下的实现代码如下：

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("lucas");
  }, 2000);
});

promise
  .then((data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`${data} next then`);
      }, 2000);
    });
  })
  .then((data) => {
    console.log(data);
  });
```

基于第一种 onfulfilled 函数和 onrejected 函数返回一个普通值的情况，要实现这种 onfulfilled 函数和 onrejected 函数返回一个 Promise 实例的情况并不困难。但是需要小幅度重构一下代码，在之前实现的 `let result = onfulfilled(this.value)` 语句和 `let result = onrejected(this.reason)` 语句中，使变量 result 由一个普通值变为一个 Promise 实例。换句话说就是，变量 result 既可以是一个普通值，也可以是一个 Promise 实例，位次，我们抽象出 resolvePromise 方法进行统一处理。对已有实现进行改动后的代码如下：

```jsx
const resolvePromise = (promise2, result, resolve, reject) => {};

Promise.prototype.then = function (onfulfilled, onrejected) {
  // promise2 将作为 then 方法的返回值
  let promise2;
  if (this.status === "fulfilled") {
    return (promise2 = new Promise((resolve, reject) => {
      try {
        // 这个新的 promise2 的经过 resolve 处理后的值为 onfulfilled 的执行结果
        const result = onfulfilled(this.value);
        resolvePromise(promise2, result, resolve, reject);
      } catch (error) {
        reject(error);
      }
    }));
  }

  if (this.status === "onrejected") {
    return (promise2 = new Promise((resolve, reject) => {
      try {
        // 这个新的 promise2 的经过 resolve 处理后的值为 onfulfilled 的执行结果
        const result = onrejected(this.value);
        resolvePromise(promise2, result, resolve, reject);
      } catch (error) {
        reject(error);
      }
    }));
  }

  if (this.status === "pending") {
    return (promise2 = new Promise((resolve, reject) => {
      this.onFulfilledArray.push((value) => {
        try {
          const result = onfulfilled(value);
          resolvePromise(promise2, result, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });

      this.onRejectedArray.push((reason) => {
        try {
          const result = onrejected(reason);
          resolvePromise(promise2, result, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }
};
```

现在的任务就是完成 resolvePromise 函数， 这个函数接收以下 4 个参数

- promise2：返回的 Promise 实例
- result：onfulfilled 或 onrejected 函数的返回值
- resolve：Promise2 的 resolve 方法
- rejecte: Promise2 的 rejecte 方法

有了这些参数，我们就具备了抽象逻辑的必备条件，接下来就是动手实现。

```jsx
const resolvePromise = (promise2, result, resolve, reject) => {
  // 当 result 和 promise2 相等时， 也就是在onfulfilled返回promise2时，执行reject
  if (result === promise2) {
    return reject(new TypeError("error due to circular reference"));
  }

  // 是否已经执行过 onfulfilled 或 onrejected
  let consumed = false;
  let thenable;

  if (result instanceof Promise) {
    if (result.status === "pending") {
      result.then(function (data) {
        resolvePromise(promise2, data, resolve, reject);
      }, reject);
    } else {
      result.then(resolve, reject);
    }
    return;
  }

  let isComplexResult = (target) =>
    typeof target === "function" ||
    (typeof target === "object" && target !== null);

  // 如果返回的是疑似Promise类型
  if (isComplexResult(result)) {
    try {
      thenable = result.then;
      // 判断返回值是否是 Promise 类型
      if (typeof thenable === "function") {
        thenable.call(
          result,
          function (data) {
            if (consumed) {
              return;
            }
            consumed = true;

            return resolvePromise(promise2, data, resolve, reject);
          },
          function (error) {
            if (consumed) {
              return;
            }
            consumed = true;

            return reject(error);
          }
        );
      } else {
        resolve(result);
      }
    } catch (error) {
      if (consumed) {
        return;
      }
      consumed = true;
      return reject(e);
    }
  } else {
    resolve(result);
  }
};
```

我们看到，resolvePromise 方法的第一步是对 “死循环” 进行处理，并在发生死循环时抛出错误，错误信息为 new TypeError('error due to circular reference')

怎么理解这个处理呢？ Promise 实现规范中支出，其实出现 “死循环" 的情况如下所示：

```jsx
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("lucas");
  }, 200);
});

promise
  .then(
    (onfulfilled = (data) => {
      console.log(data);
      return onfulfilled(data);
    })
  )
  .then((data) => {
    console.log(data);
  });
```

接着，对于 onfulfilled 函数返回的结果 result；如果 result 不是 Promise 实例，不是对象，也不是函数，而是一个普通值的话（isComplexResult 函数用于对此进行判断），则直接对 promise2 进行决议。

对于 onfulfilled 函数返回的结果 result： 如果 result 含有 then 属性方法， 那么我们称该属性方法为 thenable， 说明 result 是一个 Promise 实例，当执行该实例的 then 方法（既 thenable） 时，返回结果还可能是一个 Promise 实例类型，也可能是一个普通值，因此还要递归调用 resolvePromise。下面代码举例为什么要递归调用方法：

```jsx
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("lucas");
  }, 200);
});

promise
  .then((data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`${data} next then`);
      }, 200);
    }).then((data) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(`${data} next then`);
        }, 200);
      });
    });
  })
  .then((data) => {
    console.log(data);
  });
```

以上代码会先输出 lucas，在 10s 时输出 lucas next then next then

此时，Promise 实现的完整代码如下：

```jsx
function Promise(executor) {
  this.status = "pending";
  this.value = null;
  this.reason = null;
  this.onFulfilledArray = [];
  this.onRejectedArray = [];

  const resolve = (value) => {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }
    queueMicrotask(() => {
      if (this.status === "pending") {
        this.value = value;
        this.status = "fulfilled";

        this.onFulfilledArray.forEach((fn) => {
          fn(value);
        });
      }
    });
  };

  const reject = (reason) => {
    queueMicrotask(() => {
      if (this.status === "pending") {
        this.reason = reason;
        this.status = "rejected";

        this.onRejectedArray.forEach((fn) => {
          fn(reason);
        });
      }
    });
  };

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

/*
resolvePromise函数即为根据result的值来决定promise2的状态的函数
也即标准中的[Promise Resolution Procedure](<https://promisesaplus.com/#point-47>)
result为`promise2 = promise1.then(onResolved, onRejected)`里`onResolved/onRejected`的返回值
`resolve`和`reject`实际上是`promise2`的`executor`的两个实参，因为很难挂在其它的地方，所以一并传进来。
*/
const resolvePromise = (promise2, result, resolve, reject) => {
  // 当 result 和 promise2 相等时，也就是onfulfilled返回promise2时，进行抛错
  if (result === promise2) {
    reject(new TypeError("error due to circular reference"));
  } // 是否已经执行过 onfulfilled 或 onrejected

  let consumed = false;
  let thenable;

  if (result instanceof PromiseFn) {
    // 如果result的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
    // 所以这里需要做一下处理，而不能一概的以为它会被一个“正常”的值resolve
    if (result.status === "pending") {
      result.then(function (data) {
        resolvePromise(promise2, data, resolve, reject);
      }, reject);
    } else {
      // 但如果这个Promise的状态已经确定了，那么它肯定有一个“正常”的值，而不是一个thenable，所以这里直接取它的状态
      result.then(resolve, reject);
    }
    return;
  }

  let isComplexResult = (target) =>
    (typeof target === "function" || typeof target === "object") &&
    target !== null; // 如果返回的是疑似Promise类型

  if (isComplexResult(result)) {
    try {
      // 2.3.3.1 因为result.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
      // 即要判断它的类型，又要调用它，这就是两次读取
      thenable = result.then; // 判断返回值是否是 PromiseFn 类型
      if (typeof thenable === "function") {
        thenable.call(
          result,
          function (data) {
            if (consumed) {
              return;
            }
            // 2.3.3.3.3 即这三处谁先执行就以谁的结果为准
            consumed = true;

            return resolvePromise(promise2, data, resolve, reject);
          },
          function (error) {
            if (consumed) {
              return;
            }
            // 2.3.3.3.3 即这三处谁先执行就以谁的结果为准
            consumed = true;

            return reject(error);
          }
        );
      } else {
        // 2.3.3.4
        resolve(result);
      }
    } catch (e) {
      if (consumed) {
        return;
      }
      // 2.3.3.3.3 即这三处谁先执行就以谁的结果为准
      consumed = true;
      return reject(e);
    }
  } else {
    resolve(result);
  }
};

PromiseFn.prototype.then = function (onfulfilled, onrejected) {
  onfulfilled =
    typeof onfulfilled === "function" ? onfulfilled : (data) => data;
  onrejected =
    typeof onrejected === "function"
      ? onrejected
      : (error) => {
          throw error;
        }; // promise2 将作为 then 方法的返回值

  let promise2;

  if (this.status === "fulfilled") {
    return (promise2 = new PromiseFn((resolve, reject) => {
      queueMicrotask(() => {
        try {
          // 这个新的 promise2 的经过 resolve 处理后的值为 onfulfilled 的执行结果
          const result = onfulfilled(this.value);
          resolvePromise(promise2, result, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }

  if (this.status === "rejected") {
    return (promise2 = new PromiseFn((resolve, reject) => {
      queueMicrotask(() => {
        try {
          // 这个新的 promise2 的经过 resolve 处理后的值为 onfulfilled 的执行结果
          const result = onrejected(this.reason);
          resolvePromise(promise2, result, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }

  if (this.status === "pending") {
    return (promise2 = new PromiseFn((resolve, reject) => {
      this.onFulfilledArray.push((value) => {
        try {
          const result = onfulfilled(value);
          resolvePromise(promise2, result, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });

      this.onRejectedArray.push((reason) => {
        try {
          const result = onrejected(reason);
          resolvePromise(promise2, result, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }
};
```
