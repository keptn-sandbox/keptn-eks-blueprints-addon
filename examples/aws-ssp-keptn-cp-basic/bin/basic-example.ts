#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { KeptnControlPlaneAddOn } from '@keptn/keptn-controlplane-eks-blueprints-addon' 

const app = new cdk.App();
const account = '<your-account-id>';
const region = '<region>';


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
    //.addOns(KeptnControlPlane)
    .build(app, 'eks-blueprint-1');