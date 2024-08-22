import { FC } from 'react'

interface ContainerProps {
  /** The width of the container. */
  width?: string | number
  /** The minimum width of the container. */
  minWidth?: string | number
  /** The maximum width of the container. */
  maxWidth?: string | number

  /** The height of the container. */
  height?: string | number
  /** The minimum height of the container. */
  minHeight?: string | number
  /** The maximum height of the container. */
  maxHeight?: string | number

  /** The flex basis of the container. */
  basis?: string | number
  /** The flex grow factor of the container. */
  grow?: string | number
  /** The flex shrink factor of the container. */
  shrink?: string | number

  padding?: string | number
  paddingBottom?: string | number
  paddingHorizontal?: string | number
  paddingLeft?: string | number
  paddingRight?: string | number
  paddingTop?: string | number
  paddingVertical?: string | number

  borderRadius?: number
  borderBottomLeftRadius?: number
  borderBottomRightRadius?: number
  borderTopLeftRadius?: number
  borderTopRightRadius?: number

  backgroundColor?: string

  /** @ignore */
  children?: React.ReactNode
  /** @ignore */
  className?: string
}

export interface TextStyleProps {
  color?: string
  size?: string | number
  weight?: 'bold'
}

/** An inline text span */
export const TextStyle: FC<TextStyleProps>

export interface TextProps extends TextStyleProps, ContainerProps {
  align?: 'left' | 'right' | 'center' | 'justify' | null
  overflow?: 'ellipsis' | null
}

/** A block of text */
export const Text: FC<TextProps>

export interface StackProps extends ContainerProps {
  /** How to align children along the cross axis. */
  alignItems?: 'baseline' | 'center' | 'end' | 'start' | 'stretch'
  /** How to align children within the main axis. */
  justifyContent?: 'center' | 'end' | 'start' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly'
  /** What happens when children overflow along the main axis. */
  wrap?: boolean
}

/** A horizontal stack */
export const HStack: FC<StackProps>

/** A vertical stack */
export const VStack: FC<StackProps>
