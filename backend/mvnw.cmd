@echo off
setlocal
set "MAVEN_VERSION=3.9.9"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Downloading Apache Maven %MAVEN_VERSION% for this user...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $version = '%MAVEN_VERSION%'; $root = Join-Path $env:USERPROFILE '.m2\wrapper\dists'; New-Item -ItemType Directory -Force -Path $root | Out-Null; $zip = Join-Path $env:TEMP ('apache-maven-' + $version + '-bin.zip'); $url = 'https://archive.apache.org/dist/maven/maven-3/' + $version + '/binaries/apache-maven-' + $version + '-bin.zip'; Invoke-WebRequest -Uri $url -OutFile $zip; Expand-Archive -LiteralPath $zip -DestinationPath $root -Force; Remove-Item -LiteralPath $zip -Force"
  if errorlevel 1 exit /b 1
)
call "%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
