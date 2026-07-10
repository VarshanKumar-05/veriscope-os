async function testRawFetch(symbol) {
  console.log(`\nTesting raw fetch for ${symbol}...`);
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  // 1. Test quote endpoint
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
    console.log(`Fetching quote: ${url}`);
    const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      const quote = data.quoteResponse?.result?.[0];
      console.log(`Quote Success! Name: ${quote?.longName}, Price: ${quote?.regularMarketPrice}`);
    } else {
      console.log(`Quote Error: ${await res.text()}`);
    }
  } catch (e) {
    console.error('Quote fetch failed:', e.message);
  }

  // 2. Test quoteSummary endpoint
  try {
    const url = `https://query1.finance.yahoo.com/v11/finance/quoteSummary/${symbol}?modules=summaryProfile,financialData,defaultKeyStatistics`;
    console.log(`Fetching summary: ${url}`);
    const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      const summary = data.quoteSummary?.result?.[0];
      console.log(`Summary Success! Sector: ${summary?.summaryProfile?.sector}, Revenue: ${summary?.financialData?.totalRevenue}`);
    } else {
      console.log(`Summary Error: ${await res.text()}`);
    }
  } catch (e) {
    console.error('Summary fetch failed:', e.message);
  }
}

async function run() {
  await testRawFetch('AAPL');
  await testRawFetch('RELIANCE.NS'); // Indian stock ticker
}

run();
