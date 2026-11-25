import type { Dispatch, SetStateAction } from "react";

export type TState<TValue> = [value: TValue, setValue: Dispatch<SetStateAction<TValue>>];
