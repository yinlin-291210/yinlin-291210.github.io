const PROMISE_STATUS_PENDING = "pending";
const PROMISE_STATUS_FULFILLED = "fulfilled";
const PROMISE_STATUS_REJECTED = "rejected";

function PromiseFn(executor) {
  this.status = PROMISE_STATUS_PENDING;
  this.value = null;
  this.reason = null;

  const resolve = value => {
    this.status = PROMISE_STATUS_FULFILLED;
    this.value = value;
  };

  const reject = reason => {
    this.status = PROMISE_STATUS_REJECTED;
    this.reason = reason;
  };

  executor(resolve, reject);
}

PromiseFn.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled(this.value);
  onRejected(this.reason);
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
