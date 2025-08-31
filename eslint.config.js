import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Ignore build directories and generated files
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "out/**/*",
      "dist/**/*",
      "build/**/*",
      "*.d.ts",
      "next-env.d.ts"
    ],
  },
  {
    rules: {
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Disable exhaustive deps warning for refs
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    // More lenient rules for test files
    files: ["**/__tests__/**/*", "**/*.test.*", "**/*.spec.*", "jest.config.js", "jest.setup.js"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Allow any for external library interfaces (Pyodide, Monaco, etc.)
    files: [
      "**/services/python-execution-service.ts", 
      "**/services/language-switching-service.ts",
      "**/services/layout-coordination-service.ts"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // External libraries often require any
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;