// Disable rate limiting for all tests
export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: false
};