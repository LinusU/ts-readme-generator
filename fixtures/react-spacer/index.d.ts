import { FC } from 'react'

declare interface Props {
  /** The width of the space. */
  width?: string | number
  /** The height of the space. */
  height?: string | number
  /** The flex grow factor of the space. */
  grow?: string | number
  /** The flex shrink factor of the space. */
  shrink?: string | number
}

declare const Spacer: FC<Props>

export = Spacer
