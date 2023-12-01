//This file is copied from pubflow-two application to follow same kinda metric registration. Changes done the required variable names.
import {CloudWatchClient, PutMetricDataCommand, StandardUnit} from "@aws-sdk/client-cloudwatch";

const cwClient = new CloudWatchClient({region: process.env["AWS_REGION"]});

export type KnownMetric = "FailedRecipes" | "SuccessfulRecipes" | "UpdatesTotalOfRecipes";

export async function registerMetric(metricName: KnownMetric, value: number) {
  const req = new PutMetricDataCommand({
    Namespace: "RecipeBackend",
    MetricData: [
      {
        MetricName: metricName,
        Dimensions: [
          {
            Name: "Stack",
            Value: process.env["STACK"],
          },
          {
            Name: "Stage",
            Value: process.env["STAGE"],
          }
        ],
        Timestamp: new Date(),
        Value: value,
      }
    ]
  });

  const response = await cwClient.send(req);
  console.log(`Updated ${metricName} metric after ${response.$metadata.attempts ?? 1} attempts`);
}
