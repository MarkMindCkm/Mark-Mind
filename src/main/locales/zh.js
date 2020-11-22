var shell=require('electron').shell;
var app=require('electron').app;

var menus = [
    {
      label: 'MarkMind',
      submenu: [
        {
          label: '关于',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'About' })
            }
          }
        },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "文件",
      submenu: [
        {
          label: '新建导图',
          accelerator: 'CmdOrCtrl+N',
          role: '',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'New File' });
            }
          },
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          role: '',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Open File' });
            }
          },
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Save' });
            }
          }
        },
        {
          label: '另存为',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Save As' });
            }
          }
        },
        {
          label: '导入',
  
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
          label: '导出',
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
          label: '展开至',
          submenu: [
            {
              label: '1级',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-1' })
                }
              }
            },
            {
              label: '2级',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-2' })
                }
              }
            },
            {
              label: '3级',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-3' })
                }
              }
            },
            {
              label: '4级',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-4' })
                }
              }
            },
            {
              label: '5级',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-5' })
                }
              }
            },
            {
              label: '6级',
              click: (item, focusedWindow) => {
                if (focusedWindow) {
                  focusedWindow.webContents.send('cmd', { type: 'Expand-6' })
                }
              }
            },
          ]
        }, {
          label: '首选项',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('cmd', { type: 'Setting' })
            }
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [{
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.send('cmd', { type: 'Undo' })
          }
        }
      },
      {
        label: '恢复',
        accelerator: 'CmdOrCtrl+Y',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.send('cmd', { type: 'Redo' })
          }
        }
      },
      ]
    },
    {
      label: '帮助 ',
      role: 'help',
      submenu: [{
        label: '意⻅反馈',
        click: function () {
          shell.openExternal('https://github.com/MarkMindLtd/Mark-Mind')
        }
      }]
    }
  ];

  if (process.platform === "darwin") {
    menus[2]=menus[2].concat([
      {
        label:'全选',
        accelerator:'CmdOrCtrl+A',
        visible:false,
        click:(item,focusedWindow)=>{
          if(focusedWindow){
            focusedWindow.webContents.selectAll()
          }
        }
      },
      {
        label:'复制',
        accelerator:'CmdOrCtrl+C',
        visible:false,
        click:(item,focusedWindow)=>{
          if(focusedWindow){
            focusedWindow.webContents.copy()
          }
        }
      },
      {
        label:'粘贴',
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

  module.exports=menus;