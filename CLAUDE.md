# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides JSON manipulation tools using `jq`, schema generation, and validation capabilities. The server is written in Node.js and uses the `@modelcontextprotocol/sdk` for MCP protocol handling.

## Key Architecture

- **Single-file MCP server**: `index.js` contains the entire server implementation
- **Three main tools**: `query_json`, `generate_json_schema`, `validate_json_schema`
- **External dependency**: Requires local `jq` binary installation
- **Security-focused**: Only accepts absolute file paths for security

### Core Components

- **MCP Server Setup**: Uses `@modelcontextprotocol/sdk` with stdio transport
- **jq Integration**: Auto-detects local `jq` binary with fallback to `jq.exe` on Windows
- **JSON Schema**: Uses `genson-js` for generation and `ajv` for validation
- **Command Line Interface**: Uses `commander` for argument parsing

### File Structure
```
index.js          - Main MCP server implementation
test.js           - Test setup and example data generator
package.json      - Dependencies and npm scripts
README.md         - Comprehensive user documentation
WINDOWS_SETUP.md  - Windows-specific setup instructions
```

## Development Commands

### Start/Test Commands
```bash
# Start server (production)
npm start

# Start with verbose logging (development)
npm run dev

# Run tests and create test data
npm test
```

### Package Management
```bash
# Clean dependencies (cross-platform)
npm run clean

# Install dependencies
npm install
```

### Publishing
```bash
# Publish to npm
npm run publish:npm

# Publish to GitHub packages
npm run publish:github

# Publish to both registries
npm run publish:all
```

## Server Configuration

The server accepts command-line arguments:
- `--verbose=true` - Enable detailed logging
- `--file-path=/path/to/file.json` - Set default file path
- `--jq-path=/path/to/jq` - Custom jq binary location

## Testing and Development

1. **Generate test data**: Run `node test.js` to create `test-data.json` and `test-schema.json`
2. **Start server**: Use `npm run dev` for verbose output during development
3. **jq requirement**: The server will check for `jq` installation on startup and provide platform-specific installation instructions if missing

## Important Implementation Details

### jq Binary Detection
The server auto-detects `jq` binary location using the `which` package. On Windows, it tries both `jq` and `jq.exe`. Custom paths can be specified with `--jq-path`.

### File Path Security
All file operations require absolute paths for security. The server validates file existence and accessibility before processing.

### Error Handling
Comprehensive error handling for:
- Missing jq binary with installation instructions
- Invalid file paths or JSON syntax
- jq query syntax errors
- Schema validation failures

### MCP Tools Architecture
Each tool (`query_json`, `generate_json_schema`, `validate_json_schema`) follows the MCP protocol with:
- Detailed input schemas
- Consistent error response format
- Verbose logging when enabled

## Dependencies to be Aware Of

- `@modelcontextprotocol/sdk` - Core MCP protocol implementation
- `node-jq` - Requires local `jq` binary (not included in npm package)
- `genson-js` - JSON schema generation
- `ajv` - JSON schema validation
- `commander` - CLI argument parsing
- `which` - Binary path detection

## Platform Considerations

The codebase is designed for cross-platform compatibility with special handling for Windows:
- Path format flexibility (forward/back slashes)
- `jq.exe` detection on Windows
- Cross-platform clean scripts
- Windows-specific documentation in `WINDOWS_SETUP.md`