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
YOUR_USER_TOKEN=
YOUR_APP_NAME=
curl -s https://raw.githubusercontent.com/cb-demos/fm-initializer/main/k8s/fm-initializer.yaml | cat | sed s/REPLACE_USER_TOKEN/$YOUR_USER_TOKEN/g ./k8s/fm-initializer.yaml | sed s/REPLACE_APP_NAME/$YOUR_APP_NAME/g  | kubectl create -f -
```
