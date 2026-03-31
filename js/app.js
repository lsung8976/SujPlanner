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
// === 사자성어 (30개) - 훈음 포함 ===
{char:'臥薪嘗膽',reading:'와신상담',meaning:'잠자리에 가시를 깔고 쓸개를 핥다',detail:'훈음: 臥(누울 와) 薪(섶 신) 嘗(맛볼 상) 膽(쓸개 담)\n越王勾踐의 복수 고사. 목표를 위해 고난을 참고 견딤.\n중국어: wò xīn cháng dǎn'},
{char:'塞翁之馬',reading:'새옹지마',meaning:'변방 노인의 말',detail:'훈음: 塞(변방 새) 翁(늙은이 옹) 之(갈 지) 馬(말 마)\n인생의 길흉화복은 예측할 수 없다.\n중국어: sài wēng zhī mǎ'},
{char:'刻舟求劍',reading:'각주구검',meaning:'배에 새기고 칼을 찾다',detail:'훈음: 刻(새길 각) 舟(배 주) 求(구할 구) 劍(칼 검)\n변화를 모르고 옛 방식만 고집함.\n중국어: kè zhōu qiú jiàn'},
{char:'四面楚歌',reading:'사면초가',meaning:'사방이 초나라 노래',detail:'훈음: 四(넷 사) 面(낯 면) 楚(초나라 초) 歌(노래 가)\n고립무원의 상황. 項羽의 고사.\n중국어: sì miàn chǔ gē'},
{char:'矛盾',reading:'모순',meaning:'창과 방패',detail:'훈음: 矛(창 모) 盾(방패 순)\n앞뒤가 맞지 않는 말이나 행동.\n중국어: máo dùn'},
{char:'溫故知新',reading:'온고지신',meaning:'옛것을 익혀 새것을 앎',detail:'훈음: 溫(따뜻할 온) 故(옛 고) 知(알 지) 新(새 신)\n論語. 과거를 복습하면 새 깨달음을 얻는다.\n중국어: wēn gù zhī xīn'},
{char:'畫龍點睛',reading:'화룡점정',meaning:'용을 그리고 눈동자를 찍다',detail:'훈음: 畫(그림 화) 龍(용 룡) 點(점 점) 睛(눈동자 정)\n가장 중요한 마무리. 핵심을 짚다.\n중국어: huà lóng diǎn jīng'},
{char:'自強不息',reading:'자강불식',meaning:'스스로 강해지기를 쉬지 않다',detail:'훈음: 自(스스로 자) 強(강할 강) 不(아니 불) 息(쉴 식)\n周易. 끊임없이 자기를 단련함.\n중국어: zì qiáng bù xī'},
{char:'厚積薄發',reading:'후적박발',meaning:'두텁게 쌓고 얇게 발한다',detail:'훈음: 厚(두터울 후) 積(쌓을 적) 薄(엷을 박) 發(필 발)\n오래 준비하여 한 번에 크게 성과를 냄.\n중국어: hòu jī bó fā'},
{char:'破釜沉舟',reading:'파부침주',meaning:'솥을 깨고 배를 침몰시키다',detail:'훈음: 破(깨뜨릴 파) 釜(가마솥 부) 沉(가라앉을 침) 舟(배 주)\n퇴로를 끊고 결사적으로 싸움. 項羽의 고사.\n중국어: pò fǔ chén zhōu'},
{char:'胸有成竹',reading:'흉유성죽',meaning:'가슴속에 이미 대나무가 있다',detail:'훈음: 胸(가슴 흉) 有(있을 유) 成(이룰 성) 竹(대나무 죽)\n일을 시작하기 전 이미 계획이 확실함.\n중국어: xiōng yǒu chéng zhú'},
{char:'愚公移山',reading:'우공이산',meaning:'어리석은 노인이 산을 옮기다',detail:'훈음: 愚(어리석을 우) 公(공변될 공) 移(옮길 이) 山(뫼 산)\n끈기와 노력으로 어떤 일이든 이룰 수 있다.\n중국어: yú gōng yí shān'},
{char:'百折不撓',reading:'백절불요',meaning:'백 번 꺾여도 굴하지 않다',detail:'훈음: 百(일백 백) 折(꺾을 절) 不(아니 불) 撓(굽힐 요)\n어떤 어려움에도 포기하지 않는 의지.\n중국어: bǎi zhé bù náo'},
{char:'韋編三絶',reading:'위편삼절',meaning:'가죽 끈이 세 번 끊어지다',detail:'훈음: 韋(가죽 위) 編(엮을 편) 三(석 삼) 絶(끊을 절)\n孔子가 易經을 열심히 읽어 가죽끈이 닳음.\n중국어: wéi biān sān jué'},
{char:'朝三暮四',reading:'조삼모사',meaning:'아침에 셋 저녁에 넷',detail:'훈음: 朝(아침 조) 三(석 삼) 暮(저물 모) 四(넷 사)\n눈앞의 차이에 속아 본질을 모름.\n중국어: zhāo sān mù sì'},
{char:'以逸待勞',reading:'이일대로',meaning:'편안함으로 피로를 기다린다',detail:'훈음: 以(써 이) 逸(편안할 일) 待(기다릴 대) 勞(수고로울 로)\n孫子兵法. 여유롭게 지친 적을 맞아 싸움.\n중국어: yǐ yì dài láo'},
{char:'鶴立鷄群',reading:'학립계군',meaning:'닭 무리 속의 학',detail:'훈음: 鶴(학 학) 立(설 립) 鷄(닭 계) 群(무리 군)\n여럿 중에서 뛰어나게 돋보이는 인재.\n중국어: hè lì jī qún'},
{char:'一石二鳥',reading:'일석이조',meaning:'한 돌로 두 새를 잡다',detail:'훈음: 一(한 일) 石(돌 석) 二(두 이) 鳥(새 조)\n하나의 행동으로 두 가지 이득을 봄.\n중국어: yì shí èr niǎo'},
{char:'前車之鑑',reading:'전거지감',meaning:'앞 수레의 거울',detail:'훈음: 前(앞 전) 車(수레 거) 之(갈 지) 鑑(거울 감)\n남의 실패를 보고 교훈으로 삼음.\n중국어: qián chē zhī jiàn'},
{char:'名不虛傳',reading:'명불허전',meaning:'이름이 헛되이 전해지지 않다',detail:'훈음: 名(이름 명) 不(아니 불) 虛(빌 허) 傳(전할 전)\n평판이 사실과 일치한다.\n중국어: míng bù xū chuán'},
{char:'虎視眈眈',reading:'호시탐탐',meaning:'호랑이가 노려보듯',detail:'훈음: 虎(범 호) 視(볼 시) 眈(노려볼 탐) 眈(노려볼 탐)\n기회를 엿보며 날카롭게 주시함.\n중국어: hǔ shì dān dān'},
{char:'錦上添花',reading:'금상첨화',meaning:'비단 위에 꽃을 더하다',detail:'훈음: 錦(비단 금) 上(위 상) 添(더할 첨) 花(꽃 화)\n좋은 것에 더 좋은 것을 더함.\n중국어: jǐn shàng tiān huā'},
{char:'同舟共濟',reading:'동주공제',meaning:'같은 배를 타고 함께 건너다',detail:'훈음: 同(한가지 동) 舟(배 주) 共(함께 공) 濟(건널 제)\n어려움을 함께 극복함.\n중국어: tóng zhōu gòng jì'},
{char:'九死一生',reading:'구사일생',meaning:'아홉 번 죽을 뻔하고 한 번 삶',detail:'훈음: 九(아홉 구) 死(죽을 사) 一(한 일) 生(날 생)\n거의 죽을 고비를 겨우 넘김.\n중국어: jiǔ sǐ yì shēng'},
{char:'大器晩成',reading:'대기만성',meaning:'큰 그릇은 늦게 이루어진다',detail:'훈음: 大(큰 대) 器(그릇 기) 晩(늦을 만) 成(이룰 성)\n큰 인물은 오랜 노력 끝에 성공함.\n중국어: dà qì wǎn chéng'},
{char:'不恥下問',reading:'불치하문',meaning:'아랫사람에게 묻기를 부끄러워하지 않다',detail:'훈음: 不(아니 불) 恥(부끄러울 치) 下(아래 하) 問(물을 문)\n論語. 배움에 겸손한 태도.\n중국어: bù chǐ xià wèn'},
{char:'見微知著',reading:'견미지저',meaning:'작은 것을 보고 큰 것을 안다',detail:'훈음: 見(볼 견) 微(작을 미) 知(알 지) 著(나타날 저)\n미세한 단서로 전체를 파악하는 통찰.\n중국어: jiàn wēi zhī zhù'},
{char:'未雨綢繆',reading:'미우주무',meaning:'비 오기 전에 창문을 수리하다',detail:'훈음: 未(아닐 미) 雨(비 우) 綢(비단 주) 繆(얽힐 무)\n미리 대비하고 준비함.\n중국어: wèi yǔ chóu móu'},
{char:'功虧一簣',reading:'공궤일궤',meaning:'한 삼태기의 흙이 모자라 실패하다',detail:'훈음: 功(공 공) 虧(이지러질 궤) 一(한 일) 簣(삼태기 궤)\n마지막 순간에 포기하여 실패함.\n중국어: gōng kuī yī kuì'},
{char:'兼聽則明',reading:'겸청즉명',meaning:'두루 들으면 밝아진다',detail:'훈음: 兼(겸할 겸) 聽(들을 청) 則(곧 즉) 明(밝을 명)\n여러 의견을 듣는 리더가 현명하다.\n중국어: jiān tīng zé míng'},
// === 중국어 기초 회화 (50개) ===
{char:'你好',reading:'nǐ hǎo',meaning:'안녕하세요',detail:'가장 기본적인 인사말입니다.'},
{char:'谢谢',reading:'xiè xie',meaning:'감사합니다',detail:'고마움을 표현할 때 사용합니다.'},
{char:'不客气',reading:'bú kè qi',meaning:'천만에요',detail:'감사에 대한 대답.'},
{char:'对不起',reading:'duì bu qǐ',meaning:'미안합니다',detail:'사과할 때 사용합니다.'},
{char:'没关系',reading:'méi guān xi',meaning:'괜찮습니다',detail:'사과에 대한 대답.'},
{char:'再见',reading:'zài jiàn',meaning:'안녕히 가세요/계세요',detail:'헤어질 때 나누는 인사.'},
{char:'好久不见',reading:'hǎo jiǔ bú jiàn',meaning:'오랜만입니다',detail:'오랜만에 만났을 때.'},
{char:'早上好',reading:'zǎo shang hǎo',meaning:'좋은 아침입니다',detail:'아침 인사.'},
{char:'晚安',reading:'wǎn ān',meaning:'안녕히 주무세요',detail:'밤에 잠들기 전 인사.'},
{char:'叫什么名字',reading:'jiào shén me míng zi',meaning:'이름이 무엇입니까?',detail:'상대방의 이름을 물어볼 때.'},
{char:'很高兴认识你',reading:'hěn gāo xìng rèn shi nǐ',meaning:'만나서 반갑습니다',detail:'처음 만났을 때 인사.'},
{char:'吃饭了吗',reading:'chī fàn le ma',meaning:'밥 먹었어요?',detail:'친근한 인사말.'},
{char:'多少钱',reading:'duō shao qián',meaning:'얼마입니까?',detail:'물건 가격을 물어볼 때.'},
{char:'太贵了',reading:'tài guì le',meaning:'너무 비싸요',detail:'가격을 흥정할 때.'},
{char:'便宜一点',reading:'pián yi yì diǎn',meaning:'조금 깎아주세요',detail:'흥정 시 자주 쓰는 표현.'},
{char:'这是什么',reading:'zhè shì shén me',meaning:'이것은 무엇입니까?',detail:'물건의 이름을 물어볼 때.'},
{char:'听不懂',reading:'tīng bu dǒng',meaning:'알아듣지 못하겠어요',detail:'상대의 말을 이해하지 못했을 때.'},
{char:'请再说一遍',reading:'qǐng zài shuō yí biàn',meaning:'다시 한 번 말씀해 주세요',detail:'다시 말해 달라고 요청할 때.'},
{char:'我会一点儿中文',reading:'wǒ huì yì diǎnr zhōng wén',meaning:'중국어 조금 할 줄 알아요',detail:'자신의 중국어 실력을 표현할 때.'},
{char:'洗手间在哪里',reading:'xǐ shǒu jiān zài nǎ lǐ',meaning:'화장실이 어디입니까?',detail:'화장실 위치를 물어볼 때.'},
{char:'救命',reading:'jiù mìng',meaning:'살려주세요',detail:'위급한 상황에서 도움을 요청할 때.'},
{char:'我爱你',reading:'wǒ ài nǐ',meaning:'사랑합니다',detail:'사랑을 고백할 때.'},
{char:'好吃',reading:'hǎo chī',meaning:'맛있어요',detail:'음식이 맛있을 때.'},
{char:'干杯',reading:'gān bēi',meaning:'건배',detail:'술을 마실 때.'},
{char:'随便',reading:'suí biàn',meaning:'마음대로 하세요/아무거나',detail:'상대방의 뜻에 따를 때.'},
{char:'为什么',reading:'wèi shén me',meaning:'왜요?',detail:'이유를 물어볼 때.'},
{char:'怎么了',reading:'zěn me le',meaning:'무슨 일 있어요?',detail:'이유나 상황을 물어볼 때.'},
{char:'不知道',reading:'bù zhī dào',meaning:'모르겠어요',detail:'정보를 모를 때.'},
{char:'明白了',reading:'míng bai le',meaning:'알겠습니다/이해했습니다',detail:'상황이나 뜻을 이해했을 때.'},
{char:'麻烦你了',reading:'má fan nǐ le',meaning:'수고하셨습니다/폐를 끼쳤습니다',detail:'도움을 받았을 때 인사.'},
{char:'辛苦了',reading:'xīn kǔ le',meaning:'수고 많으셨습니다',detail:'고생한 사람에게.'},
{char:'加油',reading:'jiā yóu',meaning:'화이팅/힘내세요',detail:'응원할 때.'},
{char:'小心',reading:'xiǎo xīn',meaning:'조심하세요',detail:'주의를 줄 때.'},
{char:'请问',reading:'qǐng wèn',meaning:'말씀 좀 묻겠습니다',detail:'질문하기 전 예의를 갖출 때.'},
{char:'可以吗',reading:'kě yǐ ma',meaning:'가능합니까?',detail:'허가를 구할 때.'},
{char:'不行',reading:'bù xíng',meaning:'안 됩니다',detail:'거절할 때.'},
{char:'等一下',reading:'děng yí xià',meaning:'잠깐만 기다려주세요',detail:'잠시 멈춰달라고 할 때.'},
{char:'快点',reading:'kuài diǎn',meaning:'빨리빨리',detail:'서두르라고 할 때.'},
{char:'慢走',reading:'màn zǒu',meaning:'조심히 가세요',detail:'배웅할 때.'},
{char:'有没有',reading:'yǒu méi yǒu',meaning:'있습니까, 없습니까?',detail:'존재 여부를 묻는 질문.'},
{char:'你要什么',reading:'nǐ yào shén me',meaning:'무엇을 원하십니까?',detail:'상대방의 요구를 물을 때.'},
{char:'我喜欢你',reading:'wǒ xǐ huan nǐ',meaning:'당신을 좋아합니다',detail:'호감을 표현할 때.'},
{char:'真漂亮',reading:'zhēn piào liang',meaning:'정말 예쁘네요',detail:'칭찬할 때.'},
{char:'非常有意思',reading:'fēi cháng yǒu yì si',meaning:'정말 재미있어요',detail:'흥미로울 때.'},
{char:'明天见',reading:'míng tiān jiàn',meaning:'내일 봐요',detail:'다음 만남을 기약할 때.'},
{char:'欢迎光临',reading:'huān yíng guāng lín',meaning:'환영합니다',detail:'가게에서 손님을 맞이할 때.'},
{char:'结账',reading:'jié zhàng',meaning:'계산해 주세요',detail:'식당/상점에서 계산할 때.'},
{char:'没有问题',reading:'méi yǒu wèn tí',meaning:'문제 없습니다',detail:'확실하게 대답할 때.'},
{char:'你多大',reading:'nǐ duō dà',meaning:'나이가 어떻게 되세요?',detail:'나이를 물어볼 때.'},
{char:'生日快乐',reading:'shēng rì kuài lè',meaning:'생일 축하합니다',detail:'생일을 축하할 때.'}
];
// Split DB into idioms and chinese
var IDIOM_DB=HANJA_DB.filter(function(_,i){return i<30});
var CHINESE_DB=HANJA_DB.filter(function(_,i){return i>=30});
var hanjaIdiomIdx=0, hanjaChineseIdx=0;
function getTodayIdiom(ds){var dy=Math.floor((new Date(ds)-new Date(ds.split('-')[0],0,0))/864e5);hanjaIdiomIdx=dy%IDIOM_DB.length;return IDIOM_DB[hanjaIdiomIdx]}
function getTodayChinese(ds){var dy=Math.floor((new Date(ds)-new Date(ds.split('-')[0],0,0))/864e5);hanjaChineseIdx=(dy+7)%CHINESE_DB.length;return CHINESE_DB[hanjaChineseIdx]}
function parseHuneum(detail){
    var m=detail.match(/훈음:\s*(.+?)(?:\n|$)/);if(!m)return[];
    return m[1].split(/\)\s*/).filter(Boolean).map(function(s){
        var p=s.match(/(.+?)\((.+)/);
        return p?{char:p[1].trim(),hun:p[2].trim()+')'}:{char:s.trim(),hun:''};
    });
}
function parseStory(detail){var lines=detail.split('\n');return lines.filter(function(l){return l.indexOf('훈음:')<0}).join('\n').trim()}
function parsePinyin(detail){var m=detail.match(/중국어:\s*(.+?)$/m);return m?m[1].trim():''}
function renderIdiom(item){
    document.getElementById('idiom-char').textContent=item.char;
    document.getElementById('idiom-reading').textContent=item.reading;
    document.getElementById('idiom-meaning').textContent=item.meaning;
    var pills=parseHuneum(item.detail);
    var bd=document.getElementById('idiom-breakdown');bd.innerHTML='';
    pills.forEach(function(p){if(p.char){var sp=document.createElement('span');sp.className='hanja-char-pill';sp.innerHTML='<span class="pill-char">'+p.char+'</span><span class="pill-hun">'+p.hun+'</span>';bd.appendChild(sp)}});
    document.getElementById('idiom-story').textContent=parseStory(item.detail);
    document.getElementById('idiom-pinyin').textContent=parsePinyin(item.detail);
}
function renderChinese(item){
    document.getElementById('chinese-char').textContent=item.char;
    document.getElementById('chinese-pinyin').textContent=item.reading;
    document.getElementById('chinese-meaning').textContent=item.meaning;
    document.getElementById('chinese-detail').textContent=item.detail;
}

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
            { id:'tomorrow_plan', label:'내일 AI 작업 미리 구상' },
            { id:'reading_2pages', label:'침대에서 책 딱 2페이지 읽기 💊', isFlex:true }
        ]
    }
];

