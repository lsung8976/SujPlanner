const admin = require('firebase-admin');

// ===== CONFIG =====
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
let SERVICE_ACCOUNT = {};
try {
  SERVICE_ACCOUNT = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch (e) {
  try {
    SERVICE_ACCOUNT = JSON.parse((process.env.FIREBASE_SERVICE_ACCOUNT || '{}').replace(/\\n/g, '\n'));
  } catch (e2) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e2.message);
    process.exit(1);
  }
}

const CORE_TASKS = [
  { id: 'swimming', label: '수영 / 운동' },
  { id: 'radar_entry', label: 'AI Radar 1건 이상' },
  { id: 'eng_diary', label: '영어 일기 (최소 3문장)' }
];

// ===== INIT =====
admin.initializeApp({ credential: admin.credential.cert(SERVICE_ACCOUNT) });
const db = admin.firestore();

// ===== HELPERS =====
function getKSTDate() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function getKSTHour() {
  return (new Date().getUTCHours() + 9) % 24;
}

async function sendTelegram(text) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
  });
  if (!resp.ok) throw new Error(`Telegram API error: ${await resp.text()}`);
  console.log('Message sent');
}

async function getData(dateStr) {
  const doc = await db.collection('daily_routines').doc(dateStr).get();
  return doc.exists ? doc.data() : null;
}

function getCoreMissing(data) {
  return CORE_TASKS.filter(function(t) {
    return !(data && data.tasks && data.tasks[t.id]);
  });
}

function hasDiary(data) {
  if (!data) return { ko: false, en: false };
  return {
    ko: !!(data.diary_ko || data.diary || data.note || '').trim(),
    en: !!(data.diary_en || '').trim()
  };
}

function countCompleted(data) {
  if (!data || !data.tasks) return { done: 0, total: 13 };
  const ALL = [
    'swimming', 'radar_entry', 'ai_chat',
    'ai_review', 'architecture', 'math_study', 'pick_one', 'eng_podcast',
    'core_deepdive', 'piano_exercise', 'eng_diary', 'tomorrow_plan', 'reading_2pages'
  ];
  let done = 0;
  ALL.forEach(function(id) { if (data.tasks[id]) done++; });
  return { done, total: ALL.length };
}

function yesterdayStr(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ===== SMART NUDGE MESSAGES =====

// 05:40 - Always send (wake up call)
async function wakeNudge(dateStr) {
  const yData = await getData(yesterdayStr(dateStr));
  const yStats = countCompleted(yData);
  const yPct = yStats.total > 0 ? Math.round((yStats.done / yStats.total) * 100) : 0;
  const yDiary = hasDiary(yData);

  let msg = `<b>Good Morning!</b>\n\n`;
  msg += `수영 갈 시간이네요.\n`;
  msg += `오늘 읽을 논문 키워드를 에이전트에게 지시해 볼까요?\n\n`;

  if (yData) {
    msg += `<b>Yesterday:</b> ${yStats.done}/${yStats.total} (${yPct}%)`;
    if (!yDiary.en) msg += ` | <b>EN diary MISSING</b>`;
    msg += `\n\n`;
  }

  const day = new Date(dateStr).getDay();
  if (day === 0 || day === 6) {
    msg += `<b>Weekend Recharge Mode</b>\n`;
    msg += `- 기상 닻: 07:30 이전 이불 밖으로\n`;
    msg += `- 공간 탈출: 11시 전 집 밖으로\n`;
    msg += `- 동적 휴식: 산책/복싱 30분\n`;
  } else {
    msg += `<b>Today's Core:</b>\n`;
    CORE_TASKS.forEach(function(t) { msg += `- ${t.label}\n`; });
  }

  msg += `\nDirector Mode starts NOW.`;
  return { send: true, msg };
}

// 12:30 - Conditional: only if morning tasks incomplete
async function lunchNudge(dateStr) {
  const data = await getData(dateStr);
  const stats = countCompleted(data);
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  // Check if radar_entry (1줄 요약) is done
  const radarDone = data && data.tasks && data.tasks['radar_entry'];
  const swimmingDone = data && data.tasks && data.tasks['swimming'];

  // If both morning core tasks are done, skip
  if (radarDone && swimmingDone) {
    console.log(`Lunch nudge SKIPPED - morning core done (${pct}%)`);
    return { send: false };
  }

  let msg = `<b>Lunch Checkpoint</b>\n\n`;
  msg += `점심 맛있게 드셨나요?\n\n`;
  msg += `<b>Current:</b> ${stats.done}/${stats.total} (${pct}%)\n\n`;

  if (!swimmingDone) {
    msg += `- 수영/운동 아직 안 했어요\n`;
  }
  if (!radarDone) {
    msg += `- AI Radar 1줄 요약이 아직 비어있습니다\n`;
    msg += `  3분만 투자해서 채워보세요!\n`;
  }

  return { send: true, msg };
}

// 23:00 - Conditional: only if diary/core incomplete
async function nightNudge(dateStr) {
  const data = await getData(dateStr);
  const stats = countCompleted(data);
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const coreMissing = getCoreMissing(data);
  const diary = hasDiary(data);

  // Perfect day - send congratulations instead of nudge
  if (coreMissing.length === 0 && diary.en && diary.ko) {
    const msg = `<b>Perfect Day!</b>\n\n`
      + `Core all done, diary all written.\n`
      + `${stats.done}/${stats.total} (${pct}%)\n\n`
      + `오늘 하루 수고하셨습니다. 푹 쉬세요.`;
    return { send: true, msg };
  }

  // Something missing - nudge
  let msg = `<b>Bedtime Check</b>\n\n`;
  msg += `오늘 하루도 고생 많으셨습니다.\n`;
  msg += `<b>Current:</b> ${stats.done}/${stats.total} (${pct}%)\n\n`;

  if (!diary.en) {
    msg += `<b>영어 일기 딱 3문장</b>만 쓰고 주무세요.\n`;
  }

  if (coreMissing.length > 0) {
    msg += `\n<b>Core INCOMPLETE:</b>\n`;
    coreMissing.forEach(function(t) { msg += `  - ${t.label}\n`; });
  }

  const readingDone = data && data.tasks && data.tasks['reading_2pages'];
  if (!readingDone) {
    msg += `\n책 딱 2페이지 읽고 주무실 시간입니다.\n`;
  }

  msg += `\nStill time. Don't sleep yet.`;
  return { send: true, msg };
}

// ===== MAIN =====
async function main() {
  const dateStr = getKSTDate();
  const hour = getKSTHour();

  // Determine nudge type
  const manualType = process.env.INPUT_TYPE || null;
  let nudgeType;

  if (manualType && ['wake', 'lunch', 'night'].includes(manualType)) {
    nudgeType = manualType;
  } else if (hour < 8) {
    nudgeType = 'wake';
  } else if (hour < 18) {
    nudgeType = 'lunch';
  } else {
    nudgeType = 'night';
  }

  console.log(`Nudge type: ${nudgeType} | Date: ${dateStr} | Hour: ${hour}`);

  let result;
  if (nudgeType === 'wake') {
    result = await wakeNudge(dateStr);
  } else if (nudgeType === 'lunch') {
    result = await lunchNudge(dateStr);
  } else {
    result = await nightNudge(dateStr);
  }

  if (result.send) {
    await sendTelegram(result.msg);
  } else {
    console.log('No nudge needed. All good!');
  }

  process.exit(0);
}

main().catch(function(err) {
  console.error('Error:', err);
  process.exit(1);
});
