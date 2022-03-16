# Generate Readme from TypeScript

Small tool to automatically generate your API documentation straight into your `readme.md` from your TypeScript typings.

**Note:** This is very much a work in progress. I'm currently going through my projects one by one and replacing the API docs with generated ones, improving this module as I go. Don't expect it to work with most modules just yet.

## Installation

```sh
npm install --global ts-readme-generator
```

## Usage

Make sure that your `readme.md` contains a `## API` section (or `## Props` if it's a React module), then simply run the command to update your Readme file from the TypeScript definitions.

```sh
ts-readme-generator
```

You can also run the script in "check mode" to make it exit with a non-zero status if the documentation isn't up to date.

```sh
ts-readme-generator --check
```

## Examples

Check out these projects using `ts-readme-generator`:

- [`@cwasm/lodepng`](https://github.com/LinusU/cwasm-lodepng)
- [`append-field`](https://github.com/LinusU/node-append-field)
- [`base32-encode`](https://github.com/LinusU/base32-encode)
- [`fs-xattr`](https://github.com/LinusU/fs-xattr)
- [`load-yaml-file`](https://github.com/LinusU/load-yaml-file)
- [`react-stacked`](https://github.com/LinusU/react-stacked)
- [`react-tinder-card`](https://github.com/3DJakob/react-tinder-card)
- [`server-accepts-email`](https://github.com/LinusU/server-accepts-email)
- [`to-data-view`](https://github.com/LinusU/to-data-view)

If you are using this in a public project, please send a PR to add it to this list!
