@echo off
REM ImgHarvest — Build ZipCreator JAR
REM No external dependencies needed — only the JDK standard library.
REM Run this once from the image_service directory before `bal run`.

REM ── Locate JDK ───────────────────────────────────────────────────────────────
set JAVAC_EXE=
set JAR_EXE=

REM 1. Prefer JAVA_HOME if set and it actually has jar.exe
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\jar.exe" (
        set JAVAC_EXE=%JAVA_HOME%\bin\javac
        set JAR_EXE=%JAVA_HOME%\bin\jar
        echo [ImgHarvest] Using JAVA_HOME: %JAVA_HOME%
        goto :found_java
    )
)

REM 2. Try jar directly on PATH
where jar >nul 2>nul
if %errorlevel% equ 0 (
    for /f "delims=" %%i in ('where jar') do set JAR_EXE=%%i
    for /f "delims=" %%i in ('where javac 2^>nul') do set JAVAC_EXE=%%i
    goto :found_java
)

REM 3. Windows registry (most JDK installers register here)
for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\JavaSoft\JDK" /v CurrentVersion 2^>nul') do set _JDK_VER=%%b
if defined _JDK_VER (
    for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\JavaSoft\JDK\%_JDK_VER%" /v JavaHome 2^>nul') do set JAVA_HOME=%%b
    if defined JAVA_HOME (
        set JAVAC_EXE=%JAVA_HOME%\bin\javac
        set JAR_EXE=%JAVA_HOME%\bin\jar
        echo [ImgHarvest] Found JDK via registry: %JAVA_HOME%
        goto :found_java
    )
)

REM 4. Common install locations
for /d %%d in ("C:\Program Files\Java\jdk*" "C:\Program Files\Eclipse Adoptium\jdk*" "C:\Program Files\Microsoft\jdk*" "C:\Program Files\Zulu\zulu*") do (
    if exist "%%~d\bin\jar.exe" (
        set JAVAC_EXE=%%~d\bin\javac
        set JAR_EXE=%%~d\bin\jar
        echo [ImgHarvest] Found JDK at: %%~d
        goto :found_java
    )
)

echo [ERROR] JDK not found. Set JAVA_HOME to your JDK directory and retry.
exit /b 1

:found_java

REM ── Compile ──────────────────────────────────────────────────────────────────
echo [ImgHarvest] Compiling ZipCreator.java...
if not exist "out\classes" mkdir out\classes

"%JAVAC_EXE%" -d out\classes libs\ZipCreator.java

if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed!
    exit /b 1
)

REM ── Package ──────────────────────────────────────────────────────────────────
echo [ImgHarvest] Packaging JAR...
"%JAR_EXE%" cf libs\zip-creator.jar -C out\classes .

if %errorlevel% neq 0 (
    echo [ERROR] JAR packaging failed!
    exit /b 1
)

echo [ImgHarvest] Done! libs\zip-creator.jar created.
echo [ImgHarvest] Now run: bal run
