import type React from "react";

export type Tx = (idText: string, enText: string) => string;

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

