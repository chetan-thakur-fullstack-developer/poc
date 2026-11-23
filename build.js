const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

console.log('[Build] Starting Executive Wealth build for GitHub Pages...');

// Ensure dist directory exists and is clean
if (fs.existsSync(distDir)) {
  const oldFiles = fs.readdirSync(distDir);
  for (const f of oldFiles) {
    const p = path.join(distDir, f);
    try {
      if (fs.rmSync) {
        fs.rmSync(p, { recursive: true, force: true });
      } else if (fs.statSync(p).isDirectory()) {
        fs.rmdirSync(p, { recursive: true });
      } else {
        fs.unlinkSync(p);
      }
    } catch (_) {}
  }
} else {
  fs.mkdirSync(distDir, { recursive: true });
}

// Files to copy to dist
const filesToCopy = [
  'index.html',
  'accounts_data.json',
  'expense_tracker_data.json',
  'plaid_demo_data.json',
  'portfolio-data.json',
  '404.html'
];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    const size = (fs.statSync(dest).size / 1024).toFixed(1);
    console.log(`[Build] ✓ Copied ${file} -> dist/${file} (${size} KB)`);
  } else {
    console.warn(`[Build] ⚠ Warning: Source file ${file} not found!`);
  }
}

// Ensure .nojekyll exists (bypasses GitHub Pages Jekyll processing)
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('[Build] ✓ Created dist/.nojekyll');

// Copy public assets if public folder exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const pf of publicFiles) {
    const psrc = path.join(publicDir, pf);
    const pdest = path.join(distDir, pf);
    if (fs.statSync(psrc).isFile()) {
      fs.copyFileSync(psrc, pdest);
      console.log(`[Build] ✓ Copied public/${pf} -> dist/${pf}`);
    }
  }
}

console.log('[Build] ✨ Build completed successfully. Application ready in dist/');
