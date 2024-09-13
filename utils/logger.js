const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs.txt');

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
}

module.exports = { log };