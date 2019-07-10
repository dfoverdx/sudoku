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
  "globalSetup": "./test/setup.js",
}