# JSON MCP Server

A Model Context Protocol (MCP) server that provides powerful JSON manipulation tools using `node-jq` with a locally installed `jq` binary, native Node.js fs operations, and `genson-js`.

## Prerequisites

**🚨 Required: Install jq binary on your system**

**Windows:**
```powershell
# Chocolatey (recommended)
choco install jq

# Scoop
scoop install jq

# Manual download
# Download jq.exe from https://stedolan.github.io/jq/download/
# Place in PATH or use --jq-path parameter

# WSL (if using Windows Subsystem for Linux)
wsl -e sudo apt-get install jq
```

**macOS:**
```bash
brew install jq
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL/Fedora
sudo yum install jq  # or sudo dnf install jq

# Arch Linux
sudo pacman -S jq
```

**Verify installation:**
```bash
# Windows (Command Prompt or PowerShell)
jq --version

# Unix/Linux/macOS
jq --version
# Should output something like: jq-1.6
```

## Features

- **Query JSON**: Use jq notation to query JSON files with complex filters and transformations
- **Generate JSON Schema**: Automatically generate JSON schemas from existing JSON data
- **Validate JSON Schema**: Ensure that JSON schemas are properly formed and valid

## Installation

1. Clone or create the project directory:
```bash
mkdir json-mcp-server
cd json-mcp-server
```

2. Save the provided files (`index.js`, `package.json`) in this directory

3. Clean install dependencies:
```bash
# Clean any existing installations first
npm run clean  # or manually: rm -rf node_modules package-lock.json
npm install
```

4. Make the script executable (Unix/Linux/macOS):
```bash
chmod +x index.js
```

## Claude Desktop Installation

**Mac/Linux**:

```json
{
  "mcpServers": {
    "json-mcp-server": {
      "command": "node",
      "args": [
        "/path/to/index.js",
        "--verbose=true",
        "--file-path=/path/to/file.json",
        "--jq-path=/path/to/jq"
      ]
    }
  }
}
```

**Windows**:

```json
{
  "mcpServers": {
    "json-mcp-server": {
      "command": "node",
      "args": [
        "C:\\path\\to\\index.js",
        "--verbose=true",
        "--file-path=C:\\path\\to\\file.json",
        "--jq-path=C:\\path\\to\\jq.exe"
      ]
    }
  }
}
```

## Usage

### Command Line Arguments

- `--verbose=true`: Enable verbose logging (default: false)
- `--file-path=/path/to/file.json`: Set a default file path for operations (optional)
- `--jq-path=/path/to/jq`: Specify custom jq binary path (auto-detected if not provided)

### Starting the Server

**Windows (Command Prompt):**
```cmd
REM Basic usage (auto-detects jq)
node index.js

REM With verbose logging
node index.js --verbose=true

REM With default file path (use forward slashes or escape backslashes)
node index.js --verbose=true --file-path=C:/Users/username/data.json

REM With custom jq binary path
node index.js --verbose=true --jq-path="C:\Program Files\jq\jq.exe"
```

**Windows (PowerShell):**
```powershell
# Basic usage
node index.js

# With verbose logging
node index.js --verbose=true

# With default file path
node index.js --verbose=true --file-path="C:\Users\username\data.json"

# With custom jq binary path
node index.js --verbose=true --jq-path="C:\Program Files\jq\jq.exe"
```

**Unix/Linux/macOS:**
```bash
# Basic usage (auto-detects jq)
node index.js

# With verbose logging
node index.js --verbose=true

# With default file path
node index.js --verbose=true --file-path=/home/user/data.json

# With custom jq binary path
node index.js --verbose=true --jq-path=/usr/local/bin/jq
```

**Using npm scripts (all platforms):**
```bash
npm start
npm run dev  # with verbose logging
```

## Tools

### 1. query_json

Query JSON data using jq notation.

**Parameters:**
- `filePath` (string, optional if default set): Absolute path to JSON file
- `query` (string, required): jq query expression

