export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({
        message: 'Not Authorized as admin'
      });
    }
  };