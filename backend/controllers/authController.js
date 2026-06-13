const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({ name, email, password });

    // Send welcome OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES) || 10;

    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    });

    await sendEmail({
      to: email,
      subject: 'Welcome! Verify Your Email',
      html: `<h2>Welcome to AI Mock Interview!</h2>
             <p>Your email verification OTP is: <strong>${otp}</strong></p>
             <p>This OTP expires in ${expiresInMinutes} minutes.</p>`,
    });

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email with the OTP sent.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login - Step 1: Verify credentials, send OTP
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES) || 10;

    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    });

    await sendEmail({
      to: email,
      subject: 'Your Login OTP Code',
      html: `<h2>Login Verification</h2>
             <p>Your OTP for login is: <strong>${otp}</strong></p>
             <p>This OTP expires in ${expiresInMinutes} minutes.</p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    res.json({
      success: true,
      message: 'OTP sent to your email',
      requiresOTP: true,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-login-otp - Step 2: Verify OTP, return token
exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please login again.',
      });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({ email });
    const token = generateToken(user._id);

    // Auto-verify email on successful OTP
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });

    const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES) || 10;
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    });

    await sendEmail({
      to: email,
      subject: 'Your OTP for Email Verification',
      html: `<h2>Email Verification</h2>
             <p>Your OTP is: <strong>${otp}</strong></p>
             <p>This OTP expires in ${expiresInMinutes} minutes.</p>`,
    });

    res.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isVerified: user.isVerified,
          }
        : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile - Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    );

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};