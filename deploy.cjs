const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Deploy] Starting main branch GitHub Pages deployment...');

// 1. Run build
console.log('[Deploy] Running build...');
try {
  execSync('node build.cjs', { stdio: 'inherit' });
} catch (e) {
  console.error('[Deploy] Build failed:', e.message);
  process.exit(1);
}

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('[Deploy] Error: dist/ directory not found!');
  process.exit(1);
}

// Recursive copy helper for Node v12 compatibility
function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('[Deploy] Copying dist files to root for main branch publishing...');
const items = fs.readdirSync(distDir);
for (const item of items) {
  if (item === '.git' || item === 'dist') continue;
  const src = path.join(distDir, item);
  const dest = path.join(__dirname, item);
  copyRecursiveSync(src, dest);
}

console.log('[Deploy] Committing built assets to main branch...');
try {
  execSync('git add -A', { stdio: 'inherit' });
  execSync('git commit -m "build: update root production assets for main branch GitHub Pages deployment" || true', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('[Deploy] ✓ Successfully deployed to main branch GitHub Pages!');
} catch (e) {
  console.error('[Deploy] Push to main failed:', e.message);
  process.exit(1);
}
