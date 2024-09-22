const { app, globalShortcut, nativeImage, BrowserWindow, Tray, Menu, ipcMain, dialog, shell } = require('electron/main')
const os = require('os')
const path = require('path')
// const shell = require('shell ')
// vals
var mainWindow = null;
var inputFile = null

// app.dock.hide();//dock栏隐藏

let W = 720;
let H = W / 4 * 3

const createWindow = () => {
    console.log('->', 'new window')
    // let trayBounds = tray.getBounds();
    mainWindow = new BrowserWindow({
        // x: trayBounds.x - W / 2 + trayBounds.width / 2,
        // y: 32,
        width: W,
        height: H,
        minWidth: W * .5,
        minHeight: H * .5,
        // maximizable: false,
        // minimizable: false,
        // resizable: false,
        // movable: false,
        // frame: false,
        // titleBarStyle: "hiddenInset", //不显示标题栏,仅显示按钮
        // alwaysOnTop: true,
        // show: true,//创建窗口时不显示
        webPreferences: {
            // nodeIntegration: true, // 是否集成Nodejs
            // contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    })

    // mainWindow.on('close', (event) => {
    //     // 截获 close 默认行为
    //     // event.preventDefault();
    //     // hideWin()
    // })

    mainWindow.loadFile('index.html')

    // Implement drag and drop functionality
    mainWindow.on('ondragover', (event) => {
        event.preventDefault()
        mainWindow.webContents.send('drag-over')
    })

    mainWindow.on('ondrop', (event) => {
        event.preventDefault()
        const files = event.dataTransfer.files
        console.log(files[0])
    })

    // 处理链接跳转
    mainWindow.webContents.on('will-navigate', (e, url) => {
        e.preventDefault();
        toUrl(url);
    })
    // 处理 window.open 跳转
    mainWindow.webContents.setWindowOpenHandler((data) => {
        // console.log('->', data.url);
        toUrl(data.url);
        return {
            action: 'deny'
        }
    })


    // mainWindow.webContents.openDevTools() // 调试

    mainWindow.once('ready-to-show', () => {
        if (inputFile) {
            readFileData(inputFile);
        }
        mainWindow.show();
    })
}

function toUrl(url) {
    dialog.showMessageBox(mainWindow, {
        type: "warning",
        title: "go url",
        icon: nativeImage.createFromPath(path.join(__dirname, 'asserts/img/icons8-markdown-96.png')),
        message: `Go to : \n${url} ?`,
        buttons: ["Cancel", "Yes"],
    }).then((index) => {
        if (index.response === 0) {
            return false
        } else {
            console.log('->', url);
            shell.openExternal(url);
        }
    })

}

const isMac = process.platform === 'darwin'

ipcMain.on('open-file', (_event, value) => {
    openFile()
})

// 不能和readFile重名！否则不能执行
function readFileData(path) {
    try {
        let data = fs.readFileSync(path, 'utf8');
        BrowserWindow.getFocusedWindow().webContents.send('file-data', { path: path, data: data });
        BrowserWindow.getFocusedWindow().setTitle(path.split('/').pop());
        inputFile = path;
    } catch (err) {
        console.error(err);
    }
}

function openFile() {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Markdown', extensions: ['md'] },
        ]
    }).then(result => {
        // console.log(result.canceled)
        if (result.filePaths[0]) {
            console.log('->', result.filePaths[0])
            readFileData(result.filePaths[0]);
        }
    }).catch(err => {
        console.log(err)
    })
}

function buildMenu() {
    const template = [
        // { role: 'appMenu' }
        ...(isMac
            ? [{
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { role: 'quit' }
                ]
            }]
            : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    click: () => {
                        openFile()
                    },
                }, {
                    label: 'New Window',
                    click: () => {
                        inputFile = null;
                        createWindow();
                    },
                }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                // { role: 'undo' },
                // { role: 'redo' },
                // { type: 'separator' },
                // { role: 'cut' },
                { role: 'copy' },
                // { role: 'paste' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://electronjs.org')
                    }
                }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

const fs = require('fs');

app.whenReady().then(() => {
    // buildTray()
    buildMenu();

    createWindow();
})

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
    app.quit()
    // }
})

app.on('open-file', (event, path) => {
    // 当用户想要在应用中打开一个文件时发出。 
    // 事件通常在应用已经打开，并且系统要再次使用该应用打开文件时发出。
    // 也会在一个文件被拖到 dock 并且还没有运行的时候发出。 
    if (mainWindow && inputFile != path) {
        inputFile = path;
        createWindow()
    }
    inputFile = path;

    event.preventDefault();
});

ipcMain.on('on-drag-start', (event, filePath) => {
    // event.sender.startDrag({
    //     file: path.join(__dirname, filePath),
    //     icon: iconName
    // })
    console.log(filePath)
})