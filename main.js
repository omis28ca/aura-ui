// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const { SerialPort,ReadlineParser } = require('serialport')
const parser = new ReadlineParser();

const { exec } = require('child_process');
const os = require('os');

const fs = require('fs');
const sudo = require('sudo-prompt');

const wifi = require('node-wifi');

const AutoGitUpdate = require('auto-git-update');
const updateConfig = {
  repository: 'https://github.com/omis28ca/aura-ui',
  fromReleases: false,
  tempLocation: '/home/orangepi/tmp/',
  ignoreFiles: [],
  executeOnComplete: '/home/orangepi/aura-ui/update.sh',
  exitOnComplete: true
}
const updater = new AutoGitUpdate(updateConfig);

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
});


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




function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: "#000000",
    title: app.getName(),
    kiosk: true, // Enables kiosk mode
    icon: path.join(__dirname, 'img/icons/desktop/favicon-16x16.png'),
    show: true, // Hide your application until your page has loaded
    webPreferences: {
      'nodeIntegration': true, // Disabling node integration allows to use libraries such as jQuery/React, etc
      'preload': path.resolve(path.join(__dirname, 'preload.js'))
    }

  })





  // and load the index.html.orig of the app.
  mainWindow.loadFile('dist/index.html')


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
  mqttClient.subscribe('aura/shutdown')
  mqttClient.subscribe( 'aura/wifi/connect')
  mqttClient.subscribe('aura/wifi/disconnect')
  mqttClient.subscribe( 'aura/wifi/delete')
  mqttClient.subscribe( 'aura/wifi/connections')
  mqttClient.subscribe( 'aura/display/brightness')
  mqttClient.subscribe('aura/system/clock/set')
  mqttClient.subscribe('aura/system/clock/sync')
  mqttClient.subscribe('aura/system/timezone')
  mqttClient.subscribe('aura/devtools')
  mqttClient.subscribe('aura/update')

  console.log('Client is online');
  // Inform controllers that board is connected
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
    case 'aura/shutdown':
      return handleShutdown(message)
    case 'aura/open':
      return handleOpenRequest(message)
    case 'aura/close':
      return handleCloseRequest(message)
    case 'aura/client':
      return handleClientMessageRequest(message)
    case 'aura/wifi/connect':
      return handleWifiConnect(message);
    case 'aura/wifi/disconnect':
      return handleWifiDisconnect(message);
    case 'aura/wifi/delete':
      return handleWifiDelete(message);
    case 'aura/wifi/connections':
      return handleWifiConnections(message);
    case 'aura/display/brightness':
      return handleDisplayBrighness(message)
    case 'aura/system/clock/set':
      return handleSetSystemClock(message)
    case 'aura/system/clock/sync':
      return handleSetSystemSync(message)
    case 'aura/system/timezone':
      return handleSystemTimeZone(message)
    case 'aura/devtools':
      return handleOpenDevtools(message)
    case 'aura/update':
      return handleUpdate()
  }
})

function handleUpdate(){
  console.log('handleUpdate()');

  updater.autoUpdate();

}

function handleOpenDevtools(message){
  console.log('handleOpenDevtools()',message.toString());
  // Open the DevTools.

}

function handleDisplayBrighness(message) {
  console.log('handleDisplayBrightness()',message.toString());

  let level = parseInt(message.toString())

  setBrightness(level)
}
function handleSetSystemClock(message) {
  console.log('handleSystemClock()',message.toString());

  let timeString = message.toString()
  // set system clock
  // Sets the date and time to the date specified, returns a promise resolves once date/time is set
  // Use Sudo (Linux only)
  setSystemTimeLinux(new Date(timeString))
}
function setSystemTimeLinux(dateString) {
  // dateString format: "YYYY-MM-DD HH:MM:SS"
  const setDateCmd = `sudo date -s "${dateString}"`;

  exec(setDateCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting time: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`System time updated: ${stdout}`);
  });
}


function handleSetSystemSync(message) {
  console.log('handleSystemSync()',JSON.stringify(message));
  // set system clock
  // Sets the date and time to the date specified, returns a promise resolves once date/time is set
  // Use Sudo (Linux only)
  syncTimeUnix()
}
function syncTimeUnix() {
  const cmd = 'sudo ntpdate pool.ntp.org'; // or use 'timedatectl set-ntp true'

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error syncing time: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Time synced: ${stdout}`);
  });
}



function handleSystemTimeZone(message) {
  console.log('handleSystemTimeZone()',JSON.stringify(message));

  let timeZone = message.toString()
  // set system clock
  // Sets the date and time to the date specified, returns a promise resolves once date/time is set
  // Use Sudo (Linux only)
  setTimeZoneLinux(timeZone)
}
function setTimeZoneLinux(timeZone) {


  // Default to "America/Los_Angeles" if timeZone is null or undefined
  if (timeZone == null) {
    timeZone = "America/Los_Angeles";
  }

  // timeZone example: "America/Los_Angeles", "Europe/London", etc.
  const cmd = `sudo timedatectl set-timezone "${timeZone}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting time zone: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Time zone updated to ${timeZone}: ${stdout}`);
    mqttClient.publish('aura/timezone/updated', JSON.stringify({state:"updated"}))
  });
}


