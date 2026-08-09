import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const functionVariable = {
  selector:
    "VariableDeclaration:has(VariableDeclarator[init.type='ArrowFunctionExpression'], VariableDeclarator[init.type='FunctionExpression'])"
};

export default tseslint.config(
  { ignores: ["dist", "coverage", "seed-design", "work"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: {
      "@stylistic": stylistic,
      "react-hooks": reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        {
          blankLine: "always",
          prev: "*",
          next: ["function", functionVariable]
        },
        {
          blankLine: "always",
          prev: ["function", functionVariable],
          next: "*"
        }
      ]
    }
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/app/**", "**/routes/**", "**/widgets/**", "**/features/**", "**/entities/**"],
              message: "Shared code cannot depend on higher FSD layers."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/app/**", "**/routes/**", "**/widgets/**", "**/features/**", "**/entities/**"],
              message: "Entities can depend only on shared code."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/app/**", "**/routes/**", "**/widgets/**", "**/features/**"],
              message: "Feature slices cannot import app, routes, widgets, or sibling features."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/app/**", "**/routes/**", "**/widgets/**"],
              message: "Widgets cannot import app, routes, or sibling widgets."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/app/**", "**/routes/**"],
              message: "Routes cannot import app or other route files."
            }
          ]
        }
      ]
    }
  }
);
