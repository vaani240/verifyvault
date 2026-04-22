const adminMiddleware = (req, res, next) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return res.status(500).json({ message: 'Admin email not configured' });
    }

    if (!req.user || req.user.email !== adminEmail) {
      return res.status(403).json({ message: 'Forbidden, admin access only' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Admin authorization failed' });
  }
};

module.exports = adminMiddleware;
