const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  
  if (user) {
    return sendError(res, 400, 'User already exists');
  }

  // Create user
  user = await User.create({
    name,
    email,
    password
  });

  const token = user.generateToken();

  sendSuccess(res, 201, {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
