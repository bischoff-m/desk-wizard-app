import { fixupConfigRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/.next/",
      "**/next-env.d.ts",
      "**/next.config.js",
      "**/gen/",
      "**/target/",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:import/recommended",
      "plugin:@typescript-eslint/recommended",
      "next/core-web-vitals",
      "eslint-config-prettier",
    ),
  ),
  {
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "module",
    },
    settings: {
      "import/resolver": {
        node: {
          paths: ["src"],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      "no-console": 2,
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "import/no-unresolved": ["error", { ignore: [".glsl$"] }],
    },
  },
];
