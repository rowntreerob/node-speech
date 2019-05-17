import logMessage from './js/logger'
import './css/style.css'

//   import {MDCMenu} from '@material/menu';  for the mic icon
// Log message to console
/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */
logMessage('Its finished!!')

  //div rec_button for recorder
var recordTime = 0;
var startTime = 0;
var endTime = 0;
var recorder, holdAudio;
var rec_button = document.querySelector('#rec_button');

var mime = require('mime-types');
import io from 'socket.io-client';
const socket = io("http://localhost:8080");
let streamStreaming = false;
window.onload = init;

/*
OPUS encoder in js.min file from separate project.
 -- git node opus rudmen
Encoder.config vals can go here in the constructor.
Note stream:true will call ondataavailable for
 EACH audio. page/frame
*/
//  var spnr = document.getElementById("spn");
function init(){
  try {
    recorder = new Recorder({
      monitorGain: 0,
      numberOfChannels: 1,
      bitRate: 44000,
      encoderSampleRate: 16000,
      originalSampleRateOverride: 16000,
      encoderPath: "./encoderWorker.min.js",
      streamPages: true
    });
  } catch(e){
      alert('ERR browser not supporting voice record ' +e);
  }
  //back navig bug  need to bettr ctl valueOf rec-button
  rec_button.classList.add("enabled");

  recorder.onstart = function(e){
    console.log('Recorder is started' );
    holdAudio = [];
    socket.emit('startGoogleCloudStream', ''); //init socket
    streamStreaming = true;
  }; //end start.rec

  recorder.onstop = function(e){
    console.log('Recorder is stopped');
    endRecord();
    setTimeout(function(){
      socket.emit('endGoogleCloudStream', '');
      streamStreaming = false;
    }, 2500);
    //changeBackground(take_audio_btn, '#111');
    //init.disabled = false;
    //pause.disabled = resume.disabled = stopButton.disabled = start.disabled = true;
  };

  recorder.onpause = function(e){
    console.log('Recorder is paused');
    //init.disabled = pause.disabled = start.disabled = true;
    //resume.disabled = stopButton.disabled = false;
  };

  recorder.onresume = function(e){
    console.log('Recorder is resuming');
    //init.disabled = start.disabled = resume.disabled = true;
    //pause.disabled = stopButton.disabled = false;
  };

//NOTE depends on Encoder.config.. 'recorder.streamPages: true|false'
//SEP PROJECT - recorderjs <opus recorder/encoder>
// false -> ONLY 1 call to onData... true -> many calls
  recorder.ondataavailable = function(data){
    //cp data arr, push to hold , socket.io to googleStreamRecognize
    var newcp = data.slice(0);
    holdAudio.push(newcp);
    socket.emit('binaryData', data.buffer);
  }; //end of dataAvail CB
}

function endRecord(){
//TODO compression needs to add to express midware
  var blob = new Blob( holdAudio, { type: 'audio/ogg' } );
  //var ext = mime.extension('audio/ogg');
  var url = '//localhost:8080/audio';  //cloud storage handler in express.routes
  //fetch
  var type = blob.type === undefined ? mime : blob.type;
  fetch(url, { // Your POST endpoint
    method: 'POST',
    headers: {
     "Content-Type": blob.type
    },
    body: blob // audio file , mic to blob
  }).then(response => {
    response.text().then(txt => {
      console.log('Audio-2-Cloud')
    })
  })
} //endRecord

rec_button.addEventListener("click", function(e){
  e.preventDefault();
  //stop_btn.classList.remove("disabled");
  // rec.init -> rec.start  using CB in getUserMedia
  if(recorder.state === "inactive"){
    //changeBackground(rec_audio_btn, '#ff3333');
    recorder.start();
    startTime = new Date().getTime();
    return true;
  }
  //bug fetchPost the photo if ffmpicurl is not
  if(recorder.state === "recording") {

    recorder.stop();
    endTime = new Date().getTime();
    recordTime = endTime - startTime;
    return true;
  }
});  //end recrdbttnListener

//================= SOCKET IO =================
socket.on('connect', function (data) {
  socket.emit('join', 'Server Connected to Client');
});

socket.on('messages', function (data) {
  console.log(data);
});
//  <div id="bubblsp" is UI to set
socket.on('speechData', function (data) {
  // console.log(data.results[0].alternatives[0].transcript);
  var resultText = document.getElementById("bubblsp");
  var dataFinal = undefined || data.results[0].isFinal;
  //set UI , set speech thats post'd to parse
  if (dataFinal === false) {
    resultText.innerHTML = data.results[0].alternatives[0].transcript
    //ffmAudSpeech = data.results[0].alternatives[0].transcript
  }
  else{
    resultText.innerHTML = data.results[0].alternatives[0].transcript;
    //ffmAudSpeech = data.results[0].alternatives[0].transcript
    console.log("Google Speech sent 'final' Sentence.");
    socket.close();
  }
})

window.onbeforeunload = function () {
     if (streamStreaming) { socket.emit('endGoogleCloudStream', ''); }
   };
