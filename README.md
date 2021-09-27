# fm-initializer

This script is built to initialize an existing/new FM app with the correct settings for our demo application.

## Run locally

```shell
cp .env.sample .env
vi .env # Replace with your FM user id and desired app name
pnpm install
pnpm start
```

## Run it in Kubernetes

```shell
kubectl run fm-init --image docker.io/ldonleycb/fm-initializer:2 --env="USER_TOKEN=" --env="APP_NAME="
```
