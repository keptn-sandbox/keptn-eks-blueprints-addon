import { ClusterInfo } from '@aws-quickstart/eks-blueprints';
import { HelmAddOn, HelmAddOnProps, HelmAddOnUserProps } from "@aws-quickstart/eks-blueprints/dist/addons/helm-addon";
import { Construct } from 'constructs';
import { getSecretValue } from "@aws-quickstart/eks-blueprints/dist/utils";
import { KubernetesManifest } from "aws-cdk-lib/aws-eks";

/**
 * Configuration options for the add-on.
 */


interface KeptnSecret {
    API_TOKEN: string;
    BRIDGE_PASSWORD: string;    
}

interface KeptnControlPlaneAddOnProps extends HelmAddOnUserProps {

    /**
     * The AWS Secrets Manager Secret which is containing the Keptn bridge password and API Token (keys: API_TOKEN, BRIDGE_PASSWORD)
     */
    ssmSecretName?: string,

    /**
     * Keptn API Token is used to connect to the Keptn API, not needed if a ssmSecretName is specified
     */    
    apiToken?: string,

    /**
     * Keptn Bridge Password is used to login to the Keptn bridge, not needed if a ssmSecretName is specified
     */    
    bridgePassword?: string,

    /**
     * The Version of Keptn which should get installed
     * @default 0.11.4
     */    
    version?: string,

    /**
     * Expose Keptn's Bridge and API Gateway service as type Loadbalancer instead of ClusterIP
     * @default false
     */            
    enableLoadbalancer?: boolean,

    /**
     * Create an Ingress object to Expose Keptn's Bridge and API Gateway
     * @default false
     */      
    enableIngress?: boolean,

    /**
     * The Hostname for the Ingress object
     */          
    ingressHostname?: string,

    /**
     * Add additional Ingress Annotations like the ingress class
     * ingressAnnotations: {
     *  "kubernetes.io/ingress.class": "nginx"
     * }
     */               
    ingressAnnotations?: {
        [key: string]: unknown;
    };

    /**
     * Configure an ingress secretName
     */      
    ingressSecretName?: string,
}

export const defaultProps: HelmAddOnProps & KeptnControlPlaneAddOnProps = {
    name: 'keptn',
    namespace: "keptn",
    repository: "https://charts.keptn.sh",
    version: "0.13.4",
    release: "keptn",
    chart: "keptn",
    ssmSecretName: "",
    apiToken: "",
    bridgePassword: "",
    enableLoadbalancer: false,
    enableIngress: false,
    ingressHostname: "",
    ingressAnnotations: {},
    ingressSecretName: ""
}

export class KeptnControlPlaneAddOn extends HelmAddOn {

   readonly options: KeptnControlPlaneAddOnProps

    constructor(props: KeptnControlPlaneAddOnProps) {
       super({...defaultProps, ...props})
       this.options = this.props as KeptnControlPlaneAddOnProps
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

        if(this.options.ingressSecretName) {
            tlsConfig = {                
                    "hosts": [
                        this.options.ingressHostname
                    ],
                    "secretName": this.options.ingressSecretName
                }
            
        }

        return new KubernetesManifest(clusterInfo.cluster.stack, "keptn-ingress-" + this.props.namespace + "-struct", {
            cluster: clusterInfo.cluster,
            manifest: [
                {
                    "apiVersion": "networking.k8s.io/v1",
                    "kind": "Ingress",
                    "metadata": {
                      "name": "keptn-ingress",
                      "namespace": this.options.namespace,
                      "annotations": this.options.ingressAnnotations,
                    },
                    "spec": {
                      "tls": [
                          tlsConfig
                        ],
                      "rules": [
                        {
                          "host": this.options.ingressHostname,
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
                    "keptn-api-token": Buffer.from(<string>this.options.apiToken).toString('base64'),
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
                    "BASIC_AUTH_PASSWORD": Buffer.from(<string>this.options.bridgePassword).toString('base64')
                }                    
            }],
            overwrite: true,
            prune: true
        });
    }    

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {       
                
        if (this.options.ssmSecretName != "") {
            const secretValue = await getSecretValue(<string>this.options.ssmSecretName, clusterInfo.cluster.stack.region);
            const credentials: KeptnSecret = JSON.parse(secretValue)
            this.options.apiToken = credentials.API_TOKEN
            this.options.bridgePassword = credentials.BRIDGE_PASSWORD
        }
        
        const namespace = this.createNamespace(clusterInfo);
        const keptnapitoken = this.createKeptnApiTokenSecret(clusterInfo);
        const bridgecredentials = this.createBridgeCredentials(clusterInfo);
        
        let ServiceType = 'ClusterIP'

        if(this.options.enableLoadbalancer) {
            ServiceType = 'LoadBalancer'
        }        

        const keptnHelmChart = this.addHelmChart(clusterInfo, {
            'control-plane': {
                apiGatewayNginx: {
                    type: ServiceType
                }
            }
        });
        
        if(this.options.enableIngress) {
            const ingress = this.createIngress(clusterInfo)
            keptnHelmChart.node.addDependency(ingress)
            ingress.node.addDependency(namespace)
        }

        keptnapitoken.node.addDependency(namespace)
        bridgecredentials.node.addDependency(namespace)
  
        keptnHelmChart.node.addDependency(keptnapitoken)
        keptnHelmChart.node.addDependency(bridgecredentials)

        return keptnHelmChart
    }
}
