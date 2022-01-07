# Keptn Add-Ons for the Amazon Shared Services Platform

Keptn – pronounced captain – is a control-plane for DevOps automation of cloud-native applications.
Keptn uses a declarative approach to build scalable automation for delivery and operations which can be scaled to a large number of services.

The Keptn add-ons provisions either a Keptn Control Plane or a Keptn Remote Execution Plane into an EKS cluster.

Please see the documentation below for details on automatic boostrapping with Keptn Control Plane and Remote Execution Service add-on.

A full [Keptn](https://keptn.sh) documentation can be found [here](https://keptn.sh/docs/).

## Keptn Control-Plane Add-On [![main](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml/badge.svg)](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml)

This AWS SSP Add-On will deploy a [Keptn](https://keptn.sh) Control Plane.
For more information please take a look into the specific [README.md](./control-plane-addon/README.md)

## Keptn Execution-Plane Add-On [![main](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml/badge.svg)](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml)

This AWS SSP Add-On will deploy a Remote [Keptn](https://keptn.sh) Execution Plane.
For more information please take a look into the specific [README.md](./execution-plane-addon/README.md)

## Quickstart

You will find some example projects to start within the [examples](./examples) directory.

### Deploy a Keptn Control Plane

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptncp from '@keptn/keptn-cp-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const KeptnControlPlane = new keptncp.KeptnControlPlaneAddOn({
    apiToken: '<your-api-token>',
    bridgePassword: '<your-bridge-password>'
})


const addOns: Array<ssp.ClusterAddOn> = [
    KeptnControlPlane,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

### Deploy a Keptn Helm-Service Execution Plane

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptnep from '@keptn/keptn-ep-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const KeptnExecutionPlane = new keptnep.KeptnControlPlaneAddOn({
    apiToken: '<your-api-token>',
    chartName: 'helm-service',
    controlPlaneHost: '<your-keptn-control-plane-host>',
})


const addOns: Array<ssp.ClusterAddOn> = [
    KeptnExecutionPlane,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

## Enhancements / Bugs 
You are welcome to use issues to report bugs or request enhancements.
