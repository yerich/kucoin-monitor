const kucoinAPI = require('kucoin-node-sdk');
const AWS = require('aws-sdk');

kucoinAPI.init({
    baseUrl: process.env.KUCOIN_API_BASEURL,
    apiAuth: {
        key: process.env.KUCOIN_API_KEY,
        secret: process.env.KUCOIN_API_SECRET,
        passphrase: process.env.KUCOIN_API_PASSPHRASE,
    },
    authVersion: 2,
});

kucoinAPI.getPaginatedResults = async (fn, params, max=null) => {
    let currentPage = 1;
    let allItems = [];
    while (true) {
        let result;
        try {
            result = await fn({currentPage, ...params});
            allItems = [...allItems, ...result.data.items];
            if (currentPage < result.data.totalPage && (!max || currentPage <= max)) {
                currentPage += 1;
            } else {
                break;
            }
        } catch (e) {
            console.error(result);
            throw e;
        }
    }
    return allItems;
};

module.exports = kucoinAPI;
