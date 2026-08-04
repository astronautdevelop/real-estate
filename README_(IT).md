# 🏠 Real Estate – Confronto Immobili

Applicazione desktop offline per la gestione e il confronto di immobili.

---

## 📦 Requisiti di sistema

- **Windows 10/11** (x64)
- **Nessuna installazione richiesta** per l'utente finale
- **Per lo sviluppo**: Node.js 18+ e npm

---

## 🚀 Download per l'utente finale

Scarica l'ultima versione dalla [pagina delle release](https://github.com/astronautdevelop/Real-Estate/releases).

- **Installer**: `Real Estate Setup.exe` (da eseguire per installare l'app)
- **Portabile**: `Real Estate.exe` (funziona senza installazione, basta doppio clic)

---

## 🛠️ Sviluppo e Contributi

Se vuoi modificare o contribuire al progetto, segui queste istruzioni.

### 1. Clona il repository

```bash
git clone https://github.com/tuo-username/Real-Estate.git
cd Real-Estate
```

### 2. Installa le dipendenze

```bash
npm install
```

Questo comando installerà **tutte** le librerie necessarie elencate in `package.json`.

### 3. Sviluppo (con Hot Reload)

```bash
npm run electron:dev
```

- Si apre una finestra Electron con l'applicazione.
- Le modifiche al codice React vengono ricaricate automaticamente.

### 4. Build di produzione

```bash
npm run build       # Compila l'app React in dist/
npm run dist        # Genera installer e portabile Windows
```

I file saranno nella cartella `release/`.

---

## 📁 Struttura del progetto

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
└── README.md              # Questa guida
```

---

## 📦 Dipendenze principali

| Libreria | Versione | Descrizione |
|----------|----------|-------------|
| React | 19 | UI framework |
| TypeScript | ~6.0 | Linguaggio tipizzato |
| Vite | 8 | Build tool |
| Electron | 34 | Desktop framework |
| Tailwind CSS | 4 | Styling |
| Dexie | 4 | IndexedDB wrapper |
| Zustand | 5 | State management |
| Recharts | 3 | Grafici |
| i18next | 26 | Internazionalizzazione |
| jsPDF | 4 | Generazione PDF |

Per l'elenco completo, consulta `package.json`.

---

## 🌍 Multilingua

L'applicazione supporta:

- 🇮🇹 Italiano (default)
- 🇬🇧 Inglese

La lingua può essere cambiata nelle **Impostazioni**.

---

## 📝 Licenza

MIT © Astronaut

---

## 👤 Autore

**Astronaut** – [GitHub](https://github.com/astronautdevelop)

---

## 🤝 Contributi

I contributi sono benvenuti! Per favore:

1. Fai un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/nuova-funzione`)
3. Fai commit delle modifiche (`git commit -m "feat: aggiunta nuova funzione"`)
4. Fai push sul branch (`git push origin feature/nuova-funzione`)
5. Apri una Pull Request

---

## ❓ Domande o problemi?

Apri una [Issue](https://github.com/astronautdevelop/Real-Estate/issues) su GitHub.

---

## 🔄 Guida rapida (per sviluppatori)

Clone
git clone https://github.com/astronautdevelop/Real-Estate.git
cd Real-Estate

Installa le dipendenze
npm install

Esegui in modalità di sviluppo
npm run electron:dev

Build per la produzione
npm run dist

---

## 🖥️ Guida rapida per l'utente

1. Scarica Real Estate.exe dalla sezione "Releases"
2. Salvalo in una posizione qualsiasi del computer (es. C:\Apps\Real Estate\)
3. Fai doppio clic per avviarlo
4. Non è richiesta alcuna installazione!

5. (Se l'applicazione non si avvia, assicurati di avere installato la versione più recente di Visual C++ Redistributable).
