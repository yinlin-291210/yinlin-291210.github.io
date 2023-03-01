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
  } catch (error) {
    reject(error);
  }
}

PromiseFn.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === "function" ? onFulfilled : data => data;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : error => {
          throw error;
        };

  let promise2;

  if (this.status === PROMISE_STATUS_FULFILLED) {
    return (promise2 = new PromiseFn((resolve, reject) => {
      queueMicrotask(() => {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }

  if (this.status === PROMISE_STATUS_REJECTED) {
    return (promise2 = new PromiseFn((resolve, reject) => {
      queueMicrotask(() => {
        try {
          const result = onRejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }

  if (this.status === PROMISE_STATUS_PENDING) {
    return (promise2 = new PromiseFn((resolve, reject) => {
      this.onFulfilledFunc.push(() => {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.onRejectedFunc.push(() => {
        try {
          const result = onRejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }));
  }
};

const promise = new PromiseFn((resolve, reject) => {
  // resolve("data");
  reject("error");
});

promise
  .then(
    data => {
      console.log("then1", data);
      return data;
    },
    error => {
      console.log("error1", error);
      return `error data`;
    }
  )
  .then(
    data => {
      console.log("then2", data);
    },
    error => {
      console.log("error2", error);
    }
  );
