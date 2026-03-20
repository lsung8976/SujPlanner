// ===== HANJA DB =====
var HANJA_DB=[{char:'學',reading:'배울 학',meaning:'learn',detail:'學而時習之 不亦說乎'},{char:'問',reading:'물을 문',meaning:'ask',detail:'不恥下問'},{char:'知',reading:'알 지',meaning:'know',detail:'知之爲知之 不知爲不知 是知也'},{char:'信',reading:'믿을 신',meaning:'trust',detail:'人無信不立'},{char:'忍',reading:'참을 인',meaning:'endure',detail:'小不忍則亂大謀'},{char:'志',reading:'뜻 지',meaning:'will',detail:'有志者事竟成'},{char:'德',reading:'큰 덕',meaning:'virtue',detail:'厚德載物'},{char:'勤',reading:'부지런할 근',meaning:'diligent',detail:'業精於勤'},{char:'道',reading:'길 도',meaning:'way',detail:'道可道非常道'},{char:'仁',reading:'어질 인',meaning:'benevolence',detail:'仁者愛人'},{char:'義',reading:'옳을 의',meaning:'righteousness',detail:'見義不爲 無勇也'},{char:'禮',reading:'예도 례',meaning:'propriety',detail:'禮之用 和爲貴'},{char:'智',reading:'슬기 지',meaning:'wisdom',detail:'智者不惑'},{char:'誠',reading:'정성 성',meaning:'sincerity',detail:'誠者天之道也'},{char:'孝',reading:'효도 효',meaning:'filial piety',detail:'百善孝爲先'},{char:'和',reading:'화할 화',meaning:'harmony',detail:'天時不如地利 地利不如人和'},{char:'力',reading:'힘 력',meaning:'power',detail:'盡人事待天命'},{char:'心',reading:'마음 심',meaning:'heart',detail:'以心傳心'},{char:'命',reading:'목숨 명',meaning:'destiny',detail:'安分知命'},{char:'光',reading:'빛 광',meaning:'light',detail:'光陰似箭'},{char:'天',reading:'하늘 천',meaning:'heaven',detail:'天道酬勤'},{char:'敎',reading:'가르칠 교',meaning:'teach',detail:'敎學相長'},{char:'忠',reading:'충성 충',meaning:'loyalty',detail:'忠言逆耳'},{char:'愛',reading:'사랑 애',meaning:'love',detail:'愛人者人恒愛之'},{char:'勇',reading:'날랠 용',meaning:'courage',detail:'勇者不懼'},{char:'書',reading:'글 서',meaning:'write',detail:'讀書百遍其義自見'},{char:'言',reading:'말씀 언',meaning:'word',detail:'言必信 行必果'},{char:'靜',reading:'고요할 정',meaning:'still',detail:'靜以修身'},{char:'樂',reading:'즐길 락',meaning:'joy',detail:'知者樂水 仁者樂山'},{char:'福',reading:'복 복',meaning:'fortune',detail:'積善之家 必有餘慶'},{char:'正',reading:'바를 정',meaning:'correct',detail:'其身正 不令而行'}];
function getTodayHanja(ds){var dy=Math.floor((new Date(ds)-new Date(ds.split('-')[0],0,0))/864e5);return HANJA_DB[dy%HANJA_DB.length]}

// ===== 3-STAGE FUNNEL MODES =====
var MODES = [
    {
        id:'morning', title:'Director Mode', subtitle:'Scouting · 기획 및 지시',
        emoji:'🌅', cssClass:'morning', funnelLabel:'scouting', funnelText:'Stage 1: Scouting',
        tasks:[
            { id:'swimming', label:'수영 (06:00-07:00) / 수호회', alt:'오후 산책 20분 or 푹 쉬기' },
            { id:'ai_direct', label:'AI에게 논문/실험 탐색 지시' },
            { id:'paper_log', label:'논문 3줄 태그 로그 작성', hasLog:true },
            { id:'radar_entry', label:'AI Radar에 요약 + 1줄 인사이트 기록' }
        ]
    },
    {
        id:'daytime', title:'Architect Mode', subtitle:'Filtering · 검증 및 선택',
        emoji:'☀️', cssClass:'daytime', funnelLabel:'filtering', funnelText:'Stage 2: Filtering',
        tasks:[
            { id:'ai_review', label:'AI 자료/코드 크로스체크' },
            { id:'architecture', label:'시스템 아키텍처 스케치' },
            { id:'math_study', label:'수학적 최적화 진도 (손 전개)' },
            { id:'pick_one', label:'Core Research로 보낼 논문 1개 선택' },
            { id:'eng_podcast', label:'팟캐스트 / Gemini 영어 티키타카' }
        ]
    },
    {
        id:'evening', title:'Storyteller & 셧다운', subtitle:'Deep Dive · 정리 및 회복',
        emoji:'🌙', cssClass:'evening', funnelLabel:'deepdive', funnelText:'Stage 3: Deep Dive',
        tasks:[
            { id:'core_deepdive', label:'Core Research 깊이 파기 (수식, Figure)' },
            { id:'piano_exercise', label:'피아노 / 필라테스 & 복싱' },
            { id:'eng_diary', label:'영어 일기 작성 (최소 3문장)' },
            { id:'tomorrow_plan', label:'내일 AI 작업 미리 구상' }
        ]
    }
];

// ===== CORE TASKS (무조건 매일) =====
var CORE_TASK_IDS = ['swimming', 'radar_entry', 'eng_diary'];

// ===== STATE =====
var currentDate=new Date(), calendarDate=new Date();
var flowMode=false;
var currentData={tasks:{},diary:'',memo:'',hanja_char:'',hanja_reading:'',hanja_note:'',paper_log:{what:'',result:'',idea:'',tags:''},radar_insight:'',flow_text:'',flow_mode:false};

// ===== UTILS =====
function fmt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dn(i){return['일','월','화','수','목','금','토'][i]}
function kd(d){return d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 ('+dn(d.getDay())+')'}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function allIds(){var r=[];MODES.forEach(function(m){m.tasks.forEach(function(t){r.push(t.id)})});return r}
function compRate(d){if(!d||!d.tasks)return 0;if(d.flow_mode&&d.flow_text&&d.flow_text.trim().length>0)return 1;var ids=allIds(),done=0;ids.forEach(function(id){if(d.tasks[id])done++});return ids.length?done/ids.length:0}
function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}

