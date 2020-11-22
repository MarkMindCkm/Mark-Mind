import { app, BrowserWindow, dialog, globalShortcut, ipcMain,Menu } from 'electron'

const Store = require('electron-store');

import '../renderer/store'
import fs from 'fs';

require('./onedrive.js');

// open file path
let preFilePath = '';

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development'
? `http://localhost:9080`
: `file://${__dirname}/index.html`;


class MarkMind{
    constructor(){
          this.template=null;
          this.mainWindow=null;
          this.store=null;
          this.checkConfig();
          this.init();
    }
    checkConfig(){
        var store = new Store();
        if (!store.has('config')) {
          store.set('config', {
            "theme": "theme-light",
            "language": "en",
            "canvasWidth": 8000,
            "canvasHeight": 8000,
            "fontSize": 14,
            "useMarkDown": false,
            "size": 0
          });
        };
        this.store=store;
    }
    init(){
         this.setMenu();
         this.addIpcListener();
         this.addAppListener();
         this.checkSystem();
    }
 

    setMenu(){
      var profile=this.store.get('config');
      if(profile.language=='zh'){
          this.template=require('./locales/zh')
      }else if(profile.language=='en'){
          this.template=require('./locales/en')
      }
      const menu = Menu.buildFromTemplate(this.template)
      Menu.setApplicationMenu(menu);
    }

    createWindow(){
      var that=this;
      this.mainWindow = new BrowserWindow({
        height: 800,
        backgroundColor: '#fff',
        width: 1200,
        titleBarStyle: 'hidden',
       
        show:true,
        frame: false,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true 
        }
      });

      this.mainWindow.loadURL(winURL)

      this.mainWindow.on('closed', () => {
          this.mainWindow = null
      });

      this.mainWindow.on('close',(event)=>{
            event.preventDefault();
            var profile=this.store.get('config');
            if(profile.language=='zh'){
              var message="还需要保存数据吗？\n如果未保存，您的数据有可能丢失"
              var title="确定关闭应用？";
              var btns=["离开一会~","取消"];
            }else{
              var message="please close window after you save mindmap";
              var title="Are you sure close this application?";
              var btns=["Leave","Back"];
            }

            dialog.showMessageBox({
              type: 'info',
              title: title,
              defaultId: 0,
              message: message,
              //buttons: i18n.t('profile.profileBtns')
              buttons: btns
              }).then(({response})=>{
                if(response===0){
                  that.mainWindow = null;
                  app.exit();	
                } else {
                  event.preventDefault();		
                }
              });

      });

      globalShortcut.register('CommandOrControl+Shift+L', () => {
        this.mainWindow && this.mainWindow.toggleDevTools();
      });
      if (process.platform === "darwin") {
        let contents = this.mainWindow.webContents;
        globalShortcut.register("CommandOrControl+C", () => {
          contents.copy();
        });
        globalShortcut.register("CommandOrControl+V", () => {
          contents.paste();
        });
        app.dock.hide();
      }

    }

    addIpcListener(){
      //min win
      ipcMain.on('win-min', () =>{
        this.mainWindow.minimize();
      });
      //max win
      ipcMain.on('win-max', ()=> {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.restore();
        } else {
          this.mainWindow.maximize();
        }
      });
    
      //close
      ipcMain.on('win-close',()=> {
        this.mainWindow.close();
      });
    
      //open mind file
      ipcMain.on('open-file', () => {
        this.mainWindow.webContents.send('lm-open-flie', preFilePath);
      });

       //export PDF
      ipcMain.on('export-list', () => {
        let focusWin = BrowserWindow.getFocusedWindow();
        dialog.showSaveDialog({
          title: 'Save PDF',
          defaultPath: 'mind.pdf',
          filters: [
            { name: 'PDF', extensions: ['pdf'] },
          ]
        }).then(function ({ filePath }) {
    
          if (filePath && focusWin) {
            focusWin.webContents.printToPDF({ 
              margin: 2, 
              pageSize: 'A3',
              pagesPerSheet :true,
              headerFooterEnabled:true
             }).then(function (data) {
              fs.writeFile(filePath, data, {}, (err, d) => {
                if (err) {
                  focusWin.webContents.send('export-list-fail');
                  return
                }
                focusWin.webContents.send('export-list-success');
              })
            }).catch((e) => {
               focusWin.webContents.send('export-list-fail');
            });
          } else {
             focusWin.webContents.send('export-list-cancel');
          }
        }).catch((e) => {
           focusWin.webContents.send('export-list-fail');
        });
      });
     
      //change menu
      ipcMain.on('setMenu',()=>{
         this.setMenu();
      });

    }

    addAppListener(){
      app.on('ready',()=>{
        this.createWindow();
      })

      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit()
        }
      });
      
      app.on("will-finish-launching", () => {
        app.on("open-file", (e, filePath) => {
          preFilePath = filePath
        });
        if (process.platform == "win32" && process.argv.length >= 2) {
          preFilePath = (process.argv[1] === '.' ? '' : process.argv[1])
        }
      });
      
      app.on('before-quit', e => {
        if (process.platform === 'win32') {
           tray&&tray.destroy();
        }
      })
      
      
      app.on('activate', () => {
        if (mainWindow === null) {
          this.createWindow()
        }else{
          this.mainWindow.reload();
        }
      })      
    }

    checkSystem(){
      
    }
}

new MarkMind();




/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */


