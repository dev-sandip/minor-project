module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
};
