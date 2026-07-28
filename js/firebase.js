const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAp2wTe15WI6QMKrR8vle1NPFTkSczH1fc",
  authDomain:        "miceapp-saas.firebaseapp.com",
  projectId:         "miceapp-saas",
  storageBucket:     "miceapp-saas.firebasestorage.app",
  messagingSenderId: "488588106232",
  appId:             "1:488588106232:web:d52123debf766216351e0d"
};

if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db   = firebase.firestore();
