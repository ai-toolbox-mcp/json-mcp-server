# 🪟 Windows Setup Guide for JSON MCP Server

## Windows-Specific Installation

### Option 1: Chocolatey (Recommended)
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install jq
choco install jq

# Verify installation
jq --version
```

### Option 2: Scoop
```powershell
# Install Scoop if not already installed
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install jq
scoop install jq

# Verify installation
jq --version
```

### Option 3: Manual Installation
1. Go to https://stedolan.github.io/jq/download/
2. Download `jq-win64.exe` or `jq-win32.exe`
3. Rename to `jq.exe`
4. Place in a directory in your PATH, or use `--jq-path` parameter

### Option 4: WSL (Windows Subsystem for Linux)
```bash
# In WSL terminal
sudo apt-get update
sudo apt-get install jq

# Then run the MCP server from WSL
```

## Windows-Specific Issues and Solutions

### Issue 1: "jq not found" Error
**Symptoms:**
```
❌ Error: Local jq binary not found or not executable
```

**Solutions:**
1. **Check if jq is installed:**
   ```cmd
   jq --version
   ```

2. **Check PATH:**
   ```cmd
   where jq
   ```

3. **If jq.exe specifically:**
   ```cmd
   jq.exe --version
   where jq.exe
   ```

4. **Use custom path:**
   ```cmd
   node index.js --jq-path="C:\ProgramData\chocolatey\bin\jq.exe"
   ```

### Issue 2: PowerShell Execution Policy
**Symptoms:**
```
cannot be loaded because running scripts is disabled on this system
```

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 3: Antivirus Blocking jq.exe
**Symptoms:**
- jq installs but doesn't run
- "Access denied" errors

**Solutions:**
1. Add jq.exe to antivirus exclusions
2. Use Windows Defender exclusions:
   - Settings → Update & Security → Windows Security → Virus & threat protection
   - Add exclusion for jq.exe location

### Issue 4: Path with Spaces
**Symptoms:**
```
Error: ENOENT: no such file or directory
```

**Solution:**
Always quote paths with spaces:
```cmd
node index.js --jq-path="C:\Program Files\jq\jq.exe"
```

## Windows File Path Formats

The MCP server accepts multiple Windows path formats:

```cmd
REM Forward slashes (recommended)
--file-path=C:/Users/username/data.json

REM Backslashes (escape in quotes)
--file-path="C:\Users\username\data.json"

REM UNC paths
--file-path="\\server\share\data.json"
```

## Testing on Windows

1. **Open Command Prompt or PowerShell as regular user** (not Administrator unless needed)

2. **Navigate to your project directory:**
   ```cmd
   cd C:\path\to\json-mcp-server
   ```

3. **Install dependencies:**
   ```cmd
   npm install
   ```

4. **Create test data:**
   ```cmd
   node test.js
   ```

5. **Start the server:**
   ```cmd
   node index.js --verbose=true
   ```

6. **Expected output:**
   ```
   [JSON-MCP-SERVER] Starting JSON MCP Server...
   [JSON-MCP-SERVER] Auto-detected jq at: C:\ProgramData\chocolatey\bin\jq.exe
   [JSON-MCP-SERVER] ✅ jq binary found and accessible: C:\ProgramData\chocolatey\bin\jq.exe
   [JSON-MCP-SERVER] ✅ jq binary configured successfully
   [JSON-MCP-SERVER] Server connected and ready
   ```

## Windows Development Tips

### Use Windows Terminal
- Better than Command Prompt
- Supports Unicode output
- Multiple tabs

### PowerShell vs Command Prompt
- Both should work
- PowerShell has better error messages
- Command Prompt is more compatible with older systems

### Long Path Support
If you encounter path length issues:
```cmd
REM Enable long path support (requires Admin)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

## Environment Variables

You can set default paths using environment variables:

**Command Prompt:**
```cmd
set JQ_PATH=C:\tools\jq\jq.exe
set DEFAULT_JSON_PATH=C:\data\default.json
node index.js --verbose=true
```

**PowerShell:**
```powershell
$env:JQ_PATH = "C:\tools\jq\jq.exe"
$env:DEFAULT_JSON_PATH = "C:\data\default.json"
node index.js --verbose=true
```

## Common Windows jq Installation Paths

After installation, jq is typically found at:

- **Chocolatey:** `C:\ProgramData\chocolatey\bin\jq.exe`
- **Scoop:** `C:\Users\{username}\scoop\apps\jq\current\jq.exe`
- **Manual:** Wherever you placed it
- **WSL:** `/usr/bin/jq` (inside WSL)

The MCP server will auto-detect these common locations! 🎉
