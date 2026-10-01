export const validMessageContent = {
	id: 'D9AEEA41-F8DB-4FC8-A0DA-275571EA7331',
	edition: 'feast-northern-hemisphere',
	version: 'v1',
	issueDate: '2024-01-02',
	fronts: {
		'all-recipes': [
			{
				id: 'd353e2de-1a65-45de-85ca-d229bc1fafad',
				title: 'Dish of the day',
				body: '',
				items: [
					{
						recipe: {
							id: '14129325',
						},
					},
				],
			},
		],
		'meat-free': [
			{
				id: 'fa6ccb35-926b-4eff-b3a9-5d0ca88387ff',
				title: 'Dish of the day',
				body: '',
				items: [
					{
						recipe: {
							id: '14132263',
						},
					},
				],
			},
		],
	},
};

export const validMessage = {
	Message: JSON.stringify(validMessageContent),
};

export const validMessageContentWithUsOnly = {
	...validMessageContent,
	fronts: {
		...validMessageContent.fronts,
		'all-recipes': [
			...validMessageContent.fronts['all-recipes'],
			{
				id: '7ab8a974-d491-4cc5-9a1f-ed3dbc8e2903',
				title: 'Us-only test',
				body: '',
				items: [
					{
						recipe: {
							id: '1237d5fa377e4957adda7b7aea12a72e',
						},
					},
				],
				targetedRegions: ['us'],
				excludedRegions: [],
			},
			{
				id: '1aa57e7d-96e7-4047-b117-b1a80f2d4eeb',
				title: 'Only for the rest of the world',
				body: '',
				items: [
					{
						recipe: {
							id: 'b96996b1e34d42e6a3796bfc873d7aaa',
						},
					},
				],
				targetedRegions: [],
				excludedRegions: ['us'],
			},
		],
	},
};

export const validMessageUsOnly = {
	Message: JSON.stringify(validMessageContentWithUsOnly),
};

export const messageWithBrokenIssueDate = {
	...validMessage,
	Message: JSON.stringify({
		...validMessageContent,
		issueDate: 'dfsdfsjk',
	}),
};

export const messageWithMissingFrontsTitle = {
	...validMessage,
	Message: JSON.stringify({
		...validMessageContent,
		fronts: {
			...validMessageContent.fronts,
			'all-recipes': [
				{
					id: 'd353e2de-1a65-45de-85ca-d229bc1fafad',
					title: null,
					body: '',
					items: [
						{
							recipe: {
								id: '14129325',
							},
						},
					],
				},
			],
		},
	}),
};
