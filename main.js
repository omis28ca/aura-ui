// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const { SerialPort,ReadlineParser } = require('serialport')
const parser = new ReadlineParser();

// mqtt
const mqtt = require('mqtt')

// Change this to point to your MQTT broker or DNS name
const mqttHost = "127.0.0.1";
const protocol = "mqtt";
const mqttPort = "1883";
// MQTT broker
const brokerURL = `${protocol}://${mqttHost}:${mqttPort}`;
const clientId = "server-client" + Math.random().toString(36).substring(7);
const options = {
  keepalive: 60,
  clientId: clientId,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
};




/**
 * The state of the unit, defaults to closed
 * Possible states : closed, open
 */
var state = 'closed'

// Create a port
const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 115200,
})



// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
})

port.on('open', () => {
  console.log('Open')
})

port.pipe(parser);
parser.on('data', function (data) {

  var dta = data.toString(); //Convert to string
  dta = dta.replace(/\r?\n|\r/g, ""); //remove '\r' from data
  dta = JSON.stringify(data);
  dta = JSON.parse(data);

  console.log(dta.id);

  mqttClient.publish('aura/data', data)

});

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {

    console.log('ports', ports);

  })
}
listSerialPorts();



function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: "#000000",
    title: app.getName(),
    icon: path.join(__dirname, 'img/icons/desktop/favicon-16x16.png'),
    show: true, // Hide your application until your page has loaded
    webPreferences: {
      'nodeIntegration': true, // Disabling node integration allows to use libraries such as jQuery/React, etc
      'preload': path.resolve(path.join(__dirname, 'preload.js'))
    }

  })



  // and load the index.html.orig of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()


  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})




// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
console.log('Running Aura Server')


const mqttClient = mqtt.connect(brokerURL, options)

mqttClient.on('connect', () => {
  mqttClient.subscribe('aura/open')
  mqttClient.subscribe('aura/close')
  mqttClient.subscribe('aura/client')
  console.log('Client is online');
  // Inform controllers that garage is connected
  mqttClient.publish('aura/connected', 'true')
  sendStateUpdate()
})

mqttClient.on('offline', () => {
  console.log('Client is offline');
});

mqttClient.on('reconnect', () => {
  console.log('Reconnecting to MQTT broker');
});

mqttClient.on('end', () => {
  console.log('Connection to MQTT broker ended');
});

mqttClient.on('reconnect', () => {
  console.log('Reconnecting...');
});


mqttClient.on("error", (err) => {
  console.log("Error: ", err);
  //client.end();
});


mqttClient.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
    case 'aura/open':
      return handleOpenRequest(message)
    case 'aura/close':
      return handleCloseRequest(message)
    case 'aura/client':
      return handleClientMessageRequest(message)
  }
})

function handleClientMessageRequest(message) {
  console.log('handleClientMessageRequest()',JSON.stringify(message));
  port.write(message + '\n', (err) => {
    if (err) {
      console.log('Error sending data:', err);
    } else {
      console.log('Data sent successfully.');
    }
  });
}

function sendStateUpdate () {
  console.log('sending state %s', state)
  mqttClient.publish('aura/state', state)
}

function handleOpenRequest (message) {
  if (state !== 'open' && state !== 'opening') {
    console.log('opening door')
    state = 'opening'
    sendStateUpdate()

    // simulate door open after 5 seconds (would be listening to hardware)
    setTimeout(() => {
      state = 'open'
      sendStateUpdate()
    }, 5000)
  }
}

function handleCloseRequest (message) {
  if (state !== 'closed' && state !== 'closing') {
    state = 'closing'
    sendStateUpdate()

    // simulate door closed after 5 seconds (would be listening to hardware)
    setTimeout(() => {
      state = 'closed'
      sendStateUpdate()
    }, 5000)
  }
}

/**
 * Want to notify controller that unit is disconnected before shutting down
 */
function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    mqttClient.publish('aura/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))

/*/ Manage unhandled exceptions as early as possible
process.on('uncaughtException', (e) => {
    console.error(`Caught unhandled exception: ${e}`);
    dialog.showErrorBox('Caught unhandled exception', e.message || 'Unknown error message');
    app.quit()
});
*/
