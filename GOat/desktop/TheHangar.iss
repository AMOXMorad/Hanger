; =======================================================
; The Hangar - Inno Setup Script
; =======================================================
[Setup]
AppId={{C6415B17-4B38-4C2E-8E3D-9457DEAF2132}
AppName=الهنجر — The Hangar
AppVersion=1.1.1
AppPublisher=Morad (AMOX)
AppPublisherURL=https://github.com/AMOXMorad
DefaultDirName={localappdata}\Programs\The Hangar
DefaultGroupName=الهنجر
OutputDir=.
OutputBaseFilename=The_Hangar_Inno_Setup
SetupIconFile=TheHangar.ico
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=lowest
DisableProgramGroupPage=yes

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "The Hangar.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "The Hangar.exe.config"; DestDir: "{app}"; Flags: ignoreversion
Source: "TheHangar.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "Microsoft.Web.WebView2.Core.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "Microsoft.Web.WebView2.WinForms.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "WebView2Loader.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "ui\*"; DestDir: "{app}\ui"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\الهنجر"; Filename: "{app}\The Hangar.exe"; IconFilename: "{app}\TheHangar.ico"
Name: "{group}\{cm:UninstallProgram,الهنجر}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\الهنجر"; Filename: "{app}\The Hangar.exe"; IconFilename: "{app}\TheHangar.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\The Hangar.exe"; Description: "{cm:LaunchProgram,الهنجر}"; Flags: nowait postinstall skipifsilent
