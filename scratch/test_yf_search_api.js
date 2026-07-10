async function testSearch(query) {
  console.log(`\nSearching for: "${query}"...`);
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
    console.log(`Fetching search URL: ${url}`);
    const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
    console.log(`Status: ${res.status}`);
    const body = await res.text();
    if (res.ok) {
      const data = JSON.parse(body);
      console.log('Search Success! Quotes count:', data.quotes?.length);
      data.quotes?.slice(0, 5).forEach((q, idx) => {
        console.log(`[${idx+1}] Symbol: ${q.symbol}, Name: ${q.shortname || q.longname}, Exchange: ${q.exchange}, Type: ${q.quoteType}`);
      });
    } else {
      console.log(`Search Error: ${body}`);
    }
  } catch (e) {
    console.error('Search failed:', e.message);
  }
}

async function run() {
  await testSearch('JP Morgan');
  await testSearch('Reliance Industries');
  await testSearch('BMW');
  await testSearch('AAPL');
}

run();
