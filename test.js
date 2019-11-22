/* eslint-env mocha */

const assert = require('assert')
const execa = require('execa')
const fs = require('fs').promises
const path = require('path')

const bin = path.join(__dirname, 'bin.js')

const fixtures = [
  'react-component-a',
  'react-component-b',
  'react-component-c',
  'server-accepts-email'
]

describe('Generate Readme from TypeScript', () => {
  for (const fixture of fixtures) {
    it(`Generates readme in "${fixture}"`, async () => {
      const cwd = path.join(__dirname, `fixtures/${fixture}`)

      const expected = (await fs.readFile(path.join(cwd, 'expected.md'))).toString()
      const before = (await fs.readFile(path.join(cwd, 'readme.md'))).toString()

      try {
        // Should report that change is needed
        await assert.rejects(execa(bin, ['--check'], { cwd, stdio: 'ignore' }))

        // Should update the readme
        await execa(bin, { cwd, stdio: ['ignore', 'ignore', 'inherit'] })
        const actual = (await fs.readFile(path.join(cwd, 'readme.md'))).toString()
        assert.strictEqual(actual, expected)

        // Should report that everything is up to date
        await execa(bin, ['--check'], { cwd, stdio: ['ignore', 'ignore', 'inherit'] })
      } finally {
        await fs.writeFile(path.join(cwd, 'readme.md'), before)
      }
    })
  }
})
