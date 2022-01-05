# Keptn Control Plane Add-On for the Amazon Shared Services Platform

[![main](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml/badge.svg)](https://github.com/keptn-sandbox/keptn-ssp-addons/actions/workflows/main.yml)

The Keptn Add-On for the Amazon Shared Services Platform enables platform administrators to install a [keptn](keptn.sh) Control Plane during the bootstrapping process of an [EKS](https://aws.amazon.com/eks/) cluster.

Therefore, this Add-On installs the [Keptn Helm Chart](https://github.com/keptn/keptn/tree/master/installer) and configures Keptn to use an API-Token and Bridge Password with credentials specified by variables or a Amazon Secrets Manager Secret.

### AWS Secret Manager Secrets
If you plan to use Secret Manager Secrets, you need to create a secret first.

Therefore:
* Open your AWS Console
* Search for "Secrets Manager"
* Create a new secret ("Store a new secret")
  * Secret Type: "Other type of secret"
  * Key/value pairs
    * API_TOKEN="<your-api-token>"
    * BRIDGE_PASSWORD="<your-bridge-password>"
* Remember the name you assigned to the secret

## Usage
The Add-On can be used by either specifying the name of a Secrets Manager secret or the API Token and Bridge password.

You can find informations how to get started with SSP Projects [here](https://aws-quickstart.github.io/ssp-amazon-eks/getting-started/). 


Example Configuration (secrets in Secrets Manager):

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptncp from '@keptn/keptn-cp-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const KeptnControlPlane = new keptncp.KeptnControlPlaneAddOn({
    ssmSecretName: 'keptn-secrets'
})


const addOns: Array<ssp.ClusterAddOn> = [
    KeptnControlPlane,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

### Example Configuration (secrets in code):

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

## Add-On Options

|Name            |Type     |Default                     |Description
|----------------|---------|----------------------------|------------------------------------
| ssmSecretName  | string  |  | The AWS Secrets Manager Secret which is containing the Keptn bridge password and API Token (keys: API_TOKEN, BRIDGE_PASSWORD)
| apiToken | string |  | Keptn API Token is used to connect to the Keptn API, not needed if a ssmSecretName is specified
| bridgePassword | string |  | Keptn Bridge Password is used to login to the Keptn bridge, not needed if a ssmSecretName is specified
| namespace | string | keptn | Namespace where the keptn Control Plane will be deployed
| helmrepo | string | https://storage.googleapis.com/keptn-installer | Helm Repository which will be used for installing Keptn
| version | string | 0.11.4 | The Version of Keptn which should get installed
| enableLoadbalancer | boolean | false | Expose Keptn's Bridge and API Gateway service as type Loadbalancer instead of ClusterIP
| enableIngress | boolean | false | Create an Ingress object to Expose Keptn's Bridge and API Gateway
| ingressHostname | string | | The Hostname for the Ingress object
| ingressAnnotations | object | | Add additional Ingress Annotations like the ingress class
| ingressSecretName | string | | Configure an ingress secretName

## Extended Examples

### Example Configuration (create Ingress):

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptncp from '@keptn/keptn-cp-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const KeptnControlPlane = new keptncp.KeptnControlPlaneAddOn({
    ssmSecretName: 'keptn-secrets',
    enableIngress: true,
    ingressHostname: 'mykeptn.yourdomain.com',
    ingressAnnotations: {
        "kubernetes.io/ingress.class": "nginx"
    },
    ingressSecretName: 'mytlssecret'
})


const addOns: Array<ssp.ClusterAddOn> = [
    KeptnControlPlane,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

### Example Configuration (expose Bridge via Loadbalancer):

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptncp from '@keptn/keptn-cp-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const KeptnControlPlane = new keptncp.KeptnControlPlaneAddOn({
    ssmSecretName: 'keptn-secrets',
    enableLoadbalancer: true
})


const addOns: Array<ssp.ClusterAddOn> = [
    KeptnControlPlane,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

## Enhancements / Bugs 
You are welcome to use issues to report bugs or request enhancements.