const dynamoDBClient = require("../lib/dynamoDBClient");
const kucoin = require("../lib/kucoin");

const main = async () => {
  const [accountLendRecord, activeLoans] = await Promise.all([
    kucoin.rest.Margin.BorrowAndLend.getAccountLendRecord(),
    kucoin.getPaginatedResults(kucoin.rest.Margin.BorrowAndLend.getActiveLendOrdersList.bind(this, []))
  ])

  const item = {
    time: Math.floor(new Date().getTime() / 1000),
    accountLendRecord: accountLendRecord,
    activeLoans: activeLoans
  }

  console.log("Adding a new item...");

  try {
    var result = await dynamoDBClient.put({
      TableName: "kucoin-loan-records",
      Item: item,
    }).promise();
  } catch (e) {
    throw new Error("Unable to add item. Error: " + JSON.stringify(e, null, 2));
  }

  console.log("Added item:", JSON.stringify(result, null, 2));

  return true;
};

exports.handler = async (event) => {
  const result = await main();
  return {
    statusCode: 200,
  };
};

if (!process.env.LAMBDA_TASK_ROOT && require.main === module) {
  main();
}
