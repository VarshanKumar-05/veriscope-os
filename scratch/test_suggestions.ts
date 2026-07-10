import { discoverCompanies } from './server/services/discovery.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config();

async function testSuggestions(query: string) {
  console.log(`\nSuggestions for: "${query}"`);
  try {
    const results = await discoverCompanies(query);
    results.forEach((r, idx) => {
      console.log(`[${idx+1}] Ticker: ${r.ticker}, Name: ${r.name}, Exchange: ${r.exchange}`);
    });
  } catch (e: any) {
    console.error('Failed:', e.message);
  }
}

async function run() {
  await testSuggestions('Reliance');
  await testSuggestions('Tata');
  await testSuggestions('JP Morgan');
}

run();
