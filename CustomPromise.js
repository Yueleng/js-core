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

    return new CustomPromise((resolve, reject) => {
      if (this.status == CustomPromise.PENDING) {
        //   this.callbacks.push(onFulfilled);
        //   this.callbacks.push(onRejected);

        // a betterway to deal with callbacks.
        this.callbacks.push({
          onFulfilled: (value) => {
            try {
              let result = onFulfilled(value);
              if (result instanceof CustomPromise) {
                // result.then(
                //   (value) => {
                //     resolve(value);
                //   },
                //   (reason) => {
                //     reject(reason);
                //   }
                // );
                result.then(resolve, reject);
              } else {
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          },
          onRejected: (reason) => {
            try {
              let result = onRejected(reason);
              if (result instanceof CustomPromise) {
                // result.then(
                //   (value) => {
                //     resolve(value);
                //   },
                //   (reason) => {
                //     reject(reason);
                //   }
                // );
                result.then(resolve, reject);
              } else {
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          },
        });
      }

      if (this.status == CustomPromise.FULFILLED) {
        setTimeout(() => {
          try {
            let result = onFulfilled(this.value);
            if (result instanceof CustomPromise) {
              //   result.then(
              //     (value) => {
              //       resolve(value);
              //     },
              //     (reason) => {
              //       reject(reason);
              //     }
              //   );
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status == CustomPromise.REJECTED) {
        setTimeout(() => {
          try {
            let result = onRejected(this.value);
            if (result instanceof CustomPromise) {
              //   result.then(
              //     (value) => {
              //       resolve(value);
              //     },
              //     (reason) => {
              //       reject(reason);
              //     }
              //   );
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        });
      }
    });
  }
}

// new Promise((resolve, reject) => {
//   resolve("JieJue");
//   resolve("JuJue");
// });
