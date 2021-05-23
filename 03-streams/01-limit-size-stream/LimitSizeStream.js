const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.#limit = options.limit;
  }

  #limit = 0;
  #bytesTotal = 0;

  /**
   * Увеличивает счётчик длины в байтах
   * @param {number} bytes
   */
  #incrementTotal(bytes) {
    this.#bytesTotal += bytes
  }

  /**
   * Проверяет переполнение счётчика длины
   * @throws LimitExceededError
   */
  #validateTotal() {
    if (this.#limit && this.#bytesTotal > this.#limit) throw new LimitExceededError()
  }

  _transform(chunk, encoding, callback) {
    let data;
    let error;
    try {
      this.#incrementTotal(chunk.length)
      this.#validateTotal()
      data = chunk.toString();
    } catch (e) {
      error = e;
    }
    callback(error, data);
  }
}

module.exports = LimitSizeStream;
