const { getAuth } = require('firebase-admin/auth');

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format.',
      });
    }

    const idToken = authorization.substring(7);

    const decodedToken =
      await getAuth().verifyIdToken(idToken);

    req.user = decodedToken;

    next();

  } catch (error) {
    console.error(
      'User authentication error:',
      error
    );

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }
};

module.exports = requireAuth;