// ===== CORE TASKS (무조건 매일) =====
var CORE_TASK_IDS = ['swimming', 'radar_entry', 'eng_diary'];

// ===== WEEKEND RECHARGE TASKS =====
var WEEKEND_TASKS = [
    { id:'we_wake',    label:'기상 닻 내리기: 오전 7:30 이전에 이불 밖으로', isCore:true },
    { id:'we_escape',  label:'공간 탈출: 오전 11시 전 집 밖으로 (카페/도서관)' },
    { id:'we_active',  label:'동적 휴식: 산책 / 복싱 / 필라테스 30분 이상' },
    { id:'we_brain',   label:'뇌 환기: 전공 외 독서 (소설·에세이·인문학)' },
    { id:'we_reading', label:'침대에서 책 딱 2페이지 읽기 💊' }
];

function isWeekend(d){ var day=(d instanceof Date?d:new Date(d)).getDay(); return day===0||day===6; }

// ===== DAILY EXPRESSIONS DB (65개, 날짜별 순환) =====
var DAILY_EXPR=[
    {expr:'burn out',meaning:'에너지가 소진되다'},{expr:'figure out',meaning:'파악하다, 알아내다'},
    {expr:'give up',meaning:'포기하다'},{expr:'run into',meaning:'우연히 마주치다'},
    {expr:'keep up with',meaning:'따라가다, 유지하다'},{expr:'catch up on',meaning:'밀린 것을 따라잡다'},
    {expr:'put off',meaning:'미루다'},{expr:'set out',meaning:'착수하다, 시작하다'},
    {expr:'carry on',meaning:'계속하다'},{expr:'work out',meaning:'잘 되다'},
    {expr:'come across',meaning:'우연히 발견하다'},{expr:'break down',meaning:'분석하다'},
    {expr:'pull through',meaning:'어려움을 극복하다'},{expr:'take on',meaning:'도전하다, 맡다'},
    {expr:'give it a shot',meaning:'한번 해보다'},{expr:'in the long run',meaning:'장기적으로'},
    {expr:'on the right track',meaning:'올바른 방향으로'},{expr:'cut corners',meaning:'대충 처리하다'},
    {expr:'hit the books',meaning:'공부하다'},{expr:'fall behind',meaning:'뒤처지다'},
    {expr:'get the hang of',meaning:'요령을 터득하다'},{expr:'think outside the box',meaning:'창의적으로 생각하다'},
    {expr:'back to square one',meaning:'원점으로 돌아가다'},{expr:'bite the bullet',meaning:'고통을 참고 하다'},
    {expr:'push through',meaning:'밀고 나가다'},{expr:'stay on track',meaning:'계획대로 유지하다'},
    {expr:'dig deep',meaning:'깊이 파고들다'},{expr:'bounce back',meaning:'회복하다'},
    {expr:'hit a wall',meaning:'벽에 부딪히다'},{expr:'wrap up',meaning:'마무리하다'},
    {expr:'narrow down',meaning:'좁혀나가다'},{expr:'make progress',meaning:'진전을 이루다'},
    {expr:'step back',meaning:'한발 물러서다'},{expr:'flesh out',meaning:'구체화하다'},
    {expr:'nail down',meaning:'확실히 하다'},{expr:'block out',meaning:'시간을 따로 빼두다'},
    {expr:'make sense of',meaning:'이해하다'},{expr:'run out of steam',meaning:'동력을 잃다'},
    {expr:'draw a blank',meaning:'생각이 떠오르지 않다'},{expr:'turn the corner',meaning:'고비를 넘기다'},
    {expr:'have a breakthrough',meaning:'돌파구를 찾다'},{expr:'be in the zone',meaning:'몰입 상태에 있다'},
    {expr:'lose track of time',meaning:'시간 가는 줄 모르다'},{expr:'make headway',meaning:'진전을 이루다'},
    {expr:'chip away at',meaning:'조금씩 해나가다'},{expr:'go the extra mile',meaning:'한 걸음 더 나아가다'},
    {expr:'put in the work',meaning:'노력을 기울이다'},{expr:'take a breather',meaning:'잠깐 쉬다'},
    {expr:'be on a roll',meaning:'흐름이 좋다'},{expr:'come a long way',meaning:'많이 발전하다'},
    {expr:'kick off',meaning:'시작하다'},{expr:'end up',meaning:'결국 ~하게 되다'},
    {expr:'look forward to',meaning:'기대하다'},{expr:'break through',meaning:'돌파하다'},
    {expr:'take it one step at a time',meaning:'한 번에 한 걸음씩'},{expr:'get back on track',meaning:'다시 궤도에 오르다'},
    {expr:'move on',meaning:'넘어가다'},{expr:'zoom in on',meaning:'집중하다'},
    {expr:'tackle',meaning:'해결하다, 다루다'},{expr:'sit with',meaning:'곰씹다, 받아들이다'},
    {expr:'hit the ground running',meaning:'빠르게 시작하다'},{expr:'pull an all-nighter',meaning:'밤을 새우다'},
    {expr:'call it a day',meaning:'오늘은 여기서 마치다'},{expr:'on top of things',meaning:'상황을 잘 파악하고 있다'},
    {expr:'pick up the pace',meaning:'속도를 내다'}
];
function getDailyExpr(ds){var dy=Math.floor((new Date(ds)-new Date(ds.split('-')[0],0,0))/864e5);return DAILY_EXPR[dy%DAILY_EXPR.length]}

