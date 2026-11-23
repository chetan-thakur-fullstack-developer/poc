const { execSync } = require('child_process');
const path = require('path');

console.log('[Deploy] Starting gh-pages branch deployment...');

// 1. Run build with Node 26 environment
const nvmDir = process.env.HOME + '/.nvm';
const nodeBin = nvmDir + '/versions/node/v26.13.1/bin';
const env = Object.assign({}, process.env, { PATH: nodeBin + ':' + process.env.PATH });

try {
  execSync('node build.cjs', { stdio: 'inherit', env });
} catch (e) {
  console.error('[Deploy] Build failed:', e.message);
  process.exit(1);
}

// 2. Deploy dist/ to gh-pages branch
const distDir = path.join(__dirname, 'dist');
process.chdir(distDir);

try {
  execSync('git init', { stdio: 'inherit', env });
  execSync('git checkout -B gh-pages', { stdio: 'inherit', env });
  execSync('git add -A', { stdio: 'inherit', env });
  execSync('git commit -m "deploy: update gh-pages deployment" || true', { stdio: 'inherit', env });

  // Get remote URL from parent directory before changing CWD
  process.chdir(__dirname);
  const repoUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  process.chdir(distDir);

  execSync(`git push --force "${repoUrl}" gh-pages`, { stdio: 'inherit', env });
  console.log('[Deploy] ✓ Successfully deployed to gh-pages branch!');
} catch (e) {
  console.error('[Deploy] Push to gh-pages failed:', e.message);
  process.exit(1);
}
