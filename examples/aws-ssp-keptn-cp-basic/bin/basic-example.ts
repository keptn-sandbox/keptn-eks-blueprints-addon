import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as keptncp from '@keptn/keptn-cp-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'
const app = new cdk.App();


const KeptnControlPlane = new keptncp.KeptnControlPlaneAddOn({
    ssmSecretName: 'keptn-ssp',
})

const addOns: Array<ssp.ClusterAddOn> = [
    KeptnControlPlane
];

const account = '<your-aws-account-id>';
const region = '<your-aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: 'my-aws-ssp-keptn-test-1', addOns}, props);