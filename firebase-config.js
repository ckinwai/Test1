// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkSDuhYnBaZfpDp4fA2r1IbN7hVwzP9kc",
  authDomain: "view-of-fortune.firebaseapp.com",
  projectId: "view-of-fortune",
  storageBucket: "view-of-fortune.firebasestorage.app",
  messagingSenderId: "663378316885",
  appId: "1:663378316885:web:ee66a71c3f8d56475d8edc",
  measurementId: "G-EQKZN1J6ZL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
