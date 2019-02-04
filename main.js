// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, dialog} = require('electron');
const fs = require('fs');
const ipc = require('electron').ipcMain;
const Store = require('./store');
const path = require('path');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const userDataPath = app.getPath('userData');

function parseStateFile (filePath, defaults) {
    console.log("state file path is " + filePath);
    let text = fs.readFileSync(filePath)
    console.log(text)
    try {
        return JSON.parse(text);
    } catch (error) {
        return defaults;
    }
}
const stateFilePath = path.join(userDataPath, 'state.json');

let state = parseStateFile(stateFilePath, {});




const template = [
    {
        label : 'File',
        submenu : [
            {
                label : 'Open',
                click : openFile
            },
            {
                label : 'Save',
                click : saveToDisk
            }
            // {
            //     label : 'Save as...',
            //     click : saveAs
            // }
        ]
    },
    {
        role : 'window',
        submenu : [
            {role : 'minimize'},
            {role : 'close'}
        ]
    },
    {
        label : 'View',
        submenu : [
            {role : 'resetzoom'},
            {role : 'zoomin'},
            {role : 'zoomout'}
        ]
    }

];
let currentFilePath;
let data;

function openFile () {
    state.currentFilePath = dialog.showOpenDialog(mainWindow, {
        title : 'Check'
    })[0];
    saveStateToDisk();
    console.log(state);
    data = parseDataFile(state.currentFilePath, {});
    mainWindow.webContents.send("new-data-opened", data);
}

// function saveFile () {
//     dialog.showOpenDialog(mainWindow, {
//         title : 'Check'
//     }, function (filePaths) {
//         const path = filePaths[0];
//         saveToDisk(path);
//     });
// }

function saveToDisk () {
    try {
        fs.writeFileSync(path.resolve(state.currentFilePath), JSON.stringify(data));
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function saveStateToDisk () {
    try {
        fs.writeFileSync(path.resolve(stateFilePath), JSON.stringify(state));
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function parseDataFile (filePath, defaults) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath));
        return data;
    } catch (error) {
        return defaults;
    }
}

function createWindow () {
    console.log(state);


    ipc.on('get-main-data', function (event, arg) {
        event.returnValue = data;
    });


    // Create the browser window.
    mainWindow = new BrowserWindow(
        {
            width : 900,
            minWidth : 450,
            height : 500,
            minHeight : 300,
            title : 'Xerocross Check',
            show : false
        });
    //mainWindow.webContents.openDevTools();
    

    // mainWindow.setMenu(null);
    //const menu = Menu.buildFromTemplate(template);

    //Menu.setApplicationMenu(menu);
    // and load the index.html of the app.
    mainWindow.loadFile('index.html');


    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', function () {
        mainWindow.webContents.send("test", "msg");
        if (state.currentFilePath) {
            console.log("opening existing data file");
            data = parseDataFile(state.currentFilePath, {});
            console.log(data);    
            mainWindow.webContents.send("new-data-opened", data);
           
        } else {
            data = {};
        }
        mainWindow.webContents.send("new-data-opened", data);
        
        mainWindow.show();
    });
}


app.on('ready', createWindow);

app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

ipc.on('save-data-file', function (event, arg ) {
    data = arg;
    try {
        fs.writeFileSync(path.resolve(state.currentFilePath), JSON.stringify(data));

        event.returnValue = true;
    }
    catch (e) {
        console.log(e);
        event.returnValue = false;
    }
});
