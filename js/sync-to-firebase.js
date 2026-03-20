// localStorage → Firebase 일괄 동기화
// 기존 로컬에만 저장된 데이터를 Firebase로 올림
(async function() {
    if (!isFirebaseConfigured || !db) {
        console.log('Firebase not configured. Skipping sync.');
        return;
    }

    var synced = localStorage.getItem('suj_firebase_synced_v1');
    if (synced) return;

    console.log('Syncing localStorage → Firebase...');
    var counts = { daily: 0, radar: 0, core: 0 };

    // 1. Daily routines (routine_YYYY-MM-DD)
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('routine_') === 0) {
            var dateStr = key.replace('routine_', '');
            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;

            try {
                var data = JSON.parse(localStorage.getItem(key));
                if (!data) continue;

                // Check if already exists in Firebase
                var doc = await db.collection('daily_routines').doc(dateStr).get();
                if (!doc.exists) {
                    await db.collection('daily_routines').doc(dateStr).set(data);
                    counts.daily++;
                }
            } catch(e) { console.error('Sync error for ' + key, e); }
        }
    }

    // 2. Radar entries
    var radarLocal = localStorage.getItem('suj_radar_entries');
    if (radarLocal) {
        try {
            var radarItems = JSON.parse(radarLocal);
            for (var r = 0; r < radarItems.length; r++) {
                var item = radarItems[r];
                var rid = item._id;
                if (!rid) continue;

                var rdoc = await db.collection('radar_entries').doc(rid).get();
                if (!rdoc.exists) {
                    var rdata = Object.assign({}, item);
                    delete rdata._id;
                    await db.collection('radar_entries').doc(rid).set(rdata);
                    counts.radar++;
                }
            }
        } catch(e) { console.error('Radar sync error', e); }
    }

    // 3. Core entries
    var coreLocal = localStorage.getItem('suj_core_entries');
    if (coreLocal) {
        try {
            var coreItems = JSON.parse(coreLocal);
            for (var c = 0; c < coreItems.length; c++) {
                var citem = coreItems[c];
                var cid = citem._id;
                if (!cid) continue;

                var cdoc = await db.collection('core_entries').doc(cid).get();
                if (!cdoc.exists) {
                    var cdata = Object.assign({}, citem);
                    delete cdata._id;
                    await db.collection('core_entries').doc(cid).set(cdata);
                    counts.core++;
                }
            }
        } catch(e) { console.error('Core sync error', e); }
    }

    localStorage.setItem('suj_firebase_synced_v1', 'true');
    console.log('Firebase sync complete: ' + counts.daily + ' daily, ' + counts.radar + ' radar, ' + counts.core + ' core entries synced.');
})();
