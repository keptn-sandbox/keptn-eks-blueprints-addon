# Keptn Control Plane Basic Example

Please adjust the settings in [bin/basic-example.ts](bin/basic-example.ts)

```typescript
apiToken: '<your-api-token>',
bridgePassword: '<your-bridge-password>'
const account = '<your-account-id>';
const region = '<region>';
```

Run the following commands to deploy the stack

```bash
npm install
cdk bootstrap
cdk deploy
kubectl -n keptn port-forward service/api-gateway-nginx 8080:80
```

You can not access the Keptn's bridge with the username `keptn` and the password you have defined via [http://localhost:8080](http://localhost:8080).
