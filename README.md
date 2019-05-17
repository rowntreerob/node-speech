# nodeSpeech - combine recorder.js, speech Recognition, Firebase DB using Express and Webpack

Provides media store backend with barebones UI allowing audio recording to narrate any photo. While the mic is recording ( opus codec to opus file on Cloud Storage bucket that you config), continuous STT recognizes speech, updating in real time as you talk a UI text field with recognition result (intermediate and final speech results).

Firebase Storage media and pointers. Cloud storage used as CDN type for the audio file (opus). Separately, data updates write 2 records to Firebase DB 'media' collection holding media URL for audio recording and the recognized text (STT final result of recognition API).

Intended use. As a webView component where the input photo is displayed with mic control and text field for STT output. User starts recording, sees STT results as they speak. DB layer allows for extending the UI with an audio tag for playback so they can record-replay the audio while viewing the actual text from the recorded audio.  

When you run `npm run buildDev`, Javascript, HTML, and CSS files are unminified and not uglified, meaning that you can easily inspect them in Chrome Dev Tools. Hot Module Reloading is enabled via `webpack-dev-middleware` and `webpack-hot-middleware`.

When you run `npm run buildProd`, Javascript, HTML, and CSS files are all minified and uglified, and images are encoded as Base64 directly into your CSS file, which results in less calls to the server for image files.

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
    [firebase steps](https://firebase.google.com/docs/web/setup) 1, 2 setup your FB project
    for FB step 3, [set up FB SDK](https://firebase.google.com/docs/admin/setup/#add_the_sdk)
      see 'To generate a private key file for your service account' and 3 steps to
      create/ download the file.
      Rename/move download to 'src/js/service-account.json'
    FB console 'database' tab use controls to add collection "media"
    FB Storage tab click on "create folder" and make   "audio" folder
    [functions steps](https://firebase.google.com/docs/functions/get-started) 1, 2
    manual move  - src/js/cloud/index.js to functions folder created during above

    npm run buildDev        // for development
        // OR
    npm run buildProd

    npm start               // navigate to localhost:8080 for local dev

### For testing

    npm test                // runs test
    npm run coverage        // generates a coverage report

## Security

Please ensure that your version of Node and NPM are up to date, and run `npm audit` after installation to ensure that no vulnerabilities exist. If they do, follow the audits instructions on how to resolve them.
