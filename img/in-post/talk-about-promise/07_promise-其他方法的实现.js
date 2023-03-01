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
  if (promise2 === result) {
    return reject(new TypeError("e due to circular reference"));
  }

  let thenable;
  let consumed = false;

  // 如果返回的result是一个Promise类型
  if (result instanceof PromiseFn) {
    if (result.status === PROMISE_STATUS_PENDING) {
      result.then(function (data) {
        resolvePromise(promise2, data, resolve, reject);
      }, reject);
    } else {
      result.then(resolve, reject);
    }
    return;
  }

  // 如果result是一个带有then方法的函数或者对象
  const isComplexResult = target =>
    (typeof target === "function" || typeof target === "object") && target !== null;

  if (isComplexResult(result)) {
    try {
      thenable = result.then;

      if (typeof thenable === "function") {
        thenable.call(
          result,
          function (data) {
            if (consumed) return;
            consumed = true;

            return resolvePromise(promise2, data, resolve, reject);
          },
          function (e) {
            if (consumed) return;
            consumed = true;

            return reject(e);
          }
        );
      } else {
        resolve(result);
      }
    } catch (e) {
      if (consumed) return;
      consumed = true;
      return reject(e);
    }
  } else {
    resolve(result);
  }
};

PromiseFn.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === "function" ? onFulfilled : data => data;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : e => {
          throw e;
        };

  let promise2;

  if (this.status === PROMISE_STATUS_FULFILLED) {
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

  if (this.status === PROMISE_STATUS_REJECTED) {
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
