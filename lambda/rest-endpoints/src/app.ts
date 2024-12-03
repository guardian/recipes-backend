import bodyParser from 'body-parser';
import { formatISO } from 'date-fns';
import { renderFile as ejs } from 'ejs';
import express, { Router } from 'express';
import type { Request } from 'express';
import { recipeByUID } from '@recipes-api/lib/recipes-data';
import { recursivelyGetIdList } from './helpers';

export const app = express();
app.set('view engine', 'ejs');
// eslint-disable-next-line @typescript-eslint/no-misused-promises -- required part of Express setup
app.engine('.ejs', ejs);

const router = Router();
router.use(
	bodyParser.json({
		limit: '1mb',
	}),
);

interface RecipeIdParams {
	recipeUID: string;
}

function validateComposerParams(params: RecipeIdParams) {
	const checker = /^[\w\d]+$/;

	if (!params.recipeUID.match(checker)) {
		throw new Error('Invalid recipe UID');
	}
}

router.get(
	'/api/content/by-uid/:recipeUID',
	(req: Request<RecipeIdParams>, resp) => {
		try {
			validateComposerParams(req.params);
		} catch (e) {
			console.log('Provided params ', req.params, ' did not validate');
			resp
				.status(400)
				.json({ status: 'error', detail: 'invalid recipe immutable ID' });
			return;
		}

		recipeByUID(req.params.recipeUID)
			.then((result) => {
				if (result) {
					resp
						.setHeader(
							'Cache-Control',
							'max-age=300, public, stale-while-revalidate=60',
						)
						.redirect(`/content/${result.checksum}`);
					return;
				} else {
					resp.status(404).json({
						status: 'not found',
						detail: 'No recipe found with that UID',
					});
					return;
				}
			})
			.catch((err) => {
				console.error(err);
				resp.status(500).json({
					status: 'error',
					detail:
						'there was an internal error fetching the recipe. See server-side logs.',
				});
			});
	},
);

router.get('/api/content/by-uid', (req, resp) => {
	const idListParam = req.query['ids'] as string | undefined;
	if (!idListParam) {
		resp
			.status(400)
			.json({ status: 'error', detail: 'you need to specify a list of ids' });
		return;
	}

	const idList = idListParam.split(',');
	recursivelyGetIdList(idList, [])
		.then((results) => {
			resp
				.status(200)
				.setHeader('Cache-Control', 'max-age=300, stale-while-revalidate=60')
				.json({
					status: 'ok',
					resolved: results.length,
					requested: idList.length,
					results: results,
				});
		})
		.catch((err) => {
			console.error(err);

			const timestamp = formatISO(new Date());
			resp.status(500).json({
				status: 'internal_error',
				detail: `An error occurred at ${timestamp}. See the server logs for details.`,
			});
		});
});

app.use('/', router);
