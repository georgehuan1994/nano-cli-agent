import { Box, Text, useInput } from "ink";
import { type ReactElement, useRef, useState } from "react";

interface IInputProps {
	onSubmit: (value: string) => void;
	disabled: boolean;
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const emptyDraft = { value: "", cursor: 0 };

export function Input({ onSubmit, disabled }: IInputProps): ReactElement | undefined {
	const [draft, setDraft] = useState(emptyDraft);
	// Terminal input events can arrive before React commits the updated draft.
	const latestDraft = useRef(draft);

	function update(value: string, cursor: number): void {
		latestDraft.current = { value, cursor };
		setDraft(latestDraft.current);
	}

	useInput((input, key): void => {
		if (disabled) {
			return;
		}

		const { value, cursor } = latestDraft.current;
		if (key.return || input === "\n") {
			if (value.trim() !== "") {
				update("", 0);
				onSubmit(value);
			}

			return;
		}

		const segments = segmenter.segment(value);
		const previous = segments.containing(cursor - 1)?.index ?? 0;
		const next = cursor + (segments.containing(cursor)?.segment.length ?? 0);

		if (key.leftArrow) {
			update(value, previous);
		} else if (key.rightArrow) {
			update(value, next);
		} else if (key.home) {
			update(value, 0);
		} else if (key.end) {
			update(value, value.length);
		} else if (key.ctrl && input === "d") {
			update(value.slice(0, cursor) + value.slice(next), cursor);
		} else if (key.backspace || key.delete) {
			// Ink 6 reports Backspace as Delete in terminals that send DEL.
			update(value.slice(0, previous) + value.slice(cursor), previous);
		} else if (input !== "" && !key.ctrl && !key.meta && !key.tab) {
			const text = input.replace(/\r\n?/g, "\n");
			const updated = value.slice(0, cursor) + text + value.slice(cursor);
			const insertionEnd = cursor + text.length;
			const following = segmenter.segment(updated).containing(insertionEnd);
			const newCursor =
				following && following.index < insertionEnd ? following.index + following.segment.length : insertionEnd;
			update(updated, newCursor);
		}
	});

	if (disabled) {
		return undefined;
	}

	const { value, cursor } = draft;
	const current = segmenter.segment(value).containing(cursor)?.segment ?? "";
	return (
		<Box gap={1}>
			<Text bold color="cyan">
				❯
			</Text>
			<Text>
				{value.slice(0, cursor)}
				<Text inverse>{current === "" ? " " : current}</Text>
				{value.slice(cursor + current.length)}
			</Text>
		</Box>
	);
}
