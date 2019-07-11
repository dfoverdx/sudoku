/**
 * @type jest.GlobalConfig
 */
module.exports = {
  "roots": [
    "./src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "setupFiles": [
    "./test/setup.js",
  ],
  "testEnvironment": "jsdom",
}