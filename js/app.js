// ===== HANJA DB =====
var HANJA_DB = [
    { char:'學', reading:'배울 학', meaning:'learn, study', detail:'學而時習之 不亦說乎 — 배우고 때때로 익히면 기쁘지 아니한가' },
    { char:'問', reading:'물을 문', meaning:'ask, inquire', detail:'不恥下問 — 아랫사람에게 묻는 것을 부끄러워하지 말라' },
    { char:'知', reading:'알 지', meaning:'know, wisdom', detail:'知之爲知之 不知爲不知 是知也' },
    { char:'信', reading:'믿을 신', meaning:'trust, faith', detail:'人無信不立 — 믿음이 없으면 설 수 없다' },
    { char:'忍', reading:'참을 인', meaning:'endure, patience', detail:'小不忍則亂大謀 — 작은 것을 참지 못하면 큰 일을 그르친다' },
    { char:'志', reading:'뜻 지', meaning:'will, ambition', detail:'有志者事竟成 — 뜻이 있는 자에게 일은 마침내 이루어진다' },
    { char:'德', reading:'큰 덕', meaning:'virtue', detail:'厚德載物 — 덕이 두터우면 만물을 실을 수 있다' },
    { char:'勤', reading:'부지런할 근', meaning:'diligent', detail:'業精於勤 — 학업은 부지런함에서 정밀해진다' },
    { char:'道', reading:'길 도', meaning:'way, path', detail:'道可道非常道 — 말할 수 있는 도는 영원한 도가 아니다' },
    { char:'仁', reading:'어질 인', meaning:'benevolence', detail:'仁者愛人 — 어진 사람은 사람을 사랑한다' },
    { char:'義', reading:'옳을 의', meaning:'righteousness', detail:'見義不爲 無勇也' },
    { char:'禮', reading:'예도 례', meaning:'propriety', detail:'禮之用 和爲貴' },
    { char:'智', reading:'슬기 지', meaning:'wisdom', detail:'智者不惑 — 지혜로운 자는 미혹되지 않는다' },
    { char:'誠', reading:'정성 성', meaning:'sincerity', detail:'誠者天之道也 — 정성은 하늘의 도이다' },
    { char:'孝', reading:'효도 효', meaning:'filial piety', detail:'百善孝爲先 — 모든 선행 중 효도가 으뜸이다' },
    { char:'和', reading:'화할 화', meaning:'harmony', detail:'天時不如地利 地利不如人和' },
    { char:'力', reading:'힘 력', meaning:'power', detail:'盡人事待天命 — 사람의 일을 다하고 하늘의 명을 기다린다' },
    { char:'心', reading:'마음 심', meaning:'heart, mind', detail:'以心傳心 — 마음으로 마음을 전한다' },
    { char:'命', reading:'목숨 명', meaning:'destiny', detail:'安分知命 — 분수를 알고 운명을 안다' },
    { char:'光', reading:'빛 광', meaning:'light', detail:'光陰似箭 — 세월이 화살과 같다' },
    { char:'天', reading:'하늘 천', meaning:'heaven', detail:'天道酬勤 — 하늘은 부지런한 자에게 보답한다' },
    { char:'敎', reading:'가르칠 교', meaning:'teach', detail:'敎學相長 — 가르침과 배움은 서로 자라게 한다' },
    { char:'忠', reading:'충성 충', meaning:'loyalty', detail:'忠言逆耳 — 충고의 말은 귀에 거슬린다' },
    { char:'愛', reading:'사랑 애', meaning:'love', detail:'愛人者人恒愛之' },
    { char:'勇', reading:'날랠 용', meaning:'courage', detail:'勇者不懼 — 용감한 자는 두려워하지 않는다' },
    { char:'書', reading:'글 서', meaning:'write, book', detail:'讀書百遍其義自見' },
    { char:'言', reading:'말씀 언', meaning:'word', detail:'言必信 行必果' },
    { char:'靜', reading:'고요할 정', meaning:'still, quiet', detail:'靜以修身 — 고요함으로 몸을 닦는다' },
    { char:'樂', reading:'즐길 락', meaning:'joy', detail:'知者樂水 仁者樂山' },
    { char:'福', reading:'복 복', meaning:'fortune', detail:'積善之家 必有餘慶' },
    { char:'正', reading:'바를 정', meaning:'correct', detail:'其身正 不令而行' }
];

