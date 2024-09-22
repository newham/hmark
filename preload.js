const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    onOpenFileData: (callback) => ipcRenderer.on('file-data', (_event, value) => callback(value)),
    openFile: () => ipcRenderer.send('open-file', ''),
})