/**
 * @param {unknown} value
 * @return {boolean}
 */
function isNumber(value) {
  return Boolean(typeof value === 'number' && !isNaN(value));
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @throws TypeError
 * @return {number}
 */
function sum(a, b) {
  if (!isNumber(a)) throw new TypeError('"a" is not a number');
  if (!isNumber(b)) throw new TypeError('"b" is not a number');
  return a + b;
}

module.exports = sum;
