#!/usr/bin/env node

const assert = require('assert')
const fs = require('fs').promises
const neodoc = require('neodoc')
const ts = require('typescript')

class UserError extends Error {}

const usage = `
Generate Readme from TypeScript

usage:
  ts-readme-generator [options]

options:
  --check      Instead of changing the readme, exit with a non-zero exit code if update is needed.
  --help       Show this help, then exit.
  --version    Print the current version, then exit.
`

/**
 * @param {boolean} checkMode
 * @param {string} heading
 * @param {string} body
 */
async function patchReadme (checkMode, heading, body) {
  const content = (await fs.readFile('readme.md')).toString()

  let first = true
  let found = false
  let result = ''
  const parts = content.split('\n## ')

  for (const part of parts) {
    if (first) {
      first = false
    } else {
      result += '\n## '
    }

    if (part.startsWith(heading + '\n')) {
      found = true
      result += heading + '\n\n' + body
    } else {
      result += part
    }
  }

  if (!found) {
    result = result.trim() + '\n\n## ' + heading + '\n\n' + body
  }

  if (result.trim() !== content.trim()) {
    if (checkMode) {
      throw new UserError(`Section "${heading}" needs update`)
    }

    await fs.writeFile('readme.md', result.trim() + '\n')
  }
}

function getTypeName (type, fullName = true) {
  if (fullName && type.typeArguments) {
    assert(type.typeArguments.length === 1, 'not implemented')
    return `${getTypeName(type, false)}<${getTypeName(type.typeArguments[0])}>`
  }

  // if (type.typeName && type.typeName.kind === ts.SyntaxKind.QualifiedName) return type.typeName.right.escapedText

  if (type.typeName) return type.typeName.escapedText
  if (type.kind === ts.SyntaxKind.BooleanKeyword) return 'boolean'
  if (type.kind === ts.SyntaxKind.NumberKeyword) return 'number'
  if (type.kind === ts.SyntaxKind.StringKeyword) return 'string'

  assert(false, 'not implemented')
}

/**
 * @param {readonly import('typescript').JSDocTag[]} jsDoc
 */
function getJsDocComment (jsDoc) {
  return ((jsDoc && jsDoc[0] && jsDoc[0].comment) || '').replace(/^- /, '')
}

/**
 * @param {import('typescript').InterfaceDeclaration} props
 */
function formatReactComponentProps (props) {
  let first = true
  let result = ''

  for (const member of props.members) {
    if (first) {
      first = false
    } else {
      result += '\n'
    }

    const defaultValue = (member.jsDoc[0].tags || []).find(tag => tag.tagName.escapedText === 'default')
    const typeName = getTypeName(member.type)

    result += `### \`${member.name.escapedText}\`\n`
    result += '\n'
    if (member.questionToken) result += '- optional\n'
    if (!member.questionToken) result += '- required\n'
    if (typeName) result += `- type: \`${typeName}\`\n`
    if (defaultValue) result += `- default: \`${defaultValue.comment}\`\n`
    result += '\n'
    result += member.jsDoc[0].comment + '\n'
  }

  return result
}

/**
 * @param {import('typescript').ExportAssignment} node
 */
function formatSingleExportFunction (node) {
  const name = ts.getNameOfDeclaration(node).escapedText
  const func = node.parent.getChildAt(0).getChildren().find(a => a.kind === ts.SyntaxKind.FunctionDeclaration && a.name.escapedText === name)
  const parameters = /** @type {import('typescript').ParameterDeclaration[]} */ (func.parameters || [])

  const returnType = getTypeName(func.type)

  let result = ''

  result += `### \`${name}(`

  let first = true
  let end = ''
  for (const p of parameters) {
    if (p.questionToken) {
      result += '['
      end += ']'
    }

    if (first) {
      first = false
    } else {
      result += ', '
    }

    result += p.name.escapedText
  }
  result += end

  result += `): ${returnType}\`\n`

  if (parameters.length) {
    result += '\n'
  }

  for (const p of parameters) {
    const isReference = p.type.typeName && p.type.typeName.kind === ts.SyntaxKind.QualifiedName
    const comment = getJsDocComment(ts.getJSDocParameterTags(p))
    result += `- \`${p.name.escapedText}\` (${isReference ? 'object' : getTypeName(p.type)}, ${p.questionToken ? 'optional' : 'required'})${comment ? ' - ' : ''}${comment}\n`

    if (isReference) {
      const namespaceName = p.type.typeName.left.escapedText
      const namespace = /** @type {import('typescript').NamespaceDeclaration} */ (node.parent.getChildAt(0).getChildren().find(a => a.kind === ts.SyntaxKind.ModuleDeclaration && a.name.escapedText === namespaceName))
      const statements = /** @type {import('typescript').ModuleBlock['statements']} */ (namespace.body.statements)

      const foo = statements.find(s => s.name.escapedText === p.type.typeName.right.escapedText)
      const childProperties = /** @type {import('typescript').PropertySignature[]} */ (foo.members.filter(m => m.kind === ts.SyntaxKind.PropertySignature))

      for (const cp of childProperties) {
        const comment = getJsDocComment(cp.jsDoc)
        result += `  - \`${cp.name.escapedText}\` (${getTypeName(cp.type)}, ${cp.questionToken ? 'optional' : 'required'})${comment ? ' - ' : ''}${comment}\n`
      }
    }
  }

  return result
}

async function main () {
  const args = neodoc.run(usage, { laxPlacement: true })
  const checkMode = Boolean(args['--check'])

  const sourceText = (await fs.readFile('index.d.ts')).toString()
  const file = ts.createSourceFile('index.d.ts', sourceText, ts.ScriptTarget.ESNext, true)
  const children = file.getChildAt(0).getChildren()

  const interfaces = /** @type {import('typescript').InterfaceDeclaration[]} */ (children.filter(child => child.kind === ts.SyntaxKind.InterfaceDeclaration))

  // React Component
  const props = interfaces.find(child => child.name.escapedText === 'Props')
  if (props) {
    const text = formatReactComponentProps(props)
    await patchReadme(checkMode, 'Options', text)
  }

  // Single Exported Function
  const exportAssignments = /** @type {import('typescript').ExportAssignment[]} */ (children.filter(child => child.kind === ts.SyntaxKind.ExportAssignment))
  if (exportAssignments[0] && exportAssignments[0].isExportEquals) {
    const text = formatSingleExportFunction(exportAssignments[0])
    await patchReadme(checkMode, 'API', text)
  }
}

main().catch((err) => {
  process.exitCode = 1
  console.error((err instanceof UserError) ? `\n\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m` : err.stack)
})
