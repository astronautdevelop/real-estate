# 🏠 Real Estate – Property Compare

Offline desktop application for managing and comparing properties.

---

## 📦 Requisiti di sistema

- **Windows 10/11** (x64)
- **No installation required for end users
- **For development: Node.js 18+ and npm

---

## 🚀 Download for End Users

Download the latest version from the [pagina delle release](https://github.com/astronautdevelop/Real-Estate/releases).

- **Installer: Real Estate Setup.exe (run to install the app)
- **Portable: Real Estate.exe (no installation needed, just double-click)

---

## 🛠️ Development & Contributions

If you want to modify or contribute to the project, follow these instructions.

### 1.  Clone the repository

```bash
git clone https://github.com/your-username/Real-Estate.git
cd Real-Estate
```

### 2.  Install dependencies

```bash
npm install
```

This command will install all the libraries listed in package.json.

### 3. Development (with Hot Reload)

```bash
npm run electron:dev
```

- An Electron window opens with the application.
- Changes to React code are automatically reloaded.

### 4. Production Build

```bash
npm run build       # Compiles the React app into dist/
npm run dist        # Generates Windows installer and portable executable
```

The files will be in the release/ folder.

---

## 📁 Project Structure

```
Real-Estate/
├── src/                    # Codice React (TypeScript)
│   ├── components/         # Componenti UI
│   ├── pages/              # Pagine (Home, Confronti, Cronologia, Impostazioni)
│   ├── store/              # Zustand store
│   ├── utils/              # Utility (confronto, profiler, formattazione)
│   ├── types/              # TypeScript types
│   └── i18n/               # Traduzioni (IT + EN)
├── electron/               # Electron (desktop)
│   ├── main.cjs           # Processo principale
│   ├── preload.cjs        # Preload script
│   └── icon.ico           # Icona personalizzata
├── public/                # File statici
├── package.json           # Dipendenze e script
├── vite.config.ts         # Configurazione Vite
├── tsconfig.json          # Configurazione TypeScript
└── README_(IT).md        
└── README_(EN).md              # This guide
```

---

## 📦 Main Dependencies

| Library | Version | Description |
|----------|----------|-------------|
| React | 19 | UI framework |
| TypeScript | ~6.0 | Typed language |
| Vite | 8 | Build tool |
| Electron | 34 | Desktop framework |
| Tailwind CSS | 4 | Styling |
| Dexie | 4 | IndexedDB wrapper |
| Zustand | 5 | State management |
| Recharts | 3 | Grafici |
| i18next | 26 | Internationalization |
| jsPDF | 4 |  PDF generation |

For the full list, see package.json.

---

## 🌍 Multilingual Support

The application supports:

- 🇮🇹 Italian (default)
- 🇬🇧 English

Language can be changed in Settings.

---

## 📝 License

MIT © Astronaut

---

## 👤 Author

**Astronaut** – [GitHub](https://github.com/astronautdevelop)

---

## 🤝 Contributions

Contributions are welcome! Please:



1. Fork the repository
2. Create a branch for your feature (git checkout -b feature/new-feature)
3. Commit your changes (git commit -m "feat: add new feature")
4. Push to the branch (git push origin feature/new-feature)
5. Open a Pull Request

---

## ❓ Questions or issues?

Open an [Issue](https://github.com/astronautdevelop/Real-Estate/issues) su GitHub.
