import fs from 'fs';
import path from 'path';

console.log('--- Testing Gemini 3.5 Flash and Gemini 2.0 Flash ---');

// Manually parse .env
let apiKey = '';
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), 'server', '.env')
];

for (const envPath of envPaths) {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
      if (match && match[1]) {
        apiKey = match[1].trim();
        break;
      }
    }
  } catch (e) {
    // Ignore error
  }
}

async function testGemini(model, version) {
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
  console.log(`\nTesting: ${version} / ${model}...`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, respond in 3 words.' }] }]
      })
    });
    
    const status = res.status;
    const body = await res.text();
    console.log(`Status: ${status}`);
    if (res.ok) {
      try {
        const parsed = JSON.parse(body);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`Success! Response: "${text?.trim()}"`);
        return true;
      } catch (e) {
        console.log(`OK status but body parse failed: ${body}`);
      }
    } else {
      console.log(`Error Response: ${body}`);
    }
  } catch (error) {
    console.error(`Fetch error:`, error.message);
  }
  return false;
}

async function run() {
  const models = [
    'gemini-3.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro'
  ];
  
  const versions = ['v1', 'v1beta'];
  
  for (const version of versions) {
    for (const model of models) {
      const success = await testGemini(model, version);
      if (success) {
        console.log(`\n*** SUCCESSFUL CONFIGURATION: Version: ${version}, Model: ${model} ***`);
      }
    }
  }
}

run();
