import React from 'react'

declare type Direction = 'left' | 'right' | 'up' | 'down'
declare type SwipeHandler = (direction: Direction) => void
declare type CardLeftScreenHandler = (direction: Direction) => void

declare interface API {
  /**
   * Programmatically trigger a swipe of the card.
   *
   * @param dir The direction in which the card should be swiped.
   */
  swipe (dir: Direction): Promise<void>
}

declare interface Props {
  ref?: React.Ref<API>

  /**
   * Whether or not to let the element be flicked away off-screen after a swipe.
   *
   * @default true
   */
  flickOnSwipe?: boolean

  /**
   * Callback that will be executed when a swipe has been completed. It will be called with a single string denoting which direction the swipe was in: `'left'`, `'right'`, `'up'` or `'down'`.
   */
  onSwipe?: SwipeHandler

  /**
   * Callback that will be executed when a `TinderCard` has left the screen. It will be called with a single string denoting which direction the swipe was in: `'left'`, `'right'`, `'up'` or `'down'`.
   */
  onCardLeftScreen?: CardLeftScreenHandler

  /**
   * An array of directions for which to prevent swiping out of screen. Valid arguments are `'left'`, `'right'`, `'up'` and `'down'`.
   *
   * @default []
   */
  preventSwipe?: string[]

  /**
   * The children passed in is what will be rendered as the actual Tinder-style card.
   */
  children?: React.ReactNode
}

declare const TinderCard: React.FC<Props>

export = TinderCard
