# clog 🔐📓

> clog is a secure, terminal-based note-keeping/daily-diary application — designed to give you a fast, keyboard-driven interface and complete privacy for all your data.

---

## ✨ Features

- 🖥️ **Terminal UI**: Navigate users, folders, and files completely via keyboard.
- 🔒 **End-to-End Encrypted**:  
  - All metadata and files are encrypted with your password.
  - Each file uses a **unique encryption key and nonce**.
- 📦 **Portable**: All notes live in a single `.clog` file.
- 🧠 **Built-in Editor Support**: Uses Vim, Nano, or your system’s default editor.
- 💻 **Cross-platform binaries** auto-downloaded at install time.

---

## 🚀 Installation

```bash
npm install -g clog
```

This installs a platform-specific prebuilt binary from GitHub and makes it available via the `clog` command.

---

## 🔐 Security Model

- **Password-protected:** Everything is encrypted — even folder/file names.
- **No recovery:** If you lose your password, there's no way to recover data.
- **Virtual filesystem:** Simulates folder/file structure inside a `.clog` blob.

---

## 📁 Data Storage

Encrypted notes are saved in a single `.clog` file at:

| OS      | Path |
|---------|------|
| Linux   | `~/.local/share/com.levi.clog/<username>.clog` |
| macOS   | `~/Library/Application Support/com.levi.clog/<username>.clog` |
| Windows | `C:\Users\<user>\AppData\Roaming\levi\clog\data\<username>.clog` |

You can copy/move this file between systems. Just run `clog` and it will detect it.

---

## ✏️ Usage

```bash
clog
```

- Choose or create a user
- Enter your password
- Start organizing your encrypted notes

---

## 📤 Move to Another Machine

```bash
scp ~/.local/share/com.levi.clog/yourname.clog user@host:~/backup/
```

Then run `clog` on the new system — and you're back in.

---

## 💻 Supported Platforms

- **Linux**: `x86_64`, `aarch64`
- **macOS**: Intel + Apple Silicon
- **Windows**: `x86_64`, `aarch64`

---

## 📦 Prebuilt Binaries

This package automatically downloads from:

👉 [GitHub Releases](https://github.com/Levi477/clog-tui/releases)

---

## 🛠 Built With

- [`ratatui`](https://github.com/ratatui-org/ratatui) – Terminal UI library
- [`clog_rs`](https://github.com/Levi477/clog) – Secure encrypted backend
- Rust 🦀 for performance and safety

---

## 📄 License

MIT © [Deep Gajjar](https://github.com/Levi477)

---

## 💡 Original Project

[https://github.com/Levi477/clog-tui](https://github.com/Levi477/clog-tui)
