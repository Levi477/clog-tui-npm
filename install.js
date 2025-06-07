const os = require("os");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const tar = require("tar");
const AdmZip = require("adm-zip");
const mkdirp = require("mkdirp");

const platform = os.platform();
const arch = os.arch();
const version = "v1.3.0"; // update to latest release

const BIN_DIR = path.join(__dirname, "bin");
const BIN_PATH = path.join(BIN_DIR, "clog");

mkdirp.sync(BIN_DIR);

function getTargetName(platform, arch) {
  const archMap = { x64: "x86_64", arm64: "aarch64" };
  const mappedArch = archMap[arch];

  if (!mappedArch) throw new Error(`Unsupported arch: ${arch}`);

  if (platform === "darwin") return `clog_tui-macos-${mappedArch}.tar.gz`;
  if (platform === "linux") return `clog_tui-linux-${mappedArch}.tar.gz`;
  if (platform === "win32") return `clog_tui-windows-${mappedArch}.zip`;

  throw new Error(`Unsupported platform: ${platform}`);
}

async function downloadAndExtract() {
  const filename = getTargetName(platform, arch);
  const url = `https://github.com/Levi477/clog-tui/releases/download/${version}/${filename}`;
  const tmpFile = path.join(__dirname, filename);

  console.log(`Downloading ${url}...`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);
  const fileStream = fs.createWriteStream(tmpFile);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  console.log("Extracting...");

  if (filename.endsWith(".tar.gz")) {
    await tar.x({ file: tmpFile, cwd: BIN_DIR });
  } else if (filename.endsWith(".zip")) {
    const zip = new AdmZip(tmpFile);
    zip.extractAllTo(BIN_DIR, true);
  }

  // Rename binary to "clog"
  const extractedName = fs.readdirSync(BIN_DIR).find(f => f.includes("clog_tui"));
  const finalPath = BIN_PATH + (platform === "win32" ? ".exe" : "");
  fs.renameSync(path.join(BIN_DIR, extractedName), finalPath);
  fs.chmodSync(finalPath, 0o755);

  fs.unlinkSync(tmpFile);

  console.log("Installed clog to ./bin/clog");
  console.log("Now use 'clog' command to start the application");
}

downloadAndExtract().catch(err => {
  console.error("Install failed:", err);
  process.exit(1);
});
