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

/** 检查普通函数的首字母，并允许 React 组件使用 PascalCase。 */
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
		/** 报错提示无效的禁用指令和重复的行内规则配置。 */
		linterOptions: { reportUnusedDisableDirectives: "error", reportUnusedInlineConfigs: "error" },
		languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
		plugins: {
			"@stylistic": stylistic,
			project: { rules: { "function-name": functionNameRule } },
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			/** 要求定义 setter 的属性同时提供 getter。 */
			"accessor-pairs": "error",
			/** 要求 map、filter 等数组方法的回调在需要结果时返回值。 */
			"array-callback-return": "error",
			/** 禁止在声明所在的代码块之外使用 var 变量。 */
			"block-scoped-var": "error",
			/** 将函数的圈复杂度限制为 50。 */
			complexity: ["error", 50],
			/** 要求条件分支和循环体使用花括号，包括只有一条语句的情况。 */
			curly: ["error", "all"],
			/** 将返回值一致性检查交给 TypeScript 版本。 */
			"consistent-return": "off",
			/** 将属性访问风格检查交给 TypeScript 版本。 */
			"dot-notation": "off",
			/** 要求使用严格相等和不等运算符 === 与 !==。 */
			eqeqeq: "error",
			/** 禁止调用浏览器的 alert、confirm 和 prompt。 */
			"no-alert": "error",
			/** 禁止访问 arguments.caller 和 arguments.callee。 */
			"no-caller": "error",
			/** 禁止以未转义的等号开始正则字面量，以免与除法赋值混淆。 */
			"no-div-regex": "error",
			/** 前置分支已经返回时，要求移除多余的 else 块。 */
			"no-else-return": "error",
			/** 禁止修改内置对象的原型。 */
			"no-extend-native": "error",
			/** 禁止没有实际效果的 bind 调用。 */
			"no-extra-bind": "error",
			/** 禁止在 break 和 continue 中使用多余的标签。 */
			"no-extra-label": "error",
			/** 禁止多余的独立代码块。 */
			"no-lone-blocks": "error",
			/** 禁止用行尾反斜杠把普通字符串跨行书写。 */
			"no-multi-str": "error",
			/** 禁止仅为副作用执行 new 并丢弃创建的对象。 */
			"no-new": "error",
			/** 禁止用 Function 构造器动态创建函数。 */
			"no-new-func": "error",
			/** 禁止用 new 创建 String、Number 和 Boolean 包装对象。 */
			"no-new-wrappers": "error",
			/** 禁止在字符串里使用八进制转义。 */
			"no-octal-escape": "error",
			/** 禁止对函数参数重新赋值。 */
			"no-param-reassign": "error",
			/** 禁止在 return 表达式中赋值，括号内也禁止。 */
			"no-return-assign": ["error", "always"],
			/** 禁止将同一个表达式与自身比较。 */
			"no-self-compare": "error",
			/** 禁止在普通表达式里使用逗号运算符，括号内也禁止。 */
			"no-sequences": ["error", { allowInParentheses: false }],
			/** 将变量遮蔽检查交给 TypeScript 版本。 */
			"no-shadow": "off",
			/** 禁止在普通字符串中误写模板插值占位符。 */
			"no-template-curly-in-string": "error",
			/** 检查循环条件中未更新、可能导致循环无法结束的变量。 */
			"no-unmodified-loop-condition": "error",
			/** 将先使用后定义的检查交给 TypeScript 版本。 */
			"no-use-before-define": "off",
			/** 禁止以不必要的 call 或 apply 代替直接调用。 */
			"no-useless-call": "error",
			/** 禁止拼接可直接合并的字符串字面量。 */
			"no-useless-concat": "error",
			/** 禁止省略后行为相同的空 return。 */
			"no-useless-return": "error",
			/** 将 void 运算符限制在独立的表达式语句中。 */
			"no-void": ["error", { allowAsStatement: true }],
			/** 要求正则捕获组使用名称。 */
			"prefer-named-capture-group": "error",
			/** 结合返回类型检查各路径是否一致地返回值。 */
			"@typescript-eslint/consistent-return": "error",
			/** 优先使用点号访问属性，允许对索引签名使用方括号。 */
			"@typescript-eslint/dot-notation": ["error", { allowIndexSignaturePropertyAccess: true }],
			/** 禁止显式使用 any。 */
			"@typescript-eslint/no-explicit-any": "error",
			/** 检查未处理的 Promise 和 thenable。 */
			"@typescript-eslint/no-floating-promises": ["error", { checkThenables: true }],
			/** 禁止内层声明遮蔽外层的同名绑定。 */
			"@typescript-eslint/no-shadow": "error",
			/** 检查先使用后定义的引用，允许跨作用域提前引用类。 */
			"@typescript-eslint/no-use-before-define": ["error", { classes: false }],
			/** 要求条件显式判断字符串和数字，避免隐式布尔转换。 */
			"@typescript-eslint/strict-boolean-expressions": ["error", { allowString: false, allowNumber: false }],
			/** 要求标明类型导入，混合导入中的类型使用内联 type。 */
			"@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
			/** 纯类型导入使用 import type，避免生成有副作用的运行时导入。 */
			"@typescript-eslint/no-import-type-side-effects": "error",
			/** 统一类型、类、枚举、参数和方法的命名。 */
			"@typescript-eslint/naming-convention": [
				"error",
				/** 类型别名使用 T 前缀和 PascalCase。 */
				{ selector: "typeAlias", format: ["PascalCase"], prefix: ["T"] },
				/** 接口使用 I 前缀和 PascalCase。 */
				{ selector: "interface", format: ["PascalCase"], prefix: ["I"] },
				/** 类名使用严格 PascalCase。 */
				{ selector: "class", format: ["StrictPascalCase"] },
				/** 泛型参数使用 T 前缀和严格 PascalCase。 */
				{ selector: "typeParameter", format: ["StrictPascalCase"], prefix: ["T"] },
				/** 枚举名使用 E 前缀和严格 PascalCase。 */
				{ selector: "enum", format: ["StrictPascalCase"], prefix: ["E"] },
				/** 枚举成员使用 PascalCase。 */
				{ selector: "enumMember", format: ["PascalCase"] },
				/** 函数参数使用 camelCase。 */
				{ selector: "parameter", format: ["camelCase"] },
				/** 方法和访问器使用 camelCase。 */
				{ selector: ["method", "accessor"], format: ["camelCase"] },
			],
			/** 要求函数和回调显式声明返回类型。 */
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowDirectConstAssertionInArrowFunctions: false,
					allowHigherOrderFunctions: false,
					allowTypedFunctionExpressions: false,
				},
			],
			/** 要求类方法、构造器和访问器显式声明访问级别。 */
			"@typescript-eslint/explicit-member-accessibility": [
				"error",
				{ accessibility: "off", overrides: { methods: "explicit", constructors: "explicit", accessors: "explicit" } },
			],
			/** 要求 switch 为联合类型或枚举的每个成员显式列出分支。 */
			"@typescript-eslint/switch-exhaustiveness-check": ["error", { considerDefaultExhaustiveForUnions: false }],
			/** 要求普通函数以小写字母开头，React 组件可以使用 PascalCase。 */
			"project/function-name": "error",
			/** 用语法选择器补充控制流、类型标注、空值和类字段的限制。 */
			"no-restricted-syntax": [
				"error",
				/** 要求 const 显式标注类型，遍历循环头由 TypeScript 推导绑定类型。 */
				{
					selector:
						"VariableDeclaration[kind='const']:not(:matches(ForOfStatement, ForInStatement) > VariableDeclaration.left) > VariableDeclarator:not([id.typeAnnotation])",
					message: "Declare the type of this const binding explicitly.",
				},
				/** 禁止 switch 使用 default。 */
				{ selector: "SwitchCase[test=null]", message: "List each switch case explicitly instead of using default." },
				/** 要求双重类型断言以 unknown 为中间类型。 */
				{
					selector:
						":matches(TSAsExpression, TSTypeAssertion) > :matches(TSAsExpression, TSTypeAssertion).expression[typeAnnotation.type!='TSUnknownKeyword']",
					message: "Use unknown as the intermediate type in a double assertion.",
				},
				/** 禁止 null 字面量和类型，空值使用 undefined。 */
				{ selector: ":matches(TSNullKeyword, Literal[raw='null'])", message: "Use undefined for absent values." },
				/** 要求函数类型的类字段声明访问级别，井号私有字段自带访问限制。 */
				{
					selector:
						"PropertyDefinition:not([accessibility])[key.type!='PrivateIdentifier'] > :matches(ArrowFunctionExpression, FunctionExpression).value",
					message: "Declare the accessibility of this function-valued class property.",
				},
			],
			/** 要求文件以换行符结尾。 */
			"@stylistic/eol-last": ["error", "always"],
			/** 文件内部最多连续空一行，文件首尾禁止额外空行。 */
			"@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0, maxBOF: 0 }],
			/** 代码块结束后与下一条同级语句之间空一行。 */
			"@stylistic/padding-line-between-statements": ["error", { blankLine: "always", prev: "block-like", next: "*" }],
			/** 禁止行尾的空格和制表符。 */
			"@stylistic/no-trailing-spaces": "error",
			/** 禁止标记之间多余的连续空格。 */
			"@stylistic/no-multi-spaces": "error",
			/** 要求小数点前后都有数字。 */
			"@stylistic/no-floating-decimal": "error",
			/** 类成员之间空一行，单行成员之后可以省略。 */
			"@stylistic/lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
			/** 每行最多 120 列，制表符按两列计算。 */
			"@stylistic/max-len": ["error", { code: 120, tabWidth: 2 }],
			/** 每行最多写一条语句。 */
			"@stylistic/max-statements-per-line": ["error", { max: 1 }],
			/** 使用 1TBS 花括号风格，非空块分多行书写。 */
			"@stylistic/brace-style": ["error", "1tbs"],
			/** 要求语句末尾使用分号。 */
			"@stylistic/semi": ["error", "always"],
			/** 使用分号分隔接口和对象类型的成员。 */
			"@stylistic/member-delimiter-style": "error",
			/** 普通字符串使用双引号。 */
			"@stylistic/quotes": ["error", "double"],
			/** JSX 属性的字符串值使用双引号。 */
			"@stylistic/jsx-quotes": ["error", "prefer-double"],
			/** 多行结构使用尾逗号，单行结构省略尾逗号。 */
			"@stylistic/comma-dangle": ["error", "always-multiline"],
			/** 用圆括号标明立即调用的函数表达式。 */
			"@stylistic/wrap-iife": "error",
			/** 对导入声明及命名导入项排序。 */
			"simple-import-sort/imports": "error",
			/** 对导出声明及命名导出项排序。 */
			"simple-import-sort/exports": "error",
		},
	},
]);
