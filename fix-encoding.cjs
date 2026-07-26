const fs = require('fs');
let content = fs.readFileSync('src/pages/3DAimTrainer.tsx', 'utf8');

// Try a double-decode
let buf = Buffer.from(content, 'latin1');
let str = buf.toString('utf8');

let buf2 = Buffer.from(str, 'latin1');
let str2 = buf2.toString('utf8');

let buf3 = Buffer.from(str2, 'latin1');
let str3 = buf3.toString('utf8');

let match = content.match(/<div class="ic-val">([^<]+)<\/div>/);
let m1 = str.match(/<div class="ic-val">([^<]+)<\/div>/);
let m2 = str2.match(/<div class="ic-val">([^<]+)<\/div>/);
let m3 = str3.match(/<div class="ic-val">([^<]+)<\/div>/);

console.log('Original:', match[1]);
console.log('Depth 1:', m1 ? m1[1] : 'null');
console.log('Depth 2:', m2 ? m2[1] : 'null');
console.log('Depth 3:', m3 ? m3[1] : 'null');

