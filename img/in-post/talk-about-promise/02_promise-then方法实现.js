const PROMISE_STATUS_PENDING = "pending";
const PROMISE_STATUS_FULFILLED = "fulfilled";
const PROMISE_STATUS_REJECTED = "rejected";

function PromiseFn(executor) {
  this.status = PROMISE_STATUS_PENDING;
  this.value = undefined;
  this.reason = undefined;

  const resolve = value => {
    if (this.status !== PROMISE_STATUS_PENDING) return;
    this.status = PROMISE_STATUS_FULFILLED;
    this.value = value;
  };

  const reject = reason => {
    if (this.status !== PROMISE_STATUS_PENDING) return;
    this.status = PROMISE_STATUS_REJECTED;
    this.reason = reason;
  };

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

PromiseFn.prototype.then = function (onFulfilled, onRejected) {
  if (this.status === PROMISE_STATUS_FULFILLED) {
    onFulfilled(this.value);
  }

  if (this.status === PROMISE_STATUS_REJECTED) {
    onRejected(this.reason);
  }
};

const promise = new PromiseFn((resolve, reject) => {
  resolve(111);
  reject(222);
});

promise.then(
  data => {
    console.log(data);
  },
  error => {
    console.log(error);
  }
);
