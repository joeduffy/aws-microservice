// Copyright 2016-2019, Pulumi Corporation.  All rights reserved.

import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

export interface MicroserviceArgs {
    // The cluster to deploy this microservice into.
    cluster: awsx.ecs.Cluster;
    // The path to the Docker image on disk that will be built/published.
    path: string;
    // The port to make Internet traffic available on.
    port: number;
    // The number of load balanced service replicas to run.
    replicas?: number;
}

// A simple AWS native load balanced microservice.
export class Microservice extends pulumi.ComponentResource {
    public readonly url: pulumi.Output<string>;

    constructor(name: string, args: MicroserviceArgs) {
        super("aws-microservice:micro:Microservice", name, args);

        const opts = { parent: this };

        // Step 1: Define the Networking for our service.
        const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
            "net-lb", { external: true, securityGroups: args.cluster.securityGroups }, opts);
        const web = alb.createListener(`${name}-lb`, { port: args.port, external: true }, opts);

        // Step 2: Build and publish a Docker image to a private ECR registry.
        const img = awsx.ecs.Image.fromPath(`${name}-cont`, args.path);

        // Step 3: Create a Fargate service task that can scale out.
        const appService = new awsx.ecs.FargateService(`${name}-svc`, {
            cluster: args.cluster,
            taskDefinitionArgs: {
                container: {
                    image: img,
                    // cpu: 102 /*10% of 1024*/,
                    // memory: 50 /*MB*/,
                    portMappings: [ web ],
                },
            },
            desiredCount: args.replicas || 1,
        }, opts);

        // Make the service's resulting Internet address available.
        this.url = pulumi.interpolate`http://${web.endpoint.hostname}:${args.port}`;
    }
}
