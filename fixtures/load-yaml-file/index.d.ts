/** @returns a promise for the parsed YAML */
export function loadYamlFile(path: string | Buffer | URL): Promise<unknown>

/**
 * @returns the parsed YAML
 * @throws {YAMLException} if the file does not contain valid YAML
 */
export function loadYamlFileSync(path: string | Buffer | URL): unknown
