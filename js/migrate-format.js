// 기존 데이터에 줄바꿈/구조 포맷팅 추가 마이그레이션
function formatLongText(text) {
    if (!text || text.indexOf('\n') >= 0) return text; // 이미 줄바꿈이 있으면 스킵

    var s = text;

    // 1. 주요 섹션 라벨 앞에 줄바꿈 추가
    s = s.replace(/(문제 정의|핵심 주장|핵심 요약|요약|방법론|한계점|적용점|결론)/g, '\n\n**$1**');

    // 2. 넘버링된 항목 앞에 줄바꿈: A1. A2. A3. V1. V2. S1. S2. etc.
    s = s.replace(/([^.\n])([A-Z]\d+[.．])/g, '$1\n$2');

    // 3. 구분자 "---" 앞뒤 줄바꿈
    s = s.replace(/\s*---\s*/g, '\n\n---\n\n');

    // 4. 마침표+공백 뒤 주요 전환 키워드 앞에 줄바꿈
    s = s.replace(/([.。])\s+(그러나|하지만|또한|특히|결국|반면|이를|기존|핵심|실제로|현재|최근|다만|이에|따라서|그래서|요약하면|정리하면|결론적으로)/g, '$1\n$2');

    // 5. 긴 문장 덩어리 (200자 이상 줄바꿈 없음) → 마침표 기준으로 문단 나누기
    if (s.length > 200) {
        var lines = s.split('\n');
        var result = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length > 200) {
                // 마침표 뒤에서 적절히 끊기 (최소 80자 간격)
                var parts = [];
                var remaining = line;
                while (remaining.length > 150) {
                    var cutIdx = -1;
                    // 80~200자 사이에서 마침표 찾기
                    for (var j = 80; j < Math.min(remaining.length, 250); j++) {
                        if (remaining[j] === '.' || remaining[j] === '다' && j + 1 < remaining.length && remaining[j + 1] === '.') {
                            cutIdx = remaining.indexOf('.', j);
                            if (cutIdx >= 0) { cutIdx++; break; }
                        }
                    }
                    if (cutIdx <= 0 || cutIdx >= remaining.length - 10) {
                        parts.push(remaining);
                        remaining = '';
                        break;
                    }
                    parts.push(remaining.substring(0, cutIdx));
                    remaining = remaining.substring(cutIdx).trim();
                }
                if (remaining) parts.push(remaining);
                result.push(parts.join('\n'));
            } else {
                result.push(line);
            }
        }
        s = result.join('\n');
    }

    // 6. 연속 빈 줄 정리
    s = s.replace(/\n{3,}/g, '\n\n');
    s = s.trim();

    return s;
}

// Radar & Core 데이터 포맷팅 마이그레이션
(async function() {
    var migrated = localStorage.getItem('suj_format_migrated_v1');
    if (migrated) return;

    console.log('Formatting migration: adding line breaks to existing data...');
    var count = 0;

    // Radar entries
    var radarItems = await TrackService.getAll('radar_entries');
    for (var i = 0; i < radarItems.length; i++) {
        var item = radarItems[i];
        var changed = false;
        var newBody = formatLongText(item.body);
        if (newBody !== item.body) { item.body = newBody; changed = true; }
        var newInsight = formatLongText(item.insight);
        if (newInsight !== item.insight) { item.insight = newInsight; changed = true; }
        if (changed) {
            item.updated = new Date().toISOString();
            await TrackService.save('radar_entries', item._id, item);
            count++;
        }
    }

    // Core entries
    var coreItems = await TrackService.getAll('core_entries');
    for (var j = 0; j < coreItems.length; j++) {
        var ci = coreItems[j];
        var cc = false;
        var fields = ['application', 'critique', 'notes'];
        for (var k = 0; k < fields.length; k++) {
            var f = fields[k];
            var nv = formatLongText(ci[f]);
            if (nv !== ci[f]) { ci[f] = nv; cc = true; }
        }
        if (cc) {
            ci.updated = new Date().toISOString();
            await TrackService.save('core_entries', ci._id, ci);
            count++;
        }
    }

    localStorage.setItem('suj_format_migrated_v1', 'true');
    console.log('Format migration complete: ' + count + ' entries updated with line breaks.');
})();
