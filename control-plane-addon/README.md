# Keptn Control Plane Add-On for the Amazon EKS Blueprints

[![main](https://github.com/keptn-sandbox/keptn-eks-blueprints-addon/actions/workflows/main.yml/badge.svg)](https://github.com/keptn-sandbox/keptn-eks-blueprints-addon/actions/workflows/main.yml)

The Keptn Add-On for the Amazon EKS Blueprints enables platform administrators to install a [keptn](keptn.sh) Control Plane (by default in version [0.13.4](https://keptn.sh/docs/news/release_announcements/keptn-0134/)) during the bootstrapping process of an [EKS](https://aws.amazon.com/eks/) cluster.

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

You can find informations how to get started with EKS Blueprints Projects [here](https://aws-quickstart.github.io/cdk-eks-blueprints/getting-started/). 


Example Configuration (secrets in Secrets Manager):

```typescript
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { KeptnControlPlaneAddOn } from '@keptn/keptn-controlplane-eks-blueprints-addon' 

const app = new cdk.App();
const account = '<AWS ACCOUNT ID>';
const region = '<AWS REGION>';


const KeptnControlPlane = new KeptnControlPlaneAddOn({
    ssmSecretName: 'keptn-ssp',
})
 
blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .addOns(new blueprints.addons.CalicoAddOn)
    .addOns(new blueprints.addons.MetricsServerAddOn,)
    .addOns(new blueprints.addons.ClusterAutoScalerAddOn)
    .addOns(new blueprints.addons.ContainerInsightsAddOn)
    .addOns(new blueprints.addons.AwsLoadBalancerControllerAddOn())
    .addOns(new blueprints.addons.VpcCniAddOn())
    .addOns(new blueprints.addons.CoreDnsAddOn())
    .addOns(new blueprints.addons.KubeProxyAddOn())
    .addOns(new blueprints.addons.XrayAddOn())
    .addOns(KeptnControlPlane)
    .build(app, 'eks-blueprint');
```

### Example Configuration (secrets in code):

```typescript
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { KeptnControlPlaneAddOn } from '@keptn/keptn-controlplane-eks-blueprints-addon' 

const app = new cdk.App();
const account = '<AWS ACCOUNT ID>';
const region = '<AWS REGION>';


const KeptnControlPlane = new KeptnControlPlaneAddOn({
    apiToken: '<your-api-token>',
    bridgePassword: '<your-bridge-password>'
})
 
blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .addOns(new blueprints.addons.CalicoAddOn)
    .addOns(new blueprints.addons.MetricsServerAddOn,)
    .addOns(new blueprints.addons.ClusterAutoScalerAddOn)
    .addOns(new blueprints.addons.ContainerInsightsAddOn)
    .addOns(new blueprints.addons.AwsLoadBalancerControllerAddOn())
    .addOns(new blueprints.addons.VpcCniAddOn())
    .addOns(new blueprints.addons.CoreDnsAddOn())
    .addOns(new blueprints.addons.KubeProxyAddOn())
    .addOns(new blueprints.addons.XrayAddOn())
    .addOns(KeptnControlPlane)
    .build(app, 'eks-blueprint');
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
const KeptnControlPlane = new KeptnControlPlaneAddOn({
    ssmSecretName: 'keptn-secrets',
    enableIngress: true,
    ingressHostname: 'mykeptn.yourdomain.com',
    ingressAnnotations: {
        "kubernetes.io/ingress.class": "nginx"
    },
    ingressSecretName: 'mytlssecret'
})
```

### Example Configuration (expose Bridge via Loadbalancer):

```typescript
const KeptnControlPlane = new KeptnControlPlaneAddOn({
    ssmSecretName: 'keptn-secrets',
    enableLoadbalancer: true
})
```

## Enhancements / Bugs 
You are welcome to use issues to report bugs or request enhancements.