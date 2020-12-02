import { Lambda, S3, config } from "aws-sdk";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { zip } from "zip-a-folder";

setupAwsSDK();

function setupAwsSDK() {
    dotenv.config();
    config.update({
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET,
        region: process.env.AWS_REGION
    });
}

interface lambdaCreationData {
    role: string;
    name: string;
    bucketName: string;
    bucketKey: string;
    description: string;
}

async function createFunction(data: lambdaCreationData) {
    const lambda = new Lambda({ apiVersion: '2015-03-31' });
    const config = {
        FunctionName: data.name,
        Role: data.role,
        Code: {
            S3Bucket: data.bucketName,
            S3Key: data.bucketKey
        },
        Handler: "index.handler",
        Runtime: "nodejs10.x",
        Description: data.description
    };

    const creationData = await lambda.createFunction(config).promise();
    return creationData;
}

async function updateFunctionCode(data: lambdaCreationData) {
    const lambda = new Lambda({ apiVersion: '2015-03-31' });
    const config = {
        FunctionName: data.name,
        S3Bucket: data.bucketName,
        S3Key: data.bucketKey
    };
    const res = await lambda.updateFunctionCode(config).promise();
    return res;
}

async function doesBucketExist(bucketName: string) {
    const s3 = new S3();
    try {
        await s3.headBucket({ Bucket: bucketName }).promise();
        return true;
    } catch (e) {
        if (e.statusCode === 404) {
            return false;
        } else {
            throw e;
        }
    }
}

async function createBucket(name: string) {
    const s3 = new S3();
    const config = { Bucket: name };
    const response = await s3.createBucket(config).promise();
    return response;
}

async function zipFunctionData(functionName: string) {
    const filePath = process.cwd();
    const inPath = path.join(filePath, "build");
    const outPath = path.join(filePath, `${functionName}.zip`);

    try {
        await zip(inPath, outPath);
    } catch (e) {
        throw `Could not zip function data: ${e}`;
    }
}

async function uploadFunctionData(bucketName: string, bucketKey: string, lambdaName: string) {
    const s3 = new S3();
    const data = fs.readFileSync(bucketKey);
    const config = {
        Bucket: bucketName,
        Key: bucketKey,
        Body: data,
    };
    const res = await s3.putObject(config).promise();
    return res;
}

async function getFunction(name: string): Promise<Lambda.GetFunctionResponse | undefined> {
    const lambda = new Lambda({ apiVersion: '2015-03-31' });
    try {
        const res = await lambda.getFunction({ FunctionName: name }).promise();
        return res;
    } catch (e) {
        if (e.statusCode === 404) {
            return;
        }
        throw e;
    }
}

async function certifyBucketExist(bucketName: string) {
    const bucketExists = await doesBucketExist(bucketName);
    if (!bucketExists) {
        await createBucket(bucketName);
    }
}

export interface DeployData {
    codePath: string;
    name: string;
    role: string;
    description: string;
}

export interface InvokeData {
    name: string;
    payload: any;
}

export async function deployFunction(data: DeployData) {
    const isFunctionCreated = await getFunction(data.name);
    const bucketName = `generated-lambda-bucket-${data.name}`;
    const bucketKey = `${data.name}.zip`;
    const lambdaData = {
        role: data.role,
        name: data.name,
        bucketName,
        bucketKey,
        description: data.description
    };
    await zipFunctionData(data.name);
    await certifyBucketExist(bucketName);
    await uploadFunctionData(bucketName, bucketKey, data.name);

    fs.unlinkSync(bucketKey);

    if (isFunctionCreated) {
        const output = await updateFunctionCode(lambdaData);
        return output;
    } else {
        const output = await createFunction(lambdaData);
        return output;
    }
}

export async function invokeFunction(data: InvokeData) {
    const lambda = new Lambda({ apiVersion: '2015-03-31' });
    const config = {
        InvocationType: "Event",
        FunctionName: data.name,
        Payload: data.payload || ""
    };
    const res = await lambda.invoke(config).promise();
    return res;
}
