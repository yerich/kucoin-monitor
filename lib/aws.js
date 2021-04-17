const AWS = require('aws-sdk');

if (!process.env.LAMBDA_TASK_ROOT && process.env.AWS_ACCESS_KEY_ID) {
    var credentials = new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    AWS.config.update({
        region: process.env.AWS_DEFAULT_REGION,
        credentials: credentials
    });
}

module.exports = AWS;
