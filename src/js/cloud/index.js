const functions = require('firebase-functions');
const admin = require("firebase-admin");
const dbUrl = "FIXME"; // https://<BUCKET_NAME>.firebaseio.com
const myBucket = 'FIXME';  //<BUCKET_NAME>.appspot.com 
var serviceAccount = require("./service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: dbUrl
});

const db = admin.firestore();

// onCreate get ref/url to new media file on cldStor and insert fireBse pointer to it
// fireBse bucket 'media' is DB entry containing the CDN type URL for media and for html.media.tags
 exports.setMedia = functions.storage.bucket(myBucket).object().onFinalize(async (object) => {
   //const fileBucket = object.bucket; // The Storage bucket that contains the file.
   const filePath = object.name; // File path in the bucket.
   const contentType = object.contentType; // File content type.

   const url = "https://storage.googleapis.com/" +myBucket +"/" +filePath;
   // const url = "https://storage.googleapis.com/" + fileBucket +"/static/" +filePath;
   var json = {};
   json['type'] = contentType;
   json['url'] = url;
   var mediaRef = db.collection('media').doc();
     mediaRef.set(json).then(ref => {
       return console.log('onINS url ' +url);
     }).catch(err => {
      console.log('FunctCl :audio insert ', err);
    });
});
