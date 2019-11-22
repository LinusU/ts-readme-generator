/* eslint-env mocha */

const assert = require('assert')
const execa = require('execa')
const fs = require('fs').promises
const path = require('path')

const bin = path.join(__dirname, 'bin.js')

const fixtures = [
  'react-component-a',
  'react-component-b',
  'server-accepts-email'
]

describe('Generate Readme from TypeScript', () => {
  for (const fixture of fixtures) {
    it(`Generates readme in "${fixture}"`, async () => {
      const cwd = path.join(__dirname, `fixtures/${fixture}`)

      const expected = (await fs.readFile(path.join(cwd, 'expected.md'))).toString()
      const before = (await fs.readFile(path.join(cwd, 'readme.md'))).toString()

      try {
        await execa(bin, { cwd, stdio: ['ignore', 'ignore', 'inherit'] })
        const actual = (await fs.readFile(path.join(cwd, 'readme.md'))).toString()
        assert.strictEqual(actual, expected)
      } finally {
        await fs.writeFile(path.join(cwd, 'readme.md'), before)
      }
    })
  }
})