// ===== TRACK A/B DATA SERVICE =====
var TrackService = {
    async getAll(collection) {
        if (isFirebaseConfigured && db) {
            try {
                var snap = await db.collection(collection).orderBy('created','desc').get();
                var items = []; snap.forEach(function(doc){ var d=doc.data(); d._id=doc.id; items.push(d); });
                return items;
            } catch(e) { console.error(e); return this.getLocal(collection); }
        }
        return this.getLocal(collection);
    },
    async save(collection, id, data) {
        if (isFirebaseConfigured && db) {
            try { await db.collection(collection).doc(id).set(data); } catch(e) { console.error(e); }
        }
        this.saveLocal(collection, id, data);
    },
    async remove(collection, id) {
        if (isFirebaseConfigured && db) {
            try { await db.collection(collection).doc(id).delete(); } catch(e) { console.error(e); }
        }
        this.removeLocal(collection, id);
    },
    getLocal(col) {
        var d=localStorage.getItem('suj_'+col); return d?JSON.parse(d):[];
    },
    saveLocal(col, id, data) {
        var items=this.getLocal(col);
        var idx=items.findIndex(function(x){return x._id===id});
        data._id=id;
        if(idx>=0) items[idx]=data; else items.unshift(data);
        localStorage.setItem('suj_'+col,JSON.stringify(items));
    },
    removeLocal(col, id) {
        var items=this.getLocal(col).filter(function(x){return x._id!==id});
        localStorage.setItem('suj_'+col,JSON.stringify(items));
    }
};

// ===== DOM CACHE =====
var D={};
function cacheDom(){
    ['current-date-display','prev-day','next-day','weekly-ribbon','mode-container',
     'daily-diary','diary-char-count','daily-memo','sync-status',
     'hanja-char','hanja-reading','hanja-meaning','hanja-detail',
     'hanja-char-input','hanja-reading-input','hanja-note-input',
     'calendar-month-display','prev-month','next-month','calendar-grid',
     'gcal-week-section','gcal-week-grid','gcal-week-label','gcal-prev-week','gcal-next-week',
     'gcal-events','gcal-list',
     'day-detail','detail-date','detail-content','close-detail',
     'flow-mode-btn','flow-mode-area','flow-text','flow-core-tasks',
     'quick-paste-btn','radar-parser','radar-paste-input','radar-parse-btn','radar-parser-cancel-btn',
     'add-radar-btn','radar-form','radar-title','radar-authors','radar-year','radar-venue','radar-tags','radar-body','radar-insight',
     'radar-save-btn','radar-cancel-btn','radar-promote-btn','radar-search','radar-search-btn','radar-list',
     'promote-modal','promote-options','promote-custom','promote-confirm-btn','promote-cancel-btn',
     'add-core-btn','core-form','core-paper','core-authors','core-year','core-venue','core-status','core-tags',
     'core-application','core-critique','core-notes',
     'core-save-btn','core-cancel-btn','core-search','core-search-btn','core-list'
    ].forEach(function(id){ D[id.replace(/-/g,'_')]=document.getElementById(id); });
}

// ===== LOADING =====
function showLoading(msg){
    var el=document.getElementById('loading-overlay');
    if(el){el.classList.remove('hidden');if(msg)el.querySelector('.loading-text').textContent=msg}
}
function hideLoading(){
    var el=document.getElementById('loading-overlay');
    if(el)el.classList.add('hidden');
}

// ===== INIT =====
var _initialized = false;
async function init(){
    if (_initialized) return;
    _initialized = true;
    cacheDom();
    setupEvents();
    setupTabs();
    setupGcalWeek();
    showLoading('오늘 데이터 불러오는 중...');
    await loadDate(currentDate);
    renderRibbon();
    updateSync();
    hideLoading();
}

// Auth-gated startup
document.addEventListener('DOMContentLoaded', function() {
    if (typeof setupAuth === 'function' && auth) {
        setupAuth();
    } else {
        // No auth, just init directly
        init();
    }
});

function updateSync(){
    if(isFirebaseConfigured){D.sync_status.textContent='Firebase 연동 중';D.sync_status.style.color='#2d6a4f'}
    else{D.sync_status.textContent='로컬 저장 모드'}
}

// ===== TABS =====
function setupTabs(){
    document.querySelectorAll('.tab-btn').forEach(function(tab){
        tab.addEventListener('click',function(){
            var v=tab.dataset.view;
            document.querySelectorAll('.tab-btn').forEach(function(t){t.classList.remove('active')});
            tab.classList.add('active');
            document.querySelectorAll('.view').forEach(function(el){el.classList.remove('active')});
            document.getElementById('view-'+v).classList.add('active');
            if(v==='calendar'){calendarDate=new Date(currentDate);gcalWeekStart=new Date(currentDate);renderCalendar();renderGcalWeek()}
            else if(v==='stats'){renderStats()}
            else if(v==='radar'){loadRadarList('')}
            else if(v==='core'){loadCoreList('','all')}
        });
    });
}

// ===== TODAY VIEW =====
async function loadDate(date){
    currentDate=new Date(date);
    var ds=fmt(currentDate);
    D.current_date_display.textContent=kd(currentDate);

    var saved=await DataService.getDailyData(ds);
    currentData=saved||{tasks:{},diary:'',memo:'',hanja_char:'',hanja_reading:'',hanja_note:'',paper_log:{what:'',result:'',idea:'',tags:''},radar_insight:'',flow_text:'',flow_mode:false};
    if(currentData.note&&!currentData.diary)currentData.diary=currentData.note;
    if(!currentData.paper_log)currentData.paper_log={what:'',result:'',idea:'',tags:''};

    // Restore flow mode
    flowMode=!!currentData.flow_mode;
    applyFlowMode();
    renderModes();
    D.daily_diary.value=currentData.diary||'';
    D.daily_memo.value=currentData.memo||'';
    D.diary_char_count.textContent=(currentData.diary||'').length+'자';

    var h=getTodayHanja(ds);
    D.hanja_char.textContent=h.char;D.hanja_reading.textContent=h.reading;
    D.hanja_meaning.textContent=h.meaning;D.hanja_detail.textContent=h.detail;
    D.hanja_char_input.value=currentData.hanja_char||'';
    D.hanja_reading_input.value=currentData.hanja_reading||'';
    D.hanja_note_input.value=currentData.hanja_note||'';
    renderRibbon();
}

