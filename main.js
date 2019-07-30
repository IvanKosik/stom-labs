//import 'node-modules/material-design-icons/iconfont/material-icons.css'
//import 'typeface-roboto/index.css'

// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,
    title: 'Кости, соединения, мышцы',
  })

  mainWindow.setMenu(null) // comment for default menu

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindow.on('closed', () => {
    app.quit();
  })

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Custom Menu.
  //const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Menu.setApplicationMenu(mainMenu);

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

/*
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 200,
    height: 300,
    title: 'Immma small'
  });

  addWindow.loadFile('sub.html');

  addWindow.on('closed', ()=>{
    addWindow = null;
  });
}

const mainMenuTemplate = [
  {
    label:'File',
    submenu: [
      {
        label: "Add Item",
        click(){
          createAddWindow();
        }
      },
      {
        label: "Clear Items"
      },
      {
        label: "Quit",
        accelerator: "Ctrl+Q",
        click(){
          app.quit();
        }
      },
      {
        label: "Reload",
        click(){
          mainWindow.reload();
        }
      },
      {
        label: "Relaunch",
        click(){
          app.relaunch();
        }
      }
    ]
  },
  {
    label:'Print',
    click(){
      mainWindow.webContents.webContents.print({
        silent: false, 
        printBackground: false, 
        deviceName: ''}, (err, data) => {console.log(err);});
    }
  }
]

if (process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
*/

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//const low = require('lowdb')
//const FileSync = require('lowdb/adapters/FileSync')
//const adapter = new FileSync('db.json')
//const db = low(adapter)