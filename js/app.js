// ===== SIMPLE MARKDOWN RENDERER =====
function renderMd(text){
    if(!text)return '';
    // Escape HTML
    var s=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    // Headings: ### → h4, ## → h3 (small headings for inside cards)
    s=s.replace(/^### (.+)$/gm,'<h4 class="md-h3">$1</h4>');
    s=s.replace(/^## (.+)$/gm,'<h3 class="md-h2">$1</h3>');
    // Bold: **text**
    s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    // Italic: *text*
    s=s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,'<em>$1</em>');
    // Inline code: `text`
    s=s.replace(/`([^`]+)`/g,'<code class="md-code">$1</code>');
    // Bullet list: - item or * item
    s=s.replace(/^[\-\*] (.+)$/gm,'<li>$1</li>');
    s=s.replace(/(<li>.*<\/li>\n?)+/g,'<ul class="md-list">$&</ul>');
    // Numbered list: 1. item
    s=s.replace(/^\d+\. (.+)$/gm,'<li>$1</li>');
    // Horizontal rule: ---
    s=s.replace(/^---$/gm,'<hr class="md-hr">');
    // Arrow/dash labels: What:, Result:, Idea: etc.
    s=s.replace(/^(What|Result|Idea|무엇을|결과|내 생각|핵심|문제 정의|핵심 주장|요약|방법론|한계점|적용점)(\s*[:：])/gm,'<strong class="md-label">$1$2</strong>');
    // Line breaks: \n → <br> (but not inside already-created tags)
    s=s.replace(/\n/g,'<br>');
    // Clean up double <br> after block elements
    s=s.replace(/(<\/h[34]>)<br>/g,'$1');
    s=s.replace(/(<\/ul>)<br>/g,'$1');
    s=s.replace(/(<hr[^>]*>)<br>/g,'$1');
    return s;
}

// ===== HANJA DB =====
var HANJA_DB=[
// === 사자성어 (50개) ===
{char:'臥薪嘗膽',reading:'와신상담',meaning:'잠자리에 가시를 깔고 쓸개를 핥다',detail:'越王勾踐의 복수 고사. 목표를 위해 고난을 참고 견딤. 중국어: wò xīn cháng dǎn'},
{char:'塞翁之馬',reading:'새옹지마',meaning:'변방 노인의 말',detail:'인생의 길흉화복은 예측할 수 없다. 중국어: sài wēng zhī mǎ'},
{char:'刻舟求劍',reading:'각주구검',meaning:'배에 새기고 칼을 찾다',detail:'변화를 모르고 옛 방식만 고집함. 중국어: kè zhōu qiú jiàn'},
{char:'四面楚歌',reading:'사면초가',meaning:'사방이 초나라 노래',detail:'고립무원의 상황. 項羽의 고사. 중국어: sì miàn chǔ gē'},
{char:'矛盾',reading:'모순',meaning:'창과 방패',detail:'앞뒤가 맞지 않는 말이나 행동. 중국어: máo dùn'},
{char:'溫故知新',reading:'온고지신',meaning:'옛것을 익혀 새것을 앎',detail:'論語. 과거를 복습하면 새 깨달음을 얻는다. 중국어: wēn gù zhī xīn'},
{char:'畫龍點睛',reading:'화룡점정',meaning:'용을 그리고 눈동자를 찍다',detail:'가장 중요한 마무리. 핵심을 짚다. 중국어: huà lóng diǎn jīng'},
{char:'自強不息',reading:'자강불식',meaning:'스스로 강해지기를 쉬지 않다',detail:'周易. 끊임없이 자기를 단련함. 중국어: zì qiáng bù xī'},
{char:'厚積薄發',reading:'후적박발',meaning:'두텁게 쌓고 얇게 발한다',detail:'오래 준비하여 한 번에 크게 성과를 냄. 중국어: hòu jī bó fā'},
{char:'破釜沉舟',reading:'파부침주',meaning:'솥을 깨고 배를 침몰시키다',detail:'퇴로를 끊고 결사적으로 싸움. 項羽의 고사. 중국어: pò fǔ chén zhōu'},
{char:'胸有成竹',reading:'흉유성죽',meaning:'가슴속에 이미 대나무가 있다',detail:'일을 시작하기 전 이미 계획이 확실함. 중국어: xiōng yǒu chéng zhú'},
{char:'愚公移山',reading:'우공이산',meaning:'어리석은 노인이 산을 옮기다',detail:'끈기와 노력으로 어떤 일이든 이룰 수 있다. 중국어: yú gōng yí shān'},
{char:'百折不撓',reading:'백절불요',meaning:'백 번 꺾여도 굴하지 않다',detail:'어떤 어려움에도 포기하지 않는 의지. 중국어: bǎi zhé bù náo'},
{char:'韋編三絶',reading:'위편삼절',meaning:'가죽 끈이 세 번 끊어지다',detail:'孔子가 易經을 열심히 읽어 가죽끈이 닳음. 중국어: wéi biān sān jué'},
{char:'朝三暮四',reading:'조삼모사',meaning:'아침에 셋 저녁에 넷',detail:'눈앞의 차이에 속아 본질을 모름. 중국어: zhāo sān mù sì'},
{char:'以逸待勞',reading:'이일대로',meaning:'편안함으로 피로를 기다린다',detail:'孫子兵法. 여유롭게 지친 적을 맞아 싸움. 중국어: yǐ yì dài láo'},
{char:'鶴立鷄群',reading:'학립계군',meaning:'닭 무리 속의 학',detail:'여럿 중에서 뛰어나게 돋보이는 인재. 중국어: hè lì jī qún'},
{char:'一石二鳥',reading:'일석이조',meaning:'한 돌로 두 새를 잡다',detail:'하나의 행동으로 두 가지 이득을 봄. 중국어: yì shí èr niǎo'},
{char:'前車之鑑',reading:'전거지감',meaning:'앞 수레의 거울',detail:'남의 실패를 보고 교훈으로 삼음. 중국어: qián chē zhī jiàn'},
{char:'名不虛傳',reading:'명불허전',meaning:'이름이 헛되이 전해지지 않다',detail:'평판이 사실과 일치한다. 중국어: míng bù xū chuán'},
{char:'虎視眈眈',reading:'호시탐탐',meaning:'호랑이가 노려보듯',detail:'기회를 엿보며 날카롭게 주시함. 중국어: hǔ shì dān dān'},
{char:'錦上添花',reading:'금상첨화',meaning:'비단 위에 꽃을 더하다',detail:'좋은 것에 더 좋은 것을 더함. 중국어: jǐn shàng tiān huā'},
{char:'同舟共濟',reading:'동주공제',meaning:'같은 배를 타고 함께 건너다',detail:'어려움을 함께 극복함. 중국어: tóng zhōu gòng jì'},
{char:'九死一生',reading:'구사일생',meaning:'아홉 번 죽을 뻔하고 한 번 삶',detail:'거의 죽을 고비를 겨우 넘김. 중국어: jiǔ sǐ yì shēng'},
{char:'大器晩成',reading:'대기만성',meaning:'큰 그릇은 늦게 이루어진다',detail:'큰 인물은 오랜 노력 끝에 성공함. 중국어: dà qì wǎn chéng'},
{char:'不恥下問',reading:'불치하문',meaning:'아랫사람에게 묻기를 부끄러워하지 않다',detail:'論語. 배움에 겸손한 태도. 중국어: bù chǐ xià wèn'},
{char:'見微知著',reading:'견미지저',meaning:'작은 것을 보고 큰 것을 안다',detail:'미세한 단서로 전체를 파악하는 통찰. 중국어: jiàn wēi zhī zhù'},
{char:'未雨綢繆',reading:'미우주무',meaning:'비 오기 전에 창문을 수리하다',detail:'미리 대비하고 준비함. 중국어: wèi yǔ chóu móu'},
{char:'功虧一簣',reading:'공궤일궤',meaning:'한 삼태기의 흙이 모자라 실패하다',detail:'마지막 순간에 포기하여 실패함. 중국어: gōng kuī yī kuì'},
{char:'兼聽則明',reading:'겸청즉명',meaning:'두루 들으면 밝아진다',detail:'여러 의견을 듣는 리더가 현명하다. 중국어: jiān tīng zé míng'},
// === 중국어 실용 단어/표현 (50개) ===
{char:'人工智能',reading:'rén gōng zhì néng',meaning:'인공지능 (AI)',detail:'人工=인공, 智能=지능. 예: 人工智能技术 (AI 기술)'},
{char:'深度学习',reading:'shēn dù xué xí',meaning:'딥러닝',detail:'深度=깊이, 学习=학습. 예: 深度学习模型 (딥러닝 모델)'},
{char:'算法',reading:'suàn fǎ',meaning:'알고리즘',detail:'算=계산, 法=방법. 예: 优化算法 (최적화 알고리즘)'},
{char:'服务器',reading:'fú wù qì',meaning:'서버',detail:'服务=서비스, 器=기기. 예: 云服务器 (클라우드 서버)'},
{char:'分布式',reading:'fēn bù shì',meaning:'분산식',detail:'分布=분포, 式=방식. 예: 分布式系统 (분산 시스템)'},
{char:'推理',reading:'tuī lǐ',meaning:'추론/인퍼런스',detail:'推=밀다/추론하다, 理=이치. 예: 模型推理 (모델 인퍼런스)'},
{char:'训练',reading:'xùn liàn',meaning:'훈련/트레이닝',detail:'예: 训练数据 (훈련 데이터), 预训练 (프리트레이닝)'},
{char:'显卡',reading:'xiǎn kǎ',meaning:'그래픽카드/GPU',detail:'显=표시, 卡=카드. 예: 高端显卡 (고급 GPU)'},
{char:'内存',reading:'nèi cún',meaning:'메모리/RAM',detail:'内=안, 存=저장. 예: 内存不足 (메모리 부족)'},
{char:'缓存',reading:'huǎn cún',meaning:'캐시',detail:'缓=완충, 存=저장. 예: KV缓存 (KV 캐시)'},
{char:'吞吐量',reading:'tūn tǔ liàng',meaning:'처리량/Throughput',detail:'吞=삼키다, 吐=뱉다, 量=양. 예: 高吞吐量 (높은 처리량)'},
{char:'延迟',reading:'yán chí',meaning:'지연/Latency',detail:'延=늘이다, 迟=늦다. 예: 低延迟 (낮은 지연)'},
{char:'论文',reading:'lùn wén',meaning:'논문',detail:'论=논의, 文=글. 예: 发表论文 (논문 발표)'},
{char:'研究生',reading:'yán jiū shēng',meaning:'대학원생',detail:'研究=연구, 生=학생. 예: 硕士研究生 (석사과정)'},
{char:'导师',reading:'dǎo shī',meaning:'지도교수',detail:'导=이끌다, 师=스승. 예: 博士导师 (박사 지도교수)'},
{char:'实验',reading:'shí yàn',meaning:'실험',detail:'实=실제, 验=검증. 예: 做实验 (실험하다)'},
{char:'数据集',reading:'shù jù jí',meaning:'데이터셋',detail:'数据=데이터, 集=모음. 예: 训练数据集 (훈련 데이터셋)'},
{char:'开源',reading:'kāi yuán',meaning:'오픈소스',detail:'开=열다, 源=근원. 예: 开源代码 (오픈소스 코드)'},
{char:'部署',reading:'bù shǔ',meaning:'배포/디플로이',detail:'예: 模型部署 (모델 배포), 云端部署 (클라우드 배포)'},
{char:'优化',reading:'yōu huà',meaning:'최적화',detail:'优=뛰어나다, 化=변화시키다. 예: 性能优化 (성능 최적화)'},
{char:'并行',reading:'bìng xíng',meaning:'병렬',detail:'并=나란히, 行=실행. 예: 并行计算 (병렬 연산)'},
{char:'量化',reading:'liàng huà',meaning:'양자화/Quantization',detail:'量=양, 化=변화. 예: 模型量化 (모델 양자화)'},
{char:'调度',reading:'diào dù',meaning:'스케줄링',detail:'调=조정, 度=정도. 예: 任务调度 (태스크 스케줄링)'},
{char:'瓶颈',reading:'píng jǐng',meaning:'병목',detail:'瓶=병, 颈=목. 예: 性能瓶颈 (성능 병목)'},
{char:'权重',reading:'quán zhòng',meaning:'가중치/Weight',detail:'权=권한, 重=무게. 예: 模型权重 (모델 가중치)'},
{char:'迁移',reading:'qiān yí',meaning:'마이그레이션/전이',detail:'예: 数据迁移 (데이터 마이그레이션), 迁移学习 (전이학습)'},
{char:'框架',reading:'kuàng jià',meaning:'프레임워크',detail:'框=틀, 架=구조. 예: 深度学习框架 (딥러닝 프레임워크)'},
{char:'加速',reading:'jiā sù',meaning:'가속',detail:'加=더하다, 速=속도. 예: GPU加速 (GPU 가속)'},
{char:'异构',reading:'yì gòu',meaning:'이기종/Heterogeneous',detail:'异=다른, 构=구조. 예: 异构计算 (이기종 컴퓨팅)'},
{char:'弹性',reading:'tán xìng',meaning:'탄력성/Elastic',detail:'弹=튀다, 性=성질. 예: 弹性计算 (탄력적 컴퓨팅)'},
{char:'负载均衡',reading:'fù zài jūn héng',meaning:'로드밸런싱',detail:'负载=부하, 均衡=균형. 예: 服务器负载均衡'},
{char:'预填充',reading:'yù tián chōng',meaning:'프리필(Prefill)',detail:'预=미리, 填充=채우다. LLM 서빙의 Prefill 단계'},
{char:'解码',reading:'jiě mǎ',meaning:'디코딩(Decode)',detail:'解=풀다, 码=코드. 예: 自回归解码 (Auto-regressive decoding)'},
{char:'注意力机制',reading:'zhù yì lì jī zhì',meaning:'어텐션 메커니즘',detail:'注意力=주의력, 机制=메커니즘. Transformer의 핵심'},
{char:'大语言模型',reading:'dà yǔ yán mó xíng',meaning:'대규모 언어 모델(LLM)',detail:'大=대규모, 语言=언어, 模型=모델. 예: 大语言模型推理'},
{char:'微调',reading:'wēi tiáo',meaning:'파인튜닝',detail:'微=미세, 调=조정. 예: 指令微调 (Instruction Fine-tuning)'},
{char:'提示词',reading:'tí shì cí',meaning:'프롬프트',detail:'提示=힌트, 词=단어. 예: 提示词工程 (프롬프트 엔지니어링)'},
{char:'上下文',reading:'shàng xià wén',meaning:'컨텍스트',detail:'上=위, 下=아래, 文=글. 예: 上下文窗口 (컨텍스트 윈도우)'},
{char:'向量',reading:'xiàng liàng',meaning:'벡터',detail:'向=방향, 量=양. 예: 词向量 (워드 벡터), 向量数据库'},
{char:'稀疏',reading:'xī shū',meaning:'스파스(Sparse)',detail:'稀=드물다, 疏=성기다. 예: 稀疏注意力 (Sparse Attention)'},
{char:'蒸馏',reading:'zhēng liù',meaning:'디스틸레이션/증류',detail:'예: 知识蒸馏 (Knowledge Distillation)'},
{char:'混合专家',reading:'hùn hé zhuān jiā',meaning:'MoE(Mixture of Experts)',detail:'混合=혼합, 专家=전문가. 예: 混合专家模型'},
{char:'端到端',reading:'duān dào duān',meaning:'End-to-End',detail:'端=끝, 到=까지. 예: 端到端训练 (E2E 트레이닝)'},
{char:'鲁棒性',reading:'lǔ bàng xìng',meaning:'로버스트니스/강건성',detail:'鲁棒=robust 음역, 性=성질. 예: 模型鲁棒性'},
{char:'收敛',reading:'shōu liǎn',meaning:'수렴/Convergence',detail:'收=모으다, 敛=거두다. 예: 训练收敛 (학습 수렴)'},
{char:'过拟合',reading:'guò nǐ hé',meaning:'오버피팅',detail:'过=지나친, 拟合=피팅. 예: 防止过拟合 (오버피팅 방지)'},
{char:'梯度',reading:'tī dù',meaning:'그래디언트',detail:'梯=사다리, 度=정도. 예: 梯度下降 (경사하강법)'},
{char:'嵌入',reading:'qiàn rù',meaning:'임베딩',detail:'嵌=끼우다, 入=들어가다. 예: 词嵌入 (워드 임베딩)'},
{char:'基准测试',reading:'jī zhǔn cè shì',meaning:'벤치마크',detail:'基准=기준, 测试=테스트. 예: 性能基准测试'},
{char:'可扩展性',reading:'kě kuò zhǎn xìng',meaning:'확장성/Scalability',detail:'可=가능, 扩展=확장, 性=성질. 예: 系统可扩展性'}
];
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
        // Remove _id before saving to Firebase (Firestore uses doc ID separately)
        var cleanData = Object.assign({}, data);
        delete cleanData._id;
        if (isFirebaseConfigured && db) {
            try {
                await db.collection(collection).doc(id).set(cleanData, {merge: true});
            } catch(e) {
                console.error('Firebase save error ('+collection+'/'+id+'):', e);
                // Show user-visible error for permission issues
                if (e.code === 'permission-denied') {
                    console.warn('Firestore 권한 오류: Firebase Console에서 보안 규칙을 확인하세요.');
                }
            }
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
            var body=document.createElement('div');body.className='radar-entry-body';body.innerHTML=renderMd(item.body);
            body.addEventListener('click',function(){body.classList.toggle('expanded')});
            entry.appendChild(body);
        }

        if(item.insight){
            var ins=document.createElement('div');ins.className='radar-entry-insight';
            ins.innerHTML='<strong>🌟 내 생각:</strong> '+renderMd(item.insight);
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
            sec.innerHTML='<div class="core-section-label">내 연구 적용점</div><div class="core-section-text">'+renderMd(item.application)+'</div>';
            entry.appendChild(sec);
        }

        if(item.critique){
            var cr=document.createElement('div');cr.className='core-section';
            cr.innerHTML='<div class="core-section-label">한계점 / Critique</div><div class="core-critique-text">'+renderMd(item.critique)+'</div>';
            entry.appendChild(cr);
        }

        if(item.notes){
            var nt=document.createElement('div');nt.className='core-section';
            nt.innerHTML='<div class="core-section-label">핵심 메모</div><div class="core-section-text">'+renderMd(item.notes)+'</div>';
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
    if(data.radar_insight){var ri=document.createElement('div');ri.className='radar-entry-insight';ri.innerHTML='<strong>🌟</strong> '+renderMd(data.radar_insight);D.detail_content.appendChild(ri)}
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

    D.gcal_week_section.style.display = 'block';

    if (typeof fetchGoogleCalendarWeek !== 'function' || !_googleAccessToken) {
        D.gcal_week_grid.innerHTML = '<div class="gcal-no-auth" style="grid-column:1/-1">Google Calendar 연동 시 일정이 표시됩니다.<br><small>로그아웃 후 재로그인하면 캘린더 권한이 추가됩니다.</small></div>';
        return;
    }

    D.gcal_week_grid.innerHTML = '<div class="gcal-loading" style="grid-column:1/-1">일정 불러오는 중...</div>';

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
