var ipc = require('electron').ipcRenderer;

module.exports = {
  menuConfig: [
    {
      label: 'd2vspace',
      submenu: [
        {
          label: 'Preferences'
        }, {
          type: 'separator'
        }, {
          label: 'Quit',
          accelerator: 'Command+Q',
          selector: 'terminate:'
        }
      ]
    }, {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click: function() {
            console.log('Open file');
          }
        }, {
          label: 'Save',
          click: function() {
            console.log('Save file');
          }
        }
      ]
    }, {
      label: 'View',
      submenu: [{
        label: 'Reload',
        click: function() {
          console.log('Reload');
          ipc.send('reloadView', {viewId: 'index'});
        }
      }, {
        label: 'Toggle developer tools',
        click: function() {
          ipc.send('toggleDevTools', {viewId: 'index'});
        }
      }]
    }
  ]
};
