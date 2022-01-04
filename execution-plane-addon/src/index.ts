import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'

/**
 * Configuration options for the add-on.
 */

 type KeptnExecutionPlaneParams = {
    apiToken: string,
    namespace: string,
    helmrepo: string,
    version: string,
    controlPlaneUrl: string
}

const defaultKeptnExecutionPlaneParams: KeptnExecutionPlaneParams = {    
    apiToken: "",    
    namespace: "keptn",
    helmrepo: "https://storage.googleapis.com/keptn-installer",
    version: "0.11.4",
    controlPlaneUrl: ""
}

export class KeptnExecutionPlaneAddOn implements ClusterAddOn {
    props: KeptnExecutionPlaneParams

    constructor(params: Partial<KeptnExecutionPlaneParams>) {
        this.props = {...defaultKeptnExecutionPlaneParams, ...params}
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        return clusterInfo.cluster.addHelmChart("helm-service", {
            chart: "helm-service",
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