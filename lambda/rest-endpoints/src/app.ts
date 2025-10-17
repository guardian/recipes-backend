import bodyParser from 'body-parser';
import { formatISO } from 'date-fns';
import { renderFile as ejs } from 'ejs';
import express, { Router } from 'express';
import type { Request } from 'express';
import type { RecipeV3 } from '@recipes-api/lib/feast-models';
import { recipeByUID } from '@recipes-api/lib/recipes-data';
import { checkTemplate } from './check-template';
import { generateHybridFront } from './curation';
import { countryCodeFromCDN } from './geo_cdn';
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
			.then((results) => {
				results.sort((a, b) => (a.version ?? 0) - (b.version ?? 0));
				if (results.length > 0) {
					const latestVersion = results[results.length - 1];
					resp
						.setHeader(
							'Cache-Control',
							'max-age=300, public, stale-while-revalidate=60',
						)
						.redirect(`/content/${latestVersion.checksum}`);
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

router.get('/api/:region/:variant/:date/hybrid-curation.json', (req, resp) => {
	const newUrl = `/${req.params.region}/${req.params.variant}/${req.params.date}/curation.json`;
	resp.redirect(301, newUrl);
});

router.get('/api/:region/:variant/hybrid-curation.json', (req, resp) => {
	const territoryParam =
		(req.query['ter'] as string | undefined) ?? countryCodeFromCDN(req);
	const curationCacheControl =
		'max-age=7200, stale-while-revalidate=300, stale-if-error=14400';
	//const curationCacheControl = 'no-store'; //while debugging!

	generateHybridFront(req.params.region, req.params.variant, territoryParam, 2)
		.then((front) => {
			resp
				.status(200)
				.setHeader('Cache-Control', curationCacheControl)
				.json(front);
		})
		.catch((err) => {
			console.error(
				`Unable to generate hybrid from for ${req.params.region} / ${
					req.params.variant
				} in ${territoryParam ?? '(undefined)'}: `,
				err,
			);
			resp.status(500).json({
				status: 'internal_error',
				detail: `An error occurred at ${new Date().toISOString()}. See the server logs for details.`,
			});
		});
});

router.post(
	'/api/check-template',
	(req: Request<object, object, RecipeV3>, resp) => {
		const recipe: RecipeV3 = req.body;
		const result = checkTemplate(recipe);
		return resp.status(200).json(result);
	},
);

// eslint-disable-next-line import/no-named-as-default-member -- required part of Express setup
app.use(express.json());
app.use('/', router);
