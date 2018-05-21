"use strict";

module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "test/.+\\.(test|spec)\\.ts$",
  testPathIgnorePatterns: [
    "<rootDir>/__mocks__/",
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
  ],
  snapshotSerializers: ["<rootDir>/test/raw-serializer.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
      "src": "<rootDir>/src/",
      "@test/(.*)": "<rootDir>/test/$1"
  },
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "html"],
  coveragePathIgnorePatterns: [
    "<rootDir>/__mocks__/",
    "<rootDir>/dist/",
    "<rootDir>/test/",
    "<rootDir>/node_modules/",
  ],
};
