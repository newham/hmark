const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    onOpenFileData: (callback) => ipcRenderer.on('file-data', (_event, value) => callback(value)),
    onBgChange: (callback) => ipcRenderer.on('bg-rgb', (_event, value) => callback(value)),
    onThemeChange: (callback) => ipcRenderer.on('theme', (_event, value) => callback(value)),
    onFontSizeChange: (callback) => ipcRenderer.on('font-size', (_event, value) => callback(value)),
    onEdit: (callback) => ipcRenderer.on('edit', (_event, value) => callback(value)),
    openFile: () => ipcRenderer.send('open-file', ''),
    themeChanged: (theme) => ipcRenderer.send('theme-changed', theme),
    saveEdit: (data) => ipcRenderer.send('save-edit', data),
    editChanged: (isChange) => ipcRenderer.send('edit-change', isChange),
})