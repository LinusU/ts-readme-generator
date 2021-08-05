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

const builtInTypeLinks = new Map([
  ['ImageData', 'https://developer.mozilla.org/en-US/docs/Web/API/ImageData'],
  ['Uint8Array', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array']
])

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

function getFormattedTypeName (type) {
  function getPlainName (type) {
    if (type.typeName) return type.typeName.escapedText
    if (type.literal && type.literal.kind === ts.SyntaxKind.StringLiteral) return `'${type.literal.text}'`
    if (type.kind === ts.SyntaxKind.AnyKeyword) return 'any'
    if (type.kind === ts.SyntaxKind.BooleanKeyword) return 'boolean'
    if (type.kind === ts.SyntaxKind.NumberKeyword) return 'number'
    if (type.kind === ts.SyntaxKind.ObjectKeyword) return 'object'
    if (type.kind === ts.SyntaxKind.StringKeyword) return 'string'
    if (type.kind === ts.SyntaxKind.SymbolKeyword) return 'symbol'
    if (type.kind === ts.SyntaxKind.VoidKeyword) return 'void'
  }

  function getGeneric (type) {
    if (type.typeArguments) {
      assert(type.typeArguments.length === 1, 'not implemented')

      if (type.typeArguments[0].kind === ts.SyntaxKind.ArrayType) {
        return `\`${getPlainName(type)}<Array<${getPlainName(type.typeArguments[0].elementType)}>>\``
      } else {
        return `\`${getPlainName(type)}<${getPlainName(type.typeArguments[0])}>\``
      }
    }
  }

  function getUnion (type) {
    if (type.kind === ts.SyntaxKind.UnionType) {
      return `\`${type.types.map(type => getPlainName(type)).join(' | ')}\``
    }
  }

  function getArray (type) {
    if (type.kind === ts.SyntaxKind.ArrayType) {
      return `\`Array<${getPlainName(type.elementType)}>\``
    }
  }

  let result

  result = getGeneric(type)
  if (result) return result

  result = getUnion(type)
  if (result) return result

  result = getArray(type)
  if (result) return result

  result = getPlainName(type)
  if (result) return builtInTypeLinks.has(result) ? `[\`${result}\`](${builtInTypeLinks.get(result)})` : `\`${result}\``

  assert(false, 'not implemented')
}

/**
 * @param {readonly import('typescript').JSDocTag[]} jsDoc
 */
function getJsDocComment (jsDoc) {
  return ((jsDoc && jsDoc[0] && jsDoc[0].comment) || '')
}

/**
 * @param {import('typescript').InterfaceDeclaration} props
 * @returns {[string, string]}
 */
function formatReactComponentProps (props) {
  let first = true
  let result = ''
  let apiTypeName = null

  for (const member of props.members) {
    if (member.name.escapedText === 'ref') {
      apiTypeName = member.type.typeArguments[0].typeName.escapedText
      continue
    }

    if (first) {
      first = false
    } else {
      result += '\n'
    }

    const defaultValue = (member.jsDoc[0].tags || []).find(tag => tag.tagName.escapedText === 'default')
    const typeName = getFormattedTypeName(member.type)

    result += `### \`${member.name.escapedText}\`\n`
    result += '\n'
    if (member.questionToken) result += '- optional\n'
    if (!member.questionToken) result += '- required\n'
    if (typeName) result += `- type: ${typeName}\n`
    if (defaultValue) result += `- default: \`${defaultValue.comment}\`\n`
    result += '\n'
    result += getJsDocComment(member.jsDoc) + '\n'
  }

  return [result, apiTypeName]
}

/**
 * @param {import('typescript').FunctionDeclaration | import('typescript').MethodSignature} func
 */
function formatFunction (func) {
  const name = func.name.escapedText
  const parameters = func.parameters || []

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

  result += ')`\n'

  if (parameters.length || func.type.kind !== ts.SyntaxKind.VoidKeyword) {
    result += '\n'
  }

  for (const p of parameters) {
    const isReference = p.type.typeName && p.type.typeName.kind === ts.SyntaxKind.QualifiedName
    const comment = getJsDocComment(ts.getJSDocParameterTags(p)).replace(/^- /, '')
    const typeName = isReference ? '`object`' : getFormattedTypeName(p.type)
    result += `- \`${p.name.escapedText}\` (${typeName}, ${p.questionToken ? 'optional' : 'required'})${comment ? ' - ' : ''}${comment}\n`

    if (isReference) {
      const namespaceName = p.type.typeName.left.escapedText
      const namespace = /** @type {import('typescript').NamespaceDeclaration} */ (func.parent.getChildAt(0).getChildren().find(a => a.kind === ts.SyntaxKind.ModuleDeclaration && a.name.escapedText === namespaceName))
      const statements = /** @type {import('typescript').ModuleBlock['statements']} */ (namespace.body.statements)

      const foo = statements.find(s => s.name.escapedText === p.type.typeName.right.escapedText)
      const childProperties = /** @type {import('typescript').PropertySignature[]} */ (foo.members.filter(m => m.kind === ts.SyntaxKind.PropertySignature))

      for (const cp of childProperties) {
        const comment = getJsDocComment(cp.jsDoc).replace(/^- /, '')
        result += `  - \`${cp.name.escapedText}\` (${getFormattedTypeName(cp.type)}, ${cp.questionToken ? 'optional' : 'required'})${comment ? ' - ' : ''}${comment}\n`
      }
    }
  }

  if (func.type.kind !== ts.SyntaxKind.VoidKeyword) {
    const returnTag = ts.getJSDocReturnTag(func)
    result += `- returns ${getFormattedTypeName(func.type)}${returnTag ? ` - ${returnTag.comment}` : ''}\n`
  }

  const comment = getJsDocComment(func.jsDoc)
  if (comment) {
    result += `\n${comment}\n`
  }

  return result
}

/**
 * @param {import('typescript').VariableDeclaration} variable
 */
function formatVariable (variable) {
  assert(variable.declarationList.declarations.length === 1, 'not implemented')
  const declaration = variable.declarationList.declarations[0]

  let result = ''

  const name = declaration.name.escapedText
  result += `### \`${name}\`\n`

  const typeName = getFormattedTypeName(declaration.type)
  result += `\n- type: ${typeName}\n`

  const comment = getJsDocComment(variable.jsDoc)
  if (comment) {
    result += `\n${comment}\n`
  }

  return result
}

/**
 * @param {import('typescript').ExportAssignment} node
 */
function formatSingleExportFunction (node) {
  const name = ts.getNameOfDeclaration(node).escapedText
  const func = node.parent.getChildAt(0).getChildren().find(a => a.kind === ts.SyntaxKind.FunctionDeclaration && a.name.escapedText === name)

  return formatFunction(func)
}

/**
 * @param {Array<import('typescript').FunctionDeclaration | import('typescript').MethodSignature>} functions
 * @param {Array<import('typescript').VariableDeclaration>} variables
 */
function formatMultipleExportFunction (functions, variables) {
  return [...functions.map(formatFunction), ...variables.map(formatVariable)].join('\n')
}

async function main () {
  const args = neodoc.run(usage, { laxPlacement: true })
  const checkMode = Boolean(args['--check'])

  const sourceText = (await fs.readFile('index.d.ts')).toString()
  const file = ts.createSourceFile('index.d.ts', sourceText, ts.ScriptTarget.ESNext, true)
  const children = file.getChildAt(0).getChildren()

  // React Component
  const props = /** @type {import('typescript').InterfaceDeclaration} */ (children.find(child => child.kind === ts.SyntaxKind.InterfaceDeclaration && child.name.escapedText === 'Props'))
  if (props) {
    const [text, apiTypeName] = formatReactComponentProps(props)
    await patchReadme(checkMode, 'Props', text)

    if (apiTypeName) {
      const api = /** @type {import('typescript').InterfaceDeclaration} */ (children.find(child => child.kind === ts.SyntaxKind.InterfaceDeclaration && child.name.escapedText === apiTypeName))
      const methods = /** @type {import('typescript').MethodSignature[]} */ (api.members.filter(member => member.kind === ts.SyntaxKind.MethodSignature))
      const text = formatMultipleExportFunction(methods, [])
      await patchReadme(checkMode, 'API', text)
    }

    return
  }

  // Single Exported Function
  const exportAssignments = /** @type {import('typescript').ExportAssignment[]} */ (children.filter(child => child.kind === ts.SyntaxKind.ExportAssignment))
  if (exportAssignments[0] && exportAssignments[0].isExportEquals) {
    const text = formatSingleExportFunction(exportAssignments[0])
    await patchReadme(checkMode, 'API', text)
    return
  }

  // Multiple Exported Functions / Variables
  const functionDeclarations = /** @type {import('typescript').FunctionDeclaration[]} */ (children.filter(child => child.kind === ts.SyntaxKind.FunctionDeclaration && child.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)))
  const variableDeclarations = /** @type {import('typescript').VariableStatement[]} */ (children.filter(child => child.kind === ts.SyntaxKind.VariableStatement && child.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)))
  if (functionDeclarations.length || variableDeclarations.length) {
    const text = formatMultipleExportFunction(functionDeclarations, variableDeclarations)
    await patchReadme(checkMode, 'API', text)
    return
  }

  throw new UserError('Failed to find anything to document')
}

main().catch((err) => {
  process.exitCode = 1
  console.error((err instanceof UserError) ? `\n\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m` : err.stack)
})
