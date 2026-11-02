#!/usr/bin/env bash
set -euo pipefail

# Run on a Mac with Xcode, including a GitHub-hosted macOS runner.
# No Apple account, certificate, device registration or password is used here.
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Este script precisa de macOS com Xcode. No Windows, use o workflow do GitHub Actions." >&2
  exit 1
fi

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
task_tmp="$(mktemp -d "${TMPDIR:-/tmp}/pausa-build.XXXXXX")"
trap 'rm -rf "$task_tmp"' EXIT

cd "$project_root"
xcodebuild -version
xcodebuild \
  -project Pausa.xcodeproj \
  -scheme Pausa \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$task_tmp/DerivedData" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  build

app_path="$task_tmp/DerivedData/Build/Products/Release-iphoneos/Pausa.app"
extension_path="$app_path/PlugIns/PausaExtension.appex"
test -f "$app_path/Pausa"
test -f "$extension_path/PausaExtension"
test -f "$extension_path/manifest.json"
# iOS extensions use a flat bundle. A top-level Resources directory makes
# macOS bundle validation look for Info.plist in the legacy bundle location.
test ! -d "$extension_path/Resources"
/usr/bin/plutil -lint "$app_path/Info.plist" "$extension_path/Info.plist"
extension_manifest="$extension_path/manifest.json"
/usr/bin/python3 - "$extension_manifest" <<'PY'
import json, sys
from pathlib import Path
manifest_path = Path(sys.argv[1])
manifest = json.loads(manifest_path.read_text())
resources = {
    manifest['action']['default_popup'],
    *manifest['icons'].values(),
    *manifest['action']['default_icon'].values(),
}
for script in manifest['content_scripts']:
    resources.update(script.get('js', []))
    resources.update(script.get('css', []))
for resource in resources:
    if not (manifest_path.parent / resource).is_file():
        raise SystemExit(f'Recurso ausente na extensão compilada: {resource}')
print('Info.plist e recursos da extensão compilada: OK')
PY

mkdir -p "$task_tmp/package/Payload" "$project_root/dist"
/usr/bin/ditto "$app_path" "$task_tmp/package/Payload/Pausa.app"
cd "$task_tmp/package"
/usr/bin/ditto -c -k --keepParent Payload "$project_root/dist/Pausa-sem-assinatura.ipa"
/usr/bin/unzip -tq "$project_root/dist/Pausa-sem-assinatura.ipa"
echo "IPA criado com a extensão preservada. Assine e instale pelo Windows."
