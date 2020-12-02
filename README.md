# ts-lambda-cli
[![NPM](https://nodei.co/npm/@aaneto/lambda-ts-cli.png)](https://npmjs.org/package/@aaneto/lambda-ts-cli)

A simple CLI tool to invoke and deploy lambda functions based on typescript projects.

Install globally with ```sudo npm i -g @aaneto/lambda-ts-cli``` or locally with ```npm i --save-dev @aaneto/lambda-ts-cli```

# Using the CLI

To use the CLI you must define three environment variables:
- AWS_KEY_ID
- AWS_SECRET
- AWS_REGION

you can do this manually, or you can add a .env file setting these variables in the root path of your project (where the script will be run from).

Example of a .env file:
```
AWS_KEY_ID=$YOUR_KEY_ID
AWS_SECRET=$YOUR_SECRET
AWS_REGION=$YOUR_REGION
```

## How to deploy a function

1. Build your typescript app
2. run ```lambda-ts deploy -f $FUNCTION_NAME -r $FUNCTION_ROLE -b $PATH_TO_BUILD_FOLDER```
3. You should see the response on the terminal and the lambda on the AWS panel

New functions will be created, if your function already exists, only the code will be updated.

## How to invoke a function

1. Function without payload: ```lambda-ts invoke -f $FUNCTION_NAME```
2. Function with payload: ```lambda-ts invoke -f $FUNCTION_NAME -p '{"ddd": 11}'```
