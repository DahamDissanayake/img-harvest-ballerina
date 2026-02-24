@echo off
REM ImgHarvest — Build Java ImageConverter JAR
REM Run this from the image_service directory before `bal run`
REM Requires JDK 11+ and TwelveMonkeys JARs in libs/

echo [ImgHarvest] Downloading TwelveMonkeys ImageIO JARs via Maven...

REM Check if mvn is available
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] Maven not found. Downloading JARs manually...
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/twelvemonkeys/imageio/imageio-core/3.10.1/imageio-core-3.10.1.jar' -OutFile 'libs\imageio-core-3.10.1.jar'"
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/twelvemonkeys/imageio/imageio-webp/3.10.1/imageio-webp-3.10.1.jar' -OutFile 'libs\imageio-webp-3.10.1.jar'"
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/twelvemonkeys/common/common-lang/3.10.1/common-lang-3.10.1.jar' -OutFile 'libs\common-lang-3.10.1.jar'"
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/twelvemonkeys/common/common-image/3.10.1/common-image-3.10.1.jar' -OutFile 'libs\common-image-3.10.1.jar'"
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/twelvemonkeys/common/common-io/3.10.1/common-io-3.10.1.jar' -OutFile 'libs\common-io-3.10.1.jar'"
) else (
    mvn dependency:get -Dartifact=com.twelvemonkeys.imageio:imageio-core:3.10.1 -Ddest=libs
    mvn dependency:get -Dartifact=com.twelvemonkeys.imageio:imageio-webp:3.10.1 -Ddest=libs
)

echo [ImgHarvest] Compiling ImageConverter.java...
if not exist "out\classes" mkdir out\classes

javac -cp "libs\imageio-core-3.10.1.jar;libs\imageio-webp-3.10.1.jar" ^
      -d out\classes ^
      libs\ImageConverter.java

if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed!
    exit /b 1
)

echo [ImgHarvest] Packaging JAR...
jar cf libs\image-converter.jar -C out\classes .

echo [ImgHarvest] Done! libs\image-converter.jar created.
echo [ImgHarvest] Now run: bal run
