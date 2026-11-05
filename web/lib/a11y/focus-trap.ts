export function getFocusWrapTarget<T extends { focus: () => void }>(
  focusableElements: readonly T[],
  activeElement: T | null,
  shiftKey: boolean,
  focusIsOutsideDrawer: boolean,
): T | null {
  if (focusableElements.length === 0) return null

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (!firstElement || !lastElement) return null

  if (shiftKey && (activeElement === firstElement || focusIsOutsideDrawer)) {
    return lastElement
  }

  if (!shiftKey && (activeElement === lastElement || focusIsOutsideDrawer)) {
    return firstElement
  }

  return null
}