// ===== EXPRESSION DETECTION =====
function _checkExprInDiary(text,expr){
    var found=text.toLowerCase().indexOf(expr.toLowerCase())>=0;
    D.expr_icon.textContent=found?'✅':'💡';
    if(D.daily_expr_banner)D.daily_expr_banner.classList.toggle('expr-matched',found);
    if(D.daily_diary_en)D.daily_diary_en.classList.toggle('expr-matched',found);
}

// ===== TOAST =====
function showToast(msg,type){
    var tc=D.toast_container;if(!tc)return;
    var t=document.createElement('div');
    t.className='toast'+(type==='warn'?' toast-warn':type==='success'?' toast-success':'');
    t.textContent=msg;
    tc.appendChild(t);
    setTimeout(function(){t.classList.add('toast-hide');setTimeout(function(){if(t.parentNode)tc.removeChild(t)},400)},3000);
}

// ===== CORE CHECK MODAL =====
var _coreModalShownDate='';
function showCoreModal(){
    var missing=CORE_TASK_IDS.filter(function(id){return !currentData.tasks[id]});
    if(!missing.length)return;
    var labels=missing.map(function(id){
        var lbl=id;
        MODES.forEach(function(m){m.tasks.forEach(function(t){if(t.id===id)lbl=t.label})});
        return lbl;
    });
    D.core_modal_missing.innerHTML=labels.map(function(l){return'<div class="core-missing-item">• '+l+'</div>'}).join('');
    D.core_check_modal.style.display='flex';
}

