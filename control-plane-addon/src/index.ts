import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'
import {getSecretValue} from "@aws-quickstart/ssp-amazon-eks/dist/utils";
import { KubernetesManifest } from "@aws-cdk/aws-eks";

/**
 * Configuration options for the add-on.
 */


interface KeptnSecret {
    API_TOKEN: string;
    BRIDGE_PASSWORD: string;    
}

type KeptnControlPlaneParams = {

    /**
     * The AWS Secrets Manager Secret which is containing the Keptn bridge password and API Token (keys: API_TOKEN, BRIDGE_PASSWORD)
     */
    ssmSecretName: string,

    /**
     * Keptn API Token is used to connect to the Keptn API, not needed if a ssmSecretName is specified
     */    
    apiToken: string,

    /**
     * Keptn Bridge Password is used to login to the Keptn bridge, not needed if a ssmSecretName is specified
     */    
    bridgePassword: string,

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
     * Expose Keptn's Bridge and API Gateway service as type Loadbalancer instead of ClusterIP
     * @default false
     */            
    enableLoadbalancer: boolean,

    /**
     * Create an Ingress object to Expose Keptn's Bridge and API Gateway
     * @default false
     */      
    enableIngress: boolean,

    /**
     * The Hostname for the Ingress object
     */          
    ingressHostname: string,

    /**
     * Add additional Ingress Annotations like the ingress class
     * ingressAnnotations: {
     *  "kubernetes.io/ingress.class": "nginx"
     * }
     */               
    ingressAnnotations: {
        [key: string]: unknown;
    };

    /**
     * Configure an ingress secretName
     */      
    ingressSecretName: string,
}

const defaultKeptnControlPlaneParams: KeptnControlPlaneParams = {
    ssmSecretName: "",
    apiToken: "",
    bridgePassword: "",
    namespace: "keptn",
    helmrepo: "https://storage.googleapis.com/keptn-installer",
    version: "0.11.4",
    enableLoadbalancer: false,
    enableIngress: false,
    ingressHostname: "",
    ingressAnnotations: {},
    ingressSecretName: "",
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
     * 
    */
    protected createIngress(clusterInfo: ClusterInfo): KubernetesManifest {

        let tlsConfig = {}

        if(this.props.ingressSecretName) {
            tlsConfig = {                
                    "hosts": [
                        this.props.ingressHostname
                    ],
                    "secretName": this.props.ingressSecretName
                }
            
        }

        return new KubernetesManifest(clusterInfo.cluster.stack, "keptn-ingress-struct", {
            cluster: clusterInfo.cluster,
            manifest: [
                {
                    "apiVersion": "networking.k8s.io/v1",
                    "kind": "Ingress",
                    "metadata": {
                      "name": "keptn-ingress",
                      "namespace": this.props.namespace,
                      "annotations": this.props.ingressAnnotations,
                    },
                    "spec": {
                      "tls": [
                          tlsConfig
                        ],
                      "rules": [
                        {
                          "host": this.props.ingressHostname,
                          "http": {
                            "paths": [
                              {
                                "path": "/",
                                "pathType": "Prefix",
                                "backend": {
                                  "service": {
                                    "name": "api-gateway-nginx",
                                    "port": {
                                      "number": 80
                                    }
                                  }
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }    
            ],
            overwrite: true,
            prune: true
        });
    }

    /**
     * Creates namespace, which is a prerequisite for service account creation and subsequent chart execution.
     * @param clusterInfo 
     * @returns 
     * 
    */
    protected createNamespace(clusterInfo: ClusterInfo): KubernetesManifest {
        return new KubernetesManifest(clusterInfo.cluster.stack, "keptn-namespace-" + this.props.namespace + "-struct", {
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
        return new KubernetesManifest(clusterInfo.cluster.stack, "keptn-api-token-" + this.props.namespace, {
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
        return new KubernetesManifest(clusterInfo.cluster.stack, "bridge-credentials-" + this.props.namespace, {
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
        
        let ServiceType = 'ClusterIP'

        if(this.props.enableLoadbalancer) {
            ServiceType = 'LoadBalancer'
        }        

        const keptnHelmChart = clusterInfo.cluster.addHelmChart("keptn-" + this.props.namespace, {
            chart: "keptn",
            repository: this.props.helmrepo,
            version: this.props.version,
            namespace: this.props.namespace,
            release: "keptn",
            wait: true,
            values: {
                'control-plane': {
                    apiGatewayNginx: {
                        type: ServiceType
                    }
                }
            }
        });
        
        if(this.props.enableIngress) {
            const ingress = this.createIngress(clusterInfo)
            keptnHelmChart.node.addDependency(ingress)
        }

        keptnapitoken.node.addDependency(namespace)
        brigecredentials.node.addDependency(namespace)
  
        keptnHelmChart.node.addDependency(keptnapitoken)
        keptnHelmChart.node.addDependency(brigecredentials)

        return keptnHelmChart
    }
}
