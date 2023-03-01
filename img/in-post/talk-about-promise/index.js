const PROMISE_STATUS_PENDING = "pending";
const PROMISE_STATUS_FULFILLED = "fulfilled";
const PROMISE_STATUS_REJECTED = "rejected";

function PromiseFn(executor) {
  this.status = PROMISE_STATUS_PENDING;
  this.value = undefined;
  this.reason = undefined;
  this.onFulfilledFunc = [];
  this.onRejectedFunc = [];

  const resolve = value => {
    // 当resolve的值是一个Promise对象时，需要进行调用
    if (value instanceof PromiseFn) {
      return value.then(resolve, reject);
    }
    queueMicrotask(() => {
      if (this.status !== PROMISE_STATUS_PENDING) return;
      this.status = PROMISE_STATUS_FULFILLED;
      this.value = value;
      this.onFulfilledFunc.forEach(fn => fn(value));
    });
  };

  const reject = reason => {
    queueMicrotask(() => {
      if (this.status !== PROMISE_STATUS_PENDING) return;
      this.status = PROMISE_STATUS_REJECTED;
      this.reason = reason;
      this.onRejectedFunc.forEach(fn => fn(reason));
    });
  };

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

/**
 * @description
 * @param {*} promise2 返回的Promise实例
 * @param {*} result onFulfilled 或 onRejected 函数的返回值
 * @param {*} resolve promise2 的 resolve 方法
 * @param {*} reject promise2 的 reject 方法
 */
const resolvePromise = (promise2, result, resolve, reject) => {
  // 当 result 和 promise2 相等时，也就是在onfulfilled返回promise2时，执行reject
  // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (promise2 === result) {
    return reject(new TypeError("e due to circular reference"));
  }

  let thenable;
  let consumed = false;

  // 如果返回的result是一个Promise类型
  // 2.3.2 If x is a promise, adopt its state [3.4]:
  if (result instanceof PromiseFn) {
    // 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
    if (result.status === PROMISE_STATUS_PENDING) {
      result.then(function (data) {
        resolvePromise(promise2, data, resolve, reject);
      }, reject);
    } else {
      // 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
      // 2.3.2.2 If/when x is rejected, reject promise with the same reason.
      result.then(resolve, reject);
    }
    return;
  }

  // 如果result是一个带有then方法的函数或者对象
  const isComplexResult = target =>
    (typeof target === "function" || typeof target === "object") && target !== null;

  // 2.3.3 Otherwise, if x is an object or function,
  if (isComplexResult(result)) {
    try {
      // 2.3.3.1 Let then be x.then. [3.5]
      thenable = result.then;

      if (typeof thenable === "function") {
        // 2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
        thenable.call(
          result,
          // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
          function (data) {
            // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
            if (consumed) return;
            consumed = true;

            return resolvePromise(promise2, data, resolve, reject);
          },
          // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
          function (e) {
            // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
            if (consumed) return;
            consumed = true;

            return reject(e);
          }
        );
      } else {
        // 2.3.3.4 If then is not a function, fulfill promise with x.
        resolve(result);
      }
    } catch (e) {
      // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
      // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
      if (consumed) return;
      consumed = true;
      return reject(e);
    }
  } else {
    // 2.3.4 If x is not an object or function, fulfill promise with x.
    resolve(result);
  }
};

PromiseFn.prototype.then = function (onFulfilled, onRejected) {
  // 2.2.1 Both onFulfilled and onRejected are optional arguments:
  // 2.2.1.1 If onFulfilled is not a function, it must be ignored.
  // 魔法穿透
  onFulfilled = typeof onFulfilled === "function" ? onFulfilled : data => data;
  // 2.2.1.2 If onRejected is not a function, it must be ignored.
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : e => {
          throw e;
        };

  let promise2;

  // 2.2.2 If onFulfilled is a function:
  // 2.2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.
  if (this.status === PROMISE_STATUS_FULFILLED) {
    // 2.2.7 then must return a promise [3.3].
    return (promise2 = new PromiseFn((resolve, reject) => {
      queueMicrotask(() => {
        try {
          const result = onFulfilled(this.value);
          resolvePromise(promise2, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }

  // 2.2.3 If onRejected is a function,
  // 2.2.3.1 it must be called after promise is rejected, with promise’s reason as its first argument.
  if (this.status === PROMISE_STATUS_REJECTED) {
    // 2.2.7 then must return a promise [3.3].
    return (promise2 = new PromiseFn((resolve, reject) => {
      queueMicrotask(() => {
        try {
          const result = onRejected(this.reason);
          resolvePromise(promise2, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }

  if (this.status === PROMISE_STATUS_PENDING) {
    // 2.2.7 then must return a promise [3.3].
    return (promise2 = new PromiseFn((resolve, reject) => {
      this.onFulfilledFunc.push(() => {
        try {
          const result = onFulfilled(this.value);
          resolvePromise(promise2, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });

      this.onRejectedFunc.push(() => {
        try {
          const result = onRejected(this.reason);
          resolvePromise(promise2, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }
};

PromiseFn.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};

PromiseFn.prototype.finally = function (onFinally) {
  this.then(
    () => {
      onFinally();
    },
    () => {
      onFinally();
    }
  );
};

PromiseFn.resolve = function (value) {
  return new PromiseFn((resolve, reject) => {
    resolve(value);
  });
};

PromiseFn.reject = function (value) {
  return new PromiseFn((resolve, reject) => {
    reject(value);
  });
};

PromiseFn.all = function (promiseArray) {
  if (!Array.isArray(promiseArray)) {
    throw new TypeError("The arguments should be an array");
  }

  return new PromiseFn((resolve, reject) => {
    try {
      const resultArray = [];

      const length = resultArray.length;

      for (let i = 0; i < length; i++) {
        promiseArray[i].then(data => {
          resultArray.push(data);

          if (resultArray.length === length) {
            resolve(resultArray);
          }
        }, reject);
      }
    } catch (e) {
      reject(e);
    }
  });
};

PromiseFn.allSettled = function (promiseArray) {
  return new PromiseFn((resolve, reject) => {
    const resultArray = [];
    const length = promiseArray.length;
    for (let i = 0; i < length; i++) {
      promiseArray[i].then(
        data => {
          resultArray.push({ status: PROMISE_STATUS_FULFILLED, value: data });
          if (resultArray.length === length) {
            resolve(results);
          }
        },
        error => {
          resultArray.push({ status: PROMISE_STATUS_REJECTED, value: error });
          if (resultArray.length === length) {
            resolve(results);
          }
        }
      );
    }
  });
};

PromiseFn.race = function (promiseArray) {
  if (!Array.isArray(promiseArray)) {
    throw new TypeError("The arguments should be an array");
  }

  return new PromiseFn((resolve, reject) => {
    const length = promiseArray.length;
    for (let i = 0; i < length; i++) {
      promiseArray[i].then(resolve, reject);
    }
  });
};

PromiseFn.deferred = function () {
  const def = {};
  const promise = new PromiseFn((resolve, reject) => {
    def.resolve = resolve;
    def.reject = reject;
  });
  def.promise = promise;

  return def;
};

module.exports = PromiseFn;
