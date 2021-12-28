class CustomPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";
  constructor(executor) {
    this.status = CustomPromise.PENDING;
    this.value = null;
    // this.callbacks = []; // [onFulfilled, onRejected]
    this.callbacks = [];
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    if (this.status === CustomPromise.PENDING) {
      this.status = CustomPromise.FULFILLED;
      this.value = value;
      // if (this.callbacks.length == 2) this.callbacks[0](value);
      setTimeout(() => {
        this.callbacks.forEach((_callbacks) => {
          _callbacks.onFulfilled(value);
        });
      });
    }
  }

  reject(reason) {
    if (this.status === CustomPromise.PENDING) {
      this.status = CustomPromise.REJECTED;
      this.value = reason;
      // if (this.callbacks.length == 2) this.callbacks[1](reason);
      setTimeout(() => {
        this.callbacks.forEach((_callbacks) => {
          _callbacks.onRejected(reason);
        });
      });
    }
  }

  then(onFulfilled, onRejected) {
    // support onFulfilled === null
    // or onRejected === null;

    if (typeof onFulfilled != "function") {
      onFulfilled = () => this.value;
    }

    if (typeof onRejected != "function") {
      onRejected = () => this.value;
    }

    let _promise = new CustomPromise((resolve, reject) => {
      if (this.status == CustomPromise.PENDING) {
        //   this.callbacks.push(onFulfilled);
        //   this.callbacks.push(onRejected);

        // a betterway to deal with callbacks.
        this.callbacks.push({
          onFulfilled: (value) => {
            this._parse(_promise, onFulfilled(value), resolve, reject);
          },
          onRejected: (reason) => {
            this._parse(_promise, onRejected(reason), resolve, reject);
          },
        });
      }

      if (this.status == CustomPromise.FULFILLED) {
        setTimeout(() => {
          this._parse(_promise, onFulfilled(this.value), resolve, reject);
        });
      }

      if (this.status == CustomPromise.REJECTED) {
        setTimeout(() => {
          this._parse(_promise, onRejected(this.value), resolve, reject);
        });
      }
    });

    return _promise;
  }

  _parse(promise, result, resolve, reject) {
    try {
      if (result === promise)
        throw new TypeError("Chaining cycle detected for promise");
      if (result instanceof CustomPromise) {
        result.then(resolve, reject);
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  }
}

// new Promise((resolve, reject) => {
//   resolve("JieJue");
//   resolve("JuJue");
// });
