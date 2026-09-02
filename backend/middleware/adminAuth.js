const {
  getAuth,
} = require('firebase-admin/auth');

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('========== ADMIN AUTH ==========');
    console.log('Authorization header exists:', !!authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');

      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    const idToken = authHeader.substring(7).trim();

    if (!idToken) {
      console.error('Empty Firebase ID token');

      return res.status(401).json({
        success: false,
        error: 'Authentication token is missing.',
      });
    }

    console.log(
      'Token received:',
      idToken.substring(0, 30) + '...'
    );

    const decodedToken =
      await getAuth().verifyIdToken(idToken, true);

    console.log('Firebase token verified:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: decodedToken.admin,
      projectId: decodedToken.firebase?.project_id,
    });

    if (decodedToken.admin !== true) {
      console.error(
        'User authenticated but does not have admin claim.'
      );

      return res.status(403).json({
        success: false,
        error: 'Admin access required.',
      });
    }

    req.user = decodedToken;

    console.log('ADMIN AUTH SUCCESS');

    next();

  } catch (error) {

    console.error('=================================');
    console.error('ADMIN AUTHENTICATION ERROR');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('=================================');

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }
};

module.exports = requireAdmin;