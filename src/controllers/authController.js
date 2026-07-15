const { User } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const { signAccessToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const user = await User.create({ fullName, email, password });
    const accessToken = signAccessToken(user);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Registration successful',
      data: {
        accessToken,
        user: user.toPublicJSON({ includeTimestamps: true }),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = signAccessToken(user);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = req.user;

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Request successful',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
};
