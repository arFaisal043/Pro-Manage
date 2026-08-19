const { validationResult, check } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

exports.validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation Error', errors.array());
    }
    next();
  }
];
