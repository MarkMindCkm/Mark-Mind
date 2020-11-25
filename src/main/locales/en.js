var shell=require('electron').shell;
var app=require('electron').app;
var menus = [
    {
      label: 'MarkMind',
      submenu: [
        {
          label: 'About MarkMind',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'About' })
            }
          }
        },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "File",
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          role: '',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'New File' });
            }
          },
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          role: '',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Open File' });
            }
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Save' });
            }
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Save As' });
            }
          }
        },
        {
          label: 'Import',
  
          submenu: [
            {
              label: 'Xmind Zen',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Import-Xmind Zen' })
                }
              }
            },
            {
              label: 'KityMind',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Import-KityMind' })
                }
              }
            },
            {
              label: 'Opml',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Import-OPML' })
                }
              }
            },
            {
              label: 'Markdown',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Import-MarkDown' })
                }
              }
            }
          ]
        },
        {
          label: 'Export',
          submenu: [
            {
              label: 'Freemind',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Export-FreeMind' })
                }
              }
            },
            {
              label: 'Opml',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Export-OPML' })
                }
              }
            },
            {
              label: 'Markdown',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Export-MarkDown' })
                }
              }
            },
            {
              label: 'Kitymind',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Export-KityMind' })
                }
              }
            }
          ],
        },
        {
          label: 'Expand To',
          submenu: [
            {
              label: 'One Level',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-1' })
                }
              }
            },
            {
              label: 'Two Level',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-2' })
                }
              }
            },
            {
              label: 'Three Level',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-3' })
                }
              }
            },
            {
              label: 'Four Level',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-4' })
                }
              }
            },
            {
              label: 'Five Level',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-5' })
                }
              }
            },
            {
              label: 'Six Level',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-6' })
                }
              }
            },
          ]
        }, {
          label: 'Setting',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Setting' })
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.send('cmd', { type: 'Undo' })
          }
        }
      },
      {
        label: 'Redo',
        accelerator: 'CmdOrCtrl+Y',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.send('cmd', { type: 'Redo' })
          }
        }
      }
  
      ]
    },
    {
      label: 'Help ',
      role: 'help',
      submenu: [{
        label: '',
        click: function () {
          shell.openExternal('https://github.com/MarkMindLtd/Mark-Mind')
        }
      }]
    }
  ];

  if (process.platform === "darwin") {
    menus[2].submenu=menus[2].submenu.concat([
      {
        label:'selectAll',
        accelerator:'CmdOrCtrl+A',
        visible:false,
        click:(item,focusedWindow)=>{
          if(focusedWindow){
            focusedWindow.webContents.selectAll()
          }
        }
      },
      {
        label:'Copy',
        accelerator:'CmdOrCtrl+C',
        visible:false,
        click:(item,focusedWindow)=>{
          if(focusedWindow){
            focusedWindow.webContents.copy()
          }
        }
      },
      {
        label:'Paste',
        accelerator:'CmdOrCtrl+V',
        visible:false,
        click:(item,focusedWindow)=>{
          if(focusedWindow){
            focusedWindow.webContents.paste()
          }
        }
      }
    ])
  }

  module.exports = menus;