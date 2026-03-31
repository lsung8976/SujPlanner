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
var auth = null;
var isFirebaseConfigured = false;
var currentUser = null;
var _googleAccessToken = null;

// Allowed user emails (add your email here to restrict access)
var ALLOWED_EMAILS = ['lsung8976@gmail.com'];

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        isFirebaseConfigured = true;
        console.log("Firebase initialized successfully.");
    } else {
        console.log("Firebase not configured. Using localStorage.");
    }
} catch (e) {
    console.error("Firebase initialization error:", e);
}

// ===== AUTH =====
var googleProvider = null;
if (auth) {
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
}

function setupAuth() {
    var loginOverlay = document.getElementById('login-overlay');
    var loginBtn = document.getElementById('google-login-btn');
    var logoutBtn = document.getElementById('logout-btn');
    var userInfo = document.getElementById('user-info');
    var userAvatar = document.getElementById('user-avatar');
    var userName = document.getElementById('user-name');

    if (!auth) {
        // No auth configured, skip login
        loginOverlay.classList.add('hidden');
        return;
    }

    loginBtn.addEventListener('click', function() {
        auth.signInWithPopup(googleProvider).then(function(result) {
            _googleAccessToken = result.credential.accessToken;
        }).catch(function(error) {
            console.error('Login error:', error);
            alert('로그인 실패: ' + error.message);
        });
    });

    logoutBtn.addEventListener('click', function() {
        auth.signOut();
    });

    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Check if allowed
            if (ALLOWED_EMAILS.length > 0 && ALLOWED_EMAILS.indexOf(user.email) < 0) {
                alert('접근 권한이 없습니다: ' + user.email);
                auth.signOut();
                return;
            }

            currentUser = user;
            loginOverlay.classList.add('hidden');
            userInfo.style.display = 'flex';
            userAvatar.src = user.photoURL || '';
            userName.textContent = user.displayName || user.email;

            // Init app after login, then sync
            if (typeof init === 'function') init();
            if (typeof syncLocalToFirebase === 'function') syncLocalToFirebase();
        } else {
            currentUser = null;
            _googleAccessToken = null;
            loginOverlay.classList.remove('hidden');
            userInfo.style.display = 'none';
        }
    });
}

// Google Calendar API
async function fetchGoogleCalendarEvents(dateStr) {
    if (!_googleAccessToken) return [];

    var dayStart = new Date(dateStr + 'T00:00:00').toISOString();
    var dayEnd = new Date(dateStr + 'T23:59:59').toISOString();

    try {
        var url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
            + '?timeMin=' + encodeURIComponent(dayStart)
            + '&timeMax=' + encodeURIComponent(dayEnd)
            + '&singleEvents=true&orderBy=startTime&maxResults=20';

        var resp = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + _googleAccessToken }
        });

        if (!resp.ok) {
            console.warn('Calendar API error:', resp.status);
            return [];
        }

        var data = await resp.json();
        return (data.items || []).map(function(ev) {
            var start = ev.start.dateTime || ev.start.date;
            var end = ev.end.dateTime || ev.end.date;
            var timeStr = '';
            if (ev.start.dateTime) {
                timeStr = new Date(start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    + ' - ' + new Date(end).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            } else {
                timeStr = '종일';
            }
            return { title: ev.summary || '(제목 없음)', time: timeStr };
        });
    } catch(e) {
        console.warn('Calendar fetch error:', e);
        return [];
    }
}

async function fetchGoogleCalendarWeek(startDate) {
    if (!_googleAccessToken) return {};

    var pad = function(n){ return String(n).padStart(2,'0'); };
    var start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    var end = new Date(start);
    end.setDate(end.getDate() + 7);

    var timeMin = start.getFullYear()+'-'+pad(start.getMonth()+1)+'-'+pad(start.getDate())+'T00:00:00';
    var timeMax = end.getFullYear()+'-'+pad(end.getMonth()+1)+'-'+pad(end.getDate())+'T00:00:00';

    try {
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul';
        var url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
            + '?timeMin=' + encodeURIComponent(timeMin + '+09:00')
            + '&timeMax=' + encodeURIComponent(timeMax + '+09:00')
            + '&singleEvents=true&orderBy=startTime&maxResults=50'
            + '&timeZone=' + encodeURIComponent(tz);

        var resp = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + _googleAccessToken }
        });

        if (!resp.ok) return {};

        var data = await resp.json();
        var byDay = {};

        (data.items || []).forEach(function(ev) {
            var evStart = ev.start.dateTime || ev.start.date;
            var dayKey = evStart.substring(0, 10);
            if (!byDay[dayKey]) byDay[dayKey] = [];

            var timeStr = '';
            var allDay = false;
            if (ev.start.dateTime) {
                timeStr = new Date(ev.start.dateTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            } else {
                timeStr = '종일';
                allDay = true;
            }

            byDay[dayKey].push({
                title: ev.summary || '(제목 없음)',
                time: timeStr,
                allDay: allDay
            });
        });

        return byDay;
    } catch(e) {
        console.warn('Calendar week fetch error:', e);
        return {};
    }
}

