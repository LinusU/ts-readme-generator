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

Foobar
