const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(process.env.TEMP || 'C:\\Temp', 'rea_chrome_debug_' + Date.now());

console.log('Launching chrome from', chromePath);
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-sync',
  '--disable-translate',
  '--hide-scrollbars',
  '--metrics-recording-only',
  '--mute-audio',
  '--safebrowsing-disable-auto-update',
  'https://www.aswinpanengal.me/'
], {
  stdio: 'inherit'
});

chrome.on('error', (err) => {
  console.error('Chrome spawn error:', err);
});

chrome.on('exit', (code, signal) => {
  console.log(`Chrome process exited with code ${code} and signal ${signal}`);
});

process.on('SIGINT', () => {
  chrome.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  chrome.kill();
  process.exit();
});
