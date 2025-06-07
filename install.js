#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

// Determine platform and architecture
const platform = process.platform;
const arch = process.arch;

// Map Node.js platform/arch to your release file naming
const platformArchMap = {
  'linux-x64': 'linux-x86_64',
  'linux-arm64': 'linux-aarch64',
  'darwin-x64': 'macos-x86_64',
  'darwin-arm64': 'macos-aarch64',
  'win32-x64': 'windows-x86_64',
  'win32-arm64': 'windows-aarch64'
};

const platformKey = `${platform}-${arch}`;
const targetPlatform = platformArchMap[platformKey];

if (!targetPlatform) {
  console.error(`Unsupported platform/architecture combination: ${platform}-${arch}`);
  console.error('Supported combinations:', Object.keys(platformArchMap).join(', '));
  process.exit(1);
}

// GitHub release info
const REPO = "Levi477/clog-tui";
const VERSION = "latest"; // or specific version like "v1.3.0"

// Determine file extension based on platform
const isWindows = platform === "win32";
const archiveExt = isWindows ? "zip" : "tar.gz";
const binaryName = isWindows ? "clog.exe" : "clog";

// Construct filename based on your naming convention
const filename = `clog_tui-${targetPlatform}.${archiveExt}`;

// GitHub releases API URL for latest release
let downloadUrl;
if (VERSION === "latest") {
  downloadUrl = `https://github.com/${REPO}/releases/latest/download/${filename}`;
} else {
  downloadUrl = `https://github.com/${REPO}/releases/download/${VERSION}/${filename}`;
}

// Paths
const BIN_DIR = path.join(__dirname, "bin");
const BINARY_PATH = path.join(BIN_DIR, binaryName);

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to download: ${url}`);
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      console.log(`Response status: ${response.statusCode}`);

      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        console.log(`Redirecting to: ${response.headers.location}`);
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}. URL: ${url}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
    }).on('error', reject);
  });
}

async function extractArchive(archivePath, targetDir) {
  if (archivePath.endsWith('.tar.gz')) {
    // Use tar command (available on macOS/Linux)
    execSync(`tar -xzf "${archivePath}" -C "${targetDir}"`, { stdio: 'inherit' });
  } else if (archivePath.endsWith('.zip')) {
    // For Windows, use PowerShell or fallback to a zip library
    if (platform === 'win32') {
      execSync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${targetDir}' -Force"`, { stdio: 'inherit' });
    } else {
      // Fallback: install and use a zip library
      try {
        const AdmZip = require('adm-zip');
        const zip = new AdmZip(archivePath);
        zip.extractAllTo(targetDir, true);
      } catch (e) {
        // If adm-zip is not available, try unzip command
        execSync(`unzip -o "${archivePath}" -d "${targetDir}"`, { stdio: 'inherit' });
      }
    }
  }
}

async function install() {
  try {
    console.log(`Installing clog-tui for ${platform}-${arch} (${targetPlatform})...`);

    // Create bin directory
    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    // Download archive
    const tempFile = path.join(__dirname, filename);
    console.log(`Downloading from: ${downloadUrl}`);
    await downloadFile(downloadUrl, tempFile);

    // Extract archive
    console.log("Extracting archive...");
    await extractArchive(tempFile, BIN_DIR);

    // Find the extracted binary
    const files = fs.readdirSync(BIN_DIR, { recursive: true });
    let binarySourcePath = null;

    // Look for the binary file (might be in subdirectories)
    for (const file of files) {
      const fullPath = path.join(BIN_DIR, file);
      const stats = fs.statSync(fullPath);

      if (stats.isFile() && (
        file.includes('clog') ||
        file === binaryName ||
        (isWindows && file.endsWith('.exe') && file.includes('clog')) ||
        (!isWindows && !file.includes('.') && file.includes('clog'))
      )) {
        binarySourcePath = fullPath;
        break;
      }
    }

    if (!binarySourcePath) {
      throw new Error("Could not find clog binary in extracted files");
    }

    // Move binary to final location
    if (binarySourcePath !== BINARY_PATH) {
      if (fs.existsSync(BINARY_PATH)) {
        fs.unlinkSync(BINARY_PATH);
      }
      fs.renameSync(binarySourcePath, BINARY_PATH);
    }

    // Make binary executable (Unix systems)
    if (!isWindows) {
      fs.chmodSync(BINARY_PATH, 0o755);
    }

    // Clean up
    fs.unlinkSync(tempFile);

    // Clean up any remaining extracted directories
    const remainingFiles = fs.readdirSync(BIN_DIR);
    remainingFiles.forEach(file => {
      const fullPath = path.join(BIN_DIR, file);
      if (fullPath !== BINARY_PATH && fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    });

    console.log("✅ clog-tui installed successfully!");
    console.log("You can now use 'clog' command from anywhere.");

  } catch (error) {
    console.error("❌ Installation failed:", error.message);
    process.exit(1);
  }
}

// Only run if this script is executed directly (not required)
if (require.main === module) {
  install();
}
