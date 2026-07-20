const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models');

function configurePassport() {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.findByPk(payload.sub);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
}

function authenticateJwt(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: info?.message || 'Unauthorized',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    req.user = user;
    return next();
  })(req, res, next);
}

function optionalAuthenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  return authenticateJwt(req, res, next);
}

module.exports = {
  configurePassport,
  authenticateJwt,
  optionalAuthenticateJwt,
};
