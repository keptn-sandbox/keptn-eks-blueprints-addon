import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'
import {getSecretValue, loadExternalYaml} from "@aws-quickstart/ssp-amazon-eks/dist/utils";


interface KeptnSecret {
    API_TOKEN: string;
}

/**
 * Configuration options for the add-on.
 */

 type KeptnExecutionPlaneParams = {

    /**
     * The AWS Secrets Manager Secret which is containing the Keptn bridge password and API Token (keys: API_TOKEN, BRIDGE_PASSWORD)
     */
    ssmSecretName: string,

    /**
     * Keptn API Token is used to connect the Execution Plane to Keptn, not needed if a ssmSecretName is specified
     */      
    apiToken: string,

    /**
     * Namespace where the keptn Control Plane will be deployed
     * @default keptn
     */    
    namespace: string,

    /**
     * Helm Repository which will be used for installing Keptn
     * @default https://storage.googleapis.com/keptn-installer
     */        
    helmrepo: string,

    /**
     * The Version of Keptn which should get installed
     * @default 0.11.4
     */     
    version: string,

    /**
     * URL of your Keptn Control Plane
     */     
    controlPlaneUrl: string

    /**
     * Name of the Execution Plane helm-chart
     * @default helm-service
     */     
    chartName: string    
}

const defaultKeptnExecutionPlaneParams: KeptnExecutionPlaneParams = {    
    ssmSecretName: "",
    apiToken: "",    
    namespace: "keptn",
    helmrepo: "https://storage.googleapis.com/keptn-installer",
    version: "0.11.4",
    controlPlaneUrl: "",
    chartName: "helm-service"
}

export class KeptnExecutionPlaneAddOn implements ClusterAddOn {
    props: KeptnExecutionPlaneParams

    constructor(params: Partial<KeptnExecutionPlaneParams>) {
        this.props = {...defaultKeptnExecutionPlaneParams, ...params}
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {

        if (this.props.ssmSecretName != "") {
            const secretValue = await getSecretValue(this.props.ssmSecretName, clusterInfo.cluster.stack.region);
            const credentials: KeptnSecret = JSON.parse(secretValue)
            this.props.apiToken = credentials.API_TOKEN            
        }

        return clusterInfo.cluster.addHelmChart("helm-service", {
            chart: this.props.chartName,
            repository: this.props.helmrepo,
            version: this.props.version,
            namespace: this.props.namespace,
            values: {
                remoteControlPlane: {
                    enabled: true,
                    api: {
                        token: this.props.apiToken,
                        hostname: this.props.controlPlaneUrl
                    }
                },
            }
        });
    }
}