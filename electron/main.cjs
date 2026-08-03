const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function getDistPath() {
    // In sviluppo: usa ../dist
    if (process.env.NODE_ENV === 'development') {
        return path.join(__dirname, '../dist');
    }

    // In produzione: prova diversi percorsi
    const possiblePaths = [
        path.join(process.resourcesPath, 'app', 'dist'),      // Installer
        path.join(process.resourcesPath, 'dist'),             // Alcuni portabili
        path.join(app.getAppPath(), 'dist'),                  // App path
        path.join(__dirname, '../dist'),                      // Fallback
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            console.log('✅ Trovata cartella dist a:', p);
            return p;
        }
    }

    // Se nessun percorso funziona, restituisce l'ultimo tentativo
    console.error('❌ Cartella dist non trovata in nessuna posizione!');
    return path.join(__dirname, '../dist');
}

function createWindow() {
    const distPath = getDistPath();
    const indexPath = path.join(distPath, 'index.html');

    console.log('📁 Percorso index.html:', indexPath);
    console.log('📁 Esiste?', fs.existsSync(indexPath));

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        show: false,
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(indexPath).catch((err) => {
            console.error('❌ Errore nel caricare index.html:', err);
            // Se fallisce, prova a caricare una pagina di errore
            mainWindow.loadURL('data:text/html;charset=utf-8,<h1>Errore</h1><p>Impossibile caricare l\'applicazione.</p>');
        });
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Apri DevTools anche in produzione per debug (rimuovi in release finale)
        mainWindow.webContents.openDevTools();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});