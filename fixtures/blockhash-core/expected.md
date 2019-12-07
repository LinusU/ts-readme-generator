# Blockhash Core

This is the core implementation of the [blockhash perceptual image hashing algorithm](http://blockhash.io).

Look at the main [`blockhash` package](https://github.com/commonsmachinery/blockhash-js) if you want a higher level api.

## Installation

```sh
npm install --save blockhash-core
```

## Usage

```js
const { bmvbhash } = require('blockhash')

const image = new ImageData(/* ... */)
const result = bmvbhash(image, 16)

console.log(result)
//=> f81bf99ffb803400e07f8c5d849f049707033a033fe33fe1bfe00e618ee30ca7
```

## API

### `bmvbhash(data, bits)`

- `data` ([`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData), required) - The input image data
- `bits` (`number`, required) - Create hash of size N^2 bits
- returns `string` - The resulting hash in hex format

Precise but slower, non-overlapping blocks.

This method is recommended as a good tradeoff between speed and good matches on any image size.

### `bmvbhashEven(data, bits)`

- `data` ([`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData), required) - The input image data
- `bits` (`number`, required) - Create hash of size N^2 bits
- returns `string` - The resulting hash in hex format

Quick and crude, non-overlapping blocks.

This method is only advisable when the image width and height are an even multiple of the number of blocks used.
