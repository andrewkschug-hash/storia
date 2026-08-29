const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'scratch', 'test_tts_1.mp3');
if (!fs.existsSync(src)) {
  console.error('Source audio does not exist:', src);
  process.exit(1);
}

const destinations = [
  path.join(__dirname, '..', 'src', 'audio', 'media', 'tts_232225bbb821dbc1.mp3'),
  path.join(__dirname, '..', 'public', 'audio', 'a1', 'tts_232225bbb821dbc1.mp3'),
  path.join(__dirname, '..', 'content', 'audio', 'bundled', 'tts_232225bbb821dbc1.mp3'),
  path.join(__dirname, '..', '..', 'services', 'tts-gateway', 'data', 'audio', 'tts_232225bbb821dbc1.mp3'),
];

for (const dst of destinations) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`Copied ${fs.statSync(dst).size} bytes to ${dst}`);
}
console.log('Audio file replaced successfully!');