function handleWifiConnect(message) {
  console.log('handleWifiConnect()',JSON.stringify(message));
  // Connect to a network
  wifi.connect({ ssid: 'S3VIN', password: '1234567890' }, () => {
    console.log('Connected');
    // on windows, the callback is called even if the connection failed due to netsh limitations
    // if your software may work on windows, you should use `wifi.getCurrentConnections` to check if the connection succeeded
    mqttClient.publish('aura/wifi/connected', JSON.stringify({state:"connected"}))
  });
}


function handleWifiConnections(message) {
  console.log('handleWifiConnections()',JSON.stringify(message));
// List the current wifi connections
  wifi.getCurrentConnections((error, currentConnections) => {
    if (error) {
      console.log(error);
    } else {
      console.log(currentConnections);
      mqttClient.publish('aura/wifi/currentConnections', JSON.stringify(currentConnections))
      /*
      // you may have several connections
      [
          {
              iface: '...', // network interface used for the connection, not available on macOS
              ssid: '...',
              bssid: '...',
              mac: '...', // equals to bssid (for retrocompatibility)
              channel: <number>,
              frequency: <number>, // in MHz
              signal_level: <number>, // in dB
              quality: <number>, // same as signal level but in %
              security: '...' //
              security_flags: '...' // encryption protocols (format currently depending of the OS)
              mode: '...' // network mode like Infra (format currently depending of the OS)
          }
      ]
      */
    }
  });


}

function handleWifiDisconnect(message) {
  console.log('handleWifiDisonnect()',JSON.stringify(message));

  // Disconnect from a network
// not available on all os for now
  wifi.disconnect(error => {
    if (error) {
      console.log(error);
    } else {
      console.log('Disconnected');
      mqttClient.publish('aura/wifi/disconnected', JSON.stringify({state:"disconnected"}))
    }
  });
}

function handleWifiDelete(message) {
  console.log('handleWifiDelete()',JSON.stringify(message));
  // Delete a saved network
  // not available on all os for now
  wifi.deleteConnection({ ssid: message }, error => {
    if (error) {
      console.log(error);
    } else {
      console.log( message + ' Deleted');
      mqttClient.publish('aura/wifi/deleted', JSON.stringify({state:"deleted",message:message}))
    }
  });

}


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




// Scan networks
wifi.scan((error, networks) => {
  if (error) {
    console.log(error);
  } else {
    console.log(networks);
    /*
        networks = [
            {
              ssid: '...',
              bssid: '...',
              mac: '...', // equals to bssid (for retrocompatibility)
              channel: <number>,
              frequency: <number>, // in MHz
              signal_level: <number>, // in dB
              quality: <number>, // same as signal level but in %
              security: 'WPA WPA2' // format depending on locale for open networks in Windows
              security_flags: '...' // encryption protocols (format currently depending of the OS)
              mode: '...' // network mode like Infra (format currently depending of the OS)
            },
            ...
        ];
        */
    //send to mqtt topic
    // simulate door closed after 5 seconds (would be listening to hardware)
    setTimeout(() => {
      mqttClient.publish('aura/wifi/networks', JSON.stringify(networks))
    }, 5000)
    

  }
});









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


function handleShutdown (message) {
  mqttClient.publish('aura/shutting/down/', 'true')

  setTimeout(() => {
    handleAppExit()
  }, 2000)

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
/**
 * Adjusts the screen brightness on Linux by writing to the brightness file.
 * @param {number} level - Brightness level (should be between 0 and maxBrightness).
 */
function setBrightness(level) {

  var backlightPathBase = '/sys/class/backlight'; // Base path for backlight control

  // Get the backlight directory
  const backlightDirs = fs.readdirSync(backlightPathBase);
  if (backlightDirs.length === 0) {
    console.error('No backlight controllers found.');
    return;
  }

  console.log(backlightDirs)

  // Use the first available backlight controller
  const backlightPath = `${backlightPathBase}/${backlightDirs[0]}`;

  console.log(backlightPath)

  // Read the maximum brightness value
  const maxBrightness = parseInt(fs.readFileSync(`${backlightPath}/max_brightness`, 'utf-8'));

  // Validate and clamp the brightness level
  if (isNaN(level) || level < 0) {
    level = 0;
  } else if (level > maxBrightness) {
    level = maxBrightness;
  }

  // Set the brightness level
  try {
    fs.writeFileSync(`${backlightPath}/brightness`, level.toString());
    console.log(`Brightness set to ${level}`);
  } catch (err) {
    console.error('Failed to set brightness:', err);
  }
}
