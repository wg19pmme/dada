# =============================================================================
#  GPT Image 便携版 —— Windows 桌面版 CI 打包脚本
#
#  作用：在 CNB Windows 自托管构建机上执行：
#    1. 安装前端依赖
#    2. 用 Tauri 编译并打包 Windows 桌面应用（.exe / .msi）
#    3. 把产物上传为仓库 Release 的附件，方便在网页直接下载
#
#  该脚本由 .cnb.yml 中的「打包 Windows 桌面版」流水线调用，
#  默认 shell 为 PowerShell（Windows 自托管构建机）。
# =============================================================================

$ErrorActionPreference = 'Stop'

# ---------- 0. 路径与版本 ----------
$RepoSlug   = $env:CNB_REPO_SLUG          # 形如 wg1929/dada
$ReleaseTag = $env:RELEASE_TAG            # 由 web_trigger 传入，如 v1.0.1
if ([string]::IsNullOrWhiteSpace($ReleaseTag)) { $ReleaseTag = 'v1.0.1' }

Write-Host ""
Write-Host "============================================"
Write-Host "  GPT Image 便携版 Windows 桌面打包"
Write-Host "  仓库: $RepoSlug  版本: $ReleaseTag"
Write-Host "============================================"

# ---------- 1. 环境检查 ----------
Write-Host "[1/5] 检查构建环境..."
foreach ($cmd in 'node', 'npm', 'cargo') {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "缺少依赖: $cmd 。请先在构建机上安装 Node.js 与 Rust，再接入本机作为 Windows 构建节点。"
    }
}
Write-Host "  Node: $(node --version)"
Write-Host "  Rust: $(cargo --version)"

# ---------- 2. 安装前端依赖 ----------
Write-Host "[2/5] 安装前端依赖 (npm ci)..."
if (-not (Test-Path 'package-lock.json')) {
    Write-Host "  未发现 package-lock.json，改用 npm install"
    npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install 失败' }
} else {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci 失败' }
}

# ---------- 3. 用 Tauri 打包 ----------
Write-Host "[3/5] 执行 tauri build（首次会下载 Rust 依赖，较慢）..."
npm run tauri:build
if ($LASTEXITCODE -ne 0) { throw 'tauri build 失败' }

# ---------- 4. 收集产物 ----------
Write-Host "[4/5] 收集构建产物..."
$BundleDir = Join-Path $PWD 'src-tauri\target\release\bundle'
$Artifacts = @()
foreach ($rel in @('exe\*.exe', 'nsis\*.exe', 'msi\*.msi')) {
    $found = Get-ChildItem (Join-Path $BundleDir $rel) -ErrorAction SilentlyContinue
    if ($found) { $Artifacts += $found }
}
if ($Artifacts.Count -eq 0) {
    Write-Warning "未在 $BundleDir 下找到 .exe/.msi 产物，请检查 tauri.conf.json 的 bundle 配置。"
} else {
    foreach ($a in $Artifacts) {
        Write-Host "  产物: $($a.FullName) ($([math]::Round($a.Length/1MB,1)) MB)"
    }
}

# ---------- 5. 上传为 Release 附件 ----------
Write-Host "[5/5] 上传产物到 Release 附件..."
# 保证 cnb CLI 可用（需 Node 环境）
if (-not (Get-Command cnb -ErrorAction SilentlyContinue)) {
    Write-Host "  未检测到 cnb CLI，正在安装 @cnbcool/cnb-cli ..."
    npm install -g @cnbcool/cnb-cli
    if ($LASTEXITCODE -ne 0) { throw '安装 cnb CLI 失败' }
}

# 5.1 确保 Release 存在（overlying 更新模式，避免重复删除重建）
Write-Host "  确保 Release $ReleaseTag 存在..."
cnb releases post-release --repo $RepoSlug --tag-name $ReleaseTag --name "GPT Image 便携版 $ReleaseTag" --body "Windows 桌面版自动打包产物" --make-latest true 2>$null
if ($LASTEXITCODE -ne 0) {
    # 已存在则尝试更新
    cnb releases post-release --repo $RepoSlug --tag-name $ReleaseTag --name "GPT Image 便携版 $ReleaseTag" --make-latest true 2>$null
}

# 5.2 通过 OpenAPI 上传附件（三步：拿上传地址 -> 上传 -> 确认）
foreach ($a in $Artifacts) {
    $size = (Get-Item $a.FullName).Length
    $assetName = $a.Name
    Write-Host "  上传 $assetName ..."

    # 第一步：获取上传 URL
    $upUrl = cnb releases post-release-asset-upload-url --repo $RepoSlug --release-id $ReleaseTag --asset-name $assetName --size $size --overwrite --data "{}"
    if ($LASTEXITCODE -ne 0) { Write-Warning "  获取上传地址失败（$assetName），跳过。"; continue }
    $upJson = $upUrl | ConvertFrom-Json
    $verifyUrl = $upJson.data.verify_url
    $uploadToken = $upJson.data.upload_token
    $assetPath = $upJson.data.asset_path
    if (-not $verifyUrl) { Write-Warning "  未从响应中解析到 verify_url，跳过 $assetName"; continue }

    # 第二步：上传文件到 verify_url
    curl.exe -sS -X PUT -H "Authorization: Bearer $env:CNB_TOKEN" -H "x-asset-path: $assetPath" --data-binary "@$($a.FullName)" $verifyUrl
    if ($LASTEXITCODE -ne 0) { Write-Warning "  上传文件失败（$assetName），跳过。"; continue }

    # 第三步：确认上传
    cnb releases post-release-asset-upload-confirmation --repo $RepoSlug --release-id $ReleaseTag --upload-token $uploadToken --asset-path $assetPath --ttl 0 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ 已上传: $assetName"
    } else {
        Write-Warning "  确认上传未返回成功，请到 Release 附件页核对 $assetName"
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host " 打包完成！可在仓库 Release 页面下载 .exe 安装包发给用户。"
Write-Host "  Release 链接: https://cnb.cool/$RepoSlug/-/releases"
Write-Host "============================================"
