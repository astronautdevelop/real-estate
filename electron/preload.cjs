const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Puoi aggiungere funzioni qui se necessario
    // Esempio:
    // getAppVersion: () => require('../package.json').version,
});