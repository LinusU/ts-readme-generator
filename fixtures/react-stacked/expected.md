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

## Components

### `<TextStyle>`

An inline text span

Property | Required | Type
-------- | -------- | ----
color | optional | `string`
size | optional | `string \| number`
weight | optional | `'bold'`

### `<Text>`

A block of text

Property | Required | Type | Comment
-------- | -------- | ---- | -------
align | optional | `'left' \| 'right' \| 'center' \| 'justify' \| null`
color | optional | `string`
overflow | optional | `'ellipsis' \| null`
size | optional | `string \| number`
weight | optional | `'bold'`
width | optional | `string \| number` | The width of the container.
minWidth | optional | `string \| number` | The minimum width of the container.
maxWidth | optional | `string \| number` | The maximum width of the container.
height | optional | `string \| number` | The height of the container.
minHeight | optional | `string \| number` | The minimum height of the container.
maxHeight | optional | `string \| number` | The maximum height of the container.
basis | optional | `string \| number` | The flex basis of the container.
grow | optional | `string \| number` | The flex grow factor of the container.
shrink | optional | `string \| number` | The flex shrink factor of the container.
padding | optional | `string \| number`
paddingBottom | optional | `string \| number`
paddingHorizontal | optional | `string \| number`
paddingLeft | optional | `string \| number`
paddingRight | optional | `string \| number`
paddingTop | optional | `string \| number`
paddingVertical | optional | `string \| number`
borderRadius | optional | `number`
borderBottomLeftRadius | optional | `number`
borderBottomRightRadius | optional | `number`
borderTopLeftRadius | optional | `number`
borderTopRightRadius | optional | `number`
backgroundColor | optional | `string`

### `<HStack>`

A horizontal stack

Property | Required | Type | Comment
-------- | -------- | ---- | -------
alignItems | optional | `'baseline' \| 'center' \| 'end' \| 'start' \| 'stretch'` | How to align children along the cross axis.
justifyContent | optional | `'center' \| 'end' \| 'start' \| 'stretch' \| 'space-around' \| 'space-between' \| 'space-evenly'` | How to align children within the main axis.
wrap | optional | `boolean` | What happens when children overflow along the main axis.
width | optional | `string \| number` | The width of the container.
minWidth | optional | `string \| number` | The minimum width of the container.
maxWidth | optional | `string \| number` | The maximum width of the container.
height | optional | `string \| number` | The height of the container.
minHeight | optional | `string \| number` | The minimum height of the container.
maxHeight | optional | `string \| number` | The maximum height of the container.
basis | optional | `string \| number` | The flex basis of the container.
grow | optional | `string \| number` | The flex grow factor of the container.
shrink | optional | `string \| number` | The flex shrink factor of the container.
padding | optional | `string \| number`
paddingBottom | optional | `string \| number`
paddingHorizontal | optional | `string \| number`
paddingLeft | optional | `string \| number`
paddingRight | optional | `string \| number`
paddingTop | optional | `string \| number`
paddingVertical | optional | `string \| number`
borderRadius | optional | `number`
borderBottomLeftRadius | optional | `number`
borderBottomRightRadius | optional | `number`
borderTopLeftRadius | optional | `number`
borderTopRightRadius | optional | `number`
backgroundColor | optional | `string`

### `<VStack>`

A vertical stack

Property | Required | Type | Comment
-------- | -------- | ---- | -------
alignItems | optional | `'baseline' \| 'center' \| 'end' \| 'start' \| 'stretch'` | How to align children along the cross axis.
justifyContent | optional | `'center' \| 'end' \| 'start' \| 'stretch' \| 'space-around' \| 'space-between' \| 'space-evenly'` | How to align children within the main axis.
wrap | optional | `boolean` | What happens when children overflow along the main axis.
width | optional | `string \| number` | The width of the container.
minWidth | optional | `string \| number` | The minimum width of the container.
maxWidth | optional | `string \| number` | The maximum width of the container.
height | optional | `string \| number` | The height of the container.
minHeight | optional | `string \| number` | The minimum height of the container.
maxHeight | optional | `string \| number` | The maximum height of the container.
basis | optional | `string \| number` | The flex basis of the container.
grow | optional | `string \| number` | The flex grow factor of the container.
shrink | optional | `string \| number` | The flex shrink factor of the container.
padding | optional | `string \| number`
paddingBottom | optional | `string \| number`
paddingHorizontal | optional | `string \| number`
paddingLeft | optional | `string \| number`
paddingRight | optional | `string \| number`
paddingTop | optional | `string \| number`
paddingVertical | optional | `string \| number`
borderRadius | optional | `number`
borderBottomLeftRadius | optional | `number`
borderBottomRightRadius | optional | `number`
borderTopLeftRadius | optional | `number`
borderTopRightRadius | optional | `number`
backgroundColor | optional | `string`
