const fs = require('fs');
const path = require('path');
const data = fs.createReadStream(path.join(__dirname, 'text.txt'));
data.on('data', chunk => console.log(chunk.toString()));