const admin = require('firebase-admin');

// ===== CONFIG =====
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
let SERVICE_ACCOUNT = {};
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '{}';
  SERVICE_ACCOUNT = JSON.parse(raw);
} catch (e) {
  // If JSON parse fails, try replacing escaped newlines
  try {
    const fixed = (process.env.FIREBASE_SERVICE_ACCOUNT || '{}').replace(/\\n/g, '\n');
    SERVICE_ACCOUNT = JSON.parse(fixed);
  } catch (e2) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e2.message);
    console.error('Raw value length:', (process.env.FIREBASE_SERVICE_ACCOUNT || '').length);
    console.error('First 100 chars:', (process.env.FIREBASE_SERVICE_ACCOUNT || '').substring(0, 100));
    process.exit(1);
  }
}

const CORE_TASKS = [
  { id: 'swimming', label: '수영 / 운동' },
  { id: 'radar_entry', label: 'AI Radar 1건 이상' },
  { id: 'eng_diary', label: '영어 일기 (최소 3문장)' }
];

// ===== INIT =====
admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT)
});
const db = admin.firestore();

function getKSTDate() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function getKSTHour() {
  const now = new Date();
  return (now.getUTCHours() + 9) % 24;
}

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Telegram API error: ${err}`);
  }
  console.log('Message sent successfully');
}

async function getTodayData(dateStr) {
  const doc = await db.collection('daily_routines').doc(dateStr).get();
  return doc.exists ? doc.data() : null;
}

function countCompleted(data) {
  if (!data || !data.tasks) return { done: 0, total: 0, items: [] };
  const tasks = data.tasks;
  let done = 0;
  let total = 0;
  const items = [];

  // Count all tasks from the 3 modes
  const ALL_TASK_IDS = [
    'swimming', 'radar_entry', 'ai_chat',
    'ai_review', 'architecture', 'math_study', 'pick_one', 'eng_podcast',
    'core_deepdive', 'piano_exercise', 'eng_diary', 'tomorrow_plan', 'reading_2pages'
  ];

  ALL_TASK_IDS.forEach(function(id) {
    total++;
    if (tasks[id]) done++;
  });

  return { done, total, items };
}

function getCoreMissing(data) {
  const missing = [];
  CORE_TASKS.forEach(function(t) {
    const isDone = data && data.tasks && data.tasks[t.id];
    if (!isDone) missing.push(t.label);
  });
  return missing;
}

function hasDiary(data) {
  if (!data) return { ko: false, en: false };
  return {
    ko: !!(data.diary_ko || data.diary || data.note || '').trim(),
    en: !!(data.diary_en || '').trim()
  };
}

// ===== MESSAGES =====
async function morningMessage(dateStr) {
  // Check yesterday's data
  const yesterday = new Date(dateStr);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  const yData = await getTodayData(yStr);

  const yStats = countCompleted(yData);
  const yPct = yStats.total > 0 ? Math.round((yStats.done / yStats.total) * 100) : 0;
  const yDiary = hasDiary(yData);

  let msg = `<b>[SujPlanner] Good Morning!</b>\n`;
  msg += `\n`;

  if (yData) {
    msg += `<b>Yesterday:</b> ${yStats.done}/${yStats.total} (${yPct}%)`;
    if (yDiary.en) msg += ` | EN diary done`;
    else msg += ` | <b>EN diary MISSING</b>`;
    msg += `\n\n`;
  }

  const day = new Date(dateStr).getDay();
  if (day === 0 || day === 6) {
    msg += `Weekend Recharge Mode\n`;
    msg += `- Wake anchor: before 7:30\n`;
    msg += `- Escape: leave home by 11:00\n`;
    msg += `- Active rest: walk/boxing 30min\n`;
  } else {
    msg += `<b>Today's Core:</b>\n`;
    CORE_TASKS.forEach(function(t) {
      msg += `- ${t.label}\n`;
    });
  }

  msg += `\nDirector Mode starts NOW.`;
  return msg;
}

async function eveningMessage(dateStr) {
  const data = await getTodayData(dateStr);
  const stats = countCompleted(data);
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const coreMissing = getCoreMissing(data);
  const diary = hasDiary(data);

  let msg = `<b>[SujPlanner] Nightly Check</b>\n`;
  msg += `\n`;
  msg += `<b>Today:</b> ${stats.done}/${stats.total} (${pct}%)\n`;

  if (coreMissing.length > 0) {
    msg += `\n<b>Core INCOMPLETE:</b>\n`;
    coreMissing.forEach(function(item) {
      msg += `  - ${item}\n`;
    });
  } else {
    msg += `\nAll Core tasks done!\n`;
  }

  if (!diary.en) {
    msg += `\n<b>EN diary not written yet!</b>\n`;
    msg += `Write at least 3 sentences before bed.\n`;
  }

  if (!diary.ko) {
    msg += `KO diary also empty.\n`;
  }

  if (coreMissing.length === 0 && diary.en && diary.ko) {
    msg += `\nPerfect day. Rest well.`;
  } else {
    msg += `\nStill time to finish. Don't sleep yet.`;
  }

  return msg;
}

// ===== MAIN =====
async function main() {
  const dateStr = getKSTDate();
  const hour = getKSTHour();

  // Manual trigger support
  const manualType = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch'
    ? (process.env.INPUT_TYPE || 'morning')
    : null;

  let msg;
  if (manualType === 'morning' || (!manualType && hour < 12)) {
    msg = await morningMessage(dateStr);
  } else {
    msg = await eveningMessage(dateStr);
  }

  await sendTelegram(msg);
  process.exit(0);
}

main().catch(function(err) {
  console.error('Error:', err);
  process.exit(1);
});
