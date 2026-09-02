const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./firebase-service-account.json');
// ==========================================
// INITIALIZE FIREBASE ADMIN
// ==========================================
initializeApp({
  credential: cert(serviceAccount),
});
const auth = getAuth();
// ==========================================
// ADMIN EMAIL
// ==========================================
const email = 'ogumsamuel12@gmail.com';
// ==========================================
// AUTHORIZE ADMIN
// ==========================================
async function makeAdmin() {
  try {
    const user = await auth.getUserByEmail(email);
    console.log('');
    console.log('User found:');
    console.log('Email:', user.email);
    console.log('UID:', user.uid);
    // Preserve any existing custom claims
    const existingClaims = user.customClaims || {};
    await auth.setCustomUserClaims(user.uid, {
      ...existingClaims,
      admin: true,
    });
    console.log('');
    console.log('================================');
    console.log('ADMIN AUTHORIZATION SUCCESSFUL');
    console.log('================================');
    console.log('');
    console.log(`Admin: ${user.email}`);
    console.log('admin: true');
    console.log('');
    console.log(
      'Sign out and sign back in to the StyleIQ Admin Dashboard.'
    );
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('FAILED TO AUTHORIZE ADMIN');
    console.error('');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}
makeAdmin();