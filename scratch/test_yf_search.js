import yahooFinance from 'yahoo-finance2';

const yf = yahooFinance;

async function testSearch(query) {
  console.log(`\nSearching for: "${query}"...`);
  try {
    const results = await yf.search(query);
    console.log('Results (first 5):');
    results.quotes?.slice(0, 5).forEach((q, i) => {
      console.log(`[${i+1}] Ticker: ${q.symbol}, Name: ${q.shortname || q.longname}, Exchange: ${q.exchange}, Type: ${q.quoteType}`);
    });
  } catch (error) {
    console.error('Search failed:', error.message);
  }
}

async function run() {
  await testSearch('JP Morgan');
  await testSearch('Reliance Industries');
  await testSearch('BMW');
  await testSearch('AAPL');
}

run();
