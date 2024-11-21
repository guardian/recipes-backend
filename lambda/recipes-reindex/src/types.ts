export type SharedStepFnState = {
	dryRun?: boolean; // If true or absent, do not send reindex messages.
};

export type SnapshotRecipeIndexInput = SharedStepFnState & {
	executionId: string;
};

export type SnapshotRecipeIndexOutput = {
	currentIndex: number;
	lastIndex: number;
};

export type WriteBatchToReindexQueueInput = SnapshotRecipeIndexOutput;

export type WriteBatchToReindexQueueOutput = SnapshotRecipeIndexOutput;
