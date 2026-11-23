const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Build] Starting Vite production build for GitHub Pages...');

try {
  // Use explicit npx path or system PATH with nvm
  const nvmDir = process.env.HOME + '/.nvm';
  const nodeBin = nvmDir + '/versions/node/v26.13.1/bin';
  const env = Object.assign({}, process.env, { PATH: nodeBin + ':' + process.env.PATH });

  execSync('npx vite build', { stdio: 'inherit', env });
} catch (e) {
  console.error('[Build] Vite build failed:', e.message);
  process.exit(1);
}

const distDir = path.join(__dirname, 'dist');

// Ensure .nojekyll exists
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('[Build] ✓ Created dist/.nojekyll');

// Copy JSON data files to dist so fetch requests succeed
const dataFiles = [
  'accounts_data.json',
  'expense_tracker_data.json',
  'plaid_demo_data.json',
  'portfolio-data.json',
  '404.html'
];

for (const file of dataFiles) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[Build] ✓ Copied ${file} -> dist/${file}`);
  }
}

console.log('[Build] ✨ Vite Production Build Completed Successfully!');
