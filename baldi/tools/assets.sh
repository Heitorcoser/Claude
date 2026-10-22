#!/bin/bash
# Copia texturas e converte os sons (.wav -> .mp3 mono) do projeto para app/assets
set -e
A=$1; D=$(dirname "$0")/../app/assets
mkdir -p "$D"
(cd "$A" && find Texture2D -name "*.png" -print0) | while IFS= read -r -d '' f; do mkdir -p "$D/$(dirname "$f")"; cp "$A/$f" "$D/$f"; done
(cd "$A" && find AudioClip -name "*.wav" -not -path "*Unused*" -not -path "*Removed*" -print0) | while IFS= read -r -d '' f; do
  o="$D/${f%.wav}.mp3"; mkdir -p "$(dirname "$o")"
  [ -f "$o" ] || ffmpeg -nostdin -v error -y -i "$A/$f" -ac 1 -ar 22050 -b:a 64k "$o"
done
du -sh "$D"
