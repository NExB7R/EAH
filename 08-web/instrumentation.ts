export async function register() {
  if (typeof process !== 'undefined' && typeof process.setMaxListeners === 'function') {
    process.setMaxListeners(50)
  }
}
