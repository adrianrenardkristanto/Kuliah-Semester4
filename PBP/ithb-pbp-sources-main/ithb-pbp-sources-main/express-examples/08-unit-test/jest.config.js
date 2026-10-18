process.env.ENV = "test";
const { compilerOptions } = require("./tsconfig");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  }, // jest.config.js
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testTimeout: 60000, // 1 minute
};