function getTodayHanja(dateStr) {
    var dayOfYear = Math.floor((new Date(dateStr) - new Date(dateStr.split('-')[0], 0, 0)) / 86400000);
    return HANJA_DB[dayOfYear % HANJA_DB.length];
}

// ===== TIME-BLOCK MODES =====
var MODES = [
    {
        id: 'morning',
        title: 'Director Mode',
        subtitle: '기획 및 지시',
        emoji: '🌅',
        cssClass: 'morning',
        tasks: [
            { id: 'swimming', label: '수영 (06:00-07:00) / 수호회', alt: '오후 산책 20분 or 푹 쉬기' },
            { id: 'ai_direct', label: 'AI에게 논문/실험 탐색 지시' },
            { id: 'paper_log', label: '논문 3줄 태그 로그 작성', hasLog: true }
        ]
    },
    {
        id: 'daytime',
        title: 'Architect Mode',
        subtitle: '검증 및 시스템 구축',
        emoji: '☀️',
        cssClass: 'daytime',
        tasks: [
            { id: 'ai_review', label: 'AI 자료/코드 크로스체크' },
            { id: 'architecture', label: '시스템 아키텍처 스케치' },
            { id: 'math_study', label: '수학적 최적화 진도 (손 전개)' },
            { id: 'eng_podcast', label: '팟캐스트 / Gemini 영어 티키타카' }
        ]
    },
    {
        id: 'evening',
        title: 'Storyteller & 셧다운',
        subtitle: '정리 및 회복',
        emoji: '🌙',
        cssClass: 'evening',
        tasks: [
            { id: 'piano_exercise', label: '피아노 / 필라테스 & 복싱' },
            { id: 'eng_diary', label: '영어 일기 작성 (최소 3문장)', hasLog: false },
            { id: 'tomorrow_plan', label: '내일 AI 작업 미리 구상' }
        ]
    }
];

// ===== STATE =====
var currentDate = new Date();
var currentData = { tasks:{}, diary:'', memo:'', hanja_char:'', hanja_reading:'', hanja_note:'', paper_log:{ what:'', result:'', idea:'', tags:'' } };
var calendarDate = new Date();

// ===== UTILS =====
function formatDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function getDayName(i) { return ['일','월','화','수','목','금','토'][i]; }
function getKoreanDate(d) { return d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 ('+getDayName(d.getDay())+')'; }
function isSameDay(a,b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

function getAllTaskIds() {
    var ids = [];
    MODES.forEach(function(m) { m.tasks.forEach(function(t) { ids.push(t.id); }); });
    return ids;
}
function getCompletionRate(data) {
    if (!data || !data.tasks) return 0;
    var ids = getAllTaskIds();
    var done = 0;
    ids.forEach(function(id) { if (data.tasks[id]) done++; });
    return ids.length > 0 ? done / ids.length : 0;
}

// ===== DOM =====
var dateDisplay, btnPrev, btnNext, weeklyRibbon, modeContainer;
var dailyDiary, diaryCharCount, dailyMemo, syncStatus;
var hanjaCharD, hanjaReadD, hanjaMeanD, hanjaDetD, hanjaCharI, hanjaReadI, hanjaNoteI;
var calMonthD, btnPrevM, btnNextM, calGrid, dayDetail, detailDate, detailContent, closeDetailBtn;

function cacheDom() {
    dateDisplay = document.getElementById('current-date-display');
    btnPrev = document.getElementById('prev-day');
    btnNext = document.getElementById('next-day');
    weeklyRibbon = document.getElementById('weekly-ribbon');
    modeContainer = document.getElementById('mode-container');
    dailyDiary = document.getElementById('daily-diary');
    diaryCharCount = document.getElementById('diary-char-count');
    dailyMemo = document.getElementById('daily-memo');
    syncStatus = document.getElementById('sync-status');
    hanjaCharD = document.getElementById('hanja-char');
    hanjaReadD = document.getElementById('hanja-reading');
    hanjaMeanD = document.getElementById('hanja-meaning');
    hanjaDetD = document.getElementById('hanja-detail');
    hanjaCharI = document.getElementById('hanja-char-input');
    hanjaReadI = document.getElementById('hanja-reading-input');
    hanjaNoteI = document.getElementById('hanja-note-input');
    calMonthD = document.getElementById('calendar-month-display');
    btnPrevM = document.getElementById('prev-month');
    btnNextM = document.getElementById('next-month');
    calGrid = document.getElementById('calendar-grid');
    dayDetail = document.getElementById('day-detail');
    detailDate = document.getElementById('detail-date');
    detailContent = document.getElementById('detail-content');
    closeDetailBtn = document.getElementById('close-detail');
}

// ===== INIT =====
async function init() {
    cacheDom();
    setupEvents();
    setupTabs();
    await loadDate(currentDate);
    renderRibbon();
    updateSync();
}

function updateSync() {
    if (isFirebaseConfigured) { syncStatus.textContent='Firebase 연동 중'; syncStatus.style.color='#2d6a4f'; }
    else { syncStatus.textContent='로컬 저장 모드'; }
}

// ===== TABS =====
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(tab) {
        tab.addEventListener('click', function() {
            var v = tab.dataset.view;
            document.querySelectorAll('.tab-btn').forEach(function(t){t.classList.remove('active')});
            tab.classList.add('active');
            document.querySelectorAll('.view').forEach(function(el){el.classList.remove('active')});
            document.getElementById('view-'+v).classList.add('active');
            if (v==='calendar') { calendarDate=new Date(currentDate); renderCalendar(); }
            else if (v==='stats') { renderStats(); }
            else if (v==='archive') { loadArchive(''); }
        });
    });
}

