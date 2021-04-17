const { spawn } = require("child_process");
const AWS = require("../lib/aws");
const dotenv = require('dotenv');
const fs = require("fs");
const path = require("path");

const spawnSync = (cmd, options=[], {stdin}={}) => {
    return new Promise((resolve, reject) => {
        console.log(cmd + " " + options.join(" "));
        let stdout = "";
        const child = spawn(cmd, options);

        if (stdin) {
            child.stdin.write(stdin);
            child.stdin.end();
        }

        child.stdout.on("data", data => {
            stdout += data.toString();
            // console.log(data.toString());
        });
        
        child.stderr.on("data", data => {
            console.error(data.toString());
        });
        
        child.on('error', (error) => {
            console.log(`${cmd} error: ${error.message}`);
            reject(error);
        });
        
        child.on("close", code => {
            console.log(`${cmd} exit: ${code}`);
            resolve({stdout, code});
        });
    });
}

const lambdaConfigs = [
    {
        functionName: "loanMarketData",
        command: "scripts/loanMarketData.handler",
    },
    {
        functionName: "accountLoanData",
        command: "scripts/accountLoanData.handler",
    }
]

const deployScripts = async () => {

    const lambdaEnv = {};
    const envVariables = dotenv.parse(fs.readFileSync(path.join(__dirname, "../.env")));
    for (k in envVariables) {
        if (!k.startsWith("AWS")) {
            lambdaEnv[k] = envVariables[k];
        }
    }
    const aws_id = envVariables.AWS_ACCOUNT_ID || process.env.AWS_ACCOUNT_ID;
    const aws_region = envVariables.AWS_DEFAULT_REGION || process.env.AWS_DEFAULT_REGION;

    // TODO use docker SDK instead
    let {stdout: pw} = await spawnSync("aws", ["ecr", "get-login-password", "--region", aws_region]);

    await spawnSync(`docker-compose`, [
        "-f", 
        path.join(__dirname, "../docker-compose.yml"), 
        "-f", 
        path.join(__dirname, "../docker-compose.prod.yml"), 
        "build", 
        "kucoin-monitor-scripts"
    ]);
    await spawnSync("docker", 
        ["login", "--username", "AWS", "--password-stdin", `${aws_id}.dkr.ecr.${aws_region}.amazonaws.com`], 
        {stdin: pw}
    );

    await spawnSync("docker", [
        "tag",
        "kucoin-monitor-scripts:latest",
        `${aws_id}.dkr.ecr.${aws_region}.amazonaws.com/kucoin-monitor-scripts:latest`
    ]);
    let {stdout: pushResults} = await spawnSync("docker", [
        "push",
        `${aws_id}.dkr.ecr.${aws_region}.amazonaws.com/kucoin-monitor-scripts:latest`
    ]);

    const imageSHA = pushResults.match(/sha256:([0-9a-f]+)/)[1];
    
    const lambda = new AWS.Lambda(
        {region: aws_region}
    );

    for (config of lambdaConfigs) {
        console.log("Updating " + config.functionName);
        await lambda.updateFunctionCode({
            FunctionName: config.functionName,
            ImageUri: `${aws_id}.dkr.ecr.${aws_region}.amazonaws.com/kucoin-monitor-scripts@sha256:${imageSHA}`,
        }).promise();

        // await lambda.updateFunctionConfiguration({
        //     FunctionName: config.functionName,
        //     Environment: {
        //         Variables: lambdaEnv,
        //     },
        //     ImageConfig: {
        //         Command: [config.command],
        //     },
        // }).promise();
    }
}

deployScripts();