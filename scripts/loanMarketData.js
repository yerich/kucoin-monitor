const dynamoDBClient = require("../lib/dynamoDBClient");
const kucoin = require("../lib/kucoin");

const lendingCurrencies = ["USDT", "USDC", "BTC", "ETH", "BNB", "XRP", "ADA", "DOT", "LTC", "UNI", "LINK", "XLM", "BCH", "THETA", "FIL"]

const main = async () => {
  const lendingPromises = lendingCurrencies.map((c) => {
    return kucoin.rest.Margin.BorrowAndLend.getLendingMarketData(c).then(r => {
      if (r.code != "200000") {
        console.error(lendingMarket.code, lendingMarket.msg);
        throw new Error(lendingMarket.code + ": " + lendingMarket.msg);
      }
      return r;
    });
  });

  const lendingResults = await Promise.all(lendingPromises);
  const lendingMarket = {};
  lendingCurrencies.forEach((c, i) => {
    lendingMarket[c] = lendingResults[i].data;
  })

  const item = {
    time: Math.floor(new Date().getTime() / 1000),
    lendingMarket: lendingMarket,
  }

  console.log("Adding a new item...");

  try {
    var result = await dynamoDBClient.put({
      TableName: "kucoin-loan-market",
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
