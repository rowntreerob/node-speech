import path from 'path'
import express from 'express'
import webpack from 'webpack'
// import config from '../../webpack.dev.config.js'

const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();
const uuidv4 = require('uuid/v4');// ⇨ '3a017fc5-4f50-4db9-b0ce-4547ba0a1bfd'

const app = express(),
            DIST_DIR = __dirname,
            HTML_FILE = path.join(DIST_DIR, 'index.html')

app.use(express.static('./'));
var intoStream = require('into-stream');
var bodyParser = require('body-parser');
var rawParser = bodyParser.raw({type: 'audio/ogg', limit: '1250kb' });
var jsnParser = bodyParser.json({type: 'application/json'})
var admin = require("firebase-admin");
var serviceAccount = require("../../dist/service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "FIXME" // https://<BUCKET_NAME>.firebaseio.com
});

const fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const myBucket = storage.bucket('FIXME'); //<BUCKET_NAME>.appspot.com
// not use do to cloud functs onCreate
var getCloudUrl = function(file) {
  const config = {
    action: 'read',
    expires: '03-17-2025'
  };
  return file.getSignedUrl(config);
}

var postRouteHandler = function(req, res) {
  let text = req.body;
  console.log('typ ' +typeof text)
  //if (! shouldPipe(text)) {
    //return res.sendStatus(400); // or whatever
  //}
  let rfil = 'audio/' +uuidv4() + '.opus';
  const file = myBucket.file(rfil);
  //console.log('audioSt 1 ' + text.length + ' ' +rfil)
  let stream     = intoStream(text);
  var otstrm = file.createWriteStream({
    metadata: {
      contentType: 'audio/ogg',
      metadata: {
        custom: 'metadata'
      }
    }
  });
  stream.pipe( otstrm )  // does emit "finish" but just go w it
  .on('error', function(err) {console.log(err);
    res.send('Error')})
  .on('finish', function() {
    res.send('Done')

  });
}
app.use('/audio', [rawParser, postRouteHandler]);

// STT from speech api.finalRslt to DB.media collection
var postRecSpeech = function(txt) {
  var bdy = {}
  //bdy['url'] = urlrsp;
  //bdy['name'] = 'my-spcl-9i876.opus'
  bdy['mime'] = 'text/html'
  bdy['speech'] = txt;
  var db = admin.firestore();
  db.collection('media').add(bdy).then(rslt => {
    console.log('DB has speech ' +rslt)
  })
};

const server = require('http').createServer(app);
const io = require('socket.io')(server);
// must agree w encoding from 'recorder.min.js'
const config = {
  encoding: 'OGG_OPUS',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
};

const request = {
  config,
  interimResults: true, //Get interim results from stream
};
// =========================== SOCKET.IO CLOUD SPEECH PROTO ============== //
io.on('connection', function (client) {
    console.log('Client Connected to server');
    let recognizeStream = null;

    client.on('join', function (data) {
        client.emit('messages', 'Socket Connected to Server');
    });

    client.on('messages', function (data) {
        client.emit('broad', data);
    });

    client.on('startGoogleCloudStream', function (data) {
       console.log('STRMbeg');
        startRecognitionStream(this, data);
    });

    client.on('endGoogleCloudStream', function (data) {
      console.log('STRMend');
        stopRecognitionStream();
    });

    client.on('binaryData', function (data) {
         //console.log('data ' +data.length); //log binary data
        if (recognizeStream !== null) {
          //console.log('toSTRM')
            recognizeStream.write(data);
        }
    });

    function startRecognitionStream(client, data) {
        recognizeStream = speechClient.streamingRecognize(request)
            .on('error', console.error)
            .on('data', (data) => {
              /*  Dev only logging
                process.stdout.write(
                    (data.results[0] && data.results[0].alternatives[0])
                        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                        : `\n\nReached transcription time limit, press Ctrl+C\n`);
              */
                client.emit('speechData', data);
                // if end of utterance, let's restart stream
                // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
                if (data.results[0] && data.results[0].isFinal) {
                    postRecSpeech(data.results[0].alternatives[0].transcript);
                    stopRecognitionStream();
                    //startRecognitionStream(client);
                    // console.log('restarted stream serverside');
                }
            });
    }

    function stopRecognitionStream() {
        if (recognizeStream) {
            recognizeStream.end();
        }
        recognizeStream = null;
    }
});

app.get('/index.html', (req, res) => {
    res.sendFile(HTML_FILE)
})

var url = 'http://localhost:8080/audio';
const PORT = process.env.PORT || 8080

server.listen(PORT, function() {
    console.log('app running http://localhost:' + PORT  +' ' +__dirname);
});