// ===== TODAY =====
async function loadDate(date) {
    currentDate = new Date(date);
    var ds = formatDate(currentDate);
    dateDisplay.textContent = getKoreanDate(currentDate);

    var saved = await DataService.getDailyData(ds);
    currentData = saved || { tasks:{}, diary:'', memo:'', hanja_char:'', hanja_reading:'', hanja_note:'', paper_log:{ what:'', result:'', idea:'', tags:'' } };
    if (currentData.note && !currentData.diary) currentData.diary = currentData.note;
    if (!currentData.paper_log) currentData.paper_log = { what:'', result:'', idea:'', tags:'' };

    renderModes();
    dailyDiary.value = currentData.diary || '';
    dailyMemo.value = currentData.memo || '';
    diaryCharCount.textContent = (currentData.diary||'').length + '자';

    var h = getTodayHanja(ds);
    hanjaCharD.textContent = h.char;
    hanjaReadD.textContent = h.reading;
    hanjaMeanD.textContent = h.meaning;
    hanjaDetD.textContent = h.detail;
    hanjaCharI.value = currentData.hanja_char || '';
    hanjaReadI.value = currentData.hanja_reading || '';
    hanjaNoteI.value = currentData.hanja_note || '';

    renderRibbon();
}

function setupEvents() {
    btnPrev.addEventListener('click', function(){ var d=new Date(currentDate); d.setDate(d.getDate()-1); loadDate(d); });
    btnNext.addEventListener('click', function(){ var d=new Date(currentDate); d.setDate(d.getDate()+1); loadDate(d); });

    dailyDiary.addEventListener('input', function(e) {
        currentData.diary = e.target.value;
        diaryCharCount.textContent = e.target.value.length + '자';
        save();
    });
    dailyMemo.addEventListener('input', function(e) { currentData.memo = e.target.value; save(); });

    hanjaCharI.addEventListener('input', function(e) { currentData.hanja_char = e.target.value; save(); });
    hanjaReadI.addEventListener('input', function(e) { currentData.hanja_reading = e.target.value; save(); });
    hanjaNoteI.addEventListener('input', function(e) { currentData.hanja_note = e.target.value; save(); });

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT') return;
        if (e.key==='ArrowLeft') { var d=new Date(currentDate); d.setDate(d.getDate()-1); loadDate(d); }
        else if (e.key==='ArrowRight') { var d2=new Date(currentDate); d2.setDate(d2.getDate()+1); loadDate(d2); }
    });

    btnPrevM.addEventListener('click', function(){ calendarDate.setMonth(calendarDate.getMonth()-1); renderCalendar(); });
    btnNextM.addEventListener('click', function(){ calendarDate.setMonth(calendarDate.getMonth()+1); renderCalendar(); });
    closeDetailBtn.addEventListener('click', function(){ dayDetail.style.display='none'; });

    // Archive search
    document.getElementById('archive-search-btn').addEventListener('click', function() {
        loadArchive(document.getElementById('archive-search').value);
    });
    document.getElementById('archive-search').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') loadArchive(e.target.value);
    });
}

