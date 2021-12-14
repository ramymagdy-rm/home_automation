import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged,
  sendPasswordResetEmail 
} from 'firebase/auth'
import {
  getDatabase, ref, onValue
} from 'firebase/database'

const _collection = 'home_automation'
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// init firebase
const app = initializeApp(firebaseConfig)

// init services
const db = getFirestore()
const auth = getAuth()
const rtdb = getDatabase();

// DOM elements

const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');

// init user interface
// Create Temperature Gauge
var gaugeTemp = new LinearGauge({
  renderTo: 'gauge-temperature',
  width: 100,
  height: 300,
  units: "Temperature °C",
  minValue: -30,
  startAngle: 90,
  ticksAngle: 180,
  maxValue: 40,
  colorValueBoxRect: "#049faa",
  colorValueBoxRectEnd: "#049faa",
  colorValueBoxBackground: "#f1fbfc",
  valueDec: 2,
  valueInt: 2,
  majorTicks: [
      "-30",
      "-20",
      "-10",
      "0",
      "10",
      "20",
      "30",
      "40"
  ],
  minorTicks: 9,
  strokeTicks: true,
  highlights: [
      {
          "from": 30,
          "to": 40,
          "color": "rgba(200, 50, 50, .75)"
      },
      {
          "from": -30,
          "to": -20,
          "color": "rgba(50, 50, 200, .75)"
      }
  ],
  colorPlate: "#fff",
  colorBarProgress: "#CC2936",
  colorBarProgressEnd: "#049faa",
  borderShadowWidth: 0,
  borders: false,
  needleType: "arrow",
  needleWidth: 2,
  needleCircleSize: 7,
  needleCircleOuter: true,
  needleCircleInner: false,
  animationDuration: 1500,
  animationRule: "linear",
  barWidth: 10,
}).draw();
  
// Create Humidity Gauge
var gaugeHum = new LinearGauge({
  renderTo: 'gauge-humidity',
  width: 100,
  height: 300,
  units: "Humidity (%)",
  minValue: 0,
  startAngle: 90,
  ticksAngle: 180,
  maxValue: 100,
  colorValueBoxRect: "#049faa",
  colorValueBoxRectEnd: "#049faa",
  colorValueBoxBackground: "#f1fbfc",
  valueDec: 2,
  valueInt: 2,
  majorTicks: [
      "0",
      "10",
      "20",
      "30",
      "40",
      "50",
      "60",
      "70",
      "80",
      "90",
      "100"
  ],
  minorTicks: 2,
  strokeTicks: true,
  highlights: [
      {
          "from": 80,
          "to": 100,
          "color": "#03C0C1"
      }
  ],
  colorPlate: "#fff",
  colorBarProgress: "#CC2936",
  colorBarProgressEnd: "#049faa",
  borderShadowWidth: 0,
  borders: false,
  needleType: "arrow",
  needleWidth: 2,
  animationDuration: 1500,
  animationRule: "linear",
  tickSide: "left",
  numberSide: "left",
  needleSide: "left",
  barWidth: 10,
  barBeginCircle: false,
}).draw();


var gaugeSoil_1 = new LinearGauge({
  renderTo: 'gauge-soil_1',
  width: 100,
  height: 300,
  units: "Soil moist (%)",
  minValue: 0,
  startAngle: 90,
  ticksAngle: 180,
  maxValue: 100,
  colorValueBoxRect: "#049faa",
  colorValueBoxRectEnd: "#049faa",
  colorValueBoxBackground: "#f1fbfc",
  valueDec: 2,
  valueInt: 2,
  majorTicks: [
      "0",
      "10",
      "20",
      "30",
      "40",
      "50",
      "60",
      "70",
      "80",
      "90",
      "100"
  ],
  minorTicks: 2,
  strokeTicks: true,
  highlights: [
      {
          "from": 30,
          "to": 70,
          "color": "rgba(50, 50, 200, .75)"
      }
  ],
  colorPlate: "#fff",
  colorBarProgress: "#CC2936",
  colorBarProgressEnd: "#049faa",
  borderShadowWidth: 0,
  borders: false,
  needleType: "arrow",
  needleWidth: 2,
  animationDuration: 1500,
  animationRule: "linear",
  tickSide: "left",
  numberSide: "left",
  needleSide: "left",
  barWidth: 10,
  barBeginCircle: false,
}).draw();

var gaugeSoil_2 = new LinearGauge({
  renderTo: 'gauge-soil_2',
  width: 100,
  height: 300,
  units: "Soil moist (%)",
  minValue: 0,
  startAngle: 90,
  ticksAngle: 180,
  maxValue: 100,
  colorValueBoxRect: "#049faa",
  colorValueBoxRectEnd: "#049faa",
  colorValueBoxBackground: "#f1fbfc",
  valueDec: 2,
  valueInt: 2,
  majorTicks: [
      "0",
      "10",
      "20",
      "30",
      "40",
      "50",
      "60",
      "70",
      "80",
      "90",
      "100"
  ],
  minorTicks: 2,
  strokeTicks: true,
  highlights: [
      {
          "from": 30,
          "to": 70,
          "color": "rgba(50, 50, 200, .75)"
      }
  ],
  colorPlate: "#fff",
  colorBarProgress: "#CC2936",
  colorBarProgressEnd: "#049faa",
  borderShadowWidth: 0,
  borders: false,
  needleType: "arrow",
  needleWidth: 2,
  animationDuration: 1500,
  animationRule: "linear",
  tickSide: "left",
  numberSide: "left",
  needleSide: "left",
  barWidth: 10,
  barBeginCircle: false,
}).draw();
  
// logging in and out
const loginForm = document.querySelector('.login')
loginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  login();
})

const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', () => {
  logout();
})

function login(){
  const email = loginForm.email.value
  const password = loginForm.password.value

  signInWithEmailAndPassword(auth, email, password)
    .then(cred => {
      console.log('user logged in:', cred.user)
    })
    .catch(err => {
      console.log(err.message)
      window.alert("Error : " + err.message);
    })
}

function logout(){
  signOut(auth)
    .then(() => {
      console.log('user signed out')
    })
    .catch(err => {
      console.log(err.message)
    })
}

// subscribing to auth changes
const unsubAuth = onAuthStateChanged(auth, (user) => {
  //console.log('user status changed:', user)
  if (user) {
    // User is signed in.
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";

    if(user != null){
      var email_id = user.email;
      console.log("Welcome User : " + email_id);
    }

  } else {
    // No user is signed in.
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";

  }
})
