# ESLint 规则与代码检查

ESLint 规则只应用于 `src/**/*.ts` 和 `src/**/*.tsx`。统一使用双引号、分号、多行结构的尾逗号和文件末尾换行，自动整理导入和导出。类型别名使用 `T` 前缀，接口使用 `I` 前缀，例如 `TResult` 和 `IResult`。

普通函数、方法及绑定到变量的箭头函数以小写字母开头，React 组件保留 PascalCase，并标注 `ReactElement` 或 `JSX.Element` 等返回类型。所有函数和回调均显式标注返回类型，例如 `void` 或 `Promise<void>`。类的可调用成员显式声明访问修饰符。空值使用 `undefined`。

ESLint 检查 120 列的行宽限制。Biome 在这个宽度内尽量保持单行，可运行 `pnpm exec biome format --write src` 重新排版。

类型检查禁止显式 `any`，并检查从依赖中流入的 `any` 是否被安全处理。若确实需要对不兼容的类型做双重断言，中间类型必须为 `unknown`，例如 `value as unknown as TResult`。类型和命名问题由开发者修正。 [TypeScript 类型断言](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)

`const` 声明必须显式标注类型，包括解构声明。`for...of`、`for await...of` 和 `for...in` 的循环头按 TypeScript 语法从遍历对象推导绑定类型。 [TypeScript 编译器诊断](https://raw.githubusercontent.com/microsoft/TypeScript/v5.9.3/src/compiler/diagnosticMessages.json)

`switch` 必须为联合类型的每个字面量和枚举的每个成员写出 `case`，禁止使用 `default`。行为相同的 `case` 可以共用一个分支体。 [typescript-eslint 穷尽检查](https://typescript-eslint.io/rules/switch-exhaustiveness-check/)

控制语句的分支体必须用花括号包裹并另起一行，即使只有单条 `return`、`break` 或 `continue`。例如，`if (!usage) return undefined;` 必须展开为多行块。`pnpm lint:fix` 会补齐花括号，Biome 会整理缩进。 [ESLint curly 规则](https://eslint.org/docs/latest/rules/curly)

代码块结束后如果还有同级语句，两者之间空一行。`pnpm lint:fix` 会补齐空行。 [ESLint Stylistic 空行规则](https://eslint.style/rules/padding-line-between-statements)

参考 UniverseEditor 的规则也检查数组回调的返回值、分支间的返回一致性、参数重赋值、返回表达式内赋值和不必要的 `else`。泛型参数用 `T` 前缀，枚举用 `E` 前缀。

`pnpm check` 还会检查以下问题。

- TypeScript 检查数组和字典的取值是否可能缺失，区分省略可选属性与显式赋值 `undefined`，并捕获遗漏返回、意外贯穿的 `switch` 分支、未声明 `override` 的方法和不可达代码。入口的副作用导入也必须可解析。 [TSConfig 参考](https://www.typescriptlang.org/tsconfig/)
- ESLint 检查宽松相等比较、隐式把字符串或数字当布尔值、变量遮蔽、未处理的 Promise 和 thenable、意外产生运行时副作用的类型导入，以及无效的 ESLint 规则注释。 [布尔表达式规则](https://typescript-eslint.io/rules/strict-boolean-expressions/) · [未处理的 Promise 检查](https://typescript-eslint.io/rules/no-floating-promises/)
