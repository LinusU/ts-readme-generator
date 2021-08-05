/** Returns true if the AWS SDK region config is set, otherwise false. */
export function awsHasRegion (): Promise<boolean>

/** A error message that can be printed if the region is not set. */
export const errorText: string
