import { XMLParser } from 'fast-xml-parser';

async function testGoogleNews(ticker) {
  console.log(`\nFetching Google News RSS for ${ticker}...`);
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(ticker + ' stock')}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const xml = await res.text();
      const parser = new XMLParser();
      const jsonObj = parser.parse(xml);
      const items = jsonObj.rss?.channel?.item;
      const articles = Array.isArray(items) ? items : items ? [items] : [];
      console.log(`Successfully fetched ${articles.length} news articles!`);
      articles.slice(0, 5).forEach((item, index) => {
        console.log(`[${index+1}] Title: ${item.title}`);
        console.log(`    Date: ${item.pubDate}`);
        console.log(`    Link: ${item.link}`);
      });
    } else {
      console.log(`Error: ${await res.text()}`);
    }
  } catch (e) {
    console.error('Google News fetch failed:', e.message);
  }
}

async function run() {
  await testGoogleNews('RELIANCE');
  await testGoogleNews('JPM');
}

run();
