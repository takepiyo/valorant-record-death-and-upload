///////////////////replay media settings/////////////////////

let turnedOn = false;
let target_path;

// Turn on replays
async function turnOnReplays() {
  if (turnedOn) {
    console.log('turnOnReplays(): replays already turned on');
    return;
  }

  // target_path = `C:\\Users\\exm_c\\Videos\\Overwolf\\Valorant Record at death\\VALORANT\\${new Date().toLocaleString('sv-SE')}`;
  const parameters = {
    "settings": {
      video: {
        buffer_length: 30000,
        fps: 144,
        // sub_folder_name: target_path
      }
    }
  };

  overwolf.media.replays.turnOn(parameters, result => {
    if (!result.success) {
      console.log('overwolf.media.replays.turnOn(): error:', result.error, result);
      return;
    }

    console.log('overwolf.media.replays.turnOn(): success:', result);

    // Store this for stopping the stream and manipulating stream settings
    turnedOn = true;
    target_path = result.mediaFolder;
    console.log(target_path);
  });

  console.log('overwolf.media.replays.turnOn(): waiting for response');
}

// Turn off replays
function turnOffReplays() {
  if (!turnedOn) {
    console.log('turnOffReplays(): replays already turned off');
    return;
  }

  overwolf.media.replays.turnOff(result => {
    if (result.success) {
      console.log('overwolf.media.replays.turnOff(): success:', result);
      turnedOn = false;
    } else {
      console.log('overwolf.media.replays.turnOff(): error:', result.error, result);
    }
  });
}

// Get replays state
function getReplayState() {
  overwolf.media.replays.getState(result => {
    if (result.success) {
      const isOnText = result.isOn ? 'on' : 'off';

      console.log(
        `overwolf.media.replays.getState(): is turned ${isOnText}:`,
        result
      );

      turnedOn = result.isOn;
    } else {
      console.log('overwolf.media.replays.getState(): error:', result.error, result);
    }
  });
}

// Capture a replay of past 20 and future 5 seconds
function capture() {
  if ( !turnedOn ) {
    console.log('capture(): replays turned off, you need to turn on replay API first');
    return;
  }

  const
    pastDuration = 5000,
    futureDuration = 500;

  const callback = result => {
    if (result.success) {
      console.log('overwolf.media.replays.capture(): started capturing:', result);
    } else {
      console.log(
        'overwolf.media.replays.capture(): callback error:',
        result.error,
        result
      );
    }
  };

  const captureFinishedCallback = result => {
    if (result.success) {
      console.log('overwolf.media.replays.capture(): finished successfully:', result);
    } else {
      console.log(
        'overwolf.media.replays.capture(): captureFinishedCallback error:',
        result.error,
        result
      );
    }
  };

  overwolf.media.replays.capture(
    pastDuration,
    futureDuration,
    captureFinishedCallback,
    callback
  );
}

// Open the media folder in Explorer
function openFolder() {
  overwolf.utils.openWindowsExplorer(
    'overwolf://media/replays/Replay+Manual+Sample+App',
    result => console.log('overwolf.utils.openWindowsExplorer():', result)
  );
}

// Opens the developer console
// PLEASE NOTE: It's not advised to use this method in production apps
function openConsole() {
  overwolfInternal.extensions.showDevTools(location.hostname, 'background');
}

// Opens the UI window
function openMainWindow() {
  overwolf.windows.obtainDeclaredWindow('main', result => {
    if (result.success && result.window && result.window.id) {
      overwolf.windows.restore(result.window.id, null);
    }
  });
}

window.turnOnReplays = turnOnReplays;
window.turnOffReplays = turnOffReplays;
window.getReplayState = getReplayState;
window.capture = capture;
window.openFolder = openFolder;
window.openConsole = openConsole;

// Log relevant streaming events

overwolf.media.replays.onCaptureError
  .addListener(e => console.log('overwolf.media.replays.onCaptureError:', e));

overwolf.media.replays.onCaptureWarning
  .addListener(e => console.log('overwolf.media.replays.onCaptureWarning:', e));

overwolf.media.replays.onHighlightsCaptured
  .addListener(e => console.log('overwolf.media.replays.onHighlightsCaptured:', e));

overwolf.media.replays.onReplayServicesStarted
  .addListener(e => console.log('overwolf.media.replays.onReplayServicesStarted:', e));

// overwolf.media.replays.onCaptureStopped
//   .addListener(e => console.log('overwolf.media.replays.onCaptureStopped:', e));

overwolf.extensions.onAppLaunchTriggered.addListener(openMainWindow);
openMainWindow();

///////////////////websocket for local python(ffmpeg)///////////////////

var websocket;

