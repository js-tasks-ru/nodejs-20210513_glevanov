const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  #buffer = '';
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    this.#buffer += chunk.toString();

    const lines = this.#buffer.split(os.EOL);

    if (lines.length) {
      lines.forEach((line, index) => {
        if (!line) return
        if (index === lines.length - 1) {
          this.#buffer = line
        } else {
          this.push(line);
        }
      });
    }

    callback();
  }

  _flush(callback) {
    this.push(this.#buffer);
    callback();
  }
}

module.exports = LineSplitStream;