// ===== STATE =====
var currentDate=new Date(), calendarDate=new Date();
var flowMode=false;
var currentData={tasks:{},diary_ko:'',diary_en:'',memo:'',hanja_char:'',hanja_reading:'',hanja_meaning:'',hanja_note:'',paper_log:{what:'',result:'',idea:'',tags:''},radar_insight:'',flow_text:'',flow_mode:false};

// ===== UTILS =====
function fmt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dn(i){return['일','월','화','수','목','금','토'][i]}
function kd(d){return d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 ('+dn(d.getDay())+')'}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function allIds(skipMorning){var r=[];MODES.forEach(function(m){if(skipMorning&&m.id==='morning')return;m.tasks.forEach(function(t){r.push(t.id)})});return r}
function compRate(d){
    if(!d||!d.tasks)return 0;
    if(d.flow_mode&&d.flow_text&&d.flow_text.trim().length>0)return 1;
    if(d.weekend_mode){
        var wd=0;WEEKEND_TASKS.forEach(function(t){if(d.tasks[t.id])wd++});
        return WEEKEND_TASKS.length?wd/WEEKEND_TASKS.length:0;
    }
    var ids=allIds(d.morning_skipped),done=0;ids.forEach(function(id){if(d.tasks[id])done++});
    return ids.length?done/ids.length:0;
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}

// ===== TRACK A/B DATA SERVICE =====
var TrackService = {
    async getAll(collection) {
        if (isFirebaseConfigured && db) {
            try {
                var snap;
                try {
                    snap = await withTimeout(db.collection(collection).orderBy('created','desc').get(), FIRESTORE_TIMEOUT);
                } catch(orderErr) {
                    console.warn('orderBy failed, fetching without order:', orderErr.message);
                    snap = await withTimeout(db.collection(collection).get(), FIRESTORE_TIMEOUT);
                }
                var items = []; snap.forEach(function(doc){ var d=doc.data(); d._id=doc.id; items.push(d); });
                items.sort(function(a,b){ return (b.created||'').localeCompare(a.created||''); });
                localStorage.setItem('suj_'+collection, JSON.stringify(items));
                return items;
            } catch(e) {
                console.error('Firebase getAll failed for '+collection+':', e.message);
                var local = this.getLocal(collection);
                if (!local.length) console.warn(collection+': Firebase 실패 + localStorage 비어있음');
                return local;
            }
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
async function renderHanjaHistory(){
    var el=document.getElementById('hanja-history');if(!el)return;
    var all=[];
    try{
        var keys=await TrackService.getAll('daily_routines');
        keys.forEach(function(d){
            if(d.hanja_char&&d.hanja_char.trim()){
                all.push({date:d._id||'',char:d.hanja_char,reading:d.hanja_reading||'',meaning:d.hanja_meaning||'',note:d.hanja_note||''});
            }
        });
    }catch(e){
        var ls=Object.keys(localStorage);
        ls.forEach(function(k){
            if(k.indexOf('routine_')===0){try{var d=JSON.parse(localStorage.getItem(k));if(d&&d.hanja_char&&d.hanja_char.trim()){all.push({date:k.replace('routine_',''),char:d.hanja_char,reading:d.hanja_reading||'',meaning:d.hanja_meaning||'',note:d.hanja_note||''})}}catch(e2){}}
        });
    }
    all.sort(function(a,b){return b.date.localeCompare(a.date)});
    var recent=all.slice(0,10);
    if(!recent.length){el.innerHTML='<div class="hanja-history-title">최근 기록이 없습니다</div>';return}
    var html='<div class="hanja-history-title">최근 기록 ('+recent.length+'건)</div>';
    recent.forEach(function(r){
        html+='<div class="hanja-history-item"><span class="h-char">'+r.char+'</span><span class="h-reading">'+r.reading+'</span><span class="h-meaning">'+r.meaning+'</span></div>';
    });
    el.innerHTML=html;
}

function cacheDom(){
    ['current-date-display','prev-day','next-day','weekly-ribbon','mode-container',
     'daily-diary-ko','diary-ko-char-count','daily-diary-en','diary-en-char-count','daily-memo','sync-status',
     'daily-expr-banner','expr-icon','expr-text','expr-meaning',
     'toast-container',
     'core-check-modal','core-modal-missing','core-modal-quit','core-modal-go',
     'hanja-char-input','hanja-reading-input','hanja-meaning-input','hanja-note-input',
     'idiom-shuffle','chinese-shuffle','hanja-history',
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
    currentData=saved||{tasks:{},diary_ko:'',diary_en:'',memo:'',hanja_char:'',hanja_reading:'',hanja_meaning:'',hanja_note:'',paper_log:{what:'',result:'',idea:'',tags:''},radar_insight:'',flow_text:'',flow_mode:false};
    // 하위 호환: 기존 diary → diary_ko 마이그레이션
    if(currentData.note&&!currentData.diary_ko)currentData.diary_ko=currentData.note;
    if(currentData.diary&&!currentData.diary_ko){currentData.diary_ko=currentData.diary;}
    if(!currentData.paper_log)currentData.paper_log={what:'',result:'',idea:'',tags:''};
    currentData.weekend_mode=isWeekend(currentDate);

    // Restore flow mode
    flowMode=!!currentData.flow_mode;
    applyFlowMode();
    renderModes();
    D.daily_diary_ko.value=currentData.diary_ko||'';
    D.daily_diary_en.value=currentData.diary_en||'';
    D.daily_memo.value=currentData.memo||'';
    D.diary_ko_char_count.textContent=(currentData.diary_ko||'').length+'자';
    D.diary_en_char_count.textContent=(currentData.diary_en||'').length+'자';
    var nudge=document.getElementById('diary-nudge');
    if(nudge)nudge.classList.toggle('visible',(currentData.diary_en||'').length>30);

    // Daily expression
    var expr=getDailyExpr(ds);
    D.expr_text.textContent=expr.expr;
    D.expr_meaning.textContent='('+expr.meaning+')';
    _checkExprInDiary(currentData.diary_en||'',expr.expr);

    // Reset core modal flag for new date
    _coreModalShownDate='';

    renderIdiom(getTodayIdiom(ds));
    renderChinese(getTodayChinese(ds));
    D.hanja_char_input.value=currentData.hanja_char||'';
    D.hanja_reading_input.value=currentData.hanja_reading||'';
    if(D.hanja_meaning_input)D.hanja_meaning_input.value=currentData.hanja_meaning||'';
    D.hanja_note_input.value=currentData.hanja_note||'';
    renderHanjaHistory();
    renderRibbon();
}

function setupEvents(){
    D.prev_day.addEventListener('click',function(){var d=new Date(currentDate);d.setDate(d.getDate()-1);loadDate(d)});
    D.next_day.addEventListener('click',function(){var d=new Date(currentDate);d.setDate(d.getDate()+1);loadDate(d)});
    D.daily_diary_ko.addEventListener('input',function(e){
        currentData.diary_ko=e.target.value;
        D.diary_ko_char_count.textContent=e.target.value.length+'자';
        save();
    });
    D.daily_diary_en.addEventListener('input',function(e){
        currentData.diary_en=e.target.value;
        D.diary_en_char_count.textContent=e.target.value.length+'자';
        var nudge=document.getElementById('diary-nudge');
        if(nudge)nudge.classList.toggle('visible',e.target.value.length>30);
        _checkExprInDiary(e.target.value,getDailyExpr(fmt(currentDate)).expr);
        save();
    });
    D.daily_diary_en.addEventListener('focus',function(){
        var ds=fmt(currentDate);
        if(_coreModalShownDate===ds)return;
        var missing=CORE_TASK_IDS.filter(function(id){return id!=='eng_diary'&&!currentData.tasks[id]});
        if(!missing.length)return;
        _coreModalShownDate=ds;
        showCoreModal();
    });
    D.core_modal_quit.addEventListener('click',function(){D.core_check_modal.style.display='none'});
    D.core_modal_go.addEventListener('click',function(){D.core_check_modal.style.display='none'});
    D.daily_memo.addEventListener('input',function(e){currentData.memo=e.target.value;save()});
    D.hanja_char_input.addEventListener('input',function(e){currentData.hanja_char=e.target.value;save()});
    D.hanja_reading_input.addEventListener('input',function(e){currentData.hanja_reading=e.target.value;save()});
    if(D.hanja_meaning_input)D.hanja_meaning_input.addEventListener('input',function(e){currentData.hanja_meaning=e.target.value;save()});
    D.hanja_note_input.addEventListener('input',function(e){currentData.hanja_note=e.target.value;save()});

    // Hanja tab switching
    document.querySelectorAll('.hanja-tab').forEach(function(tab){
        tab.addEventListener('click',function(){
            document.querySelectorAll('.hanja-tab').forEach(function(t){t.classList.remove('active')});
            document.querySelectorAll('.hanja-panel').forEach(function(p){p.classList.remove('active')});
            tab.classList.add('active');
            document.getElementById('hanja-panel-'+tab.dataset.tab).classList.add('active');
        });
    });

    // Shuffle buttons
    D.idiom_shuffle.addEventListener('click',function(){
        hanjaIdiomIdx=(hanjaIdiomIdx+1)%IDIOM_DB.length;
        renderIdiom(IDIOM_DB[hanjaIdiomIdx]);
    });
    D.chinese_shuffle.addEventListener('click',function(){
        hanjaChineseIdx=(hanjaChineseIdx+1)%CHINESE_DB.length;
        renderChinese(CHINESE_DB[hanjaChineseIdx]);
    });

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

// ===== WEEKEND RECHARGE MODE =====
function renderWeekendMode(){
    var c=D.mode_container;
    c.className='mode-grid weekend-mode-grid';
    c.innerHTML='';

    var block=document.createElement('div');
    block.className='mode-block weekend';

    var fl=document.createElement('div');fl.className='funnel-label recharge';fl.textContent='🌴 Weekend Recharge Mode';
    block.appendChild(fl);

    var hdr=document.createElement('div');hdr.className='mode-header';
    hdr.innerHTML='<span class="mode-emoji">🌴</span><span class="mode-title">주말 리차지</span><span class="mode-subtitle">수면 리듬 사수 · 번아웃 방지 · 뇌 환기</span>';
    block.appendChild(hdr);

    var checked=0;WEEKEND_TASKS.forEach(function(t){if(currentData.tasks[t.id])checked++;});
    var pct=WEEKEND_TASKS.length?Math.round(checked/WEEKEND_TASKS.length*100):0;
    var pw=document.createElement('div');pw.className='progress-wrap';
    pw.innerHTML='<div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div><div class="progress-label"><span>'+checked+'/'+WEEKEND_TASKS.length+'</span><span>'+pct+'%</span></div>';
    block.appendChild(pw);

    var notice=document.createElement('div');notice.className='weekend-notice';
    notice.innerHTML='<strong>💡 오늘의 철칙</strong> 기상 시간만 지키면 나머지는 자유. 뇌를 쉬게 하되 리듬은 사수. 전공 책 금지 — 소설·에세이만.';
    block.appendChild(notice);

    WEEKEND_TASKS.forEach(function(task){
        var ic=!!currentData.tasks[task.id];
        var el=document.createElement('div');el.className='task-item weekend-task'+(ic?' checked':'')+(task.isCore?' core-task':'');
        var cb=document.createElement('div');cb.className='checkbox';cb.innerHTML='<span class="checkbox-inner">✔</span>';
        var lbl=document.createElement('span');lbl.className='task-label';lbl.textContent=task.label;
        el.appendChild(cb);el.appendChild(lbl);
        el.addEventListener('click',function(){currentData.tasks[task.id]=!currentData.tasks[task.id];save();renderWeekendMode();});
        block.appendChild(el);
    });

    var tip=document.createElement('div');tip.className='weekend-sleep-tip';
    tip.innerHTML='<span class="tip-icon">😴</span><div><strong>수면 리듬 팁</strong> — 취침은 놓쳐도 기상은 7:30 이전. 낮잠은 오후 3시 전, 소파에서 20분만. 졸리면 침대 대신 산책.</div>';
    block.appendChild(tip);

    c.appendChild(block);
}

// ===== RENDER MODES =====
function renderModes(){
    D.mode_container.className='mode-grid';
    D.mode_container.innerHTML='';
    if(isWeekend(currentDate)){renderWeekendMode();return;}
    MODES.forEach(function(mode){
        var isSkipped=!!currentData.morning_skipped&&mode.id==='morning';
        var block=document.createElement('div');
        block.className='mode-block '+mode.cssClass+(isSkipped?' mode-skipped':'');

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
            var isFlex=!!task.isFlex;
            var el=document.createElement('div');el.className='task-item'+(ic?' checked':'')+(isCore?' core-task':'')+(isFlex?' flex-task':'');

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

            el.addEventListener('click',function(){
                var newVal=!currentData.tasks[task.id];
                if(newVal&&isFlex&&!isSkipped){
                    var coreDone=CORE_TASK_IDS.every(function(id){return currentData.tasks[id]});
                    if(!coreDone){
                        var missingLabels=CORE_TASK_IDS.filter(function(id){return!currentData.tasks[id]}).map(function(id){
                            var lbl=id;MODES.forEach(function(m){m.tasks.forEach(function(t){if(t.id===id)lbl=t.label.split(' (')[0]})});return lbl;
                        });
                        showToast('⚠️ Core 항목이 아직 비어있어요: '+missingLabels.join(', '),'warn');
                    }
                }
                if(!isSkipped)currentData.tasks[task.id]=newVal;
                save();renderModes();
            });
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

        // Half-day reset (오전 Director Mode, 오늘 날짜, 11시 이후, 아직 스킵 안 했을 때)
        if(mode.id==='morning'&&sameDay(currentDate,new Date())&&new Date().getHours()>=11&&!currentData.morning_skipped){
            var morningDone=0;mode.tasks.forEach(function(t){if(currentData.tasks[t.id])morningDone++});
            if(morningDone===0){
                var rb=document.createElement('button');rb.className='half-day-reset-btn';
                rb.innerHTML='🔄 오후부터 다시 시작하기';
                rb.addEventListener('click',function(){currentData.morning_skipped=true;save();renderModes();showToast('아침은 리셋! 지금부터 Architect Mode 100% 목표 🏃','success')});
                block.appendChild(rb);
            }
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
        if(dd&&(dd.diary_ko||dd.diary_en||dd.diary||dd.note)&&(dd.diary_ko||dd.diary_en||dd.diary||dd.note).trim())cell.classList.add('has-diary');
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
    var diaryKo=data.diary_ko||data.diary||data.note||'';
    var diaryEn=data.diary_en||'';
    if(diaryKo.trim()){var dd2=document.createElement('div');dd2.className='detail-diary';dd2.innerHTML='<span style="font-size:0.7rem;color:#888;font-weight:600">📝 한국어</span><br>'+diaryKo;D.detail_content.appendChild(dd2)}
    if(diaryEn.trim()){var dd3=document.createElement('div');dd3.className='detail-diary';dd3.innerHTML='<span style="font-size:0.7rem;color:#888;font-weight:600">🇺🇸 영어</span><br>'+diaryEn;D.detail_content.appendChild(dd3)}
    if(data.hanja_char){var hd=document.createElement('div');hd.className='detail-hanja';hd.innerHTML='<strong>'+data.hanja_char+'</strong> '+(data.hanja_reading||'')+(data.hanja_meaning?' — '+data.hanja_meaning:'')+(data.hanja_note?'<br><em>'+data.hanja_note+'</em>':'');D.detail_content.appendChild(hd)}
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
        var has=data&&((data.diary_ko||data.diary_en||data.diary||data.note||'').trim().length>0);
        if(has)written++;dots.push(has);
    }
    c.innerHTML='<div class="diary-stats-text">최근 30일 중 '+written+'일 작성 ('+Math.round(written/30*100)+'%)</div>';
    var dd=document.createElement('div');dd.className='diary-streak';
    dots.forEach(function(h){var dot=document.createElement('div');dot.className='diary-dot'+(h?' written':'');dd.appendChild(dot)});
    c.appendChild(dd);
}

// Init is now handled by auth-gated startup at top
