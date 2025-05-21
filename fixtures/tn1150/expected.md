# TN1150

HFS Plus string utilities.

## Usage

```js
import { compare, normalize } from 'tn1150'

// Sort filenames
filenames.sort(compare)

// Normalize filename
filename = normalize(filename)
```

## API

### `compare(lhs, rhs)`

- `lhs` (`string`, required)
- `rhs` (`string`, required)
- returns `-1 | 0 | 1`

Compare two strings using the algorithm from TN1150. Useful for sorting filenames.

### `normalize(input)`

- `input` (`string`, required)
- returns `string`

Normalize a string using Unicode Canonical Decomposition.
