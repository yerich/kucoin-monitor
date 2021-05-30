const AWS = require("../lib/aws");
const dotenv = require('dotenv');
const fs = require("fs");
const path = require("path");
const {spawnSync} = require("./helpers");

const deployServer = async () => {
  const envVariables = dotenv.parse(fs.readFileSync(path.join(__dirname, "../.env")));
  const aws_id = envVariables.AWS_ACCOUNT_ID || process.env.AWS_ACCOUNT_ID;
  const aws_region = envVariables.AWS_DEFAULT_REGION || process.env.AWS_DEFAULT_REGION;

  // TODO use docker SDK instead
  let {stdout: pw} = await spawnSync("aws", ["ecr", "get-login-password", "--region", aws_region]);

  await spawnSync(`docker-compose`, [
    "-f",
    path.join(__dirname, "../docker-compose.yml"),
    "build",
    "kucoin-monitor-scripts"
  ]);
  await spawnSync("docker",
    ["login", "--username", "AWS", "--password-stdin", `${aws_id}.dkr.ecr.${aws_region}.amazonaws.com`],
    {stdin: pw}
  );

  await spawnSync("docker", [
    "tag",
    "kucoin-monitor-server:latest",
    `${aws_id}.dkr.ecr.${aws_region}.amazonaws.com/kucoin-monitor-server:latest`
  ]);
  let {stdout: pushResults} = await spawnSync("docker", [
    "push",
    `${aws_id}.dkr.ecr.${aws_region}.amazonaws.com/kucoin-monitor-scripts:latest`
  ]);
}