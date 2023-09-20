// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const rootPath = (process.cwd())

// Or async function
module.exports = async () => {
  return {
    verbose: true,
    rootDir: rootPath,
    "preset": "react-native",
    coveragePathIgnorePatterns: [
      '*node_modules*',
      '<rootDir>/src',
      "<rootDir>/lib/"
    ],
    moduleNameMapper:{
      'parser-sdk': '<rootDir>/src/index.tsx'
    }
  }
}
