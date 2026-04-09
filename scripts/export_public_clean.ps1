param(
    [string]$OutputDir = "artifacts/releases/public-clean"
)

$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$destination = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $OutputDir))

if (-not $destination.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "OutputDir must stay inside the project root."
}

$publicFiles = @(
    ".nojekyll",
    "index.html",
    "main.js",
    "main.css",
    "site-text-config.js",
    "subscription-crypto.js",
    "build-info.js",
    "community.js",
    "docs-pages.css",
    "extension-info.html",
    "robots.txt",
    "sitemap.xml",
    "googleb305551590fcb6e6.html"
)

$publicGeneratedFiles = @(
    @{
        Source = Join-Path $projectRoot "scripts/public-clean-admin-stub.html"
        Destination = "admin.html"
    }
)

$publicDirectories = @(
    "images",
    "guide",
    "faq",
    "pricing",
    "privacy",
    "terms"
)

if (Test-Path -LiteralPath $destination) {
    Remove-Item -LiteralPath $destination -Recurse -Force
}

New-Item -ItemType Directory -Path $destination | Out-Null

foreach ($relativePath in $publicFiles) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        continue
    }
    $targetPath = Join-Path $destination $relativePath
    $targetDir = Split-Path -Parent $targetPath
    if ($targetDir -and -not (Test-Path -LiteralPath $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
}

foreach ($relativePath in $publicDirectories) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        continue
    }
    $targetPath = Join-Path $destination $relativePath
    Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Recurse -Force
}

foreach ($generatedFile in $publicGeneratedFiles) {
    if (-not (Test-Path -LiteralPath $generatedFile.Source)) {
        continue
    }
    $targetPath = Join-Path $destination $generatedFile.Destination
    $targetDir = Split-Path -Parent $targetPath
    if ($targetDir -and -not (Test-Path -LiteralPath $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $generatedFile.Source -Destination $targetPath -Force
}

Write-Host "public-clean export completed:"
Write-Host $destination
