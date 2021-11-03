# React Stacked

Building blocks for robust cross-platform layouts.

The vision of React Stacked is not to provide any styling or be a full-featured UI library, instead it aims to provide low lever primitives that works the same on different platforms.

Currently supported platforms:

- React (`react-dom`)
- React Native (`react-native` or `expo`)

## Installation

```sh
npm install --save react-stacked
```

## Usage

```js
const { HStack, Text, VStack } = require('react-stacked')

const React = require('react')
const { render } = require('react-dom')

const Example = () => (
  <VStack height='150px'>
    <HStack justifyContent='space-between'>
      <Text>Left</Text>
      <Text>Right</Text>
    </HStack>

    <HStack alignItems='center' justifyContent='center' grow='1'>
      <Text>Center</Text>
    </HStack>
  </VStack>
)

render(<Example />)
```

```text
Left                             Right



                Center



```
