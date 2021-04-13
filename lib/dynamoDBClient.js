const AWS = require("./aws");

const docClient = new AWS.DynamoDB.DocumentClient({region: "us-east-1"});

module.exports = docClient;
