# PromptMapGUI - User Installation Guide

Welcome to PromptMapGUI! This guide will help you install and get started with the application.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Download](#download)
3. [Installation](#installation)
4. [First Launch](#first-launch)
5. [Configuration](#configuration)
6. [Using PromptMapGUI](#using-promptmapgui)
7. [Uninstallation](#uninstallation)
8. [FAQ](#faq)
9. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10 (64-bit) or Windows 11
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 500 MB free space
- **Python**: Python 3.8 or higher (automatically checked on first launch)
- **Internet Connection**: Required for LLM provider APIs and initial setup

### Recommended Requirements

- **Operating System**: Windows 11
- **RAM**: 16 GB (for running local LLM models via Ollama)
- **Disk Space**: 2 GB free space
- **Internet**: Broadband connection

## Download

### Official Release

Download the latest installer from the GitHub releases page:

**https://github.com/crazyrob425/promptmapgui/releases**

Look for the file named: `PromptMapGUI-Setup-v2.0.exe`

### Verify Download (Optional but Recommended)

For security, verify the installer's checksum:

1. Download the SHA256 checksum file from the releases page
2. Open PowerShell in the download folder
3. Run: `Get-FileHash PromptMapGUI-Setup-v2.0.exe -Algorithm SHA256`
4. Compare the output with the checksum file

## Installation

### Step-by-Step Installation

1. **Run the Installer**
   - Double-click `PromptMapGUI-Setup-v2.0.exe`
   - If Windows SmartScreen appears, click "More info" → "Run anyway"

2. **Welcome Screen**
   - Read the welcome message
   - Click "Next" to continue

3. **License Agreement**
   - Read the GPL-3.0 license
   - Select "I accept the agreement"
   - Click "Next"

4. **Installation Directory**
   - Default: `C:\Program Files\PromptMapGUI`
   - Click "Browse" to choose a different location
   - Ensure you have at least 500 MB free space
   - Click "Next"

5. **Select Additional Tasks**
   - ☐ Create a desktop shortcut (optional)
   - ☐ Create a Start Menu shortcut (recommended)
   - Click "Next"

6. **Ready to Install**
   - Review your selections
   - Click "Back" if you need to change anything
   - Click "Install" to begin installation

7. **Installation Progress**
   - Wait while files are extracted and installed
   - This typically takes 30-60 seconds

8. **Completing Setup**
   - ☑ Launch PromptMapGUI (checked by default)
   - Click "Finish"

### Silent Installation (Advanced)

For automated deployment:

```batch
PromptMapGUI-Setup-v2.0.exe /VERYSILENT /NORESTART /TASKS="desktopicon,startmenuicon"
```

## First Launch

### What Happens on First Launch

1. **Dependency Check**
   - PromptMapGUI checks if required Python packages are installed
   - If not, you'll see a prompt to install them

2. **Install Dependencies**
   - Click "Yes" to install required packages
   - This requires an internet connection
   - Installation takes 1-2 minutes

3. **API Key Warning (Optional)**
   - You may see a warning about missing API keys
   - This is normal if you haven't configured them yet
   - Click "OK" to continue

4. **Server Starts**
   - Flask web server starts in the background
   - Your default web browser opens to http://localhost:5000
   - The application is now ready to use!

### System Tray Icon

After launching, you'll see a PromptMapGUI icon in your system tray:

- **Left-click**: Opens the application in your browser
- **Right-click**: Shows menu
  - "Open PromptMapGUI" - Opens in browser
  - "Stop Server" - Closes the application

## Configuration

### Setting Up API Keys

To use cloud LLM providers, you need to configure API keys as environment variables.

#### Method 1: System Environment Variables (Recommended)

1. **Open System Properties**
   - Press `Win + X`
   - Select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"

2. **Add API Keys**
   - Under "User variables", click "New"
   - Variable name: `OPENAI_API_KEY`
   - Variable value: Your API key
   - Click "OK"

   Repeat for other providers:
   - `ANTHROPIC_API_KEY` - For Claude models
   - `GOOGLE_API_KEY` - For Gemini models
   - `XAI_API_KEY` - For Grok models

3. **Restart PromptMapGUI**
   - Right-click system tray icon → "Stop Server"
   - Launch PromptMapGUI again

#### Method 2: PowerShell Session (Temporary)

For testing or temporary use:

```powershell
$env:OPENAI_API_KEY = "your-api-key-here"
& "C:\Program Files\PromptMapGUI\PromptMapGUI.exe"
```

### Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google**: https://makersuite.google.com/app/apikey
- **XAI**: https://console.x.ai/

### Using Ollama (Local Models)

For local model testing without API keys:

1. **Install Ollama**
   - Download from: https://ollama.ai/download
   - Install and start Ollama

2. **Download Models**
   ```bash
   ollama pull llama2:7b
   ollama pull mistral
   ```

3. **Use in PromptMapGUI**
   - Select "Ollama" as model type
   - Enter model name (e.g., "llama2:7b")

## Using PromptMapGUI

### Basic Workflow

1. **Configure Target Model**
   - Enter model name (e.g., `gpt-4`, `claude-3-opus`)
   - Select model type

2. **Configure Controller Model (Optional)**
   - Use a different model for evaluation
   - Recommended: Use a powerful model like GPT-4 or Claude Sonnet

3. **Select Test Configuration**
   - Choose number of iterations (default: 3)
   - Select rule categories to test
   - Enable firewall mode if needed

4. **Start Scan**
   - Click "Start Scan"
   - Monitor progress in real-time
   - View results when complete

### Understanding Results

- **Passed Tests**: Your LLM successfully defended against the attack
- **Failed Tests**: The attack was successful (vulnerability found)
- **Severity Levels**:
  - 🔴 High - Critical vulnerabilities
  - 🟡 Medium - Important but not critical
  - 🟢 Low - Minor issues

### Exporting Results

Results are displayed in the web interface. To save:
- Use browser's "Save Page As" feature
- Take screenshots of results tables
- Copy results from the output log

## Uninstallation

### Method 1: Windows Settings (Recommended)

1. Open Windows Settings (`Win + I`)
2. Go to "Apps" → "Apps & features"
3. Search for "PromptMapGUI"
4. Click "Uninstall"
5. Follow the prompts

### Method 2: Start Menu

1. Open Start Menu
2. Find "PromptMapGUI" folder
3. Click "Uninstall PromptMapGUI"
4. Follow the prompts

### Method 3: Control Panel

1. Open Control Panel
2. Go to "Programs and Features"
3. Find "PromptMapGUI"
4. Right-click → "Uninstall"
5. Follow the prompts

### What Gets Removed

- All installed files in `C:\Program Files\PromptMapGUI`
- Desktop shortcut (if created)
- Start Menu shortcuts
- Uninstaller registry entries

### What Stays

- User configuration (environment variables)
- Browser history/cache
- Any exported results you saved

## FAQ

### General Questions

**Q: Do I need Python installed?**  
A: Yes, Python 3.8+ is required. The launcher will check and guide you if it's missing.

**Q: Is internet connection required?**  
A: Yes, for cloud LLM providers and initial setup. Ollama can work offline after models are downloaded.

**Q: Can I use this offline?**  
A: Partially. You can use Ollama models offline, but cloud providers require internet.

**Q: Is my data sent to third parties?**  
A: Only to the LLM providers you configure (OpenAI, Anthropic, etc.). No data is sent to PromptMapGUI developers.

### Technical Questions

**Q: Which port does the server use?**  
A: Default is port 5000. You can change this by editing the launcher configuration.

**Q: Can I run multiple instances?**  
A: No, only one instance can run at a time due to port conflicts.

**Q: Where are logs stored?**  
A: Logs are displayed in the web interface. Check `C:\Program Files\PromptMapGUI\` for error logs.

**Q: Can I customize test rules?**  
A: Yes! Edit YAML files in `C:\Program Files\PromptMapGUI\rules\` or add your own.

### Troubleshooting Questions

See [Troubleshooting](#troubleshooting) section below.

## Troubleshooting

### Application Won't Start

**Problem**: Double-clicking the icon does nothing

**Solutions**:
1. Check if Python is installed: `python --version` in Command Prompt
2. Right-click the icon → "Run as administrator"
3. Check Windows Event Viewer for errors

**Problem**: "Python not found" error

**Solutions**:
1. Install Python from https://www.python.org/
2. Ensure "Add Python to PATH" was checked during installation
3. Reinstall PromptMapGUI

### Browser Doesn't Open

**Problem**: Server starts but browser doesn't open

**Solutions**:
1. Manually open browser to http://localhost:5000
2. Check if another application is using port 5000
3. Check firewall settings

**Problem**: "This site can't be reached" error

**Solutions**:
1. Wait 5-10 seconds after launch for server to start
2. Check system tray icon - is the server running?
3. Try http://127.0.0.1:5000 instead

### API Key Issues

**Problem**: "No API keys configured" warning

**Solutions**:
1. This is just a warning - you can still use Ollama
2. Set environment variables as described in [Configuration](#configuration)
3. Restart the application after setting keys

**Problem**: "Invalid API key" error during scan

**Solutions**:
1. Verify your API key is correct
2. Check if the key has been revoked
3. Ensure the environment variable name is correct

### Scan Issues

**Problem**: Scan fails immediately

**Solutions**:
1. Check API key is valid
2. Verify model name is correct (e.g., `gpt-4`, not `gpt4`)
3. Check internet connection
4. Review error message in output log

**Problem**: Scan is very slow

**Solutions**:
1. This is normal for thorough testing (3 iterations × 50+ rules)
2. Reduce iteration count
3. Select specific rule categories instead of all
4. Use faster models for controller

### Installation Issues

**Problem**: "This app can't run on your PC"

**Solutions**:
1. Ensure you have 64-bit Windows 10 or 11
2. Download the correct version for your system

**Problem**: Windows Defender blocks installation

**Solutions**:
1. This is a false positive (application is not signed yet)
2. Click "More info" → "Run anyway"
3. Or add exception in Windows Defender

## Getting Help

If you're still having issues:

1. **Check the Documentation**
   - See README.md in installation folder
   - See README-WEB.md for web interface details

2. **GitHub Issues**
   - Search existing issues: https://github.com/crazyrob425/promptmapgui/issues
   - Create new issue with:
     - Windows version
     - Python version
     - Error messages
     - Steps to reproduce

3. **Community Support**
   - GitHub Discussions
   - Project README

## Updates

### Checking for Updates

Currently, check manually:
1. Visit https://github.com/crazyrob425/promptmapgui/releases
2. Compare your version (shown in installer) with latest release
3. Download and install new version if available

### Installing Updates

1. Download new installer
2. Run installer - it will detect and remove old version
3. Your settings and API keys are preserved

## Security & Privacy

### Data Privacy

- **Test data**: Only sent to LLM providers you configure
- **No telemetry**: PromptMapGUI doesn't collect usage data
- **API keys**: Stored in your environment variables (not in the app)

### Best Practices

1. **Protect API keys**: Never share or commit them to code
2. **Use least privilege**: Only grant necessary API permissions
3. **Monitor usage**: Check your LLM provider dashboards for unexpected usage
4. **Keep updated**: Install updates when available

## License

PromptMapGUI is licensed under GPL-3.0. See LICENSE file for details.

## Credits

- Original PromptMap by Utku Sen
- Web interface and installer by PromptMap Project contributors
- Icon design by PromptMap Project

---

**Need more help?** Visit: https://github.com/crazyrob425/promptmapgui
