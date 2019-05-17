#!/bin/bash
# get 3 minified from separate github project without getting into build(submodule)
# from an emscripten project and i did not want to drag in that dependency 
[ -d ../configs ] && rm -rf ../configs
mkdir ../configs
curl -L -o ../configs/encoderWorker.min.js https://raw.githubusercontent.com/chris-rudmin/opus-recorder/master/dist/encoderWorker.min.js
curl -L -o ../configs/encoderWorker.min.wasm https://raw.githubusercontent.com/chris-rudmin/opus-recorder/master/dist/encoderWorker.min.wasm
curl -L -o ../configs/recorder.min.js https://raw.githubusercontent.com/chris-rudmin/opus-recorder/master/dist/recorder.min.js
