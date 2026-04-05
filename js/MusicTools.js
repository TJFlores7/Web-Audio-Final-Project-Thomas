/**
 * My Special Music Tools
 * @module MusicTools
 */

/**
 * Converts linear amplitude to decibels Full Scale
 * @param {number} amp - linear amplitude value
 * @returns {number} decibels full scale (dBFS)
 */

export function atodb(amp) {
  return 20 * Math.log10(amp);
}

/**
 * Converts decibels to linear amplitude
 * @param {number} db - decibels full scale (dBFS)
 * @returns  {number} linear amplitude
 */
export function dbtoa(db) {
  return 10 ** (db / 20);
}

/**
 * mtof
 */
export function mtof(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * ftom
 */
export function ftom(freq) {
  return Math.log2(freq / 440) * 12 + 69;
}
