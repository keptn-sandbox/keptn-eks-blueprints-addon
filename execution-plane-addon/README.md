# Keptn Execution Plane Add-On for the Amazon Shared Services Platform

[![main](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml/badge.svg)](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml)

The Keptn Execution Plane Add-On for the Amazon Shared Services Platform enables platform administrators to install a [keptn](keptn.sh) Execution Plane during the bootstrapping process of an [EKS](https://aws.amazon.com/eks/) cluster.

Therefore, this Add-On installs the an Execution Plane Helm Chart and configures it to connect to your Keptn to your Keptn Control Plane

### AWS Secret Manager Secrets
If you plan to use Secret Manager Secrets, you need to create a secret first.

Therefore:
* Open your AWS Console
* Search for "Secrets Manager"
* Create a new secret ("Store a new secret")
  * Secret Type: "Other type of secret"
  * Key/value pairs
    * API_TOKEN="<your-api-token>"
* Remember the name you assigned to the secret

## Usage
The Add-On can be used by either specifying the name of a Secrets Manager secret or the API Token and Bridge password.

You can find informations how to get started with SSP Projects [here](https://aws-quickstart.github.io/ssp-amazon-eks/getting-started/). 


Example Configuration (secrets in Secrets Manager):

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptnep from '@keptn/keptn-ep-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const KeptnExecutionPlane = new keptnep.KeptnExecutionPlaneAddOn({
    ssmSecretName: 'keptn-secrets',
    controlPlaneHost: 'mykeptn.yourdomain.com',    
})


const addOns: Array<ssp.ClusterAddOn> = [
    KeptnExecutionPlane,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

### Example Configuration (secrets in code and jmeter-service):

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptnep from '@keptn/keptn-ep-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const KeptnExecutionPlane = new keptnep.KeptnControlPlaneAddOn({
    apiToken: '<your-api-token>',
    chartName: 'jmeter-service',
    controlPlaneHost: 'mykeptn.yourdomain.com',
})


const addOns: Array<ssp.ClusterAddOn> = [
    KeptnExecutionPlane,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

## Add-On Options

|Name            |Type     |Default                     |Description
|----------------|---------|----------------------------|------------------------------------
| ssmSecretName  | string  |  | The AWS Secrets Manager Secret which is containing the Keptn API Token (key: API_TOKEN)
| apiToken | string |  | Keptn API Token is used to connect to the Keptn API, not needed if a ssmSecretName is specified
| namespace | string | keptn | Namespace where the keptn Control Plane will be deployed
| helmrepo | string | https://storage.googleapis.com/keptn-installer | Helm Repository which will be used for installing Keptn
| version | string | 0.11.4 | The Version of Keptn which should get installed
| controlPlaneHost | string | | Hostname of your Keptn Control Plane
| chartName | string | helm-service | Name of the Execution Plane helm-chart

## Enhancements / Bugs 
You are welcome to use issues to report bugs or request enhancements.