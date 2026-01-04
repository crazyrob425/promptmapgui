; PromptMapGUI Installer Script
; Inno Setup Script for creating Windows installer

[Setup]
; Basic Information
AppName=PromptMapGUI
AppVersion=2.0
AppPublisher=PromptMap Project
AppPublisherURL=https://github.com/crazyrob425/promptmapgui
AppSupportURL=https://github.com/crazyrob425/promptmapgui/issues
AppUpdatesURL=https://github.com/crazyrob425/promptmapgui/releases
DefaultDirName={autopf}\PromptMapGUI
DefaultGroupName=PromptMapGUI
AllowNoIcons=yes
LicenseFile=..\LICENSE
InfoBeforeFile=installer-info.txt
OutputDir=output
OutputBaseFilename=PromptMapGUI-Setup-v2.0
SetupIconFile=icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\PromptMapGUI.exe
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

; Version Information
VersionInfoVersion=2.0.0.0
VersionInfoCompany=PromptMap Project
VersionInfoDescription=PromptMapGUI Windows Installer
VersionInfoCopyright=Copyright (C) 2025 PromptMap Project
VersionInfoProductName=PromptMapGUI
VersionInfoProductVersion=2.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startmenuicon"; Description: "Create a Start Menu shortcut"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Main executable
Source: "..\dist\PromptMapGUI.exe"; DestDir: "{app}"; Flags: ignoreversion

; Web application files
Source: "..\web\*"; DestDir: "{app}\web"; Flags: ignoreversion recursesubdirs createallsubdirs

; Test rules
Source: "..\rules\*"; DestDir: "{app}\rules"; Flags: ignoreversion recursesubdirs createallsubdirs

; Core Python files
Source: "..\promptmap2.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\requirements.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\requirements-web.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\system-prompts.txt"; DestDir: "{app}"; Flags: ignoreversion

; HTTP examples
Source: "..\http-examples\*"; DestDir: "{app}\http-examples"; Flags: ignoreversion recursesubdirs createallsubdirs

; Documentation
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme
Source: "..\README-WEB.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\USER-INSTALL-GUIDE.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Start Menu shortcuts
Name: "{group}\PromptMapGUI"; Filename: "{app}\PromptMapGUI.exe"; WorkingDir: "{app}"; Tasks: startmenuicon
Name: "{group}\User Guide"; Filename: "{app}\USER-INSTALL-GUIDE.md"; Tasks: startmenuicon
Name: "{group}\Uninstall PromptMapGUI"; Filename: "{uninstallexe}"; Tasks: startmenuicon

; Desktop shortcut
Name: "{autodesktop}\PromptMapGUI"; Filename: "{app}\PromptMapGUI.exe"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\PromptMapGUI.exe"; Description: "{cm:LaunchProgram,PromptMapGUI}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\web\__pycache__"
Type: files; Name: "{app}\*.pyc"
Type: files; Name: "{app}\*.log"

[Code]
function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;

function IsUpgrade(): Boolean;
begin
  Result := (GetUninstallString() <> '');
end;

function UnInstallOldVersion(): Integer;
var
  sUnInstallString: String;
  iResultCode: Integer;
begin
  Result := 0;
  sUnInstallString := GetUninstallString();
  if sUnInstallString <> '' then begin
    sUnInstallString := RemoveQuotes(sUnInstallString);
    if Exec(sUnInstallString, '/SILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
      Result := 3
    else
      Result := 2;
  end else
    Result := 1;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep=ssInstall) then
  begin
    if (IsUpgrade()) then
    begin
      UnInstallOldVersion();
    end;
  end;
end;
