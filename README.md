# nodeSpeech - combine recorder.js, speech Recognition, Firebase DB using Express and Webpack

Provides media store backend with barebones UI allowing audio recording to narrate any photo. While the mic is recording ( opus codec to opus file on Cloud Storage bucket that you config), continuous STT recognizes speech, updating in real time as you talk a UI text field with recognition result (intermediate and final speech results).

Firebase Storage media and pointers. Cloud storage used as CDN type for the audio file (opus). Separately, data updates write 2 records to Firebase DB 'media' collection holding media URL for audio recording and the recognized text (STT final result of recognition API).

Intended use. As a webView component where the input photo is displayed with mic control and text field for STT output. User starts recording, sees STT results as they speak. DB layer allows for extending the UI with an audio tag for playback so they can record-replay the audio while viewing the actual text from the recorded audio.  

When you run `npm run buildDev`, it builds version that can then be run with `npm run start`.


## Recorder and Opus encoding from submodule

Standard submodule not used to avoid dragging in emscripten which would needlessly complicate build stack. To get 3 minified files from this [git project](https://github.com/chris-rudmin/opus-recorder) , a script in ./bin uses Curl to get those 3 minified js files.   

## Installation & Usage

    git clone https://github.com/bengrunfeld/expack.git
    cd expack
    npm install
    cd functions
    npm install
    cd ../bin
    ./conf.sh
    cd ..

[firebase steps](https://firebase.google.com/docs/web/setup)

[firebase SDK](https://firebase.google.com/docs/admin/setup/#add_the_sdk)

    firebase steps 1, 2 from first above link. setup your FB project
    firebase SDK link , 'Add the SDK' steps , then: see 'Initialize the SDK'
      see 'To generate a private key file for your service account' and 3 steps to
      create/ download the file-key for express server side.
      Rename/move file-key download to 'src/js/service-account.json'
    FB console 'database' tab use controls to add collection "media"
    FB Storage tab click on "create folder" and make   "audio" folder

[functions steps](https://firebase.google.com/docs/functions/get-started)

    steps  1, 2 in above link will create 'functions' directory
    manual move  - src/js/cloud/index.js to 'functions' folder created during above
    manual code edits to configure the Firebase bucketName in "FIXME"
      fix src/server/server-dev.js
      fix functions/index.js

[Cloud Speech API](https://console.cloud.google.com/apis/dashboard)

    GoogleCloud Speech API needs to be enabled in the Services console        
    visit link above , main menu select 'APIs and Services'
    then on toolbar, select your project (Firebase)     
    click "enable apis and services"
    search for api "cloud-speech-to-text"  and enable it
    'service-account.json' credential now covers both FB and Speech.

[Cloud Speech background](https://github.com/googleapis/nodejs-speech) if there are issues

    npm run buildDev        // for development
        // OR
    npm run buildProd       // not implemented yet

    npm start               // navigate to localhost:8080 for local dev


## Security

Please ensure that your version of Node and NPM are up to date, and run `npm audit` after installation to ensure that no vulnerabilities exist. If they do, follow the audits instructions on how to resolve them.
