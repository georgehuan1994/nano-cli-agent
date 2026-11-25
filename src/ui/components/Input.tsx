import { Box, Text, useInput } from "ink";
import { type ReactElement, type RefObject, useRef, useState } from "react";

import type { TState } from "../types.js";

interface IInputProps {
	onSubmit: (value: string) => void;
	disabled: boolean;
}

interface IInputDraft {
	value: string;
	cursor: number;
}

const segmenter: Intl.Segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const emptyDraft: IInputDraft = { value: "", cursor: 0 };

export function Input({ onSubmit, disabled }: IInputProps): ReactElement | undefined {
	const [draft, setDraft]: TState<IInputDraft> = useState(emptyDraft);
	// Terminal input events can arrive before React commits the updated draft.
	const latestDraft: RefObject<IInputDraft> = useRef(draft);

	function update(value: string, cursor: number): void {
		latestDraft.current = { value, cursor };
		setDraft(latestDraft.current);
	}

	useInput((input, key): void => {
		if (disabled) {
			return;
		}

		const { value, cursor }: IInputDraft = latestDraft.current;
		if (key.return || input === "\n") {
			if (value.trim() !== "") {
				update("", 0);
				onSubmit(value);
			}

			return;
		}

		const segments: Intl.Segments = segmenter.segment(value);
		const previous: number = segments.containing(cursor - 1)?.index ?? 0;
		const next: number = cursor + (segments.containing(cursor)?.segment.length ?? 0);

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
			const text: string = input.replace(/\r\n?/g, "\n");
			const updated: string = value.slice(0, cursor) + text + value.slice(cursor);
			const insertionEnd: number = cursor + text.length;
			const following: Intl.SegmentData | undefined = segmenter.segment(updated).containing(insertionEnd);
			const newCursor: number =
				following && following.index < insertionEnd ? following.index + following.segment.length : insertionEnd;
			update(updated, newCursor);
		}
	});

	if (disabled) {
		return undefined;
	}

	const { value, cursor }: IInputDraft = draft;
	const current: string = segmenter.segment(value).containing(cursor)?.segment ?? "";
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