**Example queries:**
- `"."` - Return entire JSON
- `".users"` - Get users array
- `".users[0].name"` - Get first user's name
- `".users[] | select(.active == true)"` - Filter active users
- `".[].price | add"` - Sum all prices

### 2. generate_json_schema

Generate a JSON schema from a JSON file using genson-js.

**Parameters:**
- `filePath` (string, optional if default set): Absolute path to JSON file

**Output:** Complete JSON schema that describes the structure of your data.

### 3. validate_json_schema

Validate that a JSON schema is properly formed.

**Parameters:**
- `schema` (object): JSON schema object to validate, OR
- `schemaFilePath` (string): Path to file containing JSON schema

**Output:** Validation result with detailed feedback.

## Example JSON Data

Create a test file `test-data.json`:

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "active": true,
      "roles": ["user", "admin"]
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "active": false,
      "roles": ["user"]
    }
  ],
  "metadata": {
    "version": "1.0",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Example Usage with MCP Client

Once connected to an MCP client, you can use the tools like this:

### Query Examples
```javascript
// Get all active users
query_json({
  filePath: "/absolute/path/to/test-data.json",
  query: ".users[] | select(.active == true)"
})

// Get user emails
query_json({
  filePath: "/absolute/path/to/test-data.json",
  query: ".users[].email"
})

// Count total users
query_json({
  filePath: "/absolute/path/to/test-data.json",
  query: ".users | length"
})
```

### Schema Generation
```javascript
generate_json_schema({
  filePath: "/absolute/path/to/test-data.json"
})
```

### Schema Validation
```javascript
validate_json_schema({
  schema: {
    "type": "object",
    "properties": {
      "name": {"type": "string"}
    },
    "required": ["name"]
  }
})
```

## Error Handling

The server provides detailed error messages for:
- Invalid file paths
- Malformed jq queries
- Invalid JSON data
- Schema validation errors
- File access issues

## Requirements

- Node.js >= 18.0.0
- Access to the file system for reading JSON files
- Files must use absolute paths for security

## Dependencies

- `@modelcontextprotocol/sdk`: MCP protocol implementation (latest v1.x)
- `node-jq`: Node.js wrapper for jq binary (uses your local jq installation)
- `genson-js`: JSON schema generation
- `ajv`: JSON schema validation
- `commander`: Command line argument parsing
- `which`: Binary path detection utility

## Troubleshooting

### jq Binary Issues

If you get "jq binary not found" errors:

**Windows:**
1. **Install jq**: Follow the prerequisites section above
2. **Check PATH**: Ensure jq is in your system PATH
   ```cmd
   where jq
   REM Should show path like: C:\ProgramData\chocolatey\bin\jq.exe
   ```
3. **Try jq.exe**: Some Windows installations use `jq.exe`
   ```cmd
   jq.exe --version
   ```
4. **Custom path**: Use `--jq-path` if jq is in a non-standard location
   ```cmd
   node index.js --jq-path="C:\tools\jq\jq.exe"
   ```

**Unix/Linux/macOS:**
1. **Install jq**: Follow the prerequisites section above
2. **Check PATH**: Ensure jq is in your system PATH
   ```bash
   which jq  # Should show path like /usr/local/bin/jq
   ```
3. **Custom path**: Use `--jq-path` if jq is in a non-standard location
   ```bash
   node index.js --jq-path=/custom/path/to/jq
   ```

### Dependency Issues

If you encounter dependency issues:

1. **Clean install**:
   ```bash
   npm run clean
   npm install
   ```

2. **Node version**: Ensure you're using Node.js >= 18.0.0
   ```bash
   node --version
   ```

3. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

### Permission Issues

**Windows:**
- Usually no permission changes needed
- If you get access denied errors, run Command Prompt or PowerShell as Administrator
- Ensure jq.exe is not blocked by antivirus software

**Unix/Linux/macOS:**
If you get permission errors:
```bash
chmod +x index.js
# And ensure jq binary is executable
chmod +x $(which jq)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
