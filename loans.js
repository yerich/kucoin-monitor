const kucoinAPI = require('kucoin-node-sdk');
const fs = require('fs');

kucoinAPI.init({
    baseUrl: process.env.KUCOIN_API_BASEURL,
    apiAuth: {
        key: process.env.KUCOIN_API_KEY,
        secret: process.env.KUCOIN_API_SECRET,
        passphrase: process.env.KUCOIN_API_PASSPHRASE,
    },
    authVersion: 2,
});

const main = async () => {
    let loansDb;
    try {
        loansDb = new Datastore({ filename: './db/loans.db', autoload: true });
    } catch (e) {
        if (!fs.existsSync("./db")){
            fs.mkdirSync("./db");
        }
        loansDb = new Datastore('./db/loans.db');
    }

    const lendingMarket = await kucoinAPI.rest.Margin.BorrowAndLend.getLendingMarketData("USDT");
    const topIntRate = lendingMarket.data[0].dailyIntRate;

    const accountLendRecord = await kucoinAPI.rest.Margin.BorrowAndLend.getAccountLendRecord("USDT");

    const activeLoans = await getPaginatedResults(kucoinAPI.rest.Margin.BorrowAndLend.getActiveLendOrdersList.bind(this, ["USDT"]));
    let totalSize = 0;
    let totalWeightedInterestRate = 0;
    activeLoans.forEach((record) => {
        actualSize = parseFloat(record.size) - parseFloat(record.repaid);
        totalSize += actualSize;
        totalWeightedInterestRate += parseFloat(record.dailyIntRate) * actualSize;
    });
    const averageInterest = totalWeightedInterestRate / totalSize;

    const record = {
        topIntRate: topIntRate,
        lendingMarket: lendingMarket.data,
        amountLent: totalSize,
        averageIntRate: averageInterest,
        dailyInterest: averageInterest * totalSize * 0.85,
        accountLendRecord: accountLendRecord.data[0],
    };

    loansDb.insert(record);

    console.log(record);
};

main();
