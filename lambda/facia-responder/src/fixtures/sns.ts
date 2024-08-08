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

export const brokenMessage = {
	...validMessage,
	Message: JSON.stringify({
		...validMessageContent,
		issueDate: 'dfsdfsjk',
	}),
};
