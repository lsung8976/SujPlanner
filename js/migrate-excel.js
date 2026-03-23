// Excel(myRoutine.xlsx) 데이터 → Firebase/localStorage 마이그레이션
// routine_export.json에서 읽어서 daily_routines에 머지

(async function() {
    var migrated = localStorage.getItem('suj_excel_migrated_v1');
    if (migrated) return;

    // Load exported JSON
    var resp;
    try {
        resp = await fetch('./routine_export.json');
        if (!resp.ok) { console.log('routine_export.json not found, skipping excel migration.'); return; }
    } catch(e) { console.log('Excel migration skipped (no JSON file).'); return; }

    var entries = await resp.json();
    console.log('Excel migration: ' + entries.length + ' days to import...');

    var count = 0;

    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var dateStr = e.date;
        if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}/)) continue;

        // Determine if 2025 or 2026 format
        // 2025: col12=한줄평, col13=영어일기
        // 2026: col12=한문, col13=한줄평, col14=영어일기
        var is2026 = dateStr.startsWith('2026');

        var tasks = {};

        // Column mapping → app task IDs
        // Col 3: 논문 1편 적기 → paper_log_task
        if (e['3'] === 'True') tasks['paper_log_task'] = true;

        // Col 4: 노션 노트 정리 → ai_direct (AI에게 논문/실험 탐색 지시)
        if (e['4'] === 'True') tasks['ai_direct'] = true;

        // Col 5: 미팅 준비 → cross_check
        if (e['5'] === 'True') tasks['cross_check'] = true;

        // Col 6: 추가공부/수학적최적화 → math_opt
        if (e['6'] === 'True') tasks['math_opt'] = true;

        // Col 7: 영어OPIC/영어일기 → eng_diary (영어 일기 작성)
        if (e['7'] === 'True') tasks['eng_diary'] = true;

        // Col 8: 영어듣기 → podcast_eng
        if (e['8'] === 'True') tasks['podcast_eng'] = true;

        // Col 9: 수영 → swimming
        if (e['9'] === 'True') tasks['swimming'] = true;

        // Col 10: 필라테스 → piano_exercise
        if (e['10'] === 'True') tasks['piano_exercise'] = true;

        // Col 11: 피아노 → piano_exercise (same category)
        if (e['11'] === 'True') tasks['piano_exercise'] = true;

        // Diary and memo
        var diary = '';
        var memo = '';
        var hanja_note = '';

        if (is2026) {
            // 2026: col12=한문(체크), col13=한줄평, col14=영어일기
            if (e['12'] === 'True') tasks['hanja_task'] = true;
            diary = e['13'] || '';
            memo = e['14'] || '';
        } else {
            // 2025: col12=한줄평, col13=영어일기
            diary = e['12'] || '';
            memo = e['13'] || '';
        }

        // Skip if no data at all
        var hasAnyTask = Object.keys(tasks).length > 0;
        var hasText = diary.length > 0 || memo.length > 0;
        if (!hasAnyTask && !hasText) continue;

        // Build daily data object
        var dayData = {
            tasks: tasks,
            diary: diary,
            memo: memo,
            paper_log: { what: '', result: '', idea: '', tags: '' },
            radar_insight: '',
            flow_mode: false,
            flow_text: '',
            hanja_char: '',
            hanja_reading: '',
            hanja_note: hanja_note
        };

        // Merge with existing data (don't overwrite)
        var existing = await DataService.getDailyData(dateStr);
        if (existing) {
            // Merge tasks: keep existing checked tasks, add new ones
            if (existing.tasks) {
                Object.keys(existing.tasks).forEach(function(tid) {
                    if (existing.tasks[tid]) dayData.tasks[tid] = true;
                });
            }
            // Keep existing diary if longer
            if (existing.diary && existing.diary.length > dayData.diary.length) {
                dayData.diary = existing.diary;
            }
            // Keep existing memo if longer
            if (existing.memo && existing.memo.length > (dayData.memo || '').length) {
                dayData.memo = existing.memo;
            }
            // Preserve other fields from existing
            if (existing.paper_log && existing.paper_log.what) dayData.paper_log = existing.paper_log;
            if (existing.radar_insight) dayData.radar_insight = existing.radar_insight;
            if (existing.flow_mode) { dayData.flow_mode = existing.flow_mode; dayData.flow_text = existing.flow_text || ''; }
            if (existing.hanja_char) dayData.hanja_char = existing.hanja_char;
            if (existing.hanja_reading) dayData.hanja_reading = existing.hanja_reading;
            if (existing.hanja_note) dayData.hanja_note = existing.hanja_note;
        }

        await DataService.saveDailyData(dateStr, dayData);
        count++;
    }

    localStorage.setItem('suj_excel_migrated_v1', 'true');
    console.log('Excel migration complete: ' + count + ' days imported.');
    // Refresh the view
    if (typeof init === 'function') {
        // Clear cache to force reload
        if (typeof _cache !== 'undefined') {
            for (var k in _cache) delete _cache[k];
        }
    }
})();
