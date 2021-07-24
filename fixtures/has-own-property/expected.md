# Has Own Property?

Check if an object has a local property.

## Installation

```sh
npm install --save has-own-property
```

## Usage

```js
import hasOwnProperty from 'has-own-property'

const obj = { a: 1 }

hasOwnProperty(obj, 'a') // true
hasOwnProperty(obj, 'b') // false
```

## API

### `hasOwnProperty(object, name)`

- `object` (`object`, required)
- `name` (`string | number | symbol`, required)
- returns `boolean`

Determines whether an object has a property with the specified name.