function renderRibbon() {
    weeklyRibbon.innerHTML = '';
    for (var i=-3; i<=3; i++) {
        var d = new Date(currentDate); d.setDate(d.getDate()+i);
        var pill = document.createElement('div');
        pill.className = 'day-pill' + (d.getDay()===0?' sun':d.getDay()===6?' sat':'') + (i===0?' active':'');
        var ns = document.createElement('span'); ns.className='day-name'; ns.textContent=getDayName(d.getDay());
        var ds = document.createElement('span'); ds.className='day-num'; ds.textContent=d.getDate();
        pill.appendChild(ns); pill.appendChild(ds);
        (function(dt){ pill.addEventListener('click', function(){ loadDate(dt); }); })(new Date(d));
        weeklyRibbon.appendChild(pill);
    }
}

// ===== RENDER MODES =====
function renderModes() {
    modeContainer.innerHTML = '';

    MODES.forEach(function(mode) {
        var block = document.createElement('div');
        block.className = 'mode-block ' + mode.cssClass;

        // Header
        var hdr = document.createElement('div');
        hdr.className = 'mode-header';
        var em = document.createElement('span'); em.className='mode-emoji'; em.textContent=mode.emoji;
        var tt = document.createElement('span'); tt.className='mode-title'; tt.textContent=mode.title;
        var st = document.createElement('span'); st.className='mode-subtitle'; st.textContent=mode.subtitle;
        hdr.appendChild(em); hdr.appendChild(tt); hdr.appendChild(st);
        block.appendChild(hdr);

        // Progress
        var checked = 0;
        mode.tasks.forEach(function(t){ if(currentData.tasks[t.id]) checked++; });
        var pct = mode.tasks.length > 0 ? Math.round(checked/mode.tasks.length*100) : 0;

        var pw = document.createElement('div'); pw.className='progress-wrap';
        var pb = document.createElement('div'); pb.className='progress-bar';
        var pf = document.createElement('div'); pf.className='progress-fill'; pf.style.width = pct+'%';
        pb.appendChild(pf); pw.appendChild(pb);
        var pl = document.createElement('div'); pl.className='progress-label';
        pl.innerHTML = '<span>'+checked+'/'+mode.tasks.length+'</span><span>'+pct+'%</span>';
        pw.appendChild(pl);
        block.appendChild(pw);

        // Tasks
        mode.tasks.forEach(function(task) {
            var isChecked = !!currentData.tasks[task.id];
            var isAlt = !!currentData.tasks[task.id + '_alt'];

            var taskEl = document.createElement('div');
            taskEl.className = 'task-item' + (isChecked ? ' checked' : '');

            var cb = document.createElement('div'); cb.className='checkbox';
            var inner = document.createElement('span'); inner.className='checkbox-inner'; inner.textContent='✔';
            cb.appendChild(inner);

            var lbl = document.createElement('span'); lbl.className='task-label';
            if (task.alt && isAlt) {
                lbl.innerHTML = '<span class="alt-label">' + task.alt + '</span>';
            } else {
                lbl.textContent = task.label;
            }

            taskEl.appendChild(cb);
            taskEl.appendChild(lbl);

            // Alt button (Plan B)
            if (task.alt) {
                var altBtn = document.createElement('button');
                altBtn.className = 'alt-btn';
                altBtn.textContent = '🔁';
                altBtn.title = isAlt ? '원래로 복귀' : 'Plan B: ' + task.alt;
                altBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    currentData.tasks[task.id + '_alt'] = !isAlt;
                    save();
                    renderModes();
                });
                taskEl.appendChild(altBtn);
            }

            taskEl.addEventListener('click', function() {
                var now = !currentData.tasks[task.id];
                currentData.tasks[task.id] = now;
                save();
                renderModes(); // re-render to update progress
            });

            block.appendChild(taskEl);
        });

        // 3-line log (for paper_log task)
        var logTask = mode.tasks.find(function(t){ return t.hasLog; });
        if (logTask) {
            var logWrap = document.createElement('div'); logWrap.className='log-toggle';

            var logBtn = document.createElement('button'); logBtn.className='log-toggle-btn';
            logBtn.textContent = '📋 3줄 로그 작성 (What / Result / Idea)';

            var logForm = document.createElement('div'); logForm.className='log-form';
            if (currentData.paper_log && currentData.paper_log.what) logForm.classList.add('open');

            var fields = [
                { key:'what', label:'What', placeholder:'오늘 읽은 논문 / 탐색한 키워드' },
                { key:'result', label:'Result', placeholder:'핵심 결과 또는 발견' },
                { key:'idea', label:'Idea', placeholder:'내 연구에 적용할 아이디어' }
            ];

            fields.forEach(function(f) {
                var row = document.createElement('div'); row.className='log-row';
                var lb = document.createElement('span'); lb.className='log-label'; lb.textContent=f.label;
                var inp = document.createElement('input'); inp.type='text'; inp.className='log-input';
                inp.placeholder = f.placeholder;
                inp.value = (currentData.paper_log && currentData.paper_log[f.key]) || '';
                inp.addEventListener('input', function(e) {
                    if (!currentData.paper_log) currentData.paper_log = {};
                    currentData.paper_log[f.key] = e.target.value;
                    save();
                });
                row.appendChild(lb); row.appendChild(inp);
                logForm.appendChild(row);
            });

            // Tags
            var tagRow = document.createElement('div'); tagRow.className='log-tags';
            var tagInp = document.createElement('input'); tagInp.type='text';
            tagInp.placeholder = '태그 (예: #OS #KV_Cache #LLM)';
            tagInp.value = (currentData.paper_log && currentData.paper_log.tags) || '';
            tagInp.addEventListener('input', function(e) {
                if (!currentData.paper_log) currentData.paper_log = {};
                currentData.paper_log.tags = e.target.value;
                save();
            });
            tagRow.appendChild(tagInp);
            logForm.appendChild(tagRow);

            logBtn.addEventListener('click', function() { logForm.classList.toggle('open'); });

            logWrap.appendChild(logBtn);
            logWrap.appendChild(logForm);
            block.appendChild(logWrap);
        }

        modeContainer.appendChild(block);
    });
}

