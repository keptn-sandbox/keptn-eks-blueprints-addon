import { ClusterInfo } from '@aws-quickstart/eks-blueprints';
import { HelmAddOn, HelmAddOnProps, HelmAddOnUserProps } from "@aws-quickstart/eks-blueprints/dist/addons/helm-addon";
import { Construct } from 'constructs';
import { getSecretValue } from "@aws-quickstart/eks-blueprints/dist/utils";


interface KeptnSecret {
    API_TOKEN: string;
}

/**
 * Configuration options for the add-on.
 */

 interface KeptnExecutionPlaneProps extends HelmAddOnUserProps {

    /**
     * The AWS Secrets Manager Secret which is containing the Keptn bridge password and API Token (keys: API_TOKEN, BRIDGE_PASSWORD)
     */
    ssmSecretName?: string,

    /**
     * Keptn API Token is used to connect the Execution Plane to Keptn, not needed if a ssmSecretName is specified
     */      
    apiToken?: string,

    /**
     * Hostname of your Keptn Control Plane
     */     
    controlPlaneHost?: string
}

export const defaultProps: HelmAddOnProps & KeptnExecutionPlaneProps = {
    name: "",
    release: "",
    ssmSecretName: "",
    apiToken: "",
    namespace: "keptn",
    repository: "https://storage.googleapis.com/keptn-installer",
    version: "0.11.4",
    controlPlaneHost: "",
    chart: "helm-service"
}

export class KeptnExecutionPlaneAddOn extends HelmAddOn {
    readonly options: KeptnExecutionPlaneProps

    constructor(props: KeptnExecutionPlaneProps) {
        super({...defaultProps, ...props})
        this.options = this.props as KeptnExecutionPlaneProps

        if (! this.props.name) {
            this.props.name = this.props.chart
        }
        if (! this.props.release) {
            this.props.release = "ssm-addon-" + this.props.name
        }
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {

        if (this.options.ssmSecretName != "") {
            const secretValue = await getSecretValue(<string>this.options.ssmSecretName, clusterInfo.cluster.stack.region);
            const credentials: KeptnSecret = JSON.parse(secretValue)
            this.options.apiToken = credentials.API_TOKEN
        }

        return this.addHelmChart(clusterInfo, {
            remoteControlPlane: {
                enabled: true,
                api: {
                    token: this.options.apiToken,
                    hostname: this.options.controlPlaneHost
                }
            },
        });
    }
}