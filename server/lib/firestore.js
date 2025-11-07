// server/lib/firestore.js
const admin = require('firebase-admin');
const path = require('path');

function initFirebase() {
  if (!admin.apps.length) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccount.json';
    const serviceAccount = require(path.resolve(serviceAccountPath));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined // optional set in env
    });
  }
  return admin;
}

async function fetchReportsWithinDays(days = 7, limit = 200) {
  const adminApp = initFirebase();
  const db = adminApp.firestore();
  const now = admin.firestore.Timestamp.now();
  const pastMillis = now.toMillis() - days * 24 * 60 * 60 * 1000;
  const past = admin.firestore.Timestamp.fromMillis(pastMillis);

  const q = db.collection('reports')
    .where('createdAt', '>=', past)
    .orderBy('createdAt', 'desc')
    .limit(limit);

  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

module.exports = { initFirebase, fetchReportsWithinDays };
