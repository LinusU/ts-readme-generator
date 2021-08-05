# AWS has region

Check wether or not the aws-sdk has a configured region, without loading any clients into memory.

## Installation

```sh
npm install --save aws-has-region
```

## Usage

```js
import awsHasRegion, { errorText } from 'aws-has-region'

if (!(await awsHasRegion())) {
  console.error(errorText)
  process.exit(1)
}

// ...
```

## API

### `awsHasRegion()`

- returns `Promise<boolean>`

Returns true if the AWS SDK region config is set, otherwise false.

### `errorText`

- type: `string`

A error message that can be printed if the region is not set.
