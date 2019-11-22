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