function connect_local_python(){
    webSocket = new WebSocket("ws://localhost:8010"); // インスタンスを作り、サーバと接続
    // ソケット接続すれば呼び出す関数を設定
    webSocket.onopen = function(message){
      console.log("Server connect... OK\n");
    };

    // ソケット接続が切ると呼び出す関数を設定
    webSocket.onclose = function(message){
      console.log("Server Disconnect... OK\n");
    };

    // ソケット通信中でエラーが発生すれば呼び出す関数を設定
    webSocket.onerror = function(message){
      console.log("error...\n");
    };

    // ソケットサーバからメッセージが受信すれば呼び出す関数を設定
    webSocket.onmessage = function(message){
      console.log("Receive => "+message.data+"\n");
    };
  }

// サーバにメッセージを送信する関数
function sendTargetPath(target_path){
  webSocket.send(target_path);
}

// サーバとの通信を切断する関数
function disconnect(){
  webSocket.close();
}

// function concat_movie(){
//   var child_process = require("child_process");
//   child_process.exec(`(for %i in ("${target_path}\\*.mp4") do @echo file '%i') > "${target_path}\\list.txt"`)
//   child_process.exec(`ffmpeg -f concat -safe 0 -i "${target_path}\\list.txt" -c copy "${target_path}\\concatenated.mp4"`)
// }

///////////////////valorant event settings///////////////////

var g_interestedInFeatures = [
  'game_info',
  'me',
  'match_info',
  'kill',
  'death',
  'gep_internal'
];

var onErrorListener,onInfoUpdates2Listener,	onNewEventsListener;

function registerEvents() {

  // onErrorListener = function(info) {
  //   console.log("Error: " + JSON.stringify(info));
  // }
  
  onInfoUpdates2Listener = function(info) {
    if("match_info" in info.info){
      if("game_mode" in info.info.match_info){
        let game_mode = info.info.match_info.game_mode;
        game_mode = JSON.parse(info.info.match_info.game_mode);
        if("ranked" in game_mode){
          let ranked = game_mode.ranked;
          if(ranked == 1){ // COMPETITION OR DEATHMATCH
            // if(ranked == 1 || ranked == 2){ // COMPETITION OR DEATHMATCH
            turnOnReplays();
            connect_local_python();
          } 
        }
      }
    }  
  }


  onNewEventsListener = function(info) {
    console.log("EVENT FIRED: " + JSON.stringify(info));
    if(info.events[0].name == "death"){
      capture();
    }
    if(info.events[0].name == "match_end"){
      turnOffReplays();
      sendTargetPath(target_path);
      disconnect();
    }
  }

  // general events errors
  // overwolf.games.events.onError.addListener(onErrorListener);
  
  // "static" data changed (total kills, username, steam-id)
  // This will also be triggered the first time we register
  // for events and will contain all the current information
  overwolf.games.events.onInfoUpdates2.addListener(onInfoUpdates2Listener);									
  // an event triggerd
  overwolf.games.events.onNewEvents.addListener(onNewEventsListener);
}

function unregisterEvents() {
  // overwolf.games.events.onError.removeListener(onErrorListener);
  overwolf.games.events.onInfoUpdates2.removeListener(onInfoUpdates2Listener);
  overwolf.games.events.onNewEvents.removeListener(onNewEventsListener);
}

function gameLaunched(gameInfoResult) {
  if (!gameInfoResult) {
    return false;
  }

  if (!gameInfoResult.gameInfo) {
    return false;
  }

  if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
    return false;
  }

  if (!gameInfoResult.gameInfo.isRunning) {
    return false;
  }

  // NOTE: we divide by 10 to get the game class id without it's sequence number
  if (Math.floor(gameInfoResult.gameInfo.id/10) != 21640) {
    return false;
  }

  console.log("Valorant Launched");
  return true;

}

function gameRunning(gameInfo) {

  if (!gameInfo) {
    return false;
  }

  if (!gameInfo.isRunning) {
    return false;
  }

  // NOTE: we divide by 10 to get the game class id without it's sequence number
  if (Math.floor(gameInfo.id/10) != 21640) {
    return false;
  }

  console.log("Valorant running");
  return true;

}


function setFeatures() {
  overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, function(info) {
    if (info.status == "error")
    {
      console.log("Could not set required features: " + info.reason);
      console.log("Trying in 2 seconds");
      window.setTimeout(setFeatures, 2000);
      return;
    }

    console.log("Set required features:");
    console.log(JSON.stringify(info));
  });
}

// Start here
overwolf.games.onGameInfoUpdated.addListener(function (res) {
  if (gameLaunched(res)) {
    unregisterEvents();
    registerEvents();
    setTimeout(setFeatures, 1000);
  }
  console.log("onGameInfoUpdated: " + JSON.stringify(res));
});

overwolf.games.getRunningGameInfo(function (res) {
  if (gameRunning(res)) {
    registerEvents();
    setTimeout(setFeatures, 1000);
  }
  console.log("getRunningGameInfo: " + JSON.stringify(res));
});
