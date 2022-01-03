import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'

/**
 * Configuration options for the add-on.
 */

export class KeptnControlPlaneAddOn implements ClusterAddOn {
    readonly Namespace: string;
    readonly Version: string;
    readonly HelmRepository: string;


    constructor(namespace?: string, helmrepo?: string, version?: string) {
        this.Namespace = namespace ?? "keptn";
        this.HelmRepository = helmrepo ?? "https://storage.googleapis.com/keptn-installer"

        this.Version = version ?? "0.11.3"
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        return clusterInfo.cluster.addHelmChart("keptn", {
            chart: "keptn",
            repository: this.HelmRepository,
            version: this.Version,
            namespace: this.Namespace,
        });
    }
}
