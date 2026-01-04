# PromptMapGUI Installer - Build Documentation

This directory contains all the files needed to build the PromptMapGUI Windows installer.

## Prerequisites

To build the installer, you need the following software installed on a Windows machine:

### Required Software

1. **Python 3.8 or higher**
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. **PyInstaller**
   - Installed automatically by the build script
   - Or install manually: `pip install pyinstaller`

3. **Inno Setup 6**
   - Download from: https://jrsoftware.org/isdl.php
   - Install to default location: `C:\Program Files (x86)\Inno Setup 6\`

### Optional Software

4. **Pillow (Python Imaging Library)**
   - For regenerating the application icon
   - Install: `pip install Pillow`

## Build Instructions

### Automated Build (Recommended)

1. Open Command Prompt or PowerShell
2. Navigate to the `installer` directory:
   ```batch
   cd C:\path\to\promptmapgui\installer
   ```
3. Run the build script:
   ```batch
   build.bat
   ```
4. The script will:
   - Check for required dependencies
   - Build the standalone executable with PyInstaller
   - Compile the installer with Inno Setup
   - Create the final installer in `installer\output\`

### Manual Build

If you prefer to build manually or need to customize the process:

#### Step 1: Build the Executable

```batch
cd C:\path\to\promptmapgui
pyinstaller --onefile --windowed --name PromptMapGUI --icon=installer\icon.ico installer\launcher.py
```

This creates `dist\PromptMapGUI.exe`

#### Step 2: Compile the Installer

```batch
cd installer
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" setup.iss
```

This creates `installer\output\PromptMapGUI-Setup-v2.0.exe`

## File Structure

```
installer/
├── launcher.py              # Python launcher script
├── setup.iss                # Inno Setup script
├── build.bat                # Automated build script
├── icon.ico                 # Application icon
├── installer-info.txt       # Info shown before installation
├── INSTALLER-README.md      # This file
└── output/                  # Generated installer output (created during build)
    └── PromptMapGUI-Setup-v2.0.exe
```

## Customization Options

### Changing Version Number

Edit `setup.iss` and update these lines:

```iss
AppVersion=2.0
OutputBaseFilename=PromptMapGUI-Setup-v2.0
VersionInfoVersion=2.0.0.0
```

### Changing Application Icon

Replace `installer\icon.ico` with your custom icon, or regenerate it:

```python
python -c "from PIL import Image, ImageDraw; ..."
```

See the icon creation script in this README for details.

### Adding Custom Branding

Edit `setup.iss` to customize:

- **Company Name**: Change `AppPublisher`
- **URLs**: Update `AppPublisherURL`, `AppSupportURL`, `AppUpdatesURL`
- **Welcome Message**: Edit `installer-info.txt`
- **License**: The installer uses the main `LICENSE` file

### Adding/Removing Files

Edit the `[Files]` section in `setup.iss`:

```iss
[Files]
Source: "path\to\file"; DestDir: "{app}"; Flags: ignoreversion
```

### Customizing Shortcuts

Edit the `[Tasks]` and `[Icons]` sections in `setup.iss`:

```iss
[Tasks]
Name: "desktopicon"; Description: "Create desktop icon"; Flags: unchecked

[Icons]
Name: "{autodesktop}\PromptMapGUI"; Filename: "{app}\PromptMapGUI.exe"
```

## PyInstaller Options Explained

```batch
pyinstaller \
  --onefile          # Bundle everything into a single .exe
  --windowed         # Don't show console window (GUI app)
  --name PromptMapGUI # Name of the output executable
  --icon=icon.ico    # Application icon
  launcher.py        # Script to bundle
```

Additional useful options:

- `--add-data "src;dest"` - Include additional files
- `--hidden-import module` - Include modules not auto-detected
- `--exclude-module module` - Exclude unnecessary modules
- `--clean` - Clean PyInstaller cache before building

## Troubleshooting

### PyInstaller Fails to Build

**Issue**: ModuleNotFoundError during build

**Solution**: Add hidden imports:
```batch
pyinstaller --hidden-import flask --hidden-import flask_socketio ...
```

**Issue**: File too large

**Solution**: Exclude unnecessary modules:
```batch
pyinstaller --exclude-module matplotlib --exclude-module pandas ...
```

### Inno Setup Fails to Compile

**Issue**: "File not found" error

**Solution**: Check that all source files in `[Files]` section exist

**Issue**: "Cannot execute" error

**Solution**: Verify Inno Setup is installed at the correct path

### Installer Doesn't Run on Target Machine

**Issue**: "Missing DLL" error

**Solution**: 
- Ensure PyInstaller bundled all dependencies with `--onefile`
- Install Visual C++ Redistributable on target machine

**Issue**: "Python not found" error

**Solution**: The launcher is designed to work without Python on the target machine. If this error occurs, rebuild with PyInstaller using `--onefile` flag.

### Application Doesn't Start After Installation

**Issue**: Dependencies not installed

**Solution**: The launcher will prompt to install dependencies on first run. Ensure internet connection is available.

**Issue**: API keys not configured

**Solution**: This is expected. Users must configure API keys as environment variables. See USER-INSTALL-GUIDE.md.

## Advanced Configuration

### Code Signing

To digitally sign your installer (recommended for production):

1. Obtain a code signing certificate
2. Add to `setup.iss`:

```iss
[Setup]
SignTool=signtool
SignedUninstaller=yes
```

3. Configure SignTool in Inno Setup:
   - Tools → Configure Sign Tools
   - Add: `signtool="C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe" sign /f "cert.pfx" /p "password" /t http://timestamp.digicert.com $f`

### Creating Silent Install

Users can install silently using:

```batch
PromptMapGUI-Setup-v2.0.exe /VERYSILENT /NORESTART
```

Useful for automated deployments.

### Multi-Language Support

Add additional languages in `[Languages]` section:

```iss
[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
```

## Building on Different Platforms

### Note on Cross-Platform Building

- **PyInstaller**: Must run on the target platform (Windows for Windows .exe)
- **Inno Setup**: Windows-only

For building on macOS/Linux:
- Use a Windows VM or CI/CD service
- Alternatives: WiX Toolset (more complex) or NSIS (cross-platform)

### Using GitHub Actions

Create `.github/workflows/build-installer.yml` for automated builds:

```yaml
name: Build Windows Installer
on: [push, pull_request]
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install pyinstaller
      - name: Build executable
        run: pyinstaller --onefile --windowed --name PromptMapGUI --icon=installer\icon.ico installer\launcher.py
      - name: Install Inno Setup
        run: choco install innosetup
      - name: Build installer
        run: iscc installer\setup.iss
      - name: Upload artifact
        uses: actions/upload-artifact@v2
        with:
          name: installer
          path: installer\output\*.exe
```

## Version History

### Version 2.0 (Current)
- Initial Windows installer with GUI
- Web-based interface
- System tray integration
- Automated dependency installation

## Support

For build issues:
1. Check this README's Troubleshooting section
2. Check PyInstaller documentation: https://pyinstaller.org/
3. Check Inno Setup documentation: https://jrsoftware.org/ishelp/
4. Open an issue: https://github.com/crazyrob425/promptmapgui/issues

## License

This installer and build scripts are part of PromptMapGUI and are licensed under GPL-3.0.
