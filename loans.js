const kucoinAPI = require('kucoin-node-sdk');
const AWS = require('aws-sdk');
const config = require('./config');

var credentials = new AWS.SharedIniFileCredentials({profile: config.aws.credentialProfile});
AWS.config.credentials = credentials;
AWS.config.update({region: 'REGION'});
kucoinAPI.init(config.kucoinAPI);

const Datastore = require('nedb');
const fs = require('fs');

const getPaginatedResults = async (fn, params, max=null) => {
    const currentPage = 1;
    let allItems = [];
    while (true) {
        try {
            let result = await fn({currentPage, ...params});
            allItems = [...allItems, ...result.data.items];
            if (currentPage < result.data.totalPage) {
                currentPage += 1;
            } else {
                break;
            }
        } catch (e) {
            throw e;
        }
    }
    return allItems;
}

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
