import { z } from 'zod';

const ContentDescriptionS3 = z.object({
	type: z.literal('s3'),
	path: z.string().nonempty(),
	bucket: z.string().nonempty(),
});

const ContentDescriptionInline = z.object({
	type: z.literal('inline'),
	content: z.string().nonempty(),
});

export type ContentDescription =
	| z.infer<typeof ContentDescriptionS3>
	| z.infer<typeof ContentDescriptionInline>;

export const UpdateDensityRequest = z.object({
	mode: z.literal('update'),
	csvContent: z.union([ContentDescriptionS3, ContentDescriptionInline]),
});

export const ListDensityRequest = z.object({
	mode: z.literal('list'),
});
export const RollbackDensityRequest = z.object({
	mode: z.literal('rollback'),
	toDate: z.coerce.date(), //parse string as date
});

export const UpdateRequest = z.union([
	UpdateDensityRequest,
	ListDensityRequest,
	RollbackDensityRequest,
]);

export type UpdateRequest = z.infer<typeof UpdateRequest>;
export type UpdateDensityRequest = z.infer<typeof UpdateDensityRequest>;
export type RollbackDensityRequest = z.infer<typeof RollbackDensityRequest>;

export const GenericResponse = z.object({
	status: z.enum(['ok', 'error']),
	detail: z.string().nullable(),
});

export const ListResponse = z.object({
	status: z.literal('ok'),
	current: z.date().nullable(),
	revisions: z.array(z.date()),
});

export type ListResponse = z.infer<typeof ListResponse>;
export const LambdaResponse = z.union([GenericResponse, ListResponse]);
export type LambdaResponse = z.infer<typeof LambdaResponse>;
