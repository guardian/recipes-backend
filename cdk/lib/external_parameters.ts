import type {GuStack} from "@guardian/cdk/lib/constructs/core";
import {aws_ssm} from "aws-cdk-lib";
import type {IStringParameter} from "aws-cdk-lib/aws-ssm";
import {Construct} from "constructs";

/**
 * ExternalParameters encapsulates values that are not specific to this stack, i.e. are set by other stacks or
 * are properties of the account setup itself.
 *
 * The CDK formulation here actually creates a Cloudformation parameter, whose default value is then obtained from
 * SSM _at deploy time_.  Therefore, the values that are used for these will be that of the SSM parameter value at the
 * time of deployment rather than the time at which the stack was built.
 */
export class ExternalParameters extends Construct {
  urgentAlarmTopicArn: IStringParameter;
  nonUrgentAlarmTopicArn: IStringParameter;

  constructor(scope: GuStack, id: string) {
    super(scope, id);

    this.urgentAlarmTopicArn = aws_ssm.StringParameter.fromStringParameterName(this, "urgent-alarm-arn", "/account/content-api-common/alarms/urgent-alarm-topic");
    this.nonUrgentAlarmTopicArn = aws_ssm.StringParameter.fromStringParameterName(this, "non-urgent-alarm-arn", "/account/content-api-common/alarms/non-urgent-alarm-topic");
  }
}
