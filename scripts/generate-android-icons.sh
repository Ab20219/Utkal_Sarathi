#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RES_DIR="$ROOT_DIR/android/app/src/main/res"
SRC_ICON="$ROOT_DIR/public/pwa-512x512.png"
SRC_MASKABLE="$ROOT_DIR/public/pwa-maskable-512x512.png"

if [ ! -f "$SRC_ICON" ]; then
  echo "Error: Source icon $SRC_ICON not found."
  exit 1
fi

echo "Generating UtkalSarathi Android launcher mipmaps & splash screens..."

generate_mipmap() {
  local folder="$1"
  local legacy_px="$2"
  local fg_canvas_px="$3"
  local fg_inner_px="$4"
  local target_dir="$RES_DIR/$folder"
  mkdir -p "$target_dir"

  # Square / rounded legacy launcher icon
  convert "$SRC_ICON" -resize "${legacy_px}x${legacy_px}" "PNG32:$target_dir/ic_launcher.png"

  # Circular launcher icon with clean alpha mask
  local radius=$((legacy_px / 2))
  convert -size "${legacy_px}x${legacy_px}" xc:none \
    -fill white -draw "circle $radius,$radius $radius,0" \
    "$target_dir/mask_tmp.png"
  convert "$SRC_MASKABLE" -resize "${legacy_px}x${legacy_px}" \
    "$target_dir/mask_tmp.png" -alpha off -compose CopyOpacity -composite \
    "PNG32:$target_dir/ic_launcher_round.png"
  rm -f "$target_dir/mask_tmp.png"

  # Adaptive icon foreground (centered within Android 66dp safe zone on 108dp transparent canvas)
  convert -size "${fg_canvas_px}x${fg_canvas_px}" xc:none \
    \( "$SRC_ICON" -resize "${fg_inner_px}x${fg_inner_px}" \) \
    -gravity center -composite \
    "PNG32:$target_dir/ic_launcher_foreground.png"
}

generate_mipmap "mipmap-mdpi"    48  108  68
generate_mipmap "mipmap-hdpi"    72  162 102
generate_mipmap "mipmap-xhdpi"   96  216 136
generate_mipmap "mipmap-xxhdpi"  144 324 204
generate_mipmap "mipmap-xxxhdpi" 192 432 272

generate_splash() {
  local rel_path="$1"
  local w="$2"
  local h="$3"
  local emblem_px="$4"
  local out_file="$RES_DIR/$rel_path"
  mkdir -p "$(dirname "$out_file")"

  convert -size "${w}x${h}" "xc:#0c0a09" \
    \( "$SRC_ICON" -resize "${emblem_px}x${emblem_px}" \) \
    -gravity center -composite \
    "PNG32:$out_file"
}

generate_splash "drawable/splash.png"              480  800  180
generate_splash "drawable-port-mdpi/splash.png"    320  480  128
generate_splash "drawable-port-hdpi/splash.png"    480  800  180
generate_splash "drawable-port-xhdpi/splash.png"   720  1280 240
generate_splash "drawable-port-xxhdpi/splash.png"  1080 1920 320
generate_splash "drawable-port-xxxhdpi/splash.png" 1080 2408 340
generate_splash "drawable-land-mdpi/splash.png"    480  320  120
generate_splash "drawable-land-hdpi/splash.png"    800  480  160
generate_splash "drawable-land-xhdpi/splash.png"   1280 720  220
generate_splash "drawable-land-xxhdpi/splash.png"  1600 960  260
generate_splash "drawable-land-xxxhdpi/splash.png" 1920 1080 300

echo "All UtkalSarathi Android icons & splash screens generated."
