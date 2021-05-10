const express = require('express');
const {checkSession} = require("../helpers/auth");
const router = express.Router();
const kucoin = require("../../lib/kucoin");

router.get('/loans', checkSession, async function (req, res) {
  const [accountLendRecord, activeLoans] = await Promise.all([
    kucoin.rest.Margin.BorrowAndLend.getAccountLendRecord(),
    kucoin.getPaginatedResults(kucoin.rest.Margin.BorrowAndLend.getActiveLendOrdersList.bind(this, []))
  ])

  res.json({success: true, data: {
    accountLendRecord: accountLendRecord.data,
    activeLoans: activeLoans,
  }})
});

module.exports = router;
