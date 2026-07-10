const fs = require('fs');
const code = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');

const lines = code.split('\n');
let openCount = 0;
let lineStats = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // A very naive check for simple JSX, assuming well-formed lines for divs
  const openMatches = (line.match(/<div(\s|>)/g) || []).length;
  const closeMatches = (line.match(/<\/div>/g) || []).length;
  
  openCount += openMatches;
  openCount -= closeMatches;
  
  if (openMatches > 0 || closeMatches > 0) {
    lineStats.push(`${i + 1}: +${openMatches} -${closeMatches} (Total: ${openCount}) -> ${line.trim()}`);
  }
}

console.log("Final balance:", openCount);
fs.writeFileSync('scratch/div_balance.txt', lineStats.join('\n'));
