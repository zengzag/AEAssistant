@echo off
setlocal enabledelayedexpansion

echo Starting the packaging process...
set EXTENSION_DIR="%APPDATA%\Adobe\CEP\extensions\com.zag.AEAssistantExtension"

rmdir /s /q %EXTENSION_DIR% 2>nul

echo "%EXTENSION_DIR%"
mkdir %EXTENSION_DIR%

npm run build && (
echo Copying build files to the extension directory...
xcopy /E /Y /I "D:\Projects\AEAssistant\build" %EXTENSION_DIR%

echo Setting up debugging registry keys...
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v LogLevel /t REG_SZ /d 5 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v ExtensionDebugLevel /t REG_SZ /d 5 /f

) || (
    echo "npm run build failed"
)
@REM pause