; =======================================================
; The Hangar - NSIS Setup Script
; =======================================================
Unicode True
Name "الهنجر — The Hangar"
OutFile "The_Hangar_NSIS_Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\The Hangar"
InstallDirRegKey HKCU "Software\TheHangar" "Install_Dir"
RequestExecutionLevel user

!include "MUI2.nsh"
!include "FileFunc.nsh"

!define MUI_ICON "TheHangar.ico"
!define MUI_UNICON "TheHangar.ico"
!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\The Hangar.exe"
!define MUI_FINISHPAGE_RUN_TEXT "تشغيل برنامج الهنجر الآن"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Arabic"

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    File "The Hangar.exe"
    File "The Hangar.exe.config"
    File "TheHangar.ico"
    File "Microsoft.Web.WebView2.Core.dll"
    File "Microsoft.Web.WebView2.WinForms.dll"
    File "WebView2Loader.dll"
    
    SetOutPath "$INSTDIR\ui"
    File /r "ui\*.*"

    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; Shortcuts
    CreateShortCut "$DESKTOP\الهنجر.lnk" "$INSTDIR\The Hangar.exe" "" "$INSTDIR\TheHangar.ico" 0
    CreateDirectory "$SMPROGRAMS\الهنجر"
    CreateShortCut "$SMPROGRAMS\الهنجر\الهنجر.lnk" "$INSTDIR\The Hangar.exe" "" "$INSTDIR\TheHangar.ico" 0
    CreateShortCut "$SMPROGRAMS\الهنجر\إلغاء التثبيت.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\TheHangar.ico" 0

    ; Registry for Add/Remove Programs
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\TheHangar" "DisplayName" "الهنجر — The Hangar"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\TheHangar" "UninstallString" '"$INSTDIR\Uninstall.exe"'
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\TheHangar" "DisplayIcon" '"$INSTDIR\TheHangar.ico"'
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\TheHangar" "DisplayVersion" "1.0.0"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\TheHangar" "Publisher" "Morad (AMOX)"
SectionEnd

Section "Uninstall"
    Delete "$DESKTOP\الهنجر.lnk"
    RMDir /r "$SMPROGRAMS\الهنجر"
    RMDir /r "$INSTDIR"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\TheHangar"
SectionEnd
