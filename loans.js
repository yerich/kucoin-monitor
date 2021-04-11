/** Require SDK */
const API = require('kucoin-node-sdk');

/** Init Configure */
API.init(require('./config'));

/** API use */
const main = async () => {
  const borrowInfo = await API.rest.Margin.BorrowAndLend.getLendingMarketData("USDT");
  const topIntRate = borrowInfo.data[0].dailyIntRate;
  console.log(topIntRate);
};

/** Run Demo */
main();
