#!/usr/bin/env bash
# ============================================================
#  GPT Image 本地便携版 —— 生成"解压即用"绿色安装包
#  用法：终端里执行  bash build-portable.sh
#
#  会在 dist-portable/ 目录生成一个 zip 包：
#     gpt-image-playground-<版本>-<平台>.zip
#  用户只需解压后双击 start.bat（Windows）或 start.sh（macOS/Linux），
#  用系统自带 Node 即可直接打开，无需 node_modules、无需联网安装依赖。
# ============================================================
set -e
cd "$(dirname "$0")"

VERSION=$(node -p "require('./package.json').version")
PLATFORM=$(uname -s | tr 'A-Z' 'a-z')
OUT="dist-portable"
PKG_DIR="$OUT/gpt-image-playground"
ZIP="$OUT/gpt-image-playground-$VERSION-$PLATFORM.zip"

echo
echo " ============================================"
echo "  正在生成便携版安装包..."
echo " ============================================"
echo

# ---------- 1. 确保构建产物存在 ----------
echo " [1/4] 检查/生成构建产物 dist/ ..."
if [ ! -f "dist/index.html" ]; then
    echo " 未检测到 dist/，先执行 npm run build ..."
    npm run build
fi

# ---------- 2. 组装便携包目录 ----------
echo " [2/4] 组装便携包目录 ..."
rm -rf "$PKG_DIR"
mkdir -p "$PKG_DIR"
cp -r dist "$PKG_DIR/dist"
cp server.js "$PKG_DIR/"
cp start.bat "$PKG_DIR/"
cp start.sh "$PKG_DIR/"
cp README.md "$PKG_DIR/"
cp LICENSE "$PKG_DIR/" 2>/dev/null || true

# ---------- 3. 压缩 ----------
echo " [3/4] 压缩为 zip ..."
rm -f "$ZIP"
if command -v zip >/dev/null 2>&1; then
    (cd "$OUT" && zip -rq "../$ZIP" "gpt-image-playground")
else
    echo " [提示] 未检测到 zip 命令，跳过压缩，已生成解压即用目录：$PKG_DIR"
fi

# ---------- 4. 完成 ----------
echo " [4/4] 完成！"
echo
if [ -f "$ZIP" ]; then
    SIZE=$(du -h "$ZIP" | cut -f1)
    echo "  便携包已生成：$ZIP  （约 $SIZE）"
    echo "  把 zip 发给用户，解压后双击 start.bat / start.sh 即可使用。"
else
    echo "  便携目录已生成：$PKG_DIR"
fi
echo
echo " 提示：用户机器需预装 Node.js 18+。"
echo "       若想真正做到连 Node 都不用装，可再把这套目录与便携版 Node 一起打包。"
echo
