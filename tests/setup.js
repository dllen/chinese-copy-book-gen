import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock getComputedStyle
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = (element) => {
  if (element === document.documentElement) {
    return {
      getPropertyValue: (prop) => {
        const styles = {
          '--grid-stroke-width': '1',
          '--fourline-y1': '0.20',
          '--fourline-y2': '0.47',
          '--fourline-y3': '0.74',
          '--fourline-y4': '0.94',
        }
        return styles[prop] || ''
      },
    }
  }
  return originalGetComputedStyle(element)
}
