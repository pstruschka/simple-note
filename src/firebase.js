import firebase from 'firebase';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCQIjtSfpLHefrt2GxtXlk0VrUVZByvJE4',
  authDomain: 'simple-note-c09c8.firebaseapp.com',
  databaseURL: 'https://simple-note-c09c8.firebaseio.com',
  projectId: 'simple-note-c09c8',
  storageBucket: 'simple-note-c09c8.appspot.com',
  messagingSenderId: '1073205324069',
};

firebase.initializeApp(config);

export default firebase;
export const db = firebase.database();
export const auth = firebase.auth();
