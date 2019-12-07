interface ImageData {
  width: number
  height: number
  data: Uint8Array | Uint8ClampedArray | number[]
}

/**
 * Precise but slower, non-overlapping blocks.
 *
 * This method is recommended as a good tradeoff between speed and good matches on any image size.
 *
 * @param data - The input image data
 * @param bits - Create hash of size N^2 bits
 * @returns The resulting hash in hex format
 */
export function bmvbhash (data: ImageData, bits: number): string

/**
 * Quick and crude, non-overlapping blocks.
 *
 * This method is only advisable when the image width and height are an even multiple of the number of blocks used.
 *
 * @param data - The input image data
 * @param bits - Create hash of size N^2 bits
 * @returns The resulting hash in hex format
 */
export function bmvbhashEven (data: ImageData, bits: number): string