// Firestore timeout wrapper (8s timeout -> fallback to localStorage)
function withTimeout(promise, ms) {
    var timeout = new Promise(function(_, reject) {
        setTimeout(function() { reject(new Error('Firestore timeout (' + ms + 'ms)')); }, ms);
    });
    return Promise.race([promise, timeout]);
}
var FIRESTORE_TIMEOUT = 30000;

// Data Interface - Firebase + LocalStorage fallback + in-memory cache
var _cache = {};

var DataService = {
    async getDailyData(dateStr) {
        if (_cache[dateStr] !== undefined) return _cache[dateStr];
        if (isFirebaseConfigured && db) {
            try {
                var docSnap = await withTimeout(db.collection("daily_routines").doc(dateStr).get(), FIRESTORE_TIMEOUT);
                var val = docSnap.exists ? docSnap.data() : null;
                _cache[dateStr] = val;
                if (val) this.saveLocalData(dateStr, val);
                return val;
            } catch (e) {
                console.warn("Firestore read failed, using localStorage:", e.message);
                return this.getLocalData(dateStr);
            }
        }
        var local = this.getLocalData(dateStr);
        _cache[dateStr] = local;
        return local;
    },

    async getMonthData(year, month) {
        var pad = function(n){ return String(n).padStart(2,'0'); };
        var startStr = year + '-' + pad(month+1) + '-01';
        var dim = new Date(year, month+1, 0).getDate();
        var endStr = year + '-' + pad(month+1) + '-' + pad(dim);
        var result = {};

        if (isFirebaseConfigured && db) {
            try {
                var snap = await withTimeout(db.collection("daily_routines")
                    .where(firebase.firestore.FieldPath.documentId(), '>=', startStr)
                    .where(firebase.firestore.FieldPath.documentId(), '<=', endStr)
                    .get(), FIRESTORE_TIMEOUT);
                snap.forEach(function(doc) {
                    result[doc.id] = doc.data();
                    _cache[doc.id] = doc.data();
                    DataService.saveLocalData(doc.id, doc.data());
                });
                // fill missing days with null cache
                for (var d = 1; d <= dim; d++) {
                    var ds = year + '-' + pad(month+1) + '-' + pad(d);
                    if (!result[ds]) { result[ds] = null; _cache[ds] = null; }
                }
                return result;
            } catch(e) {
                console.error("Error batch reading from Firebase", e);
            }
        }
        // fallback: localStorage
        for (var d2 = 1; d2 <= dim; d2++) {
            var ds2 = year + '-' + pad(month+1) + '-' + pad(d2);
            result[ds2] = this.getLocalData(ds2);
            _cache[ds2] = result[ds2];
        }
        return result;
    },

    async getDateRange(startDate, days) {
        var result = {};
        var pad = function(n){ return String(n).padStart(2,'0'); };
        var dates = [];
        for (var i = 0; i < days; i++) {
            var d = new Date(startDate);
            d.setDate(d.getDate() - i);
            dates.push(d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()));
        }

        // check cache first
        var uncached = [];
        dates.forEach(function(ds) {
            if (_cache[ds] !== undefined) result[ds] = _cache[ds];
            else uncached.push(ds);
        });

        if (uncached.length === 0) return result;

        if (isFirebaseConfigured && db && uncached.length > 0) {
            try {
                uncached.sort();
                var snap = await withTimeout(db.collection("daily_routines")
                    .where(firebase.firestore.FieldPath.documentId(), '>=', uncached[0])
                    .where(firebase.firestore.FieldPath.documentId(), '<=', uncached[uncached.length-1])
                    .get(), FIRESTORE_TIMEOUT);
                snap.forEach(function(doc) {
                    result[doc.id] = doc.data();
                    _cache[doc.id] = doc.data();
                    DataService.saveLocalData(doc.id, doc.data());
                });
                uncached.forEach(function(ds) {
                    if (!result[ds]) { result[ds] = null; _cache[ds] = null; }
                });
                return result;
            } catch(e) { console.error(e); }
        }
        // fallback
        uncached.forEach(function(ds) {
            var local = DataService.getLocalData(ds);
            result[ds] = local; _cache[ds] = local;
        });
        return result;
    },

    async saveDailyData(dateStr, data) {
        _cache[dateStr] = data;
        this.saveLocalData(dateStr, data);
        if (isFirebaseConfigured && db && currentUser) {
            try {
                await db.collection("daily_routines").doc(dateStr).set(data);
                return true;
            } catch (e) {
                console.error("Error saving to Firebase:", e);
                if (e.code === 'permission-denied') {
                    console.warn('Firestore 권한 오류: Firebase Console → Firestore → 규칙에서 만료일을 확인하세요.');
                }
                return false;
            }
        }
        return true;
    },

    getLocalData(dateStr) {
        var data = localStorage.getItem("routine_" + dateStr);
        return data ? JSON.parse(data) : null;
    },

    saveLocalData(dateStr, data) {
        localStorage.setItem("routine_" + dateStr, JSON.stringify(data));
    }
};
