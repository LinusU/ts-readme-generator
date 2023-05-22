#!/usr/bin/env node

const assert = require('assert')
const fs = require('fs').promises
// @ts-ignore
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
 * @param {string|string[]} input
 * @returns {string}
 */
function escapeTableCell (input) {
  return (Array.isArray(input) ? input.join('') : input).replace(/\|/g, '\\|').replace(/\n/g, '<br />')
}

/**
 * @template T
 * @param {(T|undefined)[]} values
 * @returns {T[]}
 */
function filterUndefined (values) {
  return /** @type {T[]} */ (values.filter(value => value !== undefined))
}

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

/**
 * @param {string} name
 * @returns {string}
 */
function getFormattedPlainName (name) {
  return builtInTypeLinks.has(name) ? `[\`${name}\`](${builtInTypeLinks.get(name)})` : `\`${name}\``
}

/**
 * @param {import('typescript').TypeNode} type
 * @returns {string}
 */
function getFormattedTypeName (type) {
  /**
   * @param {import('typescript').TypeNode} type
   * @returns {import('typescript').__String|string|undefined}
   */
  function getPlainName (type) {
    if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) return type.typeName.escapedText
    if (ts.isLiteralTypeNode(type) && type.literal.kind === ts.SyntaxKind.NumericLiteral) return `${type.literal.text}`
    if (ts.isLiteralTypeNode(type) && type.literal.kind === ts.SyntaxKind.StringLiteral) return `'${type.literal.text}'`
    if (type.kind === ts.SyntaxKind.AnyKeyword) return 'any'
    if (type.kind === ts.SyntaxKind.BooleanKeyword) return 'boolean'
    if (type.kind === ts.SyntaxKind.NullKeyword) return 'null'
    if (type.kind === ts.SyntaxKind.NumberKeyword) return 'number'
    if (type.kind === ts.SyntaxKind.ObjectKeyword) return 'object'
    if (type.kind === ts.SyntaxKind.StringKeyword) return 'string'
    if (type.kind === ts.SyntaxKind.SymbolKeyword) return 'symbol'
    // TODO: Readd
    // if (type.kind === ts.SyntaxKind.UndefinedKeyword) return 'undefined'
    if (type.kind === ts.SyntaxKind.UnknownKeyword) return 'unknown'
    if (type.kind === ts.SyntaxKind.VoidKeyword) return 'void'
  }

  /**
   * @param {import('typescript').TypeNode} type
   * @returns {string|undefined}
   */
  function getGeneric (type) {
    if (ts.isExpressionWithTypeArguments(type) && type.typeArguments) {
      assert(type.typeArguments.length === 1, 'not implemented')

      if (!type.typeArguments[0]) {

      } else if (ts.isArrayTypeNode(type.typeArguments[0])) {
        return `\`${getPlainName(type)}<Array<${getPlainName(type.typeArguments[0].elementType)}>>\``
      } else {
        return `\`${getPlainName(type)}<${getPlainName(type.typeArguments[0])}>\``
      }
    }
  }

  /**
   * @param {import('typescript').TypeNode} type
   * @returns {string|undefined}
   */
  function getUnion (type) {
    // TODO: Swap getPlainName() for getFormattedTypeName()
    if (ts.isUnionTypeNode(type)) {
      return `\`${type.types.map(type => getPlainName(type)).join(' | ')}\``
    }
  }

  /**
   * @param {import('typescript').TypeNode} type
   * @returns {string|undefined}
   */
  function getArray (type) {
    if (ts.isArrayTypeNode(type)) {
      return `\`Array<${getPlainName(type.elementType)}>\``
    }
  }

  /**
   * @param {import('typescript').TypeNode} type
   * @returns {string|undefined}
   */
  function getReference (type) {
    if (ts.isTypeReferenceNode(type) && ts.isQualifiedName(type.typeName) && ts.isIdentifier(type.typeName.left)) {
      return `\`${type.typeName.left.escapedText}.${type.typeName.right.escapedText}\``
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
  if (result) return getFormattedPlainName(result)

  result = getReference(type)
  if (result) return result

  assert(false, 'not implemented ' + type.kind)
}

/**
 * @param {readonly import('typescript').JSDocTag[]} jsDoc
 * @returns {string | import('typescript').NodeArray<import('typescript').JSDocComment>}
 */
function getJsDocComment (jsDoc) {
  return jsDoc[0]?.comment || ''
}

/**
 * @param {readonly import('typescript').JSDocTag[]} jsDoc
 * @returns {string[]}
 */
function getJsDocExamples (jsDoc) {
  if (!jsDoc[0]?.tags) return []
  const tags = jsDoc[0].tags.filter(tag => tag.tagName.escapedText === 'example')
  return tags.map(tag => tag.comment)
}

/**
 * @param {readonly import('typescript').JSDocTag[]} jsDoc
 * @returns {string[]}
 */
function getJsDocNotes (jsDoc) {
  if (!jsDoc || !jsDoc[0] || !jsDoc[0].tags) return []
  const tags = jsDoc[0].tags.filter(tag => tag.tagName.escapedText === 'note')
  return tags.map(tag => tag.comment)
}

/**
 * @param {readonly import('typescript').JSDocTag[]} jsDoc
 * @returns {{ comment: string, type: string | null } | null}
 */
function getJsDocThrows (jsDoc) {
  if (!jsDoc || !jsDoc[0] || !jsDoc[0].tags) return null
  const tag = jsDoc[0].tags.find(tag => tag.tagName.escapedText === 'throws')
  if (!tag) return null

  const match = /^(\{([A-Za-z0-9]+)\})?\s*(.*)/.exec(tag.comment)
  return { comment: match[3], type: match[2] || null }
}

/**
 * @param {import('typescript').InterfaceDeclaration} props
 * @returns {[string, import('typescript').__String | null]}
 */
function formatReactComponentProps (props) {
  let first = true
  let result = ''
  let apiTypeName = null

  for (const member of props.members) {
    if (
      ts.isPropertySignature(member) &&
      ts.isIdentifier(member.name) &&
      member.name.escapedText === 'ref' &&
      member.type && ts.isExpressionWithTypeArguments(member.type) &&
      member.type.typeArguments?.[0] &&
      ts.isTypeReferenceNode(member.type.typeArguments[0]) &&
      ts.isIdentifier(member.type.typeArguments[0].typeName)
    ) {
      apiTypeName = member.type.typeArguments[0].typeName.escapedText
      continue
    }

    if (first) {
      first = false
    } else {
      result += '\n'
    }

    const defaultValue = (member.jsDoc[0].tags || []).find(tag => tag.tagName.escapedText === 'default')
    const typeName = ts.isPropertySignature(member) && member.type ? getFormattedTypeName(member.type) : ''

    result += `### \`${member.name && ts.isIdentifier(member.name) ? member.name.escapedText : ''}\`\n`
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
 * @returns {string}
 */
function formatFunction (func) {
  const name = func.name && ts.isIdentifier(func.name) ? func.name.escapedText : undefined
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

    result += ts.isIdentifier(p.name) ? p.name.escapedText : ''
  }
  result += end

  result += ')`\n'

  if (parameters.length || func.type?.kind !== ts.SyntaxKind.VoidKeyword) {
    result += '\n'
  }

  for (const p of parameters) {
    if (!p.type) continue

    const referenceNode = ts.isTypeReferenceNode(p.type) ? p.type : undefined
    const comment = getJsDocComment(ts.getJSDocParameterTags(p)).replace(/^- /, '')
    const typeName = referenceNode ? '`object`' : getFormattedTypeName(p.type)
    console.log({ typeName })
    result += `- \`${ts.isIdentifier(p.name) ? p.name.escapedText : ''}\` (${typeName}, ${p.questionToken ? 'optional' : 'required'})${comment ? ' - ' : ''}${comment}\n`

    if (referenceNode && ts.isQualifiedName(referenceNode.typeName) && ts.isIdentifier(referenceNode.typeName.left) && ts.isIdentifier(referenceNode.typeName.right)) {
      const namespaceName = referenceNode.typeName.left.escapedText
      const referenceNodeRightText = referenceNode.typeName.right.escapedText
      const namespace = /** @type {import('typescript').NamespaceDeclaration|undefined} */ (func.parent.getChildAt(0).getChildren().find(a => ts.isModuleDeclaration(a) && ts.isIdentifier(a.name) && a.name.escapedText === namespaceName))
      const statements = namespace && ts.isModuleBlock(namespace.body) ? namespace.body.statements : undefined

      const foo = /** @type {import('typescript').ClassLikeDeclaration|undefined} */ (statements?.find(s => ts.isClassLike(s) ? s.name?.escapedText === referenceNodeRightText : false))
      const childProperties = /** @type {import('typescript').PropertySignature[]|undefined} */ (foo?.members.filter(m => ts.isPropertySignature(m)))

      for (const cp of childProperties || []) {
        if (!ts.isIdentifier(cp.name) || !cp.type) {
          continue
        }
        const comment = getJsDocComment(cp.jsDoc).replace(/^- /, '')
        result += `  - \`${cp.name.escapedText}\` (${getFormattedTypeName(cp.type)}, ${cp.questionToken ? 'optional' : 'required'})${comment ? ' - ' : ''}${comment}\n`
      }
    }
  }

  if (func.type && func.type.kind !== ts.SyntaxKind.VoidKeyword) {
    const returnTag = ts.getJSDocReturnTag(func)
    result += `- returns ${getFormattedTypeName(func.type)}${returnTag ? ` - ${returnTag.comment}` : ''}\n`
  }

  const throws = getJsDocThrows(func.jsDoc)
  if (throws) {
    if (throws.type) {
      result += `- throws ${getFormattedPlainName(throws.type)} - ${throws.comment}\n`
    } else {
      result += `- throws ${throws.comment}\n`
    }
  }

  const comment = getJsDocComment(func.jsDoc)
  if (comment) {
    result += `\n${comment}\n`
  }

  const notes = getJsDocNotes(func.jsDoc)
  for (const note of notes) {
    result += `\nNote: ${note}\n`
  }

  const examples = getJsDocExamples(func.jsDoc)
  if (examples.length > 0) {
    result += '\nExample:\n\n'
    result += examples.join('\n\n') + '\n'
  }

  return result
}

/**
 * @param {import('typescript').VariableStatement[]} components
 * @param {(name: string | import('typescript').__String) => import('typescript').InterfaceDeclaration | undefined} findInterface
 */
function formatMultipleReactComponents (components, findInterface) {
  let result = ''

  for (const component of components) {
    assert(component.declarationList.declarations.length === 1, 'not implemented')
    const declaration = component.declarationList.declarations[0]

    result += `### \`<${declaration && ts.isIdentifier(declaration.name) ? declaration.name.escapedText : ''}>\`\n\n`

    const comment = getJsDocComment(component.jsDoc)
    if (comment) {
      result += `${comment}\n\n`
    }

    const parentMembers = []
    const properties = declaration?.type && ts.isTypeReferenceNode(declaration.type) && declaration.type.typeArguments?.[0] && ts.isTypeReferenceNode(declaration.type.typeArguments[0]) && ts.isIdentifier(declaration.type.typeArguments[0].typeName) ? findInterface(declaration.type.typeArguments[0].typeName.escapedText) : undefined

    if (properties?.heritageClauses?.length) {
      assert(component.declarationList.declarations.length === 1, 'not implemented')

      for (const type of properties.heritageClauses[0]?.types || []) {
        if (ts.isIdentifier(type.expression)) {
          parentMembers.push(...(findInterface(type.expression.escapedText)?.members || []))
        }
      }
    }

    const members = filterUndefined(properties?.members.map((member) => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name) && member.type) {
        return {
          name: member.name.escapedText + '',
          required: member.questionToken ? 'optional' : 'required',
          typeName: getFormattedTypeName(member.type),
          defaultValue: ((member.jsDoc && member.jsDoc[0].tags) || []).find(tag => tag.tagName.escapedText === 'default'),
          comment: getJsDocComment(member.jsDoc)
        }
      }
    }) || [])

    const someDefaultValues = members.some(member => member.defaultValue)
    const someComments = members.some(member => member.comment)

    result += `Property | Required | Type${someDefaultValues ? ' | Default' : ''}${someComments ? ' | Comment' : ''}\n`
    result += `-------- | -------- | ----${someDefaultValues ? ' | -------' : ''}${someComments ? ' | -------' : ''}\n`
    for (const member of members || []) {
      result += `${escapeTableCell(member.name)} | ${escapeTableCell(member.required)} | ${escapeTableCell(member.typeName)}`
      if (someDefaultValues) result += ` | ${escapeTableCell(member.defaultValue ? member.defaultValue.comment : '')}`
      if (someComments && member.comment) result += ` | ${escapeTableCell(member.comment)}`
      result += '\n'
    }
    result += '\n'
  }

  return result
}

