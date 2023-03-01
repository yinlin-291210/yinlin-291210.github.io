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

  if (this.status === PROMISE_STATUS_FULFILLED) {
    onFulfilled(this.value);
  }

  if (this.status === PROMISE_STATUS_REJECTED) {
    onRejected(this.reason);
  }

  if (this.status === PROMISE_STATUS_PENDING) {
    this.onFulfilledFunc.push(onFulfilled);
    this.onRejectedFunc.push(onRejected);
  }
};

const promise = new PromiseFn((resolve, reject) => {
  setTimeout(() => {
    resolve(
      new PromiseFn(resolve => {
        resolve("new PromiseFn");
      })
    );
  }, 200);
});

console.log(1);

promise.then(
  data => {
    console.log("then1", data);
  },
  error => {
    console.log(error);
  }
);

promise.then(
  data => {
    console.log("then2", data);
  },
  error => {
    console.log(error);
  }
);

console.log(2);
