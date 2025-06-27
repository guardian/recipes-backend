import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client();
const bucketName = 'feast-recipes-static-code';

const xtractor = /\/(.*)\.pdf$/;

async function processNextPage(ContinuationToken: string | undefined) {
	const req = new ListObjectsV2Command({
		Bucket: bucketName,
		Prefix: 'content/',
		ContinuationToken,
	});

	const response = await s3.send(req);
	if (response.Contents) {
		for (const obj of response.Contents) {
			if (obj.ETag == 'deee5b11b47f2dc1652c37277d971287') {
				console.log(`${obj.Key ?? '(no file)'} has suspicious etag`);
			}
			if (obj.Size == 23891) {
				//console.log(`${obj.Key ?? '(no file)'} has suspicious size`);
				if (obj.Key) {
					//console.log(`https://recipes.code.dev-guardianapis.com/${obj.Key}`);
					const bits = xtractor.exec(obj.Key);
					if (bits) {
						console.log(
							`npx ts-node --project tsconfig.app.json src/reindexSingle.ts ${bits[1]}`,
						);
					} else {
						console.warn(`Could not determine ID from ${obj.Key}`);
					}
				}
			}
		}
	}

	return response.NextContinuationToken;
}

async function main() {
	let continuationToken: string | undefined = undefined;
	do {
		continuationToken = await processNextPage(continuationToken);
	} while (continuationToken);
}

main()
	.then(() => console.log('All done'))
	.catch((err) => console.error(err));
