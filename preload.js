const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    onOpenFileData: (callback) => ipcRenderer.on('file-data', (_event, value) => callback(value)),
    onBgChange: (callback) => ipcRenderer.on('bg-rgb', (_event, value) => callback(value)),
    onThemeChange: (callback) => ipcRenderer.on('theme', (_event, value) => callback(value)),
    openFile: () => ipcRenderer.send('open-file', ''),
    themeChanged: (theme) => ipcRenderer.send('theme-changed', theme),
})