const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '..', 'src', 'data', 'monumentVoiceProfiles.ts'),
  path.join('C:', 'Users', 'abhis', 'Downloads', 'UtkalSarathi-main', 'UtkalSarathi-main', 'src', 'data', 'monumentVoiceProfiles.ts'),
];

for (const p of targetFiles) {
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/basePitch:\s*[0-9.]+/g, 'basePitch: 1.0');
    // Also remove any drone frequencies to eliminate background alien hum
    c = c.replace(/droneRootFreqs:\s*\[[^\]]+\]/g, 'droneRootFreqs: [0, 0, 0, 0]');
    fs.writeFileSync(p, c, 'utf8');
    console.log('Successfully normalized pitch and disabled drones in:', p);
  }
}
