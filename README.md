# Recipes API / Recipes Backend

## What is this?

This is a backend service that translates data from the Content API into a format that apps like 
https://github.com/guardian/ios-feast can use.

## Running CDK

The CDK stack is integrated with `nx`, so the regular "npm run synth" in the cdk directory won't work.

Instead, you can do:

```bash
npm run build
```

To build _everything_, including the CDK.

```bash
npm test
```

Will run the tests on everyhing, including CDK (therefore it will fail if the CDK snapshot is out of sync)

```bash
npm run update-cdk
```

Will update the CDK snapshot and allow the tests to pass again

## How does it work?

TBD
