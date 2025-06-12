import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuParameter } from '@guardian/cdk/lib/constructs/core';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import {
	Cluster,
	Compatibility,
	ContainerImage,
	CpuArchitecture,
	LaunchType,
	LogDriver,
	OperatingSystemFamily,
	TaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import type { IEventBus } from 'aws-cdk-lib/aws-events';
import { EventField, Rule } from 'aws-cdk-lib/aws-events';
import { EcsTask } from 'aws-cdk-lib/aws-events-targets';
import {
	Effect,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface TestConstructProps {
	eventBus: IEventBus;
}

export class PrintableRecipeGenerator extends Construct {
	constructor(scope: GuStack, id: string, { eventBus }: TestConstructProps) {
		super(scope, id);

		const vpcid = new GuParameter(scope, 'VpcIdParam', {
			fromSSM: true,
			default: `/account/vpc/primary/id`,
		});

		const publicSubnetIds = new GuParameter(scope, 'VpcPublicParam', {
			fromSSM: true,
			default: '/account/vpc/primary/subnets/public',
			type: 'List<String>',
		});

		const privateSubnetIds = new GuParameter(scope, 'VpcPrivateParam', {
			fromSSM: true,
			default: '/account/vpc/primary/subnets/private',
			type: 'List<String>',
		});

		const availabilityZones = new GuParameter(scope, 'VpcAZParam', {
			fromSSM: true,
			default: '/account/vpc/primary/availability-zones',
			type: 'List<String>',
		});

		const vpc = Vpc.fromVpcAttributes(this, 'VPC', {
			vpcId: vpcid.valueAsString,
			publicSubnetIds: publicSubnetIds.valueAsList,
			privateSubnetIds: privateSubnetIds.valueAsList,
			availabilityZones: availabilityZones.valueAsList,
		});

		const clusterArnParam = new GuParameter(scope, 'ClusterArn', {
			fromSSM: true,
			default: '/account/services/ecs-cluster-name',
		});

		const repoNameParam = new GuParameter(scope, 'RepoName', {
			fromSSM: true,
			default: `/${scope.stage}/feast/recipes-backend/ecr-repo-printables`,
		});

		const cluster = Cluster.fromClusterAttributes(this, 'ECSCluster', {
			clusterName: clusterArnParam.valueAsString,
			vpc,
		});

		const role = new Role(this, 'IAMRole', {
			roleName: `printable-recipe-generator-${scope.stage}`,
			assumedBy: ServicePrincipal.fromStaticServicePrincipleName(
				'ecs-tasks.amazonaws.com',
			),
			inlinePolicies: {
				s3write: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: ['s3:PutObject'],
							resources: [
								`arn:aws:s3:::feast-recipes-static-${scope.stage.toLowerCase()}/content/*`,
							],
						}),
					],
				}),
			},
		});

		const taskDefinition = new TaskDefinition(this, 'PrintableRecipeGenTD', {
			compatibility: Compatibility.FARGATE,
			cpu: '1024', //1 vcpu
			ephemeralStorageGiB: 25, //minimum 21Gb ephemeral storage
			memoryMiB: '2048', //2 Gb RAM, minimum value for 1vcpu
			runtimePlatform: {
				cpuArchitecture: CpuArchitecture.X86_64, //Chrome headless does not appear to have an ARM64 package at present :-/
				operatingSystemFamily: OperatingSystemFamily.LINUX,
			},
			volumes: [{ name: 'tmp-volume' }, { name: 'home-volume' }],
			taskRole: role,
		});

		const ecrRepo = Repository.fromRepositoryName(
			this,
			'ECRRepo',
			repoNameParam.valueAsString,
		);

		const imageTag = process.env['IMAGE_TAG'] ?? 'latest';

		const container = taskDefinition.addContainer('main', {
			image: ContainerImage.fromEcrRepository(ecrRepo, imageTag),
			memoryLimitMiB: 2048,
			readonlyRootFilesystem: true,
			logging: LogDriver.awsLogs({
				streamPrefix: 'printable-recipe-generator-',
			}),
      environment: {
        "STAGE": scope.stage,
        "STACK":scope.stack
      },
			workingDirectory: '/home/pdfrender',
		});

		container.addMountPoints({
			sourceVolume: 'tmp-volume',
			containerPath: '/tmp',
			readOnly: false,
		});

		container.addMountPoints({
			sourceVolume: 'home-volume',
			containerPath: '/home/pdfrender',
			readOnly: false,
		});

		const ruleTarget = new EcsTask({
			taskDefinition,
			cluster,
			launchType: LaunchType.FARGATE,
			containerOverrides: [
				{
					containerName: 'main',
					environment: [
						{
							name: 'RECIPE_UID',
							value: EventField.fromPath('$.detail.uid'),
						},
						{
							name: 'RECIPE_CSID',
							value: EventField.fromPath('$.detail.checksum'),
						},
						{
							name: 'CONTENT',
							value: EventField.fromPath('$.detail.blob'),
						},
						{
							name: 'BUCKET',
							value: `feast-recipes-static-${scope.stage.toLowerCase()}`,
						},
					],
				},
			],
		});

		new Rule(this, 'PublicationConnect', {
			enabled: scope.stage !== 'PROD', //only enabled in the CODE environment until design work fully implemented, but available for testing in PROD
			eventBus,
			targets: [ruleTarget],
			eventPattern: {
				source: ['recipe-responder'],
				detailType: ['recipe-update'],
			},
		});
	}
}
