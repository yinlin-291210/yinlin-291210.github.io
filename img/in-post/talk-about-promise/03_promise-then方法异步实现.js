const PROMISE_STATUS_PENDING = "pending";
const PROMISE_STATUS_FULFILLED = "fulfilled";
const PROMISE_STATUS_REJECTED = "rejected";

function PromiseFn(executor) {
  this.status = PROMISE_STATUS_PENDING;
  this.value = undefined;
  this.reason = undefined;
  this.onFulfilled = Function.prototype;
  this.onRejected = Function.prototype;

  const resolve = value => {
    // 当resolve的值是一个Promise对象时，需要进行调用
    if (value instanceof PromiseFn) {
      return value.then(resolve, reject);
    }
    queueMicrotask(() => {
      if (this.status !== PROMISE_STATUS_PENDING) return;
      this.status = PROMISE_STATUS_FULFILLED;
      this.value = value;
      this.onFulfilled(this.value);
    });
  };

  const reject = reason => {
    queueMicrotask(() => {
      if (this.status !== PROMISE_STATUS_PENDING) return;
      this.status = PROMISE_STATUS_REJECTED;
      this.reason = reason;
      this.onRejected(this.reason);
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
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
  }
};

const promise = new PromiseFn((resolve, reject) => {
  setTimeout(() => {
    resolve(111);
  }, 200);
});

console.log(1);

promise.then(
  data => {
    console.log(data);
  },
  error => {
    console.log(error);
  }
);

console.log(2);