/**
 * @param {import('typescript').VariableStatement} variable
 * @returns {string}
 */
function formatVariable (variable) {
  assert(variable.declarationList.declarations.length === 1, 'not implemented')
  const declaration = variable.declarationList.declarations[0]

  if (!declaration) return ''

  let result = ''

  const name = ts.isIdentifier(declaration.name) ? declaration.name.escapedText : ''
  result += `### \`${name}\`\n`

  if (declaration.type) {
    const typeName = getFormattedTypeName(declaration.type)
    result += `\n- type: ${typeName}\n`
  }

  const comment = getJsDocComment(variable.jsDoc)
  if (comment) {
    result += `\n${comment}\n`
  }

  return result
}

/**
 * @param {import('typescript').ExportAssignment} node
 * @returns {string}
 */
function formatSingleExportFunction (node) {
  const declarationName = ts.getNameOfDeclaration(node)
  const name = declarationName && ts.isIdentifier(declarationName) ? declarationName.escapedText : ''
  const func = /** @type {import('typescript').FunctionDeclaration | undefined} */ (node.parent.getChildAt(0).getChildren().find(a => ts.isFunctionDeclaration(a) && a.name?.escapedText === name))

  return func ? formatFunction(func) : ''
}

/**
 * @param {Array<import('typescript').FunctionDeclaration | import('typescript').MethodSignature>} functions
 * @param {Array<import('typescript').VariableStatement>} variables
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

  /**
   * @param {string | import('typescript').__String} name
   * @returns {import('typescript').InterfaceDeclaration | undefined}
   */
  function findInterface (name) {
    return /** @type {import('typescript').InterfaceDeclaration | undefined} */ (children.find(child => ts.isInterfaceDeclaration(child) && child.name.escapedText === name))
  }

  // Single React Component
  const props = findInterface('Props')
  if (props) {
    const [text, apiTypeName] = formatReactComponentProps(props)
    await patchReadme(checkMode, 'Props', text)

    if (apiTypeName) {
      const api = /** @type {import('typescript').InterfaceDeclaration | undefined} */ (children.find(child => ts.isInterfaceDeclaration(child) && child.name.escapedText === apiTypeName))
      const methods = /** @type {import('typescript').MethodSignature[]} */ ((api?.members || []).filter(member => ts.isMethodSignature(member)))
      const text = formatMultipleExportFunction(methods, [])
      await patchReadme(checkMode, 'API', text)
    }

    return
  }

  // Multiple React Components
  const components = /** @type {import('typescript').VariableStatement[]} */ (children.filter(child => {
    if (!ts.isVariableStatement(child) || !child.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      return false
    }

    const childDeclaration = child.declarationList.declarations[0]?.type

    return childDeclaration &&
      ts.isTypeReferenceNode(childDeclaration) &&
      ts.isIdentifier(childDeclaration.typeName) &&
      childDeclaration.typeName.escapedText === 'FC'
  }))
  if (components.length) {
    const text = formatMultipleReactComponents(components, findInterface)
    await patchReadme(checkMode, 'Components', text)
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
  const functionDeclarations = /** @type {import('typescript').FunctionDeclaration[]} */ (children.filter(child => ts.isFunctionDeclaration(child) && child.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)))
  const variableDeclarations = /** @type {import('typescript').VariableStatement[]} */ (children.filter(child => ts.isVariableStatement(child) && child.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)))
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
