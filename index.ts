// Copyright 2016-2019, Pulumi Corporation.  All rights reserved.

import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Microservice } from "./micro";

// First create an AWS cluster using ECS Fargate.
let cluster = new awsx.ecs.Cluster("my-cluster");

// Next create a load balanced microservice available to
// the Internet. This will build and publish the application's
// Docker container image.
let service = new Microservice("my-app", {
    cluster,
    path: "./app",
    port: 80,
    replicas: 3,
});

// Finally, export the Internet address for the service.
export const url = service.url;
