import type { GuStackProps } from "@guardian/cdk/lib/constructs/core";
import { GuStack } from "@guardian/cdk/lib/constructs/core";
import type { App } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";

export class RecipesBackend extends GuStack {
  constructor(scope: App, id: string, props: GuStackProps) {
    super(scope, id, props);

    new Bucket(this, "StaticHosting", {

    });
  }
}
