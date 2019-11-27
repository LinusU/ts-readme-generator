# Indeterminate Spinner for React

A simple indeterminate spinner for use with React.js

## Installation

```sh
npm install --save react-indeterminate-spinner
```

## Usage

```js
const IndeterminateSpinner = require('react-indeterminate-spinner')

// ...

return (
  <div>
    <p>
      <IndeterminateSpinner size='128px' />
    </p>

    <p>
      Loading data...
    </p>
  </div>
)
```

**Result:**

<img src="example.gif" width="160" height="200" />

## Props

### `size`

The size of the spinner. Can be specified as any css-compatible length.

e.g. `'100%'`, `'128px'`, `'1em'`
