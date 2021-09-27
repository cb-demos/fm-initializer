# fm-initializer

This script is built to initialize an existing/new FM app with the correct settings for our demo application.

## What it does

1. Create an app matching the `APP_NAME` if it doesn't already exist
2. Creates the following environments if they don't exist: `Production`, `Pre-Prod`, `QA`, `Dev`
3. Initializes the needed flags
4. Initializes the custom properties
5. Sets up the target groups

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
