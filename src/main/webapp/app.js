const Websemble = require('websemble');
const protocol = require('electron').protocol;
const path = require('path');
// const IPFS = require('ipfs');


var app = new Websemble.ElectronApp.getInstance({width: 800, height: 600});

app.onReady.then(function() {
  console.log('process versions:', process.versions);
  // Open the devtools.
  app.mainWindow.openDevTools();

    // Spawn your IPFS node \o/
  //  const node = new IPFS();

/*    node.on('ready', function () {
        /* node.id(function (err, id) {
         if (err) {
         return console.log('error', err)
         }
         console.log('id:', id)
         });
        console.log('IPFS node ready');
    });

    node.on('error', function(err) {
        console.log("IPFS node error:", err);
    }); */



    protocol.registerFileProtocol('atom', function (request, callback) {
        const url = request.url.substr(7);
        var p = path.normalize(`${__dirname}/${url}`);
        console.log('path: ', p);
        callback({path: p});
    }, function (error) {
        if (error) {
            console.error('Failed to register protocol')
        }
    });
});

console.log('App started - ' + typeof app);
