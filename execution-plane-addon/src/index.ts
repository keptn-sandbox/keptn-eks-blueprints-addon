import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'

/**
 * Configuration options for the add-on.
 */

export class KeptnExecutionPlaneAddOn implements ClusterAddOn {
    readonly Namespace: string;
    readonly Version: string;
    readonly ControlPlaneUrl: string;
    readonly HelmRepository: string;
    readonly ApiToken: string;

    constructor(controlPlaneUrl?: string, apiToken?: string, namespace?: string, helmrepo?: string, version?: string) {
        this.Namespace = namespace ?? "keptn";
        this.HelmRepository = helmrepo ?? "https://storage.googleapis.com/keptn-installer"

        this.Version = version ?? "0.11.3"
        this.ControlPlaneUrl = controlPlaneUrl ?? ""
        this.ApiToken = apiToken ?? ""
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        return clusterInfo.cluster.addHelmChart("helm-service", {
            chart: "helm-service",
            repository: this.HelmRepository,
            version: this.Version,
            namespace: this.Namespace,
            values: {
                remoteControlPlane: {
                    enabled: true,
                    api: {
                        token: this.ApiToken,
                        hostname: this.ControlPlaneUrl
                    }
                },
            }
        });
    }
}