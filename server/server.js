const express = require('express');
const app = express();
const router = express.Router();

const kucoin = require("../lib/kucoin");
const AWS = require("../lib/aws");

const port = 8080;

router.get('/', async function(req, res){

    const accountLendRecord = await kucoin.rest.Margin.BorrowAndLend.getAccountLendRecord("USDT");

    res.json(accountLendRecord);
});

app.use('/', router);

app.listen(port, function () {
    console.log('Example app listening on port 8080!')
});
