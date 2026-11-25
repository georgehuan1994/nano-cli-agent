import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

const reactReturnTypes = new Set([
	"JSX.Element",
	"React.JSX.Element",
	"ReactElement",
	"React.ReactElement",
	"ReactNode",
	"React.ReactNode",
]);

const functionNameRule = {
	meta: {
		type: "suggestion",
		schema: [],
		messages: { lowercase: "Function names must start with a lowercase letter. React components may use PascalCase." },
	},
	create(context) {
		function checkName(identifier, fn) {
			if (identifier?.type !== "Identifier" || /^\p{Ll}/u.test(identifier.name)) return;

			const annotation = fn.returnType?.typeAnnotation;
			const types = annotation?.type === "TSUnionType" ? annotation.types : [annotation];
			const rendersReact = types.some(
				(type) => type?.type === "TSTypeReference" && reactReturnTypes.has(context.sourceCode.getText(type.typeName)),
			);
			if (!rendersReact || !/^[A-Z][A-Za-z0-9]*$/.test(identifier.name)) {
				context.report({ node: identifier, messageId: "lowercase" });
			}
		}

		return {
			":matches(FunctionDeclaration, FunctionExpression)"(node) {
				checkName(node.id, node);
			},
			"VariableDeclarator > :matches(ArrowFunctionExpression, FunctionExpression).init"(node) {
				checkName(node.parent.id, node);
			},
		};
	},
};

export default defineConfig([
	globalIgnores(["**/*", "!src/", "!src/**/", "!src/**/*.{ts,tsx}"]),
	{
		files: ["src/**/*.{ts,tsx}"],
		extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
		languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
		plugins: {
			"@stylistic": stylistic,
			project: { rules: { "function-name": functionNameRule } },
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
			"@typescript-eslint/naming-convention": [
				"error",
				{ selector: "typeAlias", format: ["PascalCase"], prefix: ["T"] },
				{ selector: "interface", format: ["PascalCase"], prefix: ["I"] },
				{ selector: ["method", "accessor"], format: ["camelCase"] },
			],
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowDirectConstAssertionInArrowFunctions: false,
					allowHigherOrderFunctions: false,
					allowTypedFunctionExpressions: false,
				},
			],
			"@typescript-eslint/explicit-member-accessibility": [
				"error",
				{ accessibility: "off", overrides: { methods: "explicit", constructors: "explicit", accessors: "explicit" } },
			],
			"project/function-name": "error",
			"no-restricted-syntax": [
				"error",
				{
					selector:
						":matches(TSAsExpression, TSTypeAssertion) > :matches(TSAsExpression, TSTypeAssertion).expression[typeAnnotation.type!='TSUnknownKeyword']",
					message: "Use unknown as the intermediate type in a double assertion.",
				},
				{ selector: ":matches(TSNullKeyword, Literal[raw='null'])", message: "Use undefined for absent values." },
				{
					selector:
						"PropertyDefinition:not([accessibility])[key.type!='PrivateIdentifier'] > :matches(ArrowFunctionExpression, FunctionExpression).value",
					message: "Declare the accessibility of this function-valued class property.",
				},
			],
			"@stylistic/eol-last": ["error", "always"],
			"@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0, maxBOF: 0 }],
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/max-len": ["error", { code: 120, tabWidth: 2 }],
			"@stylistic/brace-style": ["error", "1tbs"],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/member-delimiter-style": "error",
			"@stylistic/quotes": ["error", "double"],
			"@stylistic/jsx-quotes": ["error", "prefer-double"],
			"@stylistic/comma-dangle": ["error", "always-multiline"],
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
		},
	},
]);
