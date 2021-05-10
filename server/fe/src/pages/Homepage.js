import React, {useEffect, useState} from "react";
import {useAuth} from "../utils/auth";
import {get} from "../utils/api";

function rounded(n, m, fixed=false) {
  if (fixed) {
    return n.toFixed(m);
  }
  const t = Math.pow(10, m)
  return Math.round(n * t) / t;
}

function aggregateLoanData(data) {
  const {accountLendRecord, activeLoans} = data;

  const usdtLendRecord = accountLendRecord.find((d) => d.currency === "USDT");
  const totalActiveLoans = activeLoans.reduce((t, i) => t + parseFloat(i.size) + parseFloat(i.accruedInterest) - parseFloat(i.repaid), 0);
  const dailyTotalInterest = activeLoans.reduce((t, i) => t + (parseFloat(i.size) + parseFloat(i.accruedInterest) - parseFloat(i.repaid)) * parseFloat(i.dailyIntRate), 0);
  const averageDailyIntRate = dailyTotalInterest / (totalActiveLoans + parseFloat(usdtLendRecord.outstanding));

  return {
    outstanding: parseFloat(usdtLendRecord.outstanding),
    filledSize: parseFloat(usdtLendRecord.filledSize),
    total: parseFloat(usdtLendRecord.outstanding) + parseFloat(usdtLendRecord.filledSize),
    accruedInterest: parseFloat(usdtLendRecord.accruedInterest),
    realizedProfit: parseFloat(usdtLendRecord.realizedProfit),
    totalInterest: parseFloat(usdtLendRecord.accruedInterest) + parseFloat(usdtLendRecord.realizedProfit),
    totalActiveLoans,
    averageDailyIntRate,
    dailyTotalInterest,
    startTime: Date.now(),
  }
}

export function Homepage() {
  const auth = useAuth();

  const [aggregatedLoanData, setAggregatedLoanData] = useState(null);
  const [liveLoanEarnings, setLiveLoanEarnings] = useState(0);

  const session = auth.session;

  useEffect(() => {
    if (!session) return;
    let liveLoanEarningsInterval;

    async function getData() {
      const data = await get("/api/kucoin/loans");
      const agg = aggregateLoanData(data);
      setAggregatedLoanData(agg);
      setLiveLoanEarnings(agg.totalInterest);

      liveLoanEarningsInterval = setInterval(() => {
        const timeD = Date.now() - agg.startTime;
        const dayFrac = timeD / (1000 * 60 * 60 * 24);
        setLiveLoanEarnings(agg.totalInterest + (agg.dailyTotalInterest * dayFrac));
      }, 14)
    }
    getData();
    return () => clearInterval(liveLoanEarningsInterval);
  }, [session])

  if (!session) {
    return <div>Please login</div>;
  }

  if (!aggregatedLoanData) {
    return <div>Loading...</div>
  }

  return <div>
    <h1>Loan statistics</h1>

    <div className="live-earnings">
      Total interest earned:
      <div className="live-earnings-amount">${rounded(liveLoanEarnings, 8, true)}</div>
    </div>

    <div className="stat-item"><span>Total loan amount</span> ${rounded(aggregatedLoanData.total, 2, true)}</div>
    <div className="stat-item"><span>Open orders</span> ${rounded(aggregatedLoanData.outstanding, 2, true)}</div>
    <div className="stat-item"><span>Average interest rate</span> {rounded(aggregatedLoanData.averageDailyIntRate * 100, 5)}%</div>
    <div className="stat-item"><span>Daily interest</span> ${rounded(aggregatedLoanData.dailyTotalInterest, 2, true)}</div>
    <div className="stat-item"><span>Total earnings (not live)</span> ${rounded(aggregatedLoanData.totalInterest, 2, true)}</div>
  </div>;
}
