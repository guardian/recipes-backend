// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this function must handle an any type
export const getErrorMessage = (e: any) =>
	e instanceof Error ? e.message : String(e);
