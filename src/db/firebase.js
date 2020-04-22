import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBtVIquQmGaP-O-pF-an8zp9yVkxhM5KEg',
  authDomain: 'shopping-assistant-ab957.firebaseapp.com',
  databaseURL: 'https://shopping-assistant-ab957.firebaseio.com',
  projectId: 'shopping-assistant-ab957',
  storageBucket: 'shopping-assistant-ab957.appspot.com',
  messagingSenderId: '455842556192',
  appId: '1:455842556192:web:76a8c80acdfc489ab94f45',
  measurementId: 'G-4CMD529XDK',
}

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const firestore = firebase.firestore()

export { auth, firestore }
