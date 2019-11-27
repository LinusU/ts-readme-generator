import { FC } from 'react'

declare interface Props {
  /**
   * The size of the spinner. Can be specified as any css-compatible length.
   *
   * e.g. `'100%'`, `'128px'`, `'1em'`
   */
  size?: string
}

declare const IndeterminateSpinner: FC<Props>

export = IndeterminateSpinner
