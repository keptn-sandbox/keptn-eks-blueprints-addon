import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct, TreeInspector } from '@aws-cdk/core'
import {getSecretValue, loadExternalYaml} from "@aws-quickstart/ssp-amazon-eks/dist/utils";
import { KubernetesManifest } from "@aws-cdk/aws-eks";
import { type } from 'os';

/**
 * Configuration options for the add-on.
 */


interface KeptnSecret {
    API_TOKEN: string;
    BRIDGE_PASSWORD: string;    
}

type KeptnControlPlaneParams = {
    ssmSecretName: string,
    apiToken: string,
    bridgePassword: string,
    namespace: string,
    helmrepo: string,
    version: string
}

const defaultKeptnControlPlaneParams: KeptnControlPlaneParams = {
    ssmSecretName: "",
    apiToken: "",
    bridgePassword: "",
    namespace: "keptn",
    helmrepo: "https://storage.googleapis.com/keptn-installer",
    version: "0.11.4"
}

export class KeptnControlPlaneAddOn implements ClusterAddOn {

    props: KeptnControlPlaneParams

    constructor(params: Partial<KeptnControlPlaneParams>) {        
        this.props = {...defaultKeptnControlPlaneParams, ...params}
    }

    /**
     * Creates namespace, which is a prerequisite for service account creation and subsequent chart execution.
     * @param clusterInfo 
     * @returns 
     * 
    */
    protected createNamespace(clusterInfo: ClusterInfo): KubernetesManifest {
        return new KubernetesManifest(clusterInfo.cluster.stack, "keptn-namespace-struct", {
            cluster: clusterInfo.cluster,
            manifest: [{
                apiVersion: 'v1',
                kind: 'Namespace',
                metadata: {
                    name: this.props.namespace,
                }
            }],
            overwrite: true,
            prune: true
        });
    }

    /**
     * Creates keptn-api-token secret, which is a prerequisite for chart execution.
     * @param clusterInfo 
     * @returns 
    */
    protected createKeptnApiTokenSecret(clusterInfo: ClusterInfo): KubernetesManifest {
        return new KubernetesManifest(clusterInfo.cluster.stack, "keptn-api-token", {
            cluster: clusterInfo.cluster,
            manifest: [{
                apiVersion: 'v1',
                kind: 'Secret',
                type: 'Opaque',
                metadata: {
                    name: 'keptn-api-token',
                    namespace: this.props.namespace,
                    labels: {
                        "app.kubernetes.io/component": "control-plane",
                        "app.kubernetes.io/instance": "keptn",
                        "app.kubernetes.io/managed-by": "Helm",
                        "app.kubernetes.io/name": "keptn-api-token",
                        "app.kubernetes.io/part-of": "keptn-" + this.props.namespace,
                        "helm.sh/chart": "control-plane-0.1.0"
                    },           
                    annotations: {
                        "meta.helm.sh/release-name": "keptn",
                        "meta.helm.sh/release-namespace": this.props.namespace
                    }                    
                },
                data: {
                    "keptn-api-token": this.props.apiToken,
                }                    
            }],
            overwrite: true,
            prune: true
        });
    }

    /**
     * Creates bridge-credentials secret, which is a prerequisite for chart execution.
     * @param clusterInfo 
     * @returns 
    */
    protected createBridgeCredentials(clusterInfo: ClusterInfo): KubernetesManifest {
        return new KubernetesManifest(clusterInfo.cluster.stack, "bridge-credentials", {
            cluster: clusterInfo.cluster,
            manifest: [{
                apiVersion: 'v1',
                kind: 'Secret',
                type: 'Opaque',                
                metadata: {
                    name: 'bridge-credentials',
                    namespace: this.props.namespace,
                    labels: {
                        "app.kubernetes.io/component": "control-plane",
                        "app.kubernetes.io/instance": "keptn",
                        "app.kubernetes.io/managed-by": "Helm",
                        "app.kubernetes.io/name": "bridge-credentials",
                        "app.kubernetes.io/part-of": "keptn-" + this.props.namespace,
                        "helm.sh/chart": "control-plane-0.1.0"
                    },
                    annotations: {
                        "meta.helm.sh/release-name": "keptn",
                        "meta.helm.sh/release-namespace": this.props.namespace
                    }
                },
                data: {
                    "BASIC_AUTH_USERNAME": 'a2VwdG4=',
                    "BASIC_AUTH_PASSWORD": this.props.bridgePassword
                }                    
            }],
            overwrite: true,
            prune: true
        });
    }    

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {       
                
        if (this.props.ssmSecretName != "") {
            const secretValue = await getSecretValue(this.props.ssmSecretName, clusterInfo.cluster.stack.region);
            const credentials: KeptnSecret = JSON.parse(secretValue)
            this.props.apiToken = btoa(credentials.API_TOKEN)
            this.props.bridgePassword = btoa(credentials.BRIDGE_PASSWORD)
        }
        
        const namespace = this.createNamespace(clusterInfo);
        const keptnapitoken = this.createKeptnApiTokenSecret(clusterInfo);
        const brigecredentials = this.createBridgeCredentials(clusterInfo);
        
        const keptnHelmChart = clusterInfo.cluster.addHelmChart("keptn", {
            chart: "keptn",
            repository: this.props.helmrepo,
            version: this.props.version,
            namespace: this.props.namespace,
            release: "keptn",
            wait: true
        });
        
        keptnapitoken.node.addDependency(namespace)
        brigecredentials.node.addDependency(namespace)
  
        keptnHelmChart.node.addDependency(keptnapitoken)
        keptnHelmChart.node.addDependency(brigecredentials)

        return keptnHelmChart
    }
}