// ===== SAVE =====
var saveTimeout;
function save() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async function() {
        await DataService.saveDailyData(formatDate(currentDate), currentData);
    }, 500);
}

// ===== ARCHIVE =====
async function loadArchive(query) {
    var container = document.getElementById('archive-results');
    container.innerHTML = '<div class="archive-empty">로딩 중...</div>';

    var results = [];
    var today = new Date();
    var q = query.trim().toLowerCase();

    // Search last 180 days
    for (var i = 0; i < 180; i++) {
        var d = new Date(today); d.setDate(today.getDate() - i);
        var ds = formatDate(d);
        var data = await DataService.getDailyData(ds);
        if (!data || !data.paper_log) continue;
        var log = data.paper_log;
        if (!log.what && !log.result && !log.idea) continue;

        var text = ((log.what||'') + ' ' + (log.result||'') + ' ' + (log.idea||'') + ' ' + (log.tags||'')).toLowerCase();
        if (q && text.indexOf(q) === -1) continue;

        results.push({ date: ds, log: log });
    }

    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = '<div class="archive-empty">검색 결과가 없습니다.' + (q ? ' "'+query+'"' : ' 아직 3줄 로그가 없습니다.') + '</div>';
        return;
    }

    results.forEach(function(r) {
        var entry = document.createElement('div'); entry.className='archive-entry';
        var dateDiv = document.createElement('div'); dateDiv.className='archive-date'; dateDiv.textContent=r.date;
        entry.appendChild(dateDiv);

        [{ k:'what', l:'What' }, { k:'result', l:'Result' }, { k:'idea', l:'Idea' }].forEach(function(f) {
            if (r.log[f.k]) {
                var row = document.createElement('div'); row.className='archive-row';
                row.innerHTML = '<span class="archive-row-label">'+f.l+'</span><span>'+r.log[f.k]+'</span>';
                entry.appendChild(row);
            }
        });

        if (r.log.tags) {
            var tagsDiv = document.createElement('div'); tagsDiv.className='archive-tags';
            r.log.tags.split(/[\s,]+/).forEach(function(tag) {
                if (!tag) return;
                var t = document.createElement('span'); t.className='archive-tag'; t.textContent=tag;
                tagsDiv.appendChild(t);
            });
            entry.appendChild(tagsDiv);
        }

        container.appendChild(entry);
    });
}

// ===== CALENDAR =====
async function renderCalendar() {
    var year = calendarDate.getFullYear(), month = calendarDate.getMonth();
    calMonthD.textContent = year+'년 '+(month+1)+'월';
    calGrid.innerHTML = '';
    dayDetail.style.display = 'none';

    ['일','월','화','수','목','금','토'].forEach(function(n,i) {
        var h = document.createElement('div');
        h.className = 'cal-day-header'+(i===0?' sun':i===6?' sat':'');
        h.textContent = n; calGrid.appendChild(h);
    });

    var firstDay = new Date(year,month,1).getDay();
    var daysInMonth = new Date(year,month+1,0).getDate();
    var today = new Date();

    var monthData = {};
    for (var d=1; d<=daysInMonth; d++) {
        var ds = formatDate(new Date(year,month,d));
        var data = await DataService.getDailyData(ds);
        if (data) monthData[ds] = data;
    }

    for (var e=0; e<firstDay; e++) {
        var emp = document.createElement('div'); emp.className='cal-day empty'; calGrid.appendChild(emp);
    }

    for (var day=1; day<=daysInMonth; day++) {
        var cell = document.createElement('div'); cell.className='cal-day';
        var dk = formatDate(new Date(year,month,day));
        var dd = monthData[dk];
        var rate = getCompletionRate(dd);

        if (dd && Object.keys(dd.tasks||{}).length > 0) {
            if (rate>=1) cell.classList.add('level-4');
            else if (rate>=0.71) cell.classList.add('level-3');
            else if (rate>=0.31) cell.classList.add('level-2');
            else cell.classList.add('level-1');
        }
        if (dd && (dd.diary||dd.note) && (dd.diary||dd.note).trim()) cell.classList.add('has-diary');
        if (isSameDay(new Date(year,month,day), today)) cell.classList.add('today');

        var num = document.createElement('span'); num.className='cal-num'; num.textContent=day;
        cell.appendChild(num);

        (function(data,key){ cell.addEventListener('click',function(){ showDetail(key,data); }); })(dd,dk);
        calGrid.appendChild(cell);
    }
}

function showDetail(ds, data) {
    detailDate.textContent = ds;
    detailContent.innerHTML = '';

    if (!data) {
        detailContent.innerHTML = '<p style="color:var(--text3);font-size:0.82rem;">기록 없음</p>';
        dayDetail.style.display='block'; return;
    }

    MODES.forEach(function(mode) {
        var div = document.createElement('div'); div.className='detail-category';
        var nm = document.createElement('div'); nm.className='detail-category-name';
        nm.textContent = mode.emoji+' '+mode.title;
        div.appendChild(nm);
        mode.tasks.forEach(function(t) {
            var td = document.createElement('div'); td.className='detail-task';
            var done = data.tasks && data.tasks[t.id];
            td.innerHTML = '<span class="'+(done?'done':'not-done')+'">'+(done?'✔':'○')+'</span> '+t.label;
            div.appendChild(td);
        });
        detailContent.appendChild(div);
    });

    // Paper log
    if (data.paper_log && (data.paper_log.what || data.paper_log.result || data.paper_log.idea)) {
        var logDiv = document.createElement('div'); logDiv.className='archive-entry'; logDiv.style.margin='0.5rem 0';
        var title = document.createElement('div'); title.className='detail-category-name'; title.textContent='📋 3줄 로그';
        logDiv.appendChild(title);
        ['what','result','idea'].forEach(function(k) {
            if (data.paper_log[k]) {
                var r = document.createElement('div'); r.className='archive-row';
                r.innerHTML='<span class="archive-row-label">'+k.charAt(0).toUpperCase()+k.slice(1)+'</span><span>'+data.paper_log[k]+'</span>';
                logDiv.appendChild(r);
            }
        });
        if (data.paper_log.tags) {
            var td2 = document.createElement('div'); td2.className='archive-tags';
            data.paper_log.tags.split(/[\s,]+/).forEach(function(tag) {
                if (!tag) return;
                var sp = document.createElement('span'); sp.className='archive-tag'; sp.textContent=tag;
                td2.appendChild(sp);
            });
            logDiv.appendChild(td2);
        }
        detailContent.appendChild(logDiv);
    }

    var diary = data.diary || data.note || '';
    if (diary.trim()) {
        var dd2 = document.createElement('div'); dd2.className='detail-diary'; dd2.textContent=diary;
        detailContent.appendChild(dd2);
    }
    if (data.hanja_char) {
        var hd = document.createElement('div'); hd.className='detail-hanja';
        hd.innerHTML='<strong>'+data.hanja_char+'</strong> '+(data.hanja_reading||'')+(data.hanja_note?' — '+data.hanja_note:'');
        detailContent.appendChild(hd);
    }
    dayDetail.style.display='block';
}

// ===== STATS =====
async function renderStats() {
    await renderWeeklyStats();
    await renderModeStats();
    await renderDiaryStats();
}

async function renderWeeklyStats() {
    var c = document.getElementById('stats-weekly'); c.innerHTML='';
    var today = new Date();
    var start = new Date(today); start.setDate(today.getDate()-today.getDay());

    for (var i=0;i<7;i++) {
        var d=new Date(start); d.setDate(start.getDate()+i);
        var data = await DataService.getDailyData(formatDate(d));
        var rate = getCompletionRate(data);
        var pct = Math.round(rate*100);
        var circ = 2*Math.PI*20;
        var off = circ-(rate*circ);

        var card = document.createElement('div'); card.className='stat-day-card';
        card.innerHTML =
            '<div class="stat-day-name">'+getDayName(i)+'</div>'+
            '<div class="stat-day-date">'+(d.getMonth()+1)+'/'+d.getDate()+'</div>'+
            '<div class="stat-ring"><svg width="48" height="48" viewBox="0 0 50 50">'+
            '<circle class="stat-ring-bg" cx="25" cy="25" r="20"></circle>'+
            '<circle class="stat-ring-fill" cx="25" cy="25" r="20" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'"></circle>'+
            '</svg><span class="stat-percent">'+pct+'%</span></div>';
        c.appendChild(card);
    }
}

async function renderModeStats() {
    var c = document.getElementById('stats-categories'); c.innerHTML='';
    var today = new Date();
    var daysData = [];
    for (var i=0;i<30;i++) {
        var d=new Date(today); d.setDate(today.getDate()-i);
        var data = await DataService.getDailyData(formatDate(d));
        if (data) daysData.push(data);
    }

    MODES.forEach(function(mode) {
        var done=0, total=0;
        daysData.forEach(function(data) {
            mode.tasks.forEach(function(t) { total++; if(data.tasks&&data.tasks[t.id]) done++; });
        });
        var pct = total>0?Math.round(done/total*100):0;
        var row = document.createElement('div'); row.className='stat-category-row';
        row.innerHTML =
            '<div class="stat-category-name">'+mode.emoji+' '+mode.title+'</div>'+
            '<div class="stat-bar-container"><div class="stat-bar-fill" style="width:'+pct+'%"></div></div>'+
            '<div class="stat-bar-label"><span>'+done+'/'+total+'</span><span>'+pct+'%</span></div>';
        c.appendChild(row);
    });
}

async function renderDiaryStats() {
    var c = document.getElementById('stats-diary'); c.innerHTML='';
    var today = new Date(); var written=0; var dots=[];
    for (var i=29;i>=0;i--) {
        var d=new Date(today); d.setDate(today.getDate()-i);
        var data = await DataService.getDailyData(formatDate(d));
        var has = data && (data.diary||data.note) && (data.diary||data.note).trim().length>0;
        if (has) written++;
        dots.push(has);
    }
    var t = document.createElement('div'); t.className='diary-stats-text';
    t.textContent='최근 30일 중 '+written+'일 작성 ('+Math.round(written/30*100)+'%)';
    c.appendChild(t);
    var dd = document.createElement('div'); dd.className='diary-streak';
    dots.forEach(function(has) {
        var dot = document.createElement('div'); dot.className='diary-dot'+(has?' written':'');
        dd.appendChild(dot);
    });
    c.appendChild(dd);
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
