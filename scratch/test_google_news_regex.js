function parseGoogleNewsRss(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    
    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch[1].trim(),
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : ''
      });
    }
  }
  return items;
}

async function testGoogleNews(ticker) {
  console.log(`\nFetching Google News RSS for ${ticker}...`);
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(ticker + ' stock')}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const xml = await res.text();
      const articles = parseGoogleNewsRss(xml);
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