function setupEvents(){
    D.prev_day.addEventListener('click',function(){var d=new Date(currentDate);d.setDate(d.getDate()-1);loadDate(d)});
    D.next_day.addEventListener('click',function(){var d=new Date(currentDate);d.setDate(d.getDate()+1);loadDate(d)});
    D.daily_diary.addEventListener('input',function(e){currentData.diary=e.target.value;D.diary_char_count.textContent=e.target.value.length+'자';save()});
    D.daily_memo.addEventListener('input',function(e){currentData.memo=e.target.value;save()});
    D.hanja_char_input.addEventListener('input',function(e){currentData.hanja_char=e.target.value;save()});
    D.hanja_reading_input.addEventListener('input',function(e){currentData.hanja_reading=e.target.value;save()});
    D.hanja_note_input.addEventListener('input',function(e){currentData.hanja_note=e.target.value;save()});

    document.addEventListener('keydown',function(e){
        if(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT')return;
        if(e.key==='ArrowLeft'){var d=new Date(currentDate);d.setDate(d.getDate()-1);loadDate(d)}
        else if(e.key==='ArrowRight'){var d2=new Date(currentDate);d2.setDate(d2.getDate()+1);loadDate(d2)}
    });

    // Flow Mode
    D.flow_mode_btn.addEventListener('click',function(){
        flowMode=!flowMode;
        currentData.flow_mode=flowMode;
        applyFlowMode();
        save();
    });
    D.flow_text.addEventListener('input',function(e){currentData.flow_text=e.target.value;save()});

    // Calendar
    D.prev_month.addEventListener('click',function(){calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar()});
    D.next_month.addEventListener('click',function(){calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar()});
    D.close_detail.addEventListener('click',function(){D.day_detail.style.display='none'});

    // Track A: Radar - Quick Paste Parser
    D.quick_paste_btn.addEventListener('click',function(){D.radar_parser.style.display='block';D.radar_paste_input.value='';D.radar_paste_input.focus()});
    D.radar_parser_cancel_btn.addEventListener('click',function(){D.radar_parser.style.display='none'});
    D.radar_parse_btn.addEventListener('click',parseAndFillRadar);

    // Track A: Radar
    D.add_radar_btn.addEventListener('click',function(){D.radar_form.style.display='block';D.radar_form._editId=null;clearRadarForm()});
    D.radar_cancel_btn.addEventListener('click',function(){D.radar_form.style.display='none'});
    D.radar_save_btn.addEventListener('click',saveRadarEntry);
    D.radar_promote_btn.addEventListener('click',promoteRadarToCore);

    // Promote Modal
    D.promote_cancel_btn.addEventListener('click',function(){D.promote_modal.style.display='none'});
    D.promote_confirm_btn.addEventListener('click',confirmPromotion);
    D.radar_search_btn.addEventListener('click',function(){loadRadarList(D.radar_search.value)});
    D.radar_search.addEventListener('keydown',function(e){if(e.key==='Enter')loadRadarList(e.target.value)});

    // Track B: Core
    D.add_core_btn.addEventListener('click',function(){D.core_form.style.display='block';D.core_form._editId=null;clearCoreForm()});
    D.core_cancel_btn.addEventListener('click',function(){D.core_form.style.display='none'});
    D.core_save_btn.addEventListener('click',saveCoreEntry);
    D.core_search_btn.addEventListener('click',function(){loadCoreList(D.core_search.value,getActiveCoreFilter())});
    D.core_search.addEventListener('keydown',function(e){if(e.key==='Enter')loadCoreList(e.target.value,getActiveCoreFilter())});

    // Core filters
    document.querySelectorAll('.filter-btn').forEach(function(btn){
        btn.addEventListener('click',function(){
            document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active')});
            btn.classList.add('active');
            loadCoreList(D.core_search.value,btn.dataset.filter);
        });
    });
}

function getActiveCoreFilter(){
    var active=document.querySelector('.filter-btn.active');
    return active?active.dataset.filter:'all';
}

// ===== RIBBON =====
function renderRibbon(){
    D.weekly_ribbon.innerHTML='';
    for(var i=-3;i<=3;i++){
        var d=new Date(currentDate);d.setDate(d.getDate()+i);
        var p=document.createElement('div');
        p.className='day-pill'+(d.getDay()===0?' sun':d.getDay()===6?' sat':'')+(i===0?' active':'');
        var ns=document.createElement('span');ns.className='day-name';ns.textContent=dn(d.getDay());
        var ds2=document.createElement('span');ds2.className='day-num';ds2.textContent=d.getDate();
        p.appendChild(ns);p.appendChild(ds2);
        (function(dt){p.addEventListener('click',function(){loadDate(dt)})})(new Date(d));
        D.weekly_ribbon.appendChild(p);
    }
}

// ===== RENDER MODES =====
function renderModes(){
    D.mode_container.innerHTML='';
    MODES.forEach(function(mode){
        var block=document.createElement('div');
        block.className='mode-block '+mode.cssClass;

        // Funnel label
        var fl=document.createElement('div');fl.className='funnel-label '+mode.funnelLabel;fl.textContent=mode.funnelText;
        block.appendChild(fl);

        // Header
        var hdr=document.createElement('div');hdr.className='mode-header';
        hdr.innerHTML='<span class="mode-emoji">'+mode.emoji+'</span><span class="mode-title">'+mode.title+'</span><span class="mode-subtitle">'+mode.subtitle+'</span>';
        block.appendChild(hdr);

        // Progress
        var checked=0;mode.tasks.forEach(function(t){if(currentData.tasks[t.id])checked++});
        var pct=mode.tasks.length?Math.round(checked/mode.tasks.length*100):0;
        var pw=document.createElement('div');pw.className='progress-wrap';
        pw.innerHTML='<div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div><div class="progress-label"><span>'+checked+'/'+mode.tasks.length+'</span><span>'+pct+'%</span></div>';
        block.appendChild(pw);

        // Tasks
        mode.tasks.forEach(function(task){
            var ic=!!currentData.tasks[task.id];
            var isAlt=!!currentData.tasks[task.id+'_alt'];
            var isCore=CORE_TASK_IDS.indexOf(task.id)>=0;
            var el=document.createElement('div');el.className='task-item'+(ic?' checked':'')+(isCore?' core-task':'');

            var cb=document.createElement('div');cb.className='checkbox';
            cb.innerHTML='<span class="checkbox-inner">✔</span>';

            var lbl=document.createElement('span');lbl.className='task-label';
            if(task.alt&&isAlt)lbl.innerHTML='<span class="alt-label">'+task.alt+'</span>';
            else lbl.textContent=task.label;

            el.appendChild(cb);el.appendChild(lbl);

            if(task.alt){
                var ab=document.createElement('button');ab.className='alt-btn';ab.textContent='🔁';
                ab.title=isAlt?'원래로':'Plan B: '+task.alt;
                ab.addEventListener('click',function(e){e.stopPropagation();currentData.tasks[task.id+'_alt']=!isAlt;save();renderModes()});
                el.appendChild(ab);
            }

            el.addEventListener('click',function(){currentData.tasks[task.id]=!currentData.tasks[task.id];save();renderModes()});
            block.appendChild(el);
        });

        // 3-line log
        if(mode.tasks.find(function(t){return t.hasLog})){
            var lw=document.createElement('div');lw.className='log-toggle';
            var lb=document.createElement('button');lb.className='log-toggle-btn';lb.textContent='📋 3줄 로그 (What / Result / Idea)';
            var lf=document.createElement('div');lf.className='log-form';
            if(currentData.paper_log&&currentData.paper_log.what)lf.classList.add('open');

            [{k:'what',l:'What',p:'읽은 논문/키워드'},{k:'result',l:'Result',p:'핵심 발견'},{k:'idea',l:'Idea',p:'내 연구 적용 아이디어'}].forEach(function(f){
                var row=document.createElement('div');row.className='log-row';
                row.innerHTML='<span class="log-label">'+f.l+'</span>';
                var inp=document.createElement('input');inp.type='text';inp.className='log-input';inp.placeholder=f.p;
                inp.value=(currentData.paper_log&&currentData.paper_log[f.k])||'';
                inp.addEventListener('input',function(e){if(!currentData.paper_log)currentData.paper_log={};currentData.paper_log[f.k]=e.target.value;save()});
                row.appendChild(inp);lf.appendChild(row);
            });

            var tr=document.createElement('div');tr.className='log-tags';
            var ti=document.createElement('input');ti.type='text';ti.placeholder='태그: #OS #KV_Cache #LLM';
            ti.value=(currentData.paper_log&&currentData.paper_log.tags)||'';
            ti.addEventListener('input',function(e){if(!currentData.paper_log)currentData.paper_log={};currentData.paper_log.tags=e.target.value;save()});
            tr.appendChild(ti);lf.appendChild(tr);

            lb.addEventListener('click',function(){lf.classList.toggle('open')});
            lw.appendChild(lb);lw.appendChild(lf);block.appendChild(lw);
        }

        // Radar insight inline (morning only)
        if(mode.id==='morning'){
            var ri=document.createElement('div');ri.className='radar-inline';
            ri.innerHTML='<label>🌟 오늘의 1줄 인사이트</label>';
            var rii=document.createElement('input');rii.type='text';rii.placeholder='AI가 보여준 것 중 내 연구에 가장 중요한 것은...';
            rii.value=currentData.radar_insight||'';
            rii.addEventListener('input',function(e){currentData.radar_insight=e.target.value;save()});
            ri.appendChild(rii);block.appendChild(ri);
        }

        D.mode_container.appendChild(block);
    });
}

// ===== FLOW MODE =====
function applyFlowMode(){
    D.flow_mode_btn.classList.toggle('active',flowMode);
    D.flow_mode_area.style.display=flowMode?'block':'none';
    D.mode_container.style.display=flowMode?'none':'';
    if(flowMode){
        D.flow_text.value=currentData.flow_text||'';
        renderFlowCoreTasks();
    }
}

function renderFlowCoreTasks(){
    var c=D.flow_core_tasks;c.innerHTML='<div style="font-size:0.75rem;font-weight:600;color:var(--text3);margin-bottom:0.4rem">Core 루틴 (이것만이라도!)</div>';
    MODES.forEach(function(mode){
        mode.tasks.forEach(function(task){
            if(CORE_TASK_IDS.indexOf(task.id)<0)return;
            var ic=!!currentData.tasks[task.id];
            var el=document.createElement('div');el.className='task-item'+(ic?' checked':'');
            var cb=document.createElement('div');cb.className='checkbox';cb.innerHTML='<span class="checkbox-inner">✔</span>';
            var lbl=document.createElement('span');lbl.className='task-label';lbl.textContent=task.label;
            el.appendChild(cb);el.appendChild(lbl);
            el.addEventListener('click',function(){currentData.tasks[task.id]=!currentData.tasks[task.id];save();renderFlowCoreTasks()});
            c.appendChild(el);
        });
    });
}

// ===== AI TEXT PARSER =====
function parseAndFillRadar(){
    var raw=D.radar_paste_input.value.trim();
    if(!raw){return}

    var title='',tags='',body='',lines=raw.split('\n');

    // Try to extract title from ## header or first line with paper name pattern
    for(var i=0;i<lines.length;i++){
        var line=lines[i].trim();
        if(!line)continue;
        // ## Header style
        if(/^#{1,3}\s+/.test(line)){title=line.replace(/^#{1,3}\s+/,'').trim();lines.splice(i,1);break}
        // "제목:" or "논문:" prefix
        if(/^(제목|논문|Title|Paper)\s*[:：]\s*/i.test(line)){title=line.replace(/^(제목|논문|Title|Paper)\s*[:：]\s*/i,'').trim();lines.splice(i,1);break}
    }
    // If no title found, use first non-empty line
    if(!title){for(var j=0;j<lines.length;j++){if(lines[j].trim()){title=lines[j].trim();lines.splice(j,1);break}}}

    // Extract tags
    for(var k=0;k<lines.length;k++){
        var ln=lines[k].trim();
        if(/^(태그|Tags?|키워드|Keywords?)\s*[:：]\s*/i.test(ln)){
            tags=ln.replace(/^(태그|Tags?|키워드|Keywords?)\s*[:：]\s*/i,'').trim();
            lines.splice(k,1);break;
        }
    }
    // Auto-detect hashtags if no explicit tag line
    if(!tags){
        var hashTags=[];
        raw.replace(/#[A-Za-z가-힣_]+/g,function(m){if(hashTags.indexOf(m)<0)hashTags.push(m)});
        if(hashTags.length)tags=hashTags.join(' ');
    }

    // Remaining is body
    body=lines.join('\n').trim();

    // Extract authors
    var authors='',year='',venue='';
    for(var a=0;a<lines.length;a++){
        var la=lines[a].trim();
        if(/^(저자|Authors?|By)\s*[:：]\s*/i.test(la)){
            authors=la.replace(/^(저자|Authors?|By)\s*[:：]\s*/i,'').trim();
            lines.splice(a,1);break;
        }
    }
    // Extract year
    for(var y=0;y<lines.length;y++){
        var ly=lines[y].trim();
        if(/^(연도|Year|Published)\s*[:：]\s*/i.test(ly)){
            year=ly.replace(/^(연도|Year|Published)\s*[:：]\s*/i,'').trim();
            lines.splice(y,1);break;
        }
    }
    // Extract venue
    for(var v=0;v<lines.length;v++){
        var lv=lines[v].trim();
        if(/^(저널|학회|Venue|Journal|Conference|Published\s*in)\s*[:：]\s*/i.test(lv)){
            venue=lv.replace(/^(저널|학회|Venue|Journal|Conference|Published\s*in)\s*[:：]\s*/i,'').trim();
            lines.splice(v,1);break;
        }
    }
    // Auto-detect year from title if not found
    if(!year){var ym=title.match(/\b(20\d{2})\b/);if(ym)year=ym[1]}

    // Remaining is body
    body=lines.join('\n').trim();

    // Fill the form
    D.radar_title.value=title;
    D.radar_authors.value=authors;
    D.radar_year.value=year;
    D.radar_venue.value=venue;
    D.radar_tags.value=tags;
    D.radar_body.value=body;
    D.radar_insight.value=''; // User fills this
    D.radar_parser.style.display='none';
    D.radar_form.style.display='block';
    D.radar_form._editId=null;

    // Focus on the insight field so user just types their thought
    setTimeout(function(){D.radar_insight.focus()},100);
}

// ===== PROMOTION MODAL =====
var _promoteItem=null;
function showPromoteModal(item){
    _promoteItem=item;
    D.promote_modal.style.display='flex';
    D.promote_custom.value='';
    D.promote_options.querySelectorAll('input[type="checkbox"]').forEach(function(cb){cb.checked=false});
}

async function confirmPromotion(){
    if(!_promoteItem)return;
    var purposes=[];
    D.promote_options.querySelectorAll('input[type="checkbox"]:checked').forEach(function(cb){
        purposes.push(cb.parentElement.textContent.trim());
    });
    var custom=D.promote_custom.value.trim();
    if(custom)purposes.push(custom);

    var purposeText=purposes.length?'\n\n🎯 목적: '+purposes.join(', '):'';

    await TrackService.save('core_entries',uid(),{
        paper:_promoteItem.title,authors:_promoteItem.authors||'',year:_promoteItem.year||'',venue:_promoteItem.venue||'',
        status:'reading',tags:_promoteItem.tags||'',
        application:'',critique:'',
        notes:'[AI Radar 승격]'+purposeText+'\n\n'+(_promoteItem.body||'')+'\n\n💡 '+(_promoteItem.insight||''),
        created:new Date().toISOString(),updated:new Date().toISOString()
    });
    D.promote_modal.style.display='none';
    _promoteItem=null;
    document.querySelector('[data-view="core"]').click();
}

// ===== SAVE =====
var saveT;
function save(){clearTimeout(saveT);saveT=setTimeout(async function(){await DataService.saveDailyData(fmt(currentDate),currentData)},500)}

// ===== TRACK A: AI RADAR =====
function clearRadarForm(){D.radar_title.value='';D.radar_authors.value='';D.radar_year.value='';D.radar_venue.value='';D.radar_tags.value='';D.radar_body.value='';D.radar_insight.value=''}

async function saveRadarEntry(){
    var id=D.radar_form._editId||uid();
    var data={
        title:D.radar_title.value,authors:D.radar_authors.value,year:D.radar_year.value,venue:D.radar_venue.value,
        tags:D.radar_tags.value,
        body:D.radar_body.value,insight:D.radar_insight.value,
        created:D.radar_form._editId?undefined:new Date().toISOString(),
        updated:new Date().toISOString()
    };
    if(!data.created){var existing=await getRadarById(id);if(existing)data.created=existing.created}
    if(!data.created)data.created=data.updated;

    await TrackService.save('radar_entries',id,data);
    D.radar_form.style.display='none';
    loadRadarList('');
}

async function getRadarById(id){
    var all=await TrackService.getAll('radar_entries');
    return all.find(function(x){return x._id===id});
}

function promoteRadarToCore(){
    showPromoteModal({
        title:D.radar_title.value,
        tags:D.radar_tags.value,
        body:D.radar_body.value,
        insight:D.radar_insight.value
    });
    D.radar_form.style.display='none';
}

async function loadRadarList(query){
    var list=D.radar_list; list.innerHTML='';showLoading('AI Radar 불러오는 중...');
    var items=await TrackService.getAll('radar_entries');
    var q=query.trim().toLowerCase();

    if(q){
        items=items.filter(function(x){
            return((x.title||'')+' '+(x.tags||'')+' '+(x.body||'')+' '+(x.insight||'')).toLowerCase().indexOf(q)>=0;
        });
    }

    hideLoading();
    if(!items.length){list.innerHTML='<div class="empty-state">'+(q?'"'+query+'" 검색 결과 없음':'아직 AI Radar 항목이 없습니다. + 버튼으로 추가해보세요!')+'</div>';return}

    items.forEach(function(item){
        var entry=document.createElement('div');entry.className='radar-entry';
        var hdr=document.createElement('div');hdr.className='radar-entry-header';
        hdr.innerHTML='<span class="radar-entry-title">'+item.title+'</span><span class="radar-entry-date">'+(item.created||'').substring(0,10)+'</span>';
        entry.appendChild(hdr);

        if(item.authors||item.year||item.venue){
            var meta=document.createElement('div');meta.className='core-entry-meta';
            if(item.authors)meta.innerHTML+='<span><span class="core-meta-label">저자</span> '+item.authors+'</span>';
            if(item.year)meta.innerHTML+='<span><span class="core-meta-label">연도</span> '+item.year+'</span>';
            if(item.venue)meta.innerHTML+='<span><span class="core-meta-label">저널</span> '+item.venue+'</span>';
            entry.appendChild(meta);
        }

        if(item.tags){
            var tags=document.createElement('div');tags.className='radar-entry-tags';
            item.tags.split(/[\s,]+/).forEach(function(t){if(!t)return;var sp=document.createElement('span');sp.className='radar-tag';sp.textContent=t;tags.appendChild(sp)});
            entry.appendChild(tags);
        }

        if(item.body){
            var body=document.createElement('div');body.className='radar-entry-body';body.textContent=item.body;
            body.addEventListener('click',function(){body.classList.toggle('expanded')});
            entry.appendChild(body);
        }

        if(item.insight){
            var ins=document.createElement('div');ins.className='radar-entry-insight';
            ins.innerHTML='<strong>🌟 내 생각:</strong> '+item.insight;
            entry.appendChild(ins);
        }

        var acts=document.createElement('div');acts.className='radar-actions';
        var editBtn=document.createElement('button');editBtn.textContent='수정';
        editBtn.addEventListener('click',function(){
            D.radar_form._editId=item._id;
            D.radar_title.value=item.title||'';D.radar_authors.value=item.authors||'';D.radar_year.value=item.year||'';D.radar_venue.value=item.venue||'';
            D.radar_tags.value=item.tags||'';
            D.radar_body.value=item.body||'';D.radar_insight.value=item.insight||'';
            D.radar_form.style.display='block';
        });
        var promBtn=document.createElement('button');promBtn.textContent='➡️ Core로';
        promBtn.addEventListener('click',function(){showPromoteModal(item)});
        var delBtn=document.createElement('button');delBtn.textContent='삭제';
        delBtn.addEventListener('click',async function(){
            if(confirm('삭제하시겠습니까?')){await TrackService.remove('radar_entries',item._id);loadRadarList(q)}
        });
        acts.appendChild(editBtn);acts.appendChild(promBtn);acts.appendChild(delBtn);
        entry.appendChild(acts);
        list.appendChild(entry);
    });
    hideLoading();
}

// ===== TRACK B: CORE RESEARCH =====
function clearCoreForm(){D.core_paper.value='';D.core_authors.value='';D.core_year.value='';D.core_venue.value='';D.core_status.value='reading';D.core_tags.value='';D.core_application.value='';D.core_critique.value='';D.core_notes.value=''}

async function saveCoreEntry(){
    var id=D.core_form._editId||uid();
    var data={
        paper:D.core_paper.value,authors:D.core_authors.value,year:D.core_year.value,venue:D.core_venue.value,
        status:D.core_status.value,
        tags:D.core_tags.value,application:D.core_application.value,
        critique:D.core_critique.value,notes:D.core_notes.value,
        created:D.core_form._editId?undefined:new Date().toISOString(),
        updated:new Date().toISOString()
    };
    if(!data.created){var all=await TrackService.getAll('core_entries');var ex=all.find(function(x){return x._id===id});if(ex)data.created=ex.created}
    if(!data.created)data.created=data.updated;

    await TrackService.save('core_entries',id,data);
    D.core_form.style.display='none';
    loadCoreList('','all');
}

async function loadCoreList(query,filter){
    var list=D.core_list;list.innerHTML='';showLoading('Core Research 불러오는 중...');
    var items=await TrackService.getAll('core_entries');
    var q=query.trim().toLowerCase();

    if(q){items=items.filter(function(x){return((x.paper||'')+' '+(x.tags||'')+' '+(x.application||'')+' '+(x.critique||'')+' '+(x.notes||'')).toLowerCase().indexOf(q)>=0})}
    if(filter&&filter!=='all'){items=items.filter(function(x){return x.status===filter})}

    hideLoading();
    if(!items.length){list.innerHTML='<div class="empty-state">'+(q||filter!=='all'?'검색 결과 없음':'아직 Core Research 항목이 없습니다.')+'</div>';return}

    var statusMap={reading:'📖 읽는 중',implemented:'⚙️ 구현 완료',cited:'📝 인용됨',archived:'📦 보관'};

    items.forEach(function(item){
        var entry=document.createElement('div');entry.className='core-entry';

        var hdr=document.createElement('div');hdr.className='core-entry-header';
        var title=document.createElement('span');title.className='core-entry-title';title.textContent=item.paper;
        var badge=document.createElement('span');badge.className='core-status-badge '+(item.status||'reading');
        badge.textContent=statusMap[item.status]||item.status;
        hdr.appendChild(title);hdr.appendChild(badge);entry.appendChild(hdr);

        if(item.authors||item.year||item.venue){
            var meta=document.createElement('div');meta.className='core-entry-meta';
            if(item.authors)meta.innerHTML+='<span><span class="core-meta-label">저자</span> '+item.authors+'</span>';
            if(item.year)meta.innerHTML+='<span><span class="core-meta-label">연도</span> '+item.year+'</span>';
            if(item.venue)meta.innerHTML+='<span><span class="core-meta-label">저널</span> '+item.venue+'</span>';
            entry.appendChild(meta);
        }

        if(item.tags){
            var tags=document.createElement('div');tags.className='core-entry-tags';
            item.tags.split(/[\s,]+/).forEach(function(t){if(!t)return;var sp=document.createElement('span');sp.className='core-tag';sp.textContent=t;tags.appendChild(sp)});
            entry.appendChild(tags);
        }

        if(item.application){
            var sec=document.createElement('div');sec.className='core-section';
            sec.innerHTML='<div class="core-section-label">내 연구 적용점</div><div class="core-section-text">'+item.application+'</div>';
            entry.appendChild(sec);
        }

        if(item.critique){
            var cr=document.createElement('div');cr.className='core-section';
            cr.innerHTML='<div class="core-section-label">한계점 / Critique</div><div class="core-critique-text">'+item.critique+'</div>';
            entry.appendChild(cr);
        }

        if(item.notes){
            var nt=document.createElement('div');nt.className='core-section';
            nt.innerHTML='<div class="core-section-label">핵심 메모</div><div class="core-section-text">'+item.notes+'</div>';
            entry.appendChild(nt);
        }

        var acts=document.createElement('div');acts.className='core-actions';
        var editBtn=document.createElement('button');editBtn.textContent='수정';
        editBtn.addEventListener('click',function(){
            D.core_form._editId=item._id;
            D.core_paper.value=item.paper||'';D.core_authors.value=item.authors||'';D.core_year.value=item.year||'';D.core_venue.value=item.venue||'';
            D.core_status.value=item.status||'reading';
            D.core_tags.value=item.tags||'';D.core_application.value=item.application||'';
            D.core_critique.value=item.critique||'';D.core_notes.value=item.notes||'';
            D.core_form.style.display='block';
        });
        var delBtn=document.createElement('button');delBtn.textContent='삭제';
        delBtn.addEventListener('click',async function(){
            if(confirm('삭제하시겠습니까?')){await TrackService.remove('core_entries',item._id);loadCoreList(q,filter)}
        });
        acts.appendChild(editBtn);acts.appendChild(delBtn);
        entry.appendChild(acts);
        list.appendChild(entry);
    });
    hideLoading();
}

// ===== CALENDAR =====
async function renderCalendar(){
    var y=calendarDate.getFullYear(),m=calendarDate.getMonth();
    D.calendar_month_display.textContent=y+'년 '+(m+1)+'월';
    D.calendar_grid.innerHTML='';D.day_detail.style.display='none';
    showLoading(y+'년 '+(m+1)+'월 불러오는 중...');
    ['일','월','화','수','목','금','토'].forEach(function(n,i){var h=document.createElement('div');h.className='cal-day-header'+(i===0?' sun':i===6?' sat':'');h.textContent=n;D.calendar_grid.appendChild(h)});
    var fd=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),today=new Date();
    // Batch load entire month in 1 query
    var md=await DataService.getMonthData(y,m);
    for(var e=0;e<fd;e++){var emp=document.createElement('div');emp.className='cal-day empty';D.calendar_grid.appendChild(emp)}
    for(var day=1;day<=dim;day++){
        var cell=document.createElement('div');cell.className='cal-day';
        var dk=fmt(new Date(y,m,day)),dd=md[dk]||null,rate=compRate(dd);
        if(dd&&Object.keys(dd.tasks||{}).length>0){if(rate>=1)cell.classList.add('level-4');else if(rate>=.71)cell.classList.add('level-3');else if(rate>=.31)cell.classList.add('level-2');else cell.classList.add('level-1')}
        if(dd&&(dd.diary||dd.note)&&(dd.diary||dd.note).trim())cell.classList.add('has-diary');
        if(sameDay(new Date(y,m,day),today))cell.classList.add('today');
        var num=document.createElement('span');num.className='cal-num';num.textContent=day;cell.appendChild(num);
        (function(data,key){cell.addEventListener('click',function(){showDetail(key,data)})})(dd,dk);
        D.calendar_grid.appendChild(cell);
    }
    hideLoading();
}

function showDetail(ds,data){
    D.detail_date.textContent=ds;D.detail_content.innerHTML='';
    if(!data){D.detail_content.innerHTML='<p style="color:var(--text3);font-size:0.82rem">기록 없음</p>';D.day_detail.style.display='block';return}
    MODES.forEach(function(mode){
        var div=document.createElement('div');div.className='detail-category';
        div.innerHTML='<div class="detail-category-name">'+mode.emoji+' '+mode.title+'</div>';
        mode.tasks.forEach(function(t){var td=document.createElement('div');td.className='detail-task';var done=data.tasks&&data.tasks[t.id];td.innerHTML='<span class="'+(done?'done':'not-done')+'">'+(done?'✔':'○')+'</span> '+t.label;div.appendChild(td)});
        D.detail_content.appendChild(div);
    });
    if(data.paper_log&&(data.paper_log.what||data.paper_log.result||data.paper_log.idea)){
        var ld=document.createElement('div');ld.className='archive-entry';ld.style.margin='0.5rem 0';
        ld.innerHTML='<div class="detail-category-name">📋 3줄 로그</div>';
        ['what','result','idea'].forEach(function(k){if(data.paper_log[k])ld.innerHTML+='<div class="archive-row"><span class="archive-row-label">'+k+'</span><span>'+data.paper_log[k]+'</span></div>'});
        D.detail_content.appendChild(ld);
    }
    if(data.radar_insight){var ri=document.createElement('div');ri.className='radar-entry-insight';ri.innerHTML='<strong>🌟</strong> '+data.radar_insight;D.detail_content.appendChild(ri)}
    var diary=data.diary||data.note||'';if(diary.trim()){var dd2=document.createElement('div');dd2.className='detail-diary';dd2.textContent=diary;D.detail_content.appendChild(dd2)}
    if(data.hanja_char){var hd=document.createElement('div');hd.className='detail-hanja';hd.innerHTML='<strong>'+data.hanja_char+'</strong> '+(data.hanja_reading||'')+(data.hanja_note?' — '+data.hanja_note:'');D.detail_content.appendChild(hd)}
    D.day_detail.style.display='block';

    // Google Calendar events
    if(typeof fetchGoogleCalendarEvents==='function'&&_googleAccessToken){
        D.gcal_events.style.display='block';
        D.gcal_list.innerHTML='<div class="gcal-empty">일정 불러오는 중...</div>';
        fetchGoogleCalendarEvents(ds).then(function(events){
            D.gcal_list.innerHTML='';
            if(!events.length){D.gcal_list.innerHTML='<div class="gcal-empty">이 날 일정이 없습니다</div>';return}
            events.forEach(function(ev){
                var el=document.createElement('div');el.className='gcal-event';
                el.innerHTML='<span class="gcal-event-time">'+ev.time+'</span><span class="gcal-event-title">'+ev.title+'</span>';
                D.gcal_list.appendChild(el);
            });
        });
    }
}

// ===== GOOGLE CALENDAR WEEKLY =====
var gcalWeekStart = new Date();

function setupGcalWeek() {
    if (!D.gcal_prev_week) return;
    D.gcal_prev_week.addEventListener('click', function() {
        gcalWeekStart.setDate(gcalWeekStart.getDate() - 7);
        renderGcalWeek();
    });
    D.gcal_next_week.addEventListener('click', function() {
        gcalWeekStart.setDate(gcalWeekStart.getDate() + 7);
        renderGcalWeek();
    });
}

async function renderGcalWeek() {
    if (!D.gcal_week_grid) return;
    if (typeof fetchGoogleCalendarWeek !== 'function' || !_googleAccessToken) {
        D.gcal_week_section.style.display = 'none';
        return;
    }

    D.gcal_week_section.style.display = 'block';
    D.gcal_week_grid.innerHTML = '<div class="gcal-loading">일정 불러오는 중...</div>';

    var pad = function(n) { return String(n).padStart(2, '0'); };
    var sun = new Date(gcalWeekStart);
    sun.setDate(sun.getDate() - sun.getDay());
    var endDay = new Date(sun);
    endDay.setDate(endDay.getDate() + 6);

    D.gcal_week_label.textContent = (sun.getMonth() + 1) + '/' + sun.getDate() + ' - ' + (endDay.getMonth() + 1) + '/' + endDay.getDate();

    var events = await fetchGoogleCalendarWeek(sun);

    D.gcal_week_grid.innerHTML = '';
    var today = new Date();
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    for (var i = 0; i < 7; i++) {
        var d = new Date(sun);
        d.setDate(sun.getDate() + i);
        var ds = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        var isToday = sameDay(d, today);

        var col = document.createElement('div');
        col.className = 'gcal-day-col';

        var header = document.createElement('div');
        header.className = 'gcal-day-col-header' + (isToday ? ' today' : '') + (i === 0 ? ' sun' : '') + (i === 6 ? ' sat' : '');
        header.textContent = dayNames[i] + ' ' + d.getDate();
        col.appendChild(header);

        var dayEvents = events[ds] || [];
        if (dayEvents.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'gcal-day-empty';
            empty.textContent = '-';
            col.appendChild(empty);
        } else {
            dayEvents.forEach(function(ev) {
                var evEl = document.createElement('div');
                evEl.className = 'gcal-mini-event' + (ev.allDay ? ' gcal-mini-allday' : '');
                evEl.innerHTML = '<div class="gcal-mini-event-time">' + ev.time + '</div><div class="gcal-mini-event-title">' + ev.title + '</div>';
                col.appendChild(evEl);
            });
        }

        D.gcal_week_grid.appendChild(col);
    }
}

// ===== STATS =====
async function renderStats(){
    showLoading('통계 계산 중...');
    // Batch load 30 days in 1 query
    var today=new Date();
    var rangeData=await DataService.getDateRange(today,30);
    renderWeeklyStats(rangeData);
    renderModeStats(rangeData);
    renderDiaryStats(rangeData);
    hideLoading();
}

function renderWeeklyStats(rangeData){
    var c=document.getElementById('stats-weekly');c.innerHTML='';
    var today=new Date(),start=new Date(today);start.setDate(today.getDate()-today.getDay());
    for(var i=0;i<7;i++){
        var d=new Date(start);d.setDate(start.getDate()+i);
        var data=rangeData[fmt(d)]||null,rate=compRate(data),pct=Math.round(rate*100);
        var circ=2*Math.PI*20,off=circ-(rate*circ);
        var card=document.createElement('div');card.className='stat-day-card';
        card.innerHTML='<div class="stat-day-name">'+dn(i)+'</div><div class="stat-day-date">'+(d.getMonth()+1)+'/'+d.getDate()+'</div><div class="stat-ring"><svg width="48" height="48" viewBox="0 0 50 50"><circle class="stat-ring-bg" cx="25" cy="25" r="20"/><circle class="stat-ring-fill" cx="25" cy="25" r="20" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'"/></svg><span class="stat-percent">'+pct+'%</span></div>';
        c.appendChild(card);
    }
}

function renderModeStats(rangeData){
    var c=document.getElementById('stats-categories');c.innerHTML='';
    var dd=[];Object.keys(rangeData).forEach(function(k){if(rangeData[k])dd.push(rangeData[k])});
    MODES.forEach(function(mode){
        var done=0,total=0;dd.forEach(function(data){mode.tasks.forEach(function(t){total++;if(data.tasks&&data.tasks[t.id])done++})});
        var pct=total?Math.round(done/total*100):0;
        var row=document.createElement('div');row.className='stat-category-row';
        row.innerHTML='<div class="stat-category-name">'+mode.emoji+' '+mode.title+'</div><div class="stat-bar-container"><div class="stat-bar-fill" style="width:'+pct+'%"></div></div><div class="stat-bar-label"><span>'+done+'/'+total+'</span><span>'+pct+'%</span></div>';
        c.appendChild(row);
    });
}

function renderDiaryStats(rangeData){
    var c=document.getElementById('stats-diary');c.innerHTML='';
    var today=new Date(),written=0,dots=[];
    for(var i=29;i>=0;i--){
        var d=new Date(today);d.setDate(today.getDate()-i);
        var data=rangeData[fmt(d)]||null;
        var has=data&&(data.diary||data.note)&&(data.diary||data.note).trim().length>0;
        if(has)written++;dots.push(has);
    }
    c.innerHTML='<div class="diary-stats-text">최근 30일 중 '+written+'일 작성 ('+Math.round(written/30*100)+'%)</div>';
    var dd=document.createElement('div');dd.className='diary-streak';
    dots.forEach(function(h){var dot=document.createElement('div');dot.className='diary-dot'+(h?' written':'');dd.appendChild(dot)});
    c.appendChild(dd);
}

// Init is now handled by auth-gated startup at top
