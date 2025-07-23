# Release Process

This repository uses an automated release process that creates both GitHub releases and publishes to npm.

## Prerequisites

### 1. NPM Authentication
Make sure you're logged in to npm:
```bash
npm login --registry=https://registry.npmjs.org/
```

### 2. GitHub Secrets Setup
The repository needs an `NPM_TOKEN` secret configured:

1. Go to [npm access tokens](https://www.npmjs.com/settings/tokens)
2. Create a new "Automation" token
3. Go to your GitHub repository → Settings → Secrets and variables → Actions
4. Add a new secret named `NPM_TOKEN` with your token value

## Release Commands

### Patch Release (1.0.3 → 1.0.4)
```bash
npm run release:patch
```

### Minor Release (1.0.3 → 1.1.0)
```bash
npm run release:minor
```

### Major Release (1.0.3 → 2.0.0)
```bash
npm run release:major
```

### Default Release (patch)
```bash
npm run release
```

## What Happens During Release

1. **Pre-flight checks:**
   - Verifies git working directory is clean
   - Confirms you're on the main branch
   - Validates npm authentication
   - Runs tests

2. **Version bump:**
   - Updates package.json version
   - Creates a commit with the version change
   - Creates a git tag (e.g., `v1.0.4`)

3. **GitHub push:**
   - Pushes the commit to main branch
   - Pushes the tag to trigger GitHub Actions

4. **GitHub Actions:**
   - Runs tests again
   - Creates a GitHub release
   - Publishes to npm registry
   - Creates/updates a `latest` tag

## Troubleshooting

### "Not logged in to npm" error
Run: `npm login --registry=https://registry.npmjs.org/`

### "Working directory is not clean" error
Commit or stash your changes first: `git add . && git commit -m "your message"`

### "You must be on the main branch" error
Switch to main: `git checkout main && git pull origin main`

### GitHub Actions failing
1. Check that `NPM_TOKEN` secret is set correctly
2. Verify the token has publish permissions
3. Check the Actions tab for detailed error logs

## Manual Fallback

If the automated process fails, you can manually publish:

```bash
# After running npm run release:patch (which creates the tag)
npm publish --registry=https://registry.npmjs.org/ --access public
```

## Monitoring

Monitor release progress at:
- GitHub Actions: https://github.com/ai-toolbox-mcp/json-mcp-server/actions
- npm package: https://www.npmjs.com/package/@ai-toolbox-mcp/json-mcp-server