// Firebase Configuration
// To use Firebase: create a project at https://console.firebase.google.com
// 1. Create a Web App and paste your config below
// 2. Enable Firestore Database in test mode

var firebaseConfig = {
    apiKey: "AIzaSyCb7Y18ELq17M4XLQui3IdCvkvgqgeokiw",
    authDomain: "suj-planner.firebaseapp.com",
    projectId: "suj-planner",
    storageBucket: "suj-planner.firebasestorage.app",
    messagingSenderId: "113004826763",
    appId: "1:113004826763:web:1487190171bc37f5ac048e",
    measurementId: "G-9MB3WL2D1P"
};

var db = null;
var isFirebaseConfigured = false;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        isFirebaseConfigured = true;
        console.log("Firebase initialized successfully.");
    } else {
        console.log("Firebase not configured. Using localStorage.");
    }
} catch (e) {
    console.error("Firebase initialization error:", e);
}

// Data Interface - Firebase + LocalStorage fallback
var DataService = {
    async getDailyData(dateStr) {
        if (isFirebaseConfigured && db) {
            try {
                var docSnap = await db.collection("daily_routines").doc(dateStr).get();
                if (docSnap.exists) return docSnap.data();
                return null;
            } catch (e) {
                console.error("Error reading from Firebase", e);
                return this.getLocalData(dateStr);
            }
        }
        return this.getLocalData(dateStr);
    },

    async saveDailyData(dateStr, data) {
        if (isFirebaseConfigured && db) {
            try {
                await db.collection("daily_routines").doc(dateStr).set(data);
                this.saveLocalData(dateStr, data); // also keep local backup
                return true;
            } catch (e) {
                console.error("Error saving to Firebase", e);
                this.saveLocalData(dateStr, data);
                return false;
            }
        } else {
            this.saveLocalData(dateStr, data);
            return true;
        }
    },

    getLocalData(dateStr) {
        var data = localStorage.getItem("routine_" + dateStr);
        return data ? JSON.parse(data) : null;
    },

    saveLocalData(dateStr, data) {
        localStorage.setItem("routine_" + dateStr, JSON.stringify(data));
    }
};
