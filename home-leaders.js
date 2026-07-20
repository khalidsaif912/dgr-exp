import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4wKBL-frMWN9Cw7uJFsyaHCk963JRUuA",
  authDomain: "similarity-f2428.firebaseapp.com",
  projectId: "similarity-f2428",
  appId: "1:353323874706:web:7999c84682c30f6800694b",
  storageBucket: "similarity-f2428.firebasestorage.app",
  messagingSenderId: "353323874706",
  measurementId: "G-X5E3CC8RZF",
};

const TIME_GAME_IDS = ["pairs", "similarity", "airlogo"];

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.trunc(Number(totalSeconds) || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function playerLabel(name) {
  const n = String(name ?? "").trim().slice(0, 20);
  return n || "لاعب";
}

function bestTimeRow(rows, gameId) {
  const filtered = rows.filter((r) => r && r.gameId === gameId);
  filtered.sort((a, b) => {
    const ta = typeof a.timeSeconds === "number" ? a.timeSeconds : 1e9;
    const tb = typeof b.timeSeconds === "number" ? b.timeSeconds : 1e9;
    if (ta !== tb) return ta - tb;
    const ma = typeof a.moves === "number" ? a.moves : 1e9;
    const mb = typeof b.moves === "number" ? b.moves : 1e9;
    return ma - mb;
  });
  const top = filtered[0];
  if (!top) return null;
  return {
    name: playerLabel(top.playerName),
    label: formatTime(top.timeSeconds),
  };
}

function bestM1Row(rows) {
  const filtered = rows.filter(Boolean);
  filtered.sort((a, b) => {
    const sa = typeof a.scorePoints === "number" ? a.scorePoints : -1;
    const sb = typeof b.scorePoints === "number" ? b.scorePoints : -1;
    if (sa !== sb) return sb - sa;
    const wa = typeof a.wrong === "number" ? a.wrong : 1e9;
    const wb = typeof b.wrong === "number" ? b.wrong : 1e9;
    if (wa !== wb) return wa - wb;
    const ca = typeof a.correct === "number" ? a.correct : -1;
    const cb = typeof b.correct === "number" ? b.correct : -1;
    return cb - ca;
  });
  const top = filtered[0];
  if (!top) return null;
  const pts = typeof top.scorePoints === "number" ? top.scorePoints : 0;
  return {
    name: playerLabel(top.playerName),
    label: `${pts} نقطة`,
  };
}

function publish(scoresRows, m1Rows) {
  const detail = {
    pairs: bestTimeRow(scoresRows, "pairs"),
    similarity: bestTimeRow(scoresRows, "similarity"),
    airlogo: bestTimeRow(scoresRows, "airlogo"),
    m1quiz: bestM1Row(m1Rows),
  };
  window.dispatchEvent(new CustomEvent("home-leaders", { detail }));
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  try {
    await signInAnonymously(auth);
  } catch (e) {
    console.warn("home-leaders auth", e);
  }

  let scoresRows = [];
  let m1Rows = [];

  const scoresQ = query(
    collection(db, "scores"),
    orderBy("createdAt", "desc"),
    limit(200),
  );
  const m1Q = query(
    collection(db, "m1_scores"),
    orderBy("createdAt", "desc"),
    limit(200),
  );

  onSnapshot(
    scoresQ,
    (snap) => {
      scoresRows = [];
      snap.forEach((d) => scoresRows.push(d.data()));
      publish(scoresRows, m1Rows);
    },
    (err) => {
      console.warn("home-leaders scores", err);
      publish(scoresRows, m1Rows);
    },
  );

  onSnapshot(
    m1Q,
    (snap) => {
      m1Rows = [];
      snap.forEach((d) => m1Rows.push(d.data()));
      publish(scoresRows, m1Rows);
    },
    (err) => {
      console.warn("home-leaders m1", err);
      publish(scoresRows, m1Rows);
    },
  );
}

main();
