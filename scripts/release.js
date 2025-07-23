#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function log(message) {
  console.log(`🚀 ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe', ...options });
    return result.trim();
  } catch (err) {
    error(`Command failed: ${command}\n${err.message}`);
  }
}

function checkGitStatus() {
  log('Checking git status...');
  
  const status = exec('git status --porcelain');
  if (status) {
    error('Working directory is not clean. Please commit or stash changes first.');
  }
  
  const branch = exec('git branch --show-current');
  if (branch !== 'main') {
    error(`You must be on the main branch to release. Current branch: ${branch}`);
  }
  
  log('Git status is clean ✅');
}

function checkNpmAuth() {
  log('Checking npm authentication...');
  
  try {
    exec('npm whoami --registry=https://registry.npmjs.org/');
    log('npm authentication verified ✅');
  } catch {
    error('Not logged in to npm. Run: npm login --registry=https://registry.npmjs.org/');
  }
}

function bumpVersion(type = 'patch') {
  log(`Bumping ${type} version...`);
  
  const validTypes = ['patch', 'minor', 'major'];
  if (!validTypes.includes(type)) {
    error(`Invalid version type: ${type}. Must be one of: ${validTypes.join(', ')}`);
  }
  
  const newVersion = exec(`npm version ${type} --no-git-tag-version`);
  log(`Version bumped to ${newVersion} ✅`);
  return newVersion;
}

function runTests() {
  log('Running tests...');
  exec('npm test');
  log('Tests passed ✅');
}

function createGitTag(version) {
  log(`Creating git tag ${version}...`);
  
  exec(`git add package.json`);
  exec(`git commit -m "chore: release ${version}"`);
  exec(`git tag -a ${version} -m "Release ${version}"`);
  
  log(`Git tag ${version} created ✅`);
}

function pushToGitHub(version) {
  log('Pushing to GitHub...');
  
  exec('git push origin main');
  exec(`git push origin ${version}`);
  
  log('Pushed to GitHub ✅');
}

function waitForGitHubActions() {
  log('Waiting for GitHub Actions to complete...');
  
  // Give GitHub Actions time to start
  console.log('Waiting 30 seconds for GitHub Actions to process the tag...');
  
  return new Promise(resolve => {
    setTimeout(() => {
      log('GitHub Actions should be running now. Check: https://github.com/ai-toolbox-mcp/json-mcp-server/actions');
      resolve();
    }, 30000);
  });
}

async function main() {
  const versionType = process.argv[2] || 'patch';
  
  log(`Starting release process (${versionType})...`);
  
  // Pre-flight checks
  checkGitStatus();
  checkNpmAuth();
  
  // Run tests before making any changes
  runTests();
  
  // Bump version
  const newVersion = bumpVersion(versionType);
  
  // Create git tag and push
  createGitTag(newVersion);
  pushToGitHub(newVersion);
  
  // Wait for GitHub Actions
  await waitForGitHubActions();
  
  log(`🎉 Release ${newVersion} completed successfully!`);
  log('GitHub Actions will handle:');
  log('  - Creating GitHub release');
  log('  - Publishing to npm registry');
  log('');
  log('Monitor progress at: https://github.com/ai-toolbox-mcp/json-mcp-server/actions');
}

main().catch(err => {
  error(`Release failed: ${err.message}`);
});