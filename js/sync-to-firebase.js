// localStorage → Firebase 일괄 동기화 (v2: 인증 후 실행, 머지 방식)
// auth 완료 후 호출됨

async function syncLocalToFirebase() {
    if (!isFirebaseConfigured || !db) {
        console.log('Firebase not configured. Skipping sync.');
        return;
    }

    var synced = localStorage.getItem('suj_firebase_synced_v2');
    if (synced) return;

    console.log('Syncing localStorage → Firebase (v2)...');
    var counts = { daily: 0, radar: 0, core: 0 };

    // 1. Daily routines (routine_YYYY-MM-DD)
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('routine_') === 0) keys.push(key);
    }

    for (var k = 0; k < keys.length; k++) {
        var dateStr = keys[k].replace('routine_', '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;

        try {
            var localData = JSON.parse(localStorage.getItem(keys[k]));
            if (!localData) continue;

            var doc = await db.collection('daily_routines').doc(dateStr).get();
            if (!doc.exists) {
                // Firebase에 없으면 로컬 데이터 업로드
                await db.collection('daily_routines').doc(dateStr).set(localData);
                counts.daily++;
            } else {
                // Firebase에 있으면 로컬 데이터와 머지 (로컬 tasks 추가, diary 로컬 우선)
                var fbData = doc.data();
                var merged = Object.assign({}, fbData);
                var changed = false;

                // 태스크 머지: 로컬에서 체크된 것 추가
                if (localData.tasks) {
                    if (!merged.tasks) merged.tasks = {};
                    Object.keys(localData.tasks).forEach(function(tid) {
                        if (localData.tasks[tid] && !merged.tasks[tid]) {
                            merged.tasks[tid] = true;
                            changed = true;
                        }
                    });
                }

                // diary: 로컬이 더 길면 로컬 것 사용
                if (localData.diary && (!merged.diary || localData.diary.length > merged.diary.length)) {
                    merged.diary = localData.diary;
                    changed = true;
                }

                // flow_text, memo, hanja 등도 로컬 값이 있고 Firebase에 없으면 추가
                ['flow_text', 'flow_mode', 'memo', 'hanja_char', 'hanja_reading', 'hanja_note',
                 'radar_insight', 'paper_log'].forEach(function(field) {
                    if (localData[field] && !merged[field]) {
                        merged[field] = localData[field];
                        changed = true;
                    }
                });

                if (changed) {
                    await db.collection('daily_routines').doc(dateStr).set(merged);
                    counts.daily++;
                }
            }
        } catch(e) { console.error('Sync error for ' + keys[k], e); }
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

    localStorage.setItem('suj_firebase_synced_v2', 'true');
    console.log('Firebase sync v2 complete: ' + counts.daily + ' daily, ' + counts.radar + ' radar, ' + counts.core + ' core entries synced.');
}
