# Load YAML file

Read and parse a YAML file.

## Installation

```sh
npm install --save load-yaml-file
```

## Usage

```js
import { loadYamlFile } from 'load-yaml-file'

const data = await loadYamlFile('foo.yml')
console.log(data)
//=> {foo: true}
```

### Sync

```js
import { loadYamlFileSync } from 'load-yaml-file'

const data = loadYamlFileSync('foo.yml')
console.log(data)
//=> {foo: true}
```

## API

### `loadYamlFile(path)`

- `path` (`string | Buffer | URL`, required)
- returns `Promise<unknown>` - a promise for the parsed YAML

### `loadYamlFileSync(path)`

- `path` (`string | Buffer | URL`, required)
- returns `unknown` - the parsed YAML

## Related

- [write-yaml-file](https://github.com/zkochan/write-yaml-file) - Stringify and write YAML to a file atomically
- [load-json-file](https://github.com/sindresorhus/load-json-file) - Read and parse a JSON file
