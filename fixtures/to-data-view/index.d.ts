/**
 * Return a `DataView` instance that uses the same memory as the provided `ArrayBuffer`, 8-bit typed array or `Buffer`.
 *
 * @example
 * ```js
 * import toDataView from 'to-data-view'
 *
 * // This function will accept both `ArrayBuffer` and `Buffer` as input
 * function awesomeParser (source) {
 *   const view = toDataView(source)
 *
 *   // ...
 * }
 * ```
 */
declare function toDataView (data: ArrayBuffer | Int8Array | Uint8Array | Uint8ClampedArray): DataView
export = toDataView
