import { Text } from "ink";
import InkSpinner from "ink-spinner";
import type { ReactElement } from "react";

export function Spinner(): ReactElement {
	return (
		<Text color="yellow">
			<InkSpinner type="dots" /> 等待模型回复…
		</Text>
	);
}
