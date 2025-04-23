#!/usr/bin/env node

const fs = require('node:fs');

const apits = fs.readFileSync('lambda/rest-endpoints/src/app.ts');
const modelsts = fs.readFileSync('lib/recipes-data/src/lib/models.ts');
const curationts = fs.readFileSync('lib/recipes-data/src/lib/curation.ts');

const result = {
  codeType: 'expressjs',
  apiDefinitionCode: apits.toString(),
  supportingModelCode: modelsts.toString() + "\n\n" + curationts.toString(),
}

fs.writeFileSync('./openapi-generator.json', JSON.stringify(result))
