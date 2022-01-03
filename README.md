# Keptn Add-On for the Amazon Shared Services Platform

Example Configuration:

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as dt from '@keptn/keptn-ep-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const Dynatrace = new dt.DynatraceOperatorAddOn(
    "<dynatrace-api-token>",
    "https://<dynatrace-tenant-url>/api",
    "<dynatrace-paas-token>"
)


const addOns: Array<ssp.ClusterAddOn> = [
    Dynatrace,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

