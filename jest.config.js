export default {
  preset: "jest-preset-vite",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  transform: {
    "^.+\\.jsx?$": ["babel-jest", { configFile: "./babel.config.js" }],
  },

  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx}",
  ],

  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.d.js",
    "!src/main.jsx",
    "!src/**/*.stories.js",
    "!src/test/**",
  ],

  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  moduleFileExtensions: ["js", "jsx", "json"],

  watchPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
