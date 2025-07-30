# Release Process

This repository uses a direct npm publishing process without GitHub Actions.

## Prerequisites

### NPM Authentication
Make sure you're logged in to npm:
```bash
npm login --registry=https://registry.npmjs.org/
```

## Release Commands

### Version Bump Commands
```bash
# Patch Release (1.0.3 → 1.0.4)
npm run release:patch

# Minor Release (1.0.3 → 1.1.0)
npm run release:minor

# Major Release (1.0.3 → 2.0.0)
npm run release:major
```

### Publishing Commands
```bash
# Dry run to test publishing (recommended first)
npm publish --dry-run --access public --registry https://registry.npmjs.org/

# Actual publish
npm publish --access public --registry https://registry.npmjs.org/
```

## What Happens During Release

1. **Version bump:**
   - Updates package.json version using `npm version`
   - Creates a commit with the version change
   - Creates a git tag (e.g., `v1.0.4`)

2. **Manual publishing:**
   - Run the dry-run command to verify everything looks correct
   - Run the publish command to publish to npm
   - Package is published with public access to npm registry

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