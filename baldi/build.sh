#!/bin/bash
# Monta o APK sem Gradle: ./build.sh   (senha da chave em BALDI_PASS)
# APK de tester do Null (outro app, instala junto): TESTER=1 ./build.sh
set -e
cd "$(dirname "$0")/android"
SDK=/opt/android/sdk; BT=$SDK/build-tools/34.0.0; JAR=$SDK/platforms/android-34/android.jar
rm -rf build assets && mkdir -p build/classes build/dex assets
cp -r ../app assets/jogo
MAN=AndroidManifest.xml; PKG=(); SAIDA=../BaldiModded.apk
if [ -n "$TESTER" ]; then
  sed -i 's#<script src="porao.js"></script>#&<script src="tester.js"></script>#' assets/jogo/index.html
  grep -q tester.js assets/jogo/index.html
  sed "s#android:label=\"[^\"]*\"#android:label=\"Baldi Null Tester\"#" AndroidManifest.xml > build/Manifest.xml; MAN=build/Manifest.xml
  PKG=(--rename-manifest-package com.heitor.baldibeta.tester); SAIDA=../BaldiNullTester.apk
else
  rm -f assets/jogo/tester.js
fi
[ -f baldi.keystore ] || keytool -genkeypair -keystore baldi.keystore -alias baldi -keyalg RSA -keysize 2048 -validity 10000 -storepass ${BALDI_PASS:-baldibeta} -keypass ${BALDI_PASS:-baldibeta} -dname "CN=Baldi Beta Tester" 2>/dev/null
$BT/aapt2 compile --dir res -o build/res.zip
$BT/aapt2 link -o build/base.apk -I $JAR --manifest $MAN "${PKG[@]}" -A assets build/res.zip --java build/gen -0 mp3 -0 png -0 woff2
javac -source 8 -target 8 -bootclasspath $JAR -classpath $JAR -d build/classes $(find src build/gen -name '*.java') 2>&1 | grep -v "warning\|^Note\|JAVA_TOOL" || true
$BT/d8 --lib $JAR --output build/dex $(find build/classes -name '*.class')
cp build/base.apk build/semdex.apk && (cd build/dex && zip -q ../semdex.apk classes.dex)
$BT/zipalign -f 4 build/semdex.apk build/aligned.apk
$BT/apksigner sign --ks baldi.keystore --ks-pass pass:${BALDI_PASS:-baldibeta} --ks-key-alias baldi --out $SAIDA build/aligned.apk
$BT/apksigner verify $SAIDA && ls -la $SAIDA
