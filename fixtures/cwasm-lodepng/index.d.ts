interface ImageData {
  width: number
  height: number
  data: Uint8ClampedArray
}

/**
 * @param source - The PNG data
 * @returns Decoded width, height and pixel data
 */
export function decode (source: Uint8Array): ImageData